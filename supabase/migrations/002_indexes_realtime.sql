-- ============================================================
-- 002 — Index, contraintes CHECK, et Realtime
-- ============================================================

-- 1. CHECK constraints pour valider les enums côté DB
alter table pousse_profiles
  add constraint chk_sleep_state
  check (sleep_state in ('awake', 'nap', 'night', 'night-wake', 'night-sleep'));

alter table pousse_profiles
  add constraint chk_sleep_state_moment
  check (sleep_state_moment is null or sleep_state_moment in ('morning', 'noon', 'afternoon'));

alter table pousse_events
  add constraint chk_event_type
  check (type in ('bottle', 'nap', 'night', 'night-wake', 'night-sleep'));

alter table pousse_events
  add constraint chk_event_moment
  check (moment is null or moment in ('morning', 'noon', 'afternoon'));

-- 2. Index pour les requêtes courantes
create index if not exists idx_events_profile_created
  on pousse_events(profile_id, created_at desc);

create index if not exists idx_events_profile_type
  on pousse_events(profile_id, type);

create index if not exists idx_sessions_profile
  on pousse_device_sessions(profile_id);

create index if not exists idx_profiles_joincode
  on pousse_profiles(join_code);

-- 3. RLS policies pour le Realtime (clé anon côté browser)
-- Le client browser écoute via la anon key, il faut autoriser SELECT
-- Le filtre profile_id est appliqué côté Realtime (filter param),
-- mais la policy doit permettre la lecture.
-- En l'absence de Supabase Auth, on autorise SELECT pour anon
-- (les données ne sont accessibles que si on connaît le profile_id UUID).

create policy "Anon can read events for realtime"
  on pousse_events for select
  to anon
  using (true);

create policy "Anon can read profiles for realtime"
  on pousse_profiles for select
  to anon
  using (true);

-- 4. Realtime — ajouter les tables à la publication
-- (nécessaire pour que postgres_changes fonctionne côté client)
alter publication supabase_realtime add table pousse_events;
alter publication supabase_realtime add table pousse_profiles;
