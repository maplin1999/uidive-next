-- ============================================================
-- Dive Log
-- ============================================================
-- Run this whole file once in the Supabase SQL editor. Safe to run more
-- than once (every statement is if-not-exists / create-or-replace).
--
-- A diver's personal logbook of real dives -- replaces the old flat
-- profiles.dives manual counter. The "Dives" stat on a profile now comes
-- from COUNT(*) against this table (via the dive_log_stats view below),
-- so it's a real number the diver can't just type in, not a field they
-- edit directly.
--
-- Existing divers' current profiles.dives value is intentionally NOT
-- migrated into placeholder rows here -- everyone's public count starts
-- at 0 and grows from real logged dives going forward. profiles.dives
-- itself is left in place untouched (just no longer read by the app),
-- in case anything else still references it.
--
-- Privacy model:
--   * Only the diver who owns a dive_logs row can read/create/edit/delete
--     it -- the logbook itself (site, depth, buddy, notes, equipment) is
--     private, same as a paper logbook.
--   * The *count* of dives stays public, same as today -- dive_log_stats
--     is a view that aggregates across every diver and is grantable to
--     anon/authenticated regardless of the row-level privacy above (same
--     pattern as trip_review_stats / host_review_stats elsewhere in this
--     app's schema).

create table if not exists public.dive_logs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  booking_id    uuid references public.bookings(id) on delete set null,
  dive_date     date not null,
  location      text not null default '',
  dive_site     text default '',
  depth_m       numeric,
  duration_min  numeric,
  buddy_name    text default '',
  notes         text default '',
  equipment     text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Logbook list is always "my dives, newest first"; lookups by booking are
-- for the "already logged?" check behind the Add to Dive Log button.
create index if not exists dive_logs_user_idx on public.dive_logs (user_id, dive_date desc);
create index if not exists dive_logs_booking_idx on public.dive_logs (booking_id);

alter table public.dive_logs enable row level security;

drop policy if exists "Users can view their own dive logs" on public.dive_logs;
create policy "Users can view their own dive logs"
  on public.dive_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own dive logs" on public.dive_logs;
create policy "Users can create their own dive logs"
  on public.dive_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own dive logs" on public.dive_logs;
create policy "Users can update their own dive logs"
  on public.dive_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own dive logs" on public.dive_logs;
create policy "Users can delete their own dive logs"
  on public.dive_logs for delete
  using (auth.uid() = user_id);

-- Keep updated_at current on every edit (set once here, reused by any
-- future "edited X ago" display the way posts might one day want it).
create or replace function public.touch_dive_log_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists dive_logs_touch_updated_at on public.dive_logs;
create trigger dive_logs_touch_updated_at
  before update on public.dive_logs
  for each row execute function public.touch_dive_log_updated_at();

-- ---- PUBLIC DIVE COUNT ----------------------------------------------------
-- A view (not a function) so it's one cheap indexed lookup, same shape as
-- trip_review_stats/host_review_stats. Runs as the view's owner, so it
-- reports every diver's count regardless of the select policy above --
-- that policy is only there to keep the *rows* (site, notes, buddy, ...)
-- private, never the count itself.
create or replace view public.dive_log_stats as
select user_id,
       count(*)::int as dive_count
from public.dive_logs
group by user_id;

grant select on public.dive_log_stats to anon, authenticated;
