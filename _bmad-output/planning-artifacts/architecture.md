---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-03-08'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-samvabien-2026-03-06.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/ux-recap-today.md
  - docs/ux-kpi-cards.md
  - docs/ux-sleep-state-machine.md
  - docs/ux-onboarding-profil.md
  - docs/design-reference.html
workflowType: 'architecture'
project_name: 'samvabien'
user_name: 'Anthony'
date: '2026-03-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (45 FRs) :**

| Domaine | FRs | Implications architecturales |
|---|---|---|
| Onboarding & Accès | FR1–FR5 | Création foyer, code d'invitation, mode démo, sessions éphémères |
| Sessions & Auth | FR6–FR10 | JWT httpOnly ~1 an, multi-appareil, révocation, suppression foyer au départ du dernier membre |
| Dashboard & Consultation | FR11–FR18 | Hero card temps réel, KPI cards avec progress bar/zone cible/moyenne 3j, récap antéchrono, cycle coucher→coucher |
| Saisie Live — Lait | FR19–FR21 | Toast biberon avec slider, valeur par défaut (moyenne 10 derniers), time picker |
| Saisie Live — Sommeil | FR22–FR26 | Machine d'états 5 états, transitions contextuelles selon l'heure, chrono serveur-side |
| Saisie Crèche (Batch) | FR27–FR30 | Toast batch sans cooldown, sélecteur moment de la journée, enregistrement individuel au "Suivant" |
| Édition & Suppression | FR31–FR34 | Toast d'édition depuis le récap, slider prérempli, undo temporaire (2s) |
| Profil Bébé | FR35–FR39 | Édition inline, recalcul zones cibles immédiat, rappel de pesée mensuel |
| Mode Démo | FR40–FR42 | Données fictives cohérentes chaque jour, toutes fonctionnalités opérationnelles, isolation totale (session storage) |
| Synchronisation | FR43–FR44 | Sync temps réel sans refresh, envoi immédiat au serveur |
| Thème Visuel | FR45 | Bascule jour/nuit pilotée par l'état sommeil du bébé |

**Non-Functional Requirements (9 NFRs) :**

| Catégorie | NFRs | Contrainte |
|---|---|---|
| Performance | NFR1–NFR4 | Dashboard opérationnel < 3s sur 4G, feedback saisie < 200ms, FCP < 2s, chrono exact à la seconde |
| Sécurité | NFR5–NFR7 | Cookies httpOnly, pas d'info leakage sur les codes, révocation effective |
| Fiabilité | NFR8–NFR9 | État sommeil survit à tout (fermeture, perte réseau, redémarrage), données démo jamais altérées |

**Scale & Complexity :**

- Domaine principal : PWA mobile-first full-stack (SPA + API + Supabase)
- Niveau de complexité : Faible (2 utilisateurs, projet personnel, pas de compliance)
- Composants architecturaux estimés : ~12-15 (auth/sessions, foyer, bébé profile, sleep state machine, cycle window, KPI engine, events CRUD, real-time sync, demo mode, toast system, theme engine, service worker)

### Technical Constraints & Dependencies

- **Stack de référence atable** : JWT via `jose` (HS256), Supabase, sessions ~365 jours, foyer/invitations. Tables préfixées `pousse_`.
- **PWA Safari iOS ≥ 16.4** : cible principale, service worker pour cache assets, pas de mode offline.
- **Connexion réseau attendue** : pas de queue offline, pas de sync différée. Erreur claire en cas de perte réseau.
- **Design verrouillé** : palette COLORS (day/night), Nunito, Tailwind + composants headless, design mobile-only 375-430px.
- **Mono-bébé** : un seul bébé par foyer, pas de sélecteur multi-bébé.

### Cross-Cutting Concerns Identified

1. **Cycle coucher→coucher** — irrigue KPI cards, récap, reset des compteurs. Un service `CycleWindow` centralise cette logique.
2. **Machine d'états sommeil** — gouverne la hero card, le thème jour/nuit, les transitions toast, le chrono. Doit être cohérente entre client et serveur.
3. **Sync temps réel** — chaque mutation (saisie, édition, suppression) doit propager aux autres appareils du foyer en < 5s.
4. **Thème jour/nuit** — piloté par l'état sommeil, affecte toute l'interface. Pas de préférence système.
5. **Valeurs par défaut intelligentes** — moyenne 10 derniers biberons, seuils horaires pour les transitions, médiane de la range en fallback.
6. **Événements avec/sans heure précise** — les imports crèche n'ont pas de timestamp, seulement un moment (Matin/Midi/Après-midi). Affecte le tri, la moyenne 3j, l'affichage hero card.

## Starter Template Evaluation

### Primary Technology Domain

PWA mobile-first full-stack (SPA + API routes + Supabase) — basé sur l'analyse des requirements et la stack de référence atable.

### Préférences techniques établies

Stack existante maîtrisée via le projet atable :
- Next.js 16 (App Router, React 19.2, Turbopack)
- TypeScript 5 strict
- Tailwind CSS 4 (sans shadcn/ui — composants custom requis par la spec UX)
- Supabase (DB + real-time)
- jose (JWT HS256)
- Vitest + Testing Library
- Vercel (déploiement)

### Starter Options Considered

| Option | Stack | PWA | Réutilisation atable | Verdict |
|---|---|---|---|---|
| `create-next-app` | Next.js 16 + Tailwind + TS | À configurer manuellement | Directe (même stack) | **Retenu** |
| `@vite-pwa/create-pwa` | Vite 7 + React + PWA | Préconfigurée | Aucune (stack différente) | Écarté |

### Selected Starter: create-next-app (Next.js 16)

**Rationale :**
- Cohérence totale avec atable — réutilisation directe des patterns auth, middleware, API routes, foyer/sessions
- Stack maîtrisée par Anthony — zéro courbe d'apprentissage
- Next.js 16 fournit Turbopack (dev rapide), App Router, React 19.2 avec React Compiler
- Les API routes intégrées simplifient le backend (JWT, chrono serveur-side, CRUD événements)
- Le PWA se configure via manifest + service worker custom (pas de mode offline requis)

**Commande d'initialisation :**

```bash
npx create-next-app@latest samvabien --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Décisions architecturales fournies par le starter :**

- **Language & Runtime** : TypeScript 5 strict, React 19.2, Node.js
- **Styling** : Tailwind CSS 4 via PostCSS (config custom pour la palette samvabien)
- **Build** : Turbopack (dev + prod), optimisations Next.js
- **Linting** : ESLint 9 + config Next.js
- **Organisation** : App Router, `src/` directory, alias `@/*`
- **Dev Experience** : Fast Refresh (Turbopack), TypeScript strict

**À ajouter manuellement post-init :**
- `@supabase/supabase-js` — DB + real-time sync
- `jose` — JWT HS256
- `vitest` + `@testing-library/react` — tests
- `zod` — validation schemas
- Manifest PWA + service worker (cache assets)
- Config Tailwind custom (palette COLORS, Nunito, arrondis)

**Note :** L'initialisation du projet avec cette commande sera la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (bloquent l'implémentation) :**
- Schéma DB (tables `pousse_*`)
- Auth/sessions (réutilisation atable)
- Sync temps réel (Supabase Realtime)
- Machine d'états sommeil (module pur TS)

**Important (structurent l'architecture) :**
- State management (React Context)
- Thème jour/nuit (CSS variables + data-attribute)
- Mode démo (données en mémoire, pas d'API)
- PWA (manifest + SW cache assets)

**Différé (post-MVP) :**
- Migration vers Zustand si perf issues avec les graphiques Phase 2
- Notifications push
- Export texte pédiatre

### Data Architecture

**Base de données :** Supabase (même instance qu'atable, tables préfixées `pousse_`)

**Schéma :**

```sql
pousse_profiles
  id            uuid PK
  baby_name     text NOT NULL
  baby_dob      date NOT NULL
  baby_weight_hg int NOT NULL          -- poids en hectogrammes (42 = 4,2 kg)
  join_code     text UNIQUE NOT NULL   -- format XXXX-0000
  sleep_state   text NOT NULL DEFAULT 'awake'
                -- 'awake' | 'nap' | 'night' | 'night-wake' | 'night-sleep'
  sleep_state_since timestamptz        -- timestamp dernier changement d'état
  sleep_state_moment text              -- 'morning'|'noon'|'afternoon'|null
  weight_reminder boolean DEFAULT true
  created_at    timestamptz DEFAULT now()

pousse_device_sessions
  id            uuid PK
  profile_id    uuid FK → pousse_profiles
  device_name   text
  last_seen     timestamptz
  created_at    timestamptz DEFAULT now()

pousse_events
  id            uuid PK
  profile_id    uuid FK → pousse_profiles
  type          text NOT NULL          -- 'bottle' | 'nap' | 'night' | 'night-wake'
  value         int NOT NULL           -- mL (lait) ou minutes (sommeil)
  started_at    timestamptz            -- heure précise, null pour imports
  ended_at      timestamptz            -- fin pour nuit/réveils nocturnes
  moment        text                   -- 'morning'|'noon'|'afternoon', null si live
  created_at    timestamptz DEFAULT now()
```

**Rationale :**
- `sleep_state` dans `pousse_profiles` — état unique par foyer, pas un historique
- `baby_weight_hg` en entier — évite les erreurs d'arrondi float, cohérent avec les pas de 100g du picker UX
- Table `pousse_events` unifiée — le `type` discrimine biberons et sommeil. Simple et adapté à 2 utilisateurs.
- `sleep_state_moment` — permet l'affichage hero card sans durée après un import crèche

**Validation :** Zod pour les schemas de validation côté API routes

### Authentication & Security

**Réutilisation directe du modèle atable :**
- JWT via `jose` (HS256), stocké en cookie httpOnly, expiration ~1 an
- Middleware Next.js pour la protection des routes
- Pas de compte individuel — le profil (`pousse_profiles`) est l'entité centrale
- Chaque appareil = une session (`pousse_device_sessions`)
- Code d'invitation `XXXX-0000`, immuable, généré à la création
- Révocation par suppression de la session device
- Suppression hard du profil + événements quand le dernier membre quitte

**Sécurité API :**
- Toutes les API routes vérifient le JWT et le `profile_id`
- Pas d'info leakage sur les codes invalides (même réponse 404 générique)
- RLS Supabase sur les tables `pousse_*` (row-level security par `profile_id`)

### API & Communication Patterns

**API Routes Next.js :**
- `POST /api/events` — créer un événement (biberon, sieste, nuit, import crèche)
- `PATCH /api/events/[id]` — modifier un événement
- `DELETE /api/events/[id]` — supprimer un événement
- `POST /api/sleep-state` — transition d'état sommeil (met à jour `pousse_profiles`)
- `POST /api/profiles` — créer un profil (onboarding)
- `PATCH /api/profiles` — modifier le profil bébé
- `POST /api/join` — rejoindre un foyer par code
- `GET /api/household` — données du foyer (profil + events + devices)
- `DELETE /api/devices/[id]` — révoquer un appareil
- `POST /api/leave` — quitter le foyer

**Sync temps réel : Supabase Realtime**
- Subscribe aux changements `pousse_events` et `pousse_profiles` filtrés par `profile_id`
- Chaque mutation API → écriture Supabase → Realtime broadcast aux autres appareils
- Latence attendue : ~1-2s (< 5s requis par NFR)

**Gestion d'erreurs :**
- Connexion réseau attendue — erreur claire affichée si fetch échoue
- Pas de retry automatique, pas de queue offline
- Validation Zod côté API, erreurs typées retournées au client

### Frontend Architecture

**State management : React Context**
- `HouseholdContext` — profil bébé, sleep_state, events, devices
- Mis à jour via les callbacks API + Supabase Realtime subscriptions
- Suffisant pour le MVP (un seul écran, ~3 morceaux d'état)
- Migration Zustand envisageable en Phase 2 si perf issues avec les graphiques

**Machine d'états sommeil : module pur TypeScript**
- `lib/sleep-state-machine.ts`
- Fonctions pures : `getNextTransitions(state, hour)`, `getTheme(state)`, `getHeroDisplay(state, since, moment)`
- Pas de librairie externe (XState overkill pour 5 états)
- Testable unitairement avec Vitest

**Thème jour/nuit :**
- `data-theme="day|night"` sur `<html>`, piloté par `sleep_state`
- CSS variables Tailwind mappées sur les tokens `COLORS` du design-reference
- `ThemeProvider` (React Context) qui lit l'état sommeil et applique le thème
- Transition CSS douce entre les thèmes

**Service CycleWindow :**
- `lib/cycle-window.ts` — logique de fenêtre coucher→coucher
- `currentCycleStart()`, `eventsInCycle()`, `rollingAverage(days, contextHour)`
- Consommé par les KPI cards, le récap, et le reset

**Mode démo :**
- Données de base : fichier statique `lib/demo-data.ts` (snapshot Léo, 4 mois, figé 17h30)
- À l'entrée en démo : données copiées en mémoire (React state)
- Mutations en mémoire uniquement — aucun appel API, aucune écriture Supabase
- Refresh = reset aux données de base

### Infrastructure & Deployment

- **Hosting :** Vercel (même compte qu'atable)
- **DB :** Supabase — même instance qu'atable, tables préfixées `pousse_`
- **PWA :** manifest `public/manifest.json` + service worker cache assets (pas de mode offline)
- **Env vars :** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET` (même pattern atable)
- **CI/CD :** Vercel auto-deploy sur push main

### Decision Impact Analysis

**Séquence d'implémentation :**
1. Init projet (`create-next-app`) + config Tailwind + PWA manifest
2. Schéma DB Supabase (tables `pousse_*` + RLS)
3. Auth/sessions (JWT, middleware, réutilisation atable)
4. CRUD événements (API routes + Supabase)
5. Supabase Realtime (sync)
6. Machine d'états sommeil + thème
7. Dashboard UI (hero card, KPI cards, récap, toasts)
8. Mode démo

**Dépendances inter-composants :**
- Le thème dépend de la machine d'états sommeil
- Les KPI cards dépendent de CycleWindow
- Le récap dépend de CycleWindow + events
- La sync Realtime dépend du schéma DB + auth
- Le mode démo dépend de tous les composants UI (il les utilise sans backend)

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Base de données (snake_case, préfixé) :**
- Tables : `pousse_profiles`, `pousse_events`, `pousse_device_sessions`
- Colonnes : `baby_name`, `sleep_state`, `profile_id`, `created_at`
- FK : `profile_id` (pas `fk_profile`)

**API Routes (kebab-case, pluriel) :**
- `POST /api/events`, `PATCH /api/events/[id]`, `DELETE /api/events/[id]`
- `POST /api/sleep-state`
- `POST /api/profiles`, `PATCH /api/profiles`
- `POST /api/join`, `POST /api/leave`
- `DELETE /api/devices/[id]`
- Paramètres dynamiques : `[id]` (convention Next.js App Router)

**Code TypeScript (camelCase) :**
- Variables/fonctions : `sleepState`, `getNextTransitions()`, `eventsInCycle()`
- Types/interfaces : `PascalCase` — `SleepState`, `BabyEvent`, `HouseholdData`
- Constantes : `UPPERCASE` — `SLEEP_THRESHOLDS`, `COLORS`, `DEMO_DATA`
- Fichiers : `kebab-case` — `sleep-state-machine.ts`, `cycle-window.ts`, `demo-data.ts`
- Composants React : `PascalCase` fichier et export — `HeroCard.tsx`, `KpiCard.tsx`, `ToastTransition.tsx`

### Structure Patterns

**Organisation par feature (pas par type) :**

```
src/
  app/                    # Next.js App Router
    (app)/                # Routes authentifiées (dashboard)
    (landing)/            # Routes publiques (landing, join, onboarding)
    api/                  # API routes
  components/
    dashboard/            # HeroCard, KpiCard, RecapList, ToastTransition...
    onboarding/           # LandingScreen, OnboardingForm, JoinScreen...
    profile/              # ProfileScreen, ProfileHeaderButton...
    ui/                   # Composants réutilisables (Toast, Slider, TimePicker, ScrollWheels...)
  lib/
    sleep-state-machine.ts
    cycle-window.ts
    medical-targets.ts    # zones cibles lait/sommeil
    demo-data.ts
    supabase/             # client, types
    auth/                 # JWT, middleware
    schemas/              # Zod schemas
  hooks/                  # useHousehold, useRealtimeSync, useTheme...
  types/                  # types partagés
```

**Tests co-localisés :**
- `lib/sleep-state-machine.test.ts` à côté de `sleep-state-machine.ts`
- `lib/cycle-window.test.ts` à côté de `cycle-window.ts`
- Tests de composants : `components/dashboard/HeroCard.test.tsx`

### Format Patterns

**API Responses :**

```ts
// Succès
{ data: T }

// Erreur
{ error: { message: string, code?: string } }

// HTTP status : 200 (ok), 201 (created), 400 (validation), 401 (unauth), 404 (not found)
```

**Dates en JSON :** ISO 8601 strings (`"2026-03-08T14:30:00.000Z"`)

**Dates dans l'UI :** format court sans zéro initial (`"14h30"`, `"5h50"`, pas `"05h50"`)

**Durées dans l'UI :**
- ≥ 1h : `"Xh00"` (ex. `"1h23"`, `"10h20"`)
- < 1h : `"Xmin"` (ex. `"12min"`, `"45min"`)

**JSON fields :** camelCase côté client (`sleepState`, `babyName`), snake_case côté DB (`sleep_state`, `baby_name`). Mapping dans les API routes.

### Communication Patterns

**Supabase Realtime — channel naming :**
- Channel : `household:{profileId}` — un seul channel par foyer
- Events écoutés : `INSERT`, `UPDATE`, `DELETE` sur `pousse_events` + `UPDATE` sur `pousse_profiles`

**React Context — state shape :**

```ts
interface HouseholdState {
  profile: Profile | null
  events: BabyEvent[]
  devices: DeviceSession[]
  isDemo: boolean
  isLoading: boolean
}
```

**Actions (fonctions, pas de Redux) :**
- `addEvent(event)`, `updateEvent(id, data)`, `deleteEvent(id)`
- `transitionSleepState(newState, time)`
- `updateProfile(data)`

### Process Patterns

**Gestion d'erreurs :**
- API routes : try/catch avec réponse `{ error: { message } }` + status code approprié
- Client : toast d'erreur discret (pas de modal), message humain en français
- Pas de retry automatique — afficher l'erreur, le parent réessaie manuellement
- Logging : `console.error` en dev uniquement, pas de service de monitoring pour le MVP

**Loading states :**
- `isLoading` global au niveau du Context (chargement initial des données)
- Pas de loading par action individuelle — les saisies sont optimistic (mise à jour UI immédiate, rollback si l'API échoue)

**Optimistic updates :**
- Les saisies (biberon, transition sommeil) mettent à jour l'UI immédiatement
- Si l'API échoue → rollback + toast d'erreur
- Assure le feedback < 200ms (NFR2)

### Enforcement Guidelines

**Tout agent IA DOIT :**
- Utiliser les patterns de naming définis (snake_case DB, camelCase TS, PascalCase composants)
- Respecter la structure de dossiers existante
- Mapper snake_case ↔ camelCase dans les API routes, pas dans les composants
- Utiliser les types partagés de `types/` et les schemas Zod de `lib/schemas/`
- Écrire les tests co-localisés pour les modules `lib/`
- Ne jamais écrire de CSS custom — tout passe par Tailwind + CSS variables
- Respecter la palette `COLORS` du design-reference pour toute couleur
- Ne jamais utiliser de rouge alarmiste ni d'emoji négatif (principe UX anti-anxiété)

**Anti-patterns à éviter :**
- `any` en TypeScript — toujours typer explicitement
- CSS-in-JS ou fichiers `.css` séparés — utiliser Tailwind uniquement
- `localStorage` pour la persistance — tout passe par Supabase (sauf mode démo = React state)
- Modals de confirmation — l'app utilise des toasts avec cooldown/undo
- Textes hardcodés en anglais — tout le contenu UI est en français

## Structure du Projet & Frontières Architecturales

### Arborescence complète du projet

```
samvabien/
├── .env.local                        # SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
├── .env.example                      # Template avec clés vides
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts                # Palette COLORS, Nunito, arrondis custom
├── tsconfig.json
├── vitest.config.ts
├── public/
│   ├── manifest.json                 # PWA manifest (name, icons, display: standalone)
│   ├── sw.js                         # Service worker (cache assets, pas offline)
│   └── icons/                        # Icônes PWA (192, 512)
├── supabase/
│   └── migrations/                   # SQL: tables pousse_*, RLS policies
│       └── 001_init.sql
├── src/
│   ├── middleware.ts                  # Vérification JWT, redirection non-auth
│   ├── app/
│   │   ├── globals.css               # CSS variables (day/night tokens), Nunito import
│   │   ├── layout.tsx                # ThemeProvider, HouseholdProvider
│   │   ├── (landing)/
│   │   │   ├── page.tsx              # Landing (3 CTAs: Créer, Rejoindre, Démo)
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx          # Formulaire onboarding (prénom, DDN, poids)
│   │   │   └── join/
│   │   │       └── page.tsx          # Rejoindre par code
│   │   ├── (app)/
│   │   │   ├── layout.tsx            # Auth guard, chargement données, Realtime sub
│   │   │   ├── page.tsx              # Dashboard (hero + KPI + récap)
│   │   │   └── profile/
│   │   │       └── page.tsx          # Profil bébé + gestion appareils
│   │   └── api/
│   │       ├── events/
│   │       │   ├── route.ts          # POST: créer événement
│   │       │   └── [id]/
│   │       │       └── route.ts      # PATCH + DELETE: modifier/supprimer
│   │       ├── sleep-state/
│   │       │   └── route.ts          # POST: transition d'état sommeil
│   │       ├── profiles/
│   │       │   └── route.ts          # POST: créer profil, PATCH: modifier
│   │       ├── join/
│   │       │   └── route.ts          # POST: rejoindre par code
│   │       ├── household/
│   │       │   └── route.ts          # GET: profil + events + devices
│   │       ├── devices/
│   │       │   └── [id]/
│   │       │       └── route.ts      # DELETE: révoquer appareil
│   │       └── leave/
│   │           └── route.ts          # POST: quitter le foyer
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── HeroCard.tsx          # État sommeil, chrono, bouton transition
│   │   │   ├── HeroCardCreche.tsx    # Variante post-import (sans durée)
│   │   │   ├── KpiCardMilk.tsx       # Biberons: total, progress bar, zone cible
│   │   │   ├── KpiCardSleep.tsx      # Sommeil: total, progress bar, zone cible
│   │   │   ├── RecapList.tsx         # Liste antéchronologique des événements
│   │   │   ├── RecapItem.tsx         # Ligne d'événement individuelle
│   │   │   └── EmptyState.tsx        # État vide du récap
│   │   ├── toasts/
│   │   │   ├── ToastBottle.tsx       # Saisie biberon (slider mL)
│   │   │   ├── ToastTransition.tsx   # Confirmation transition sommeil (cooldown 5s)
│   │   │   ├── ToastCreche.tsx       # Import crèche (multi-step)
│   │   │   ├── ToastEdit.tsx         # Édition événement (slider prérempli)
│   │   │   └── ToastUndo.tsx         # Undo suppression (cooldown 2s)
│   │   ├── onboarding/
│   │   │   ├── LandingScreen.tsx     # 3 CTAs + illustration
│   │   │   ├── OnboardingForm.tsx    # 3 champs + ScrollWheels poids
│   │   │   ├── JoinScreen.tsx        # Saisie code d'invitation
│   │   │   └── WelcomeBanner.tsx     # Bannière "Bienvenue [prénom]!"
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx     # Fiche bébé + appareils + quitter
│   │   │   └── ProfileHeaderButton.tsx # Bouton accès profil (header dashboard)
│   │   └── ui/
│   │       ├── Slider.tsx            # Slider custom (lait mL)
│   │       ├── TimePicker.tsx        # Sélecteur heure
│   │       ├── ScrollWheels.tsx      # Rouleaux de sélection (poids)
│   │       ├── MomentSelector.tsx    # Sélecteur Matin/Midi/Après-midi
│   │       ├── Toast.tsx             # Container toast générique (bottom sheet)
│   │       ├── ProgressBar.tsx       # Barre de progression KPI
│   │       └── CooldownButton.tsx    # Bouton avec auto-confirm après délai
│   ├── lib/
│   │   ├── sleep-state-machine.ts    # 5 états, transitions, seuils horaires
│   │   ├── sleep-state-machine.test.ts
│   │   ├── cycle-window.ts           # Logique coucher→coucher
│   │   ├── cycle-window.test.ts
│   │   ├── medical-targets.ts        # Zones cibles lait/sommeil par âge/poids
│   │   ├── medical-targets.test.ts
│   │   ├── demo-data.ts              # Snapshot Léo 4 mois, figé 17h30
│   │   ├── format.ts                 # Formatage durées (Xh00/Xmin), heures (14h30)
│   │   ├── format.test.ts
│   │   ├── supabase/
│   │   │   ├── client.ts             # createClient Supabase (browser)
│   │   │   ├── server.ts             # createClient Supabase (server/API routes)
│   │   │   └── types.ts              # Types générés Supabase
│   │   ├── auth/
│   │   │   ├── jwt.ts                # sign/verify JWT via jose
│   │   │   ├── cookies.ts            # set/get/clear cookie httpOnly
│   │   │   └── guard.ts              # Extraction profileId depuis JWT
│   │   └── schemas/
│   │       ├── event.ts              # Zod: CreateEventSchema, UpdateEventSchema
│   │       ├── profile.ts            # Zod: CreateProfileSchema, UpdateProfileSchema
│   │       └── sleep-state.ts        # Zod: TransitionSchema
│   ├── hooks/
│   │   ├── useHousehold.ts           # Accès au HouseholdContext
│   │   ├── useRealtimeSync.ts        # Subscribe Supabase Realtime
│   │   ├── useTheme.ts              # data-theme day/night basé sur sleepState
│   │   ├── useSleepChrono.ts         # Calcul durée écoulée (requestAnimationFrame)
│   │   └── useDemo.ts               # Logique mode démo (state en mémoire)
│   ├── contexts/
│   │   ├── HouseholdContext.tsx       # Provider: profil, events, devices, isDemo
│   │   └── ThemeContext.tsx           # Provider: thème day/night
│   └── types/
│       ├── index.ts                  # SleepState, BabyEvent, Profile, DeviceSession
│       └── api.ts                    # ApiResponse<T>, ApiError
```

### Frontières Architecturales

**Frontière API (src/app/api/) :**
- Point unique d'entrée/sortie des données vers Supabase
- Chaque route vérifie le JWT et extrait `profileId` via `guard.ts`
- Validation Zod à l'entrée, mapping snake_case ↔ camelCase
- Réponses uniformes : `{ data: T }` ou `{ error: { message, code? } }`
- Aucun composant client n'accède directement à Supabase (sauf Realtime subscribe)

**Frontière Composants (src/components/) :**
- Les composants reçoivent des données via `useHousehold()` (Context)
- Les actions passent par les fonctions du Context (`addEvent`, `transitionSleepState`, etc.)
- Les composants `ui/` sont purement présentationnels — pas d'accès Context
- Les composants `dashboard/`, `toasts/`, `onboarding/`, `profile/` orchestrent les `ui/`

**Frontière Données (src/lib/) :**
- Les modules `lib/` sont des fonctions pures — pas d'effets de bord, pas d'accès réseau
- `sleep-state-machine.ts`, `cycle-window.ts`, `medical-targets.ts`, `format.ts` : pur calcul
- `supabase/`, `auth/` : accès infrastructure (DB, JWT)
- `schemas/` : validation (Zod)
- `demo-data.ts` : données statiques

**Frontière Mode Démo :**
- Le `HouseholdContext` détecte `isDemo` et route les mutations :
  - `isDemo = false` → appels API → Supabase → Realtime broadcast
  - `isDemo = true` → mutations React state en mémoire, aucun appel réseau
- Les composants UI sont identiques — la frontière est dans le Context

### Mapping Requirements → Structure

**FR1–FR5 (Onboarding & Accès) :**
- `(landing)/page.tsx`, `onboarding/page.tsx`, `join/page.tsx`
- `components/onboarding/` (LandingScreen, OnboardingForm, JoinScreen, WelcomeBanner)
- `api/profiles/route.ts`, `api/join/route.ts`

**FR6–FR10 (Sessions & Auth) :**
- `middleware.ts`, `lib/auth/` (jwt.ts, cookies.ts, guard.ts)
- `api/devices/[id]/route.ts`, `api/leave/route.ts`
- `components/profile/` (gestion appareils, quitter)

**FR11–FR18 (Dashboard & Consultation) :**
- `(app)/page.tsx`
- `components/dashboard/` (HeroCard, KpiCardMilk, KpiCardSleep, RecapList, RecapItem, EmptyState)
- `lib/cycle-window.ts`, `lib/medical-targets.ts`, `lib/format.ts`
- `hooks/useSleepChrono.ts`

**FR19–FR21 (Saisie Live — Lait) :**
- `components/toasts/ToastBottle.tsx`
- `components/ui/Slider.tsx`, `components/ui/TimePicker.tsx`
- `api/events/route.ts`

**FR22–FR26 (Saisie Live — Sommeil) :**
- `components/toasts/ToastTransition.tsx`, `components/dashboard/HeroCard.tsx`
- `lib/sleep-state-machine.ts`
- `api/sleep-state/route.ts`

**FR27–FR30 (Saisie Crèche — Batch) :**
- `components/toasts/ToastCreche.tsx`
- `components/ui/MomentSelector.tsx`, `components/ui/Slider.tsx`
- `api/events/route.ts`

**FR31–FR34 (Édition & Suppression) :**
- `components/toasts/ToastEdit.tsx`, `components/toasts/ToastUndo.tsx`
- `api/events/[id]/route.ts`

**FR35–FR39 (Profil Bébé) :**
- `(app)/profile/page.tsx`, `components/profile/ProfileScreen.tsx`
- `api/profiles/route.ts`
- `lib/medical-targets.ts` (recalcul zones cibles)

**FR40–FR42 (Mode Démo) :**
- `lib/demo-data.ts`
- `hooks/useDemo.ts`
- `contexts/HouseholdContext.tsx` (branchement isDemo)

**FR43–FR44 (Synchronisation) :**
- `hooks/useRealtimeSync.ts`
- `lib/supabase/client.ts` (channel Realtime)

**FR45 (Thème Visuel) :**
- `contexts/ThemeContext.tsx`
- `hooks/useTheme.ts`
- `app/globals.css` (CSS variables day/night)

### Cross-Cutting Concerns → Localisation

| Concern | Fichiers principaux |
|---|---|
| Cycle coucher→coucher | `lib/cycle-window.ts` → consommé par KpiCard*, RecapList |
| Machine d'états sommeil | `lib/sleep-state-machine.ts` → consommé par HeroCard, ThemeContext, API sleep-state |
| Sync Realtime | `hooks/useRealtimeSync.ts` → instancié dans `(app)/layout.tsx` |
| Thème jour/nuit | `contexts/ThemeContext.tsx` + `globals.css` → affecte toute l'interface |
| Valeurs par défaut | calculées dans `HouseholdContext` (moyenne 10 derniers biberons) |

### Points d'intégration

**Communication interne :**
- Composants → Context : `useHousehold()` pour lecture, fonctions d'action pour mutations
- Context → API : fetch sur les routes `/api/*`
- API → Supabase : `lib/supabase/server.ts`
- Supabase → Clients : Realtime broadcast via channel `household:{profileId}`

**Intégrations externes :**
- Supabase (DB + Realtime) — seul service externe
- Vercel (hosting + CI/CD auto-deploy)

**Flux de données (saisie biberon, exemple) :**
1. Utilisateur tap "Biberon" → `ToastBottle` s'ouvre
2. Slide quantité → tap confirmer → `addEvent()` dans Context
3. Context : optimistic update (UI immédiate) + `POST /api/events`
4. API route : validation Zod → insertion Supabase
5. Supabase Realtime → broadcast INSERT → autre appareil
6. Autre appareil : `useRealtimeSync` reçoit l'event → update Context → UI refresh

## Validation Architecturale

### Validation de Cohérence

**Compatibilité des décisions :**
- Next.js 16 + React 19.2 + Tailwind CSS 4 + Supabase + jose — stack 100% compatible, validée en production sur atable
- Turbopack (dev) + Vercel (prod) — pipeline native Next.js, aucun conflit
- Zod (validation) + TypeScript strict — complémentaires et cohérents
- Vitest + Testing Library — compatible React 19 et Next.js

**Cohérence des patterns :**
- snake_case (DB) → camelCase (TS) avec mapping explicite dans les API routes — cohérent
- Composants PascalCase, fichiers kebab-case pour `lib/`, PascalCase pour composants — aligné conventions React/Next.js
- Tests co-localisés — pattern unique et clair
- Format `{ data: T }` / `{ error: { message } }` — uniforme sur toutes les routes

**Alignement de la structure :**
- L'arborescence reflète exactement les décisions : route groups `(app)/`+`(landing)/`, API routes, composants par feature
- Frontières nettes : API = seul accès Supabase (hors Realtime), `lib/` = fonctions pures, `ui/` = présentationnel
- Mode démo branché au niveau Context — zéro duplication de composants

### Couverture des Requirements

**Functional Requirements (45/45) — 100% couverts :**

| FRs | Couverture architecturale | Status |
|---|---|---|
| FR1–FR5 (Onboarding) | Routes `(landing)/`, composants `onboarding/`, API `profiles`+`join` | Complet |
| FR6–FR10 (Sessions) | `middleware.ts`, `lib/auth/`, API `devices`+`leave` | Complet |
| FR11–FR18 (Dashboard) | `(app)/page.tsx`, `components/dashboard/`, `lib/cycle-window`+`medical-targets` | Complet |
| FR19–FR21 (Lait live) | `ToastBottle`, `Slider`, API `events` | Complet |
| FR22–FR26 (Sommeil live) | `HeroCard`, `ToastTransition`, `sleep-state-machine`, API `sleep-state` | Complet |
| FR27–FR30 (Crèche batch) | `ToastCreche`, `MomentSelector`, API `events` | Complet |
| FR31–FR34 (Édition) | `ToastEdit`, `ToastUndo`, API `events/[id]` | Complet |
| FR35–FR39 (Profil) | `ProfileScreen`, API `profiles`, `medical-targets` | Complet |
| FR40–FR42 (Démo) | `demo-data.ts`, `useDemo`, `HouseholdContext` (branchement isDemo) | Complet |
| FR43–FR44 (Sync) | `useRealtimeSync`, Supabase Realtime channel | Complet |
| FR45 (Thème) | `ThemeContext`, `useTheme`, CSS variables `globals.css` | Complet |

**Non-Functional Requirements (9/9) — 100% couverts :**

| NFR | Solution architecturale | Status |
|---|---|---|
| NFR1 (Dashboard < 3s) | SPA client-side, données pré-chargées dans Context via `(app)/layout.tsx` | Couvert |
| NFR2 (Feedback < 200ms) | Optimistic updates dans HouseholdContext | Couvert |
| NFR3 (FCP < 2s) | Next.js + Turbopack + SW cache assets | Couvert |
| NFR4 (Chrono exact) | `sleep_state_since` serveur-side, `useSleepChrono` calcule le delta | Couvert |
| NFR5 (Cookies httpOnly) | `lib/auth/cookies.ts` — httpOnly, secure, sameSite | Couvert |
| NFR6 (Pas d'info leakage) | API `join` retourne 404 générique quel que soit le code | Couvert |
| NFR7 (Révocation) | `DELETE /api/devices/[id]` supprime la session | Couvert |
| NFR8 (État sommeil survit) | `sleep_state` persisté dans `pousse_profiles` (DB), pas en mémoire | Couvert |
| NFR9 (Données démo intactes) | `demo-data.ts` statique, copié en mémoire, refresh = reset | Couvert |

### Analyse des Gaps

**Aucun gap critique identifié.**

**Gaps importants (non-bloquants) :**
1. **RLS Supabase** — mentionné comme décision mais les policies exactes ne sont pas écrites. À définir dans la première story d'implémentation DB.
2. **Service Worker** — `sw.js` pour cache assets, mais la stratégie de cache (cache-first, stale-while-revalidate) n'est pas spécifiée. À décider à l'implémentation PWA.

### Checklist de Complétude

**Analyse des Requirements :**
- [x] Contexte projet analysé en profondeur
- [x] Scale et complexité évalués
- [x] Contraintes techniques identifiées
- [x] Cross-cutting concerns mappés

**Décisions Architecturales :**
- [x] Décisions critiques documentées avec versions
- [x] Stack technique complètement spécifiée
- [x] Patterns d'intégration définis
- [x] Considérations de performance adressées

**Patterns d'Implémentation :**
- [x] Conventions de naming établies
- [x] Patterns de structure définis
- [x] Patterns de communication spécifiés
- [x] Patterns de process documentés

**Structure du Projet :**
- [x] Arborescence complète définie (~60 fichiers)
- [x] Frontières de composants établies
- [x] Points d'intégration mappés
- [x] Mapping requirements → structure complet (45 FRs, 9 NFRs)

### Évaluation de Préparation

**Status global : PRÊT POUR L'IMPLÉMENTATION**

**Niveau de confiance : Élevé** — stack éprouvée sur atable, patterns clairs, structure détaillée, aucun gap critique.

**Forces clés :**
- Réutilisation directe des patterns atable (auth, JWT, foyer) — risque technique minimal
- Machine d'états sommeil isolée en module pur TS — testable, prévisible
- Mode démo branché au niveau Context — zéro duplication de composants
- Frontières nettes : API = seul accès DB, lib = fonctions pures, ui = présentationnel

**Améliorations futures (post-MVP) :**
- Migration Context → Zustand si perf issues avec graphiques Phase 2
- Notifications push
- Export texte pédiatre
- Monitoring/logging en production

### Handoff d'Implémentation

**Directives pour les agents IA :**
- Suivre toutes les décisions architecturales exactement comme documenté
- Utiliser les patterns d'implémentation de manière cohérente
- Respecter la structure du projet et les frontières
- Se référer à ce document pour toute question architecturale

**Première priorité d'implémentation :**
```bash
npx create-next-app@latest samvabien --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
