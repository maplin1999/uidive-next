-- ============================================================
-- Ocean Conservation Pledge Pool
-- ============================================================
-- Run this whole file once in the Supabase SQL editor. Safe to run more
-- than once (every statement is if-not-exists / create-or-replace).
--
-- Part of the Corals reward economy brainstorm: a diver "pledges" Corals
-- from their own balance into a shared conservation pool. What this
-- actually funds is a real monthly donation to a conservation partner,
-- paid out of a share of UiDive's own platform revenue -- NOT a literal
-- Corals-to-cash conversion. Pledging Corals doesn't create extra money;
-- it decides each diver's share of the recognition (this table, the
-- monthly progress bar on the Explore page) for a donation that's already
-- happening regardless of how many Corals get pledged. Worth keeping that
-- distinction honest in the UI copy, not just here.
--
-- Partner charity is intentionally not named anywhere in schema or code
-- yet -- see CONSERVATION_MONTHLY_GOAL_CORALS in src/lib/conservation.ts
-- for where that eventually plugs in.

create table if not exists public.conservation_pledges (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  corals_amount  int not null check (corals_amount > 0),
  created_at     timestamptz not null default now()
);

create index if not exists conservation_pledges_user_idx on public.conservation_pledges (user_id, created_at desc);
create index if not exists conservation_pledges_created_idx on public.conservation_pledges (created_at desc);

alter table public.conservation_pledges enable row level security;

drop policy if exists "Users can view their own pledges" on public.conservation_pledges;
create policy "Users can view their own pledges"
  on public.conservation_pledges for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy -- every write goes through
-- pledge_corals_to_conservation() below, same "no direct table access"
-- pattern as bookings/payment_holds/dive_logs elsewhere in this schema.

-- ---- PLEDGE: ATOMIC BALANCE DEBIT + RECORD -----------------------------
-- Locks the caller's own profiles row so two pledges racing from the same
-- account (double-tap on a slow connection) can't both read the same
-- starting balance and overdraw it.
create or replace function public.pledge_corals_to_conservation(p_amount int)
returns public.conservation_pledges as $$
declare
  v_balance int;
  v_pledge  public.conservation_pledges%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to pledge Corals.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Pledge amount must be greater than zero.';
  end if;

  select corals into v_balance
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found.';
  end if;

  if v_balance < p_amount then
    raise exception 'Not enough Corals -- you have % but tried to pledge %.', v_balance, p_amount;
  end if;

  update public.profiles set corals = corals - p_amount where id = auth.uid();

  insert into public.conservation_pledges (user_id, corals_amount)
  values (auth.uid(), p_amount)
  returning * into v_pledge;

  return v_pledge;
end;
$$ language plpgsql security definer;

-- ---- PUBLIC PROGRESS STATS ----------------------------------------------
-- One-row aggregate (this month's total + all-time total), no per-user
-- data exposed. Grantable to anon so the Explore page's progress banner
-- can show real numbers to signed-out visitors too, same "count is public,
-- rows are private" split as dive_log_stats / trip_review_stats.
create or replace view public.conservation_fund_stats as
select
  coalesce(sum(corals_amount) filter (
    where date_trunc('month', created_at) = date_trunc('month', now())
  ), 0)::int as month_total,
  coalesce(sum(corals_amount), 0)::int as all_time_total
from public.conservation_pledges;

grant select on public.conservation_fund_stats to anon, authenticated;
