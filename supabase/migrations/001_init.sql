-- pousse_profiles
CREATE TABLE pousse_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_name     text NOT NULL,
  baby_dob      date NOT NULL,
  baby_weight_hg int NOT NULL,
  join_code     text UNIQUE NOT NULL,
  sleep_state   text NOT NULL DEFAULT 'awake',
  sleep_state_since timestamptz,
  sleep_state_moment text,
  weight_reminder boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- pousse_device_sessions
CREATE TABLE pousse_device_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES pousse_profiles(id) ON DELETE CASCADE,
  device_name   text,
  last_seen     timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

-- pousse_events
CREATE TABLE pousse_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES pousse_profiles(id) ON DELETE CASCADE,
  type          text NOT NULL,
  value         int NOT NULL,
  started_at    timestamptz,
  ended_at      timestamptz,
  moment        text,
  created_at    timestamptz DEFAULT now()
);

-- RLS : activé, aucune policy pour le rôle anon → deny all
-- Les API routes utilisent SUPABASE_SERVICE_ROLE_KEY qui bypass le RLS
-- Les policies Realtime seront ajoutées quand la sync temps réel sera implémentée (Epic 2+)
ALTER TABLE pousse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pousse_device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pousse_events ENABLE ROW LEVEL SECURITY;
