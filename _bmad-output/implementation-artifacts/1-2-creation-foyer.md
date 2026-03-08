# Story 1.2: Création de foyer (onboarding complet)

Status: done

## Story

As a visiteur,
I want créer un foyer en renseignant le prénom, la date de naissance et le poids de mon bébé,
So that je peux commencer à suivre sa journée.

## Acceptance Criteria

1. **Given** je suis sur la landing screen **When** je tape "Créer un profil" **Then** je suis redirigé vers le formulaire d'onboarding avec 3 champs : prénom (texte), date de naissance (date picker scroll wheels), poids (scroll wheels kg 2-15 | hg 0-9, défaut 3kg5) **And** le bouton "C'est parti" est désactivé tant que les 3 champs ne sont pas remplis

2. **Given** j'ai rempli les 3 champs correctement (prénom 1-30 caractères, DDN ≤ aujourd'hui, poids 2.0-15.0 kg) **When** je tape "C'est parti" **Then** le système crée un foyer en DB (table pousse_profiles avec baby_name, baby_dob, baby_weight_hg, sleep_state='awake', weight_reminder=true) **And** le système génère un code d'invitation unique au format XXXX-0000 (4 lettres majuscules + 4 chiffres) **And** le système crée une session device (table pousse_device_sessions) **And** un cookie JWT httpOnly est posé (~1 an d'expiration, signé HS256 via jose) **And** je suis redirigé vers le dashboard (shell vide pour l'instant)

3. **Given** je suis authentifié avec un JWT valide **When** j'accède à une route protégée (app/) **Then** le middleware Next.js vérifie le JWT et autorise l'accès

4. **Given** je n'ai pas de session active **When** j'accède à une route protégée **Then** je suis redirigé vers la landing screen

## Tasks / Subtasks

- [x] Task 1 — Créer la migration SQL Supabase (AC: #2)
  - [x] `supabase/migrations/001_init.sql`
  - [x] Table `pousse_profiles` avec tous les champs (id uuid, baby_name, baby_dob, baby_weight_hg, join_code UNIQUE, sleep_state DEFAULT 'awake', sleep_state_since, sleep_state_moment, weight_reminder DEFAULT true, created_at)
  - [x] Table `pousse_device_sessions` (id uuid, profile_id FK, device_name, last_seen, created_at)
  - [x] Table `pousse_events` (id uuid, profile_id FK, type, value, started_at, ended_at, moment, created_at)
  - [x] RLS policies : accès filtré par profile_id (le JWT contient profileId et sessionId)
- [x] Task 2 — Implémenter l'auth JWT (AC: #2, #3, #4)
  - [x] `src/lib/auth/jwt.ts` : fonctions `signJwt(payload)` et `verifyJwt(token)` via jose HS256
  - [x] Payload JWT : `{ profileId: string, sessionId: string, iat, exp }` — expiration ~365 jours
  - [x] `src/lib/auth/cookies.ts` : `setAuthCookie(response, token)`, `getAuthCookie(request)`, `clearAuthCookie(response)` — httpOnly, secure, sameSite=lax, maxAge ~1 an
  - [x] `src/lib/auth/guard.ts` : `getSession(request)` → extrait profileId et sessionId depuis le JWT du cookie, retourne null si invalide
- [x] Task 3 — Implémenter le middleware Next.js (AC: #3, #4)
  - [x] `src/middleware.ts` : vérifie le JWT pour les routes `/(app)/*`
  - [x] Si JWT valide → laisse passer
  - [x] Si JWT absent ou invalide → redirect vers `/` (landing)
  - [x] Routes publiques exemptées : `/(landing)/*`, `/api/profiles` (POST), `/api/join` (POST), `/join/*`
- [x] Task 4 — Créer le composant ScrollWheels (AC: #1)
  - [x] `src/components/ui/ScrollWheels.tsx` : composant réutilisable pour sélection par défilement
  - [x] Props : colonnes (label, values[], defaultIndex), onChange callback
  - [x] UX : scroll snap, friction, momentum, fade haut/bas, highlight sélection courante
  - [x] Touch targets ≥ 44px par item
- [x] Task 5 — Créer le composant OnboardingForm (AC: #1)
  - [x] `src/components/onboarding/OnboardingForm.tsx`
  - [x] Champ prénom : input texte, 1-30 caractères
  - [x] Champ date de naissance : ScrollWheels (jour, mois, année) — contrainte ≤ aujourd'hui
  - [x] Champ poids : ScrollWheels (kg 2-15 | hg 0-9), défaut 3kg5
  - [x] Bouton "C'est parti" : primary, pleine largeur, disabled tant que 3 champs non remplis
  - [x] Validation Zod via CreateProfileSchema
- [x] Task 6 — Créer l'API route POST /api/profiles (AC: #2)
  - [x] `src/app/api/profiles/route.ts`
  - [x] Validation Zod du body (baby_name, baby_dob, baby_weight_hg)
  - [x] Génération du join_code : 4 lettres majuscules aléatoires + 4 chiffres (XXXX-0000), retry si collision
  - [x] Insertion dans pousse_profiles via Supabase
  - [x] Création de la session device dans pousse_device_sessions (device_name extrait du User-Agent)
  - [x] Signature du JWT (profileId + sessionId)
  - [x] Pose du cookie httpOnly dans la response
  - [x] Retour : `{ data: { profileId, joinCode } }`
- [x] Task 7 — Créer la page onboarding (AC: #1, #2)
  - [x] `src/app/(landing)/onboarding/page.tsx`
  - [x] Rend `<OnboardingForm />`
  - [x] Après succès de l'API → redirect vers `/(app)` (dashboard)
- [x] Task 8 — Créer le Zod schema CreateProfileSchema (AC: #2)
  - [x] `src/lib/schemas/profile.ts`
  - [x] `baby_name` : string, min 1, max 30, trim
  - [x] `baby_dob` : string (ISO date), ≤ today
  - [x] `baby_weight_hg` : number, min 20, max 150 (2.0-15.0 kg en hectogrammes)

## Dev Notes

### Schéma DB complet

```sql
-- pousse_profiles
CREATE TABLE pousse_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_name     text NOT NULL,
  baby_dob      date NOT NULL,
  baby_weight_hg int NOT NULL,        -- poids en hectogrammes (42 = 4,2 kg)
  join_code     text UNIQUE NOT NULL, -- format XXXX-0000
  sleep_state   text NOT NULL DEFAULT 'awake',
  sleep_state_since timestamptz,
  sleep_state_moment text,            -- 'morning'|'noon'|'afternoon'|null
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
  type          text NOT NULL,        -- 'bottle' | 'nap' | 'night' | 'night-wake'
  value         int NOT NULL,         -- mL (lait) ou minutes (sommeil)
  started_at    timestamptz,          -- heure précise, null pour imports
  ended_at      timestamptz,          -- fin pour nuit/réveils nocturnes
  moment        text,                 -- 'morning'|'noon'|'afternoon', null si live
  created_at    timestamptz DEFAULT now()
);
```

### Auth — Modèle atable adapté

- Pas de compte individuel : le profil (pousse_profiles) est l'entité centrale
- Chaque appareil = une session (pousse_device_sessions)
- JWT payload : `{ profileId, sessionId, iat, exp }`
- Le cookie est httpOnly, secure en production, sameSite=lax
- Le middleware protège toutes les routes `/(app)/*`

### Code d'invitation — Génération

- Format : 4 lettres majuscules (A-Z) + tiret + 4 chiffres (0-9) → `XXXX-0000`
- ~456 millions de combinaisons (26⁴ × 10⁴)
- Unicité garantie par contrainte UNIQUE en DB + retry si collision
- Immuable une fois créé

### ScrollWheels — Composant réutilisable

Ce composant sera réutilisé dans :
- Onboarding : poids (kg|hg), date de naissance (jour|mois|année)
- Time picker (Story 2.3) : heures|minutes
- Profil (Story 1.5) : édition poids

UX du scroll : snap sur chaque valeur, friction/momentum natif via CSS `scroll-snap-type: y mandatory`, fade en haut/bas via masque gradient, highlight sur la sélection courante (center item).

### Mapping snake_case ↔ camelCase

Le mapping se fait dans l'API route :
- Request body (client → API) : camelCase (`babyName`, `babyDob`, `babyWeightHg`)
- DB insertion : snake_case (`baby_name`, `baby_dob`, `baby_weight_hg`)
- Response (API → client) : camelCase (`profileId`, `joinCode`)

### Sécurité

- Cookies httpOnly : pas accessibles via JavaScript (NFR5)
- JWT signé HS256 via jose avec JWT_SECRET
- RLS Supabase : chaque query filtrée par profile_id
- Le middleware vérifie le JWT à chaque requête sur les routes protégées

### Dépendance Story 1.1

Cette story nécessite que la fondation projet (Story 1.1) soit terminée : structure de dossiers, Tailwind configuré, types de base, client Supabase.

### Project Structure Notes

- Fichiers créés : `supabase/migrations/001_init.sql`, `src/lib/auth/*.ts`, `src/middleware.ts`, `src/components/ui/ScrollWheels.tsx`, `src/components/onboarding/OnboardingForm.tsx`, `src/app/(landing)/onboarding/page.tsx`, `src/app/api/profiles/route.ts`, `src/lib/schemas/profile.ts`
- Le composant ScrollWheels est dans `ui/` car réutilisable (profil, time picker, etc.)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure du Projet]
- [Source: docs/ux-onboarding-profil.md#Onboarding — Création de profil]
- [Source: docs/ux-onboarding-profil.md#Poids — Scroll wheels]
- [Source: docs/ux-onboarding-profil.md#Sessions & authentification]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- jose v6 incompatible avec jsdom TextEncoder → tests JWT en environnement node
- Zod v4 : `.error.issues` au lieu de `.error.errors`
- Next.js 16 : middleware deprecation warning (proxy) — non bloquant

### Completion Notes List
- ✅ Migration SQL 001_init.sql avec 3 tables + RLS
- ✅ Auth JWT via jose (signJwt, verifyJwt) avec HS256
- ✅ Cookies httpOnly (setAuthCookie, getAuthCookie, clearAuthCookie)
- ✅ Guard d'authentification (getSession)
- ✅ Middleware Next.js protégeant les routes /(app)/*
- ✅ ScrollWheels composant réutilisable avec scroll snap
- ✅ OnboardingForm avec 3 champs + validation Zod
- ✅ API POST /api/profiles avec génération join_code
- ✅ Page onboarding connectée
- ✅ 13 tests passent (JWT, Schema, LandingScreen)

### Change Log
- 2026-03-08 : Story 1.2 implémentée — auth, onboarding, API profiles

### File List
- supabase/migrations/001_init.sql (créé)
- src/lib/auth/jwt.ts (créé)
- src/lib/auth/cookies.ts (créé)
- src/lib/auth/guard.ts (créé)
- src/middleware.ts (créé)
- src/components/ui/ScrollWheels.tsx (créé)
- src/components/onboarding/OnboardingForm.tsx (créé)
- src/app/api/profiles/route.ts (créé)
- src/app/(landing)/onboarding/page.tsx (modifié)
- src/lib/auth/__tests__/jwt.test.ts (créé)
- src/lib/schemas/__tests__/profile.test.ts (créé)
