-- ============================================================
-- Real payments via Revolut Business (Merchant API)
-- ============================================================
-- Run this whole file once in the Supabase SQL editor. Safe to run more
-- than once (every statement is if-not-exists / create-or-replace).
--
-- Replaces the free, instant book_trip() flow with a real paid one, WITHOUT
-- touching the existing bookings table's meaning at all: a bookings row is
-- still only ever inserted once a trip is genuinely confirmed, with
-- status = 'confirmed', exactly like today. Every other RPC/query that
-- already filters on status = 'confirmed' (reviews, host roster, "My
-- Bookings", etc.) keeps working unchanged.
--
-- What's new is what happens BEFORE that row exists: a new payment_holds
-- table tracks "this diver started checking out for this trip" from the
-- moment a Revolut order is created until it either succeeds (a real
-- booking gets inserted) or fails/expires (the held spot is released).
-- dive_trips.spots_booked is incremented the instant a hold is created --
-- same atomic, row-locked pattern book_trip() always used -- so two divers
-- racing for the last spot still can't both get through, whether they're
-- racing to click "Confirm" or racing to actually pay.
--
-- Abandoned holds (someone starts checkout, never pays, never comes back)
-- self-heal with no cron job: release_expired_payment_holds() sweeps any
-- hold whose expires_at has passed, and create_payment_hold() always calls
-- it first, before its own capacity check -- so the very next booking
-- attempt on that trip cleans up any stale holds before deciding whether
-- there's really a spot free. Same "no scheduled job needed" trick as
-- dive_log_stats in add-dive-logs.sql, just applied to cleanup instead of
-- aggregation.

create table if not exists public.payment_holds (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  trip_id          uuid references public.dive_trips(id) on delete cascade not null,
  price            numeric(10,2) not null,
  currency         text not null default 'GBP',
  equipment        jsonb not null default '{}'::jsonb,
  revolut_order_id text not null unique,
  checkout_url     text not null,
  status           text not null default 'pending', -- 'pending' | 'completed' | 'failed' | 'expired'
  booking_id       uuid references public.bookings(id) on delete set null,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null
);

create index if not exists payment_holds_user_idx on public.payment_holds (user_id, created_at desc);
create index if not exists payment_holds_status_idx on public.payment_holds (status, expires_at);

alter table public.payment_holds enable row level security;

drop policy if exists "Users can view their own payment holds" on public.payment_holds;
create policy "Users can view their own payment holds"
  on public.payment_holds for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy -- every write goes through the
-- SECURITY DEFINER functions below (create_payment_hold from your server's
-- order-creation route, confirm/fail_payment_hold from the webhook route),
-- same "no direct table access" pattern as bookings/book_trip always used.

-- ---- SWEEP ABANDONED HOLDS -------------------------------------------
create or replace function public.release_expired_payment_holds()
returns void as $$
begin
  update public.dive_trips t
  set spots_booked = greatest(0, t.spots_booked - sub.n)
  from (
    select trip_id, count(*) as n
    from public.payment_holds
    where status = 'pending' and expires_at < now()
    group by trip_id
  ) sub
  where t.id = sub.trip_id;

  update public.payment_holds
  set status = 'expired'
  where status = 'pending' and expires_at < now();
end;
$$ language plpgsql security definer;

-- ---- START CHECKOUT: ATOMIC, CAPACITY-SAFE HOLD ------------------------
-- Called by your server (the /api/revolut/create-order route) right after
-- creating the Revolut order, with that order's real id/checkout_url. Price
-- is ALWAYS re-derived from dive_trips.price server-side here, never taken
-- from an argument -- same discipline as book_trip's own price fix, doubly
-- important now that this is a real charge, not a free reservation.
create or replace function public.create_payment_hold(
  p_trip_id uuid,
  p_equipment jsonb,
  p_revolut_order_id text,
  p_checkout_url text,
  p_hold_minutes int default 15
)
returns public.payment_holds as $$
declare
  v_capacity int;
  v_booked   int;
  v_price    numeric;
  v_hold     public.payment_holds%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to book a dive.';
  end if;

  perform public.release_expired_payment_holds();

  select capacity, spots_booked, price into v_capacity, v_booked, v_price
  from public.dive_trips
  where id = p_trip_id
  for update;

  if not found then
    raise exception 'This dive trip no longer exists.';
  end if;

  if v_booked >= v_capacity then
    raise exception 'This trip is fully booked.';
  end if;

  insert into public.payment_holds
    (user_id, trip_id, price, equipment, revolut_order_id, checkout_url, expires_at)
  values
    (auth.uid(), p_trip_id, v_price, coalesce(p_equipment, '{}'::jsonb), p_revolut_order_id, p_checkout_url,
     now() + make_interval(mins => p_hold_minutes))
  returning * into v_hold;

  update public.dive_trips set spots_booked = spots_booked + 1 where id = p_trip_id;

  return v_hold;
end;
$$ language plpgsql security definer;

-- ---- WEBHOOK: PAYMENT SUCCEEDED ----------------------------------------
-- Called only from your server's /api/revolut/webhook route (using the
-- Supabase service role key, after verifying Revolut's signature -- see
-- src/app/api/revolut/webhook/route.ts). Turns a held spot into a real,
-- permanent booking. spots_booked is NOT incremented again here -- it was
-- already counted the moment the hold was created.
create or replace function public.confirm_payment_hold(p_revolut_order_id text)
returns public.bookings as $$
declare
  v_hold    public.payment_holds%rowtype;
  v_booking public.bookings%rowtype;
begin
  select * into v_hold
  from public.payment_holds
  where revolut_order_id = p_revolut_order_id
  for update;

  if not found then
    raise exception 'No payment hold found for order %', p_revolut_order_id;
  end if;

  -- Idempotent: Revolut can and does retry webhook delivery. A hold that's
  -- already completed just returns its existing booking instead of
  -- creating a second one.
  if v_hold.status = 'completed' and v_hold.booking_id is not null then
    select * into v_booking from public.bookings where id = v_hold.booking_id;
    return v_booking;
  end if;

  insert into public.bookings (user_id, trip_id, price_paid, status, equipment)
  values (v_hold.user_id, v_hold.trip_id, v_hold.price, 'confirmed', v_hold.equipment)
  returning * into v_booking;

  update public.payment_holds
  set status = 'completed', booking_id = v_booking.id
  where id = v_hold.id;

  return v_booking;
end;
$$ language plpgsql security definer;

-- ---- WEBHOOK: PAYMENT FAILED/DECLINED/CANCELLED ------------------------
-- Releases the held spot immediately instead of waiting for it to expire
-- naturally, so a declined card frees the spot for someone else right away.
create or replace function public.fail_payment_hold(p_revolut_order_id text)
returns void as $$
declare
  v_hold public.payment_holds%rowtype;
begin
  select * into v_hold
  from public.payment_holds
  where revolut_order_id = p_revolut_order_id
  for update;

  if not found or v_hold.status <> 'pending' then
    return; -- already handled, or nothing to release
  end if;

  update public.payment_holds set status = 'failed' where id = v_hold.id;
  update public.dive_trips set spots_booked = greatest(0, spots_booked - 1) where id = v_hold.trip_id;
end;
$$ language plpgsql security definer;
