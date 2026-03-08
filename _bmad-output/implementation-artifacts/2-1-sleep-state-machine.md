# Story 2.1: Machine d'états sommeil & API transition

Status: review

## Story

As a parent,
I want déclencher une transition d'état sommeil,
So that l'app reflète en temps réel si mon bébé dort ou est éveillé.

## Acceptance Criteria

1. **Given** le module `lib/sleep-state-machine.ts` est implémenté **When** j'appelle `getNextTransitions('awake', 14)` **Then** l'action primaire est "😴 Sieste" et l'alternative est "🌙 Coucher du soir" (zone 6h–17h)

2. **Given** le module `lib/sleep-state-machine.ts` est implémenté **When** j'appelle `getNextTransitions('awake', 18)` **Then** l'action primaire est "🌙 Coucher du soir" et l'alternative est "😴 Sieste" (zone 17h–23h)

3. **Given** le bébé est en état `night` ou `night-sleep` **When** j'appelle `getNextTransitions` à 6h **Then** l'action primaire est "☀️ Réveil matin" et l'alternative est "🫣 Réveil nocturne" (zone 5h–8h)

4. **Given** le bébé est en état `nap` **When** j'appelle `getNextTransitions` **Then** l'action est "☀️ Fin de sieste" sans alternative

5. **Given** le bébé est en état `night-wake` **When** j'appelle `getNextTransitions` **Then** l'action est "🌙 Rendormi" sans alternative

6. **Given** je suis authentifié et le bébé est en état `awake` **When** j'envoie POST /api/sleep-state avec newState='nap' et time=now **Then** le champ `sleep_state` de pousse_profiles passe à 'nap', `sleep_state_since` est mis à jour, `sleep_state_moment` est null **And** un événement de type 'nap' est créé dans pousse_events avec started_at = time

7. **Given** les tests unitaires de sleep-state-machine **When** je lance vitest **Then** tous les cas de la matrice transitions × seuils horaires passent (awake→nap, awake→night, night→night-wake, night-wake→night-sleep, night/night-sleep→awake, nap→awake)

## Tasks / Subtasks

- [x] Task 1 — Créer le type SleepState et les types associés (AC: #1–#5)
  - [x] `src/types/index.ts` : ajouter `SleepState = 'awake' | 'nap' | 'night' | 'night-wake' | 'night-sleep'`
  - [x] Ajouter les types `TransitionAction`, `TransitionResult` (primary + alt optionnel)
  - [x] Chaque action : `{ label: string, emoji: string, targetState: SleepState }`
- [x] Task 2 — Implémenter `lib/sleep-state-machine.ts` (AC: #1–#5)
  - [x] Constante `SLEEP_THRESHOLDS` avec les bornes horaires (bornes [début, fin[ — inclusive/exclusive)
  - [x] Fonction `getNextTransitions(state: SleepState, hour: number): TransitionResult`
  - [x] Table de transitions :
    - `awake` + 6h–17h → primary "😴 Sieste" (nap), alt "🌙 Coucher du soir" (night)
    - `awake` + 17h–23h → primary "🌙 Coucher du soir" (night), alt "😴 Sieste" (nap)
    - `awake` + 23h–6h → primary "🌙 Coucher du soir" (night), pas d'alt
    - `nap` → primary "☀️ Fin de sieste" (awake), pas d'alt
    - `night`/`night-sleep` + 19h–5h → primary "🫣 Réveil nocturne" (night-wake), alt "☀️ Réveil matin" (awake)
    - `night`/`night-sleep` + 5h–8h → primary "☀️ Réveil matin" (awake), alt "🫣 Réveil nocturne" (night-wake)
    - `night`/`night-sleep` + après 8h → primary "☀️ Réveil matin" (awake), pas d'alt
    - `night-wake` → primary "🌙 Rendormi" (night-sleep), pas d'alt
  - [x] Fonction `getTheme(state: SleepState): 'day' | 'night'` — awake → day, tout le reste → night
  - [x] Fonction `getHeroDisplay(state: SleepState, since: string | null, moment: string | null)` — retourne emoji, label, durée (si since existe), subtitle (si since existe)
  - [x] Export nommé, pas de default export
- [x] Task 3 — Écrire les tests `lib/sleep-state-machine.test.ts` (AC: #7)
  - [x] Tester chaque ligne de la matrice transitions × seuils
  - [x] Tester les bornes exactes (6h00 = sieste, 16h59 = sieste, 17h00 = coucher)
  - [x] Tester `getTheme` pour chaque état
  - [x] Tester `getHeroDisplay` avec since (durée affichée) et avec moment (sans durée)
  - [x] Tester le fallback night-sleep = mêmes transitions que night
- [x] Task 4 — Créer le Zod schema de transition (AC: #6)
  - [x] `src/lib/schemas/sleep-state.ts` : `TransitionSchema = z.object({ newState: z.enum([...]), time: z.string().datetime() })`
  - [x] Valider que newState est un état valide de SleepState
- [x] Task 5 — Créer la table pousse_events si nécessaire (AC: #6)
  - [x] Vérifier que la migration `supabase/migrations/001_init.sql` (créée en Story 1.2) inclut pousse_events
  - [x] Si absent, ajouter la migration — DÉJÀ PRÉSENT dans 001_init.sql
  - [x] RLS policy : seuls les membres du foyer (via session) peuvent lire/écrire — RLS enabled, API uses service role
- [x] Task 6 — Créer l'API route POST /api/sleep-state (AC: #6)
  - [x] `src/app/api/sleep-state/route.ts`
  - [x] Auth guard : extraire profileId du JWT via `guard.ts`
  - [x] Valider le body avec TransitionSchema (Zod)
  - [x] Vérifier que la transition est légale : charger l'état actuel, appeler `getNextTransitions`, vérifier que newState est dans primary ou alt
  - [x] Transaction Supabase :
    1. UPDATE pousse_profiles SET sleep_state = newState, sleep_state_since = time, sleep_state_moment = null
    2. INSERT pousse_events (profile_id, type = newState, value = 0, started_at = time)
  - [x] Si l'état précédent était une sieste/nuit, calculer la durée et UPDATE pousse_events.ended_at + value (minutes) sur l'événement précédent
  - [x] Retour : `{ data: { sleepState, sleepStateSince, event } }`
  - [x] Mapping snake_case → camelCase dans la response

## Dev Notes

### Architecture — Module pur TypeScript
`sleep-state-machine.ts` est un module **pur** : fonctions pures, pas d'effets de bord, pas d'accès réseau. Il est consommé par :
- La hero card (affichage état + transitions possibles)
- Le ThemeContext (bascule jour/nuit)
- L'API route /api/sleep-state (validation des transitions)

Ne PAS importer de code côté serveur dans ce module — il tourne aussi côté client.

### Convention de bornes horaires
Les plages sont **[début, fin[** (borne gauche inclusive, droite exclusive) :
- 6h–17h = `hour >= 6 && hour < 17`
- 17h–23h = `hour >= 17 && hour < 23`
- 23h–6h = `hour >= 23 || hour < 6`

### Calcul de durée (getHeroDisplay)
- Si `since` est non-null : calculer `now() - since` et formater avec `format.ts` (créer si absent)
- Si `moment` est non-null et `since` est null : afficher seulement l'emoji + label, sans durée ni subtitle
- Format durée : `lib/format.ts` → `formatDuration(ms)` retourne "Xh00" si ≥ 1h, "Xmin" si < 1h

### Événement précédent — ended_at et value
Quand on quitte un état sommeil (nap→awake, night→awake, etc.) :
- Trouver le dernier événement ouvert (type = état précédent, ended_at = null)
- Calculer la durée en minutes : `(time - started_at) / 60000`
- UPDATE ended_at = time, value = durée en minutes

### Événements import crèche vs live
- Import crèche : `started_at = null`, `moment = 'morning'|'noon'|'afternoon'`, `value = durée en minutes`
- Live : `started_at = timestamp`, `moment = null`, `value` calculé à la fin

### Anti-patterns à éviter
- NE PAS utiliser XState ou une librairie de state machine — c'est un simple switch/lookup
- NE PAS hardcoder les labels/emojis dans l'API route — les obtenir via `getNextTransitions`
- NE PAS créer de timer client-side — la durée se calcule à partir de `sleep_state_since` stocké en DB

### Project Structure Notes
- `src/lib/sleep-state-machine.ts` — module pur, fonctions exportées nommées
- `src/lib/sleep-state-machine.test.ts` — tests co-localisés
- `src/lib/schemas/sleep-state.ts` — Zod schema
- `src/app/api/sleep-state/route.ts` — API route POST
- `src/types/index.ts` — types SleepState, TransitionAction, TransitionResult

### Dépendances
- Story 1.1 : fondation projet (Next.js, structure)
- Story 1.2 : auth (JWT, guard.ts, middleware), tables DB (pousse_profiles avec sleep_state)
- Aucune dépendance sur d'autres stories Epic 2

### Stack technique rappel
- TypeScript 5 strict, pas de `any`
- Vitest pour les tests
- Zod pour la validation
- Supabase `lib/supabase/server.ts` pour les API routes
- Format réponse API : `{ data: T }` ou `{ error: { message } }`

### References

- [Source: docs/ux-sleep-state-machine.md] — Spec complète machine d'états, transitions, seuils
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — Module pur TS
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Schema pousse_events, pousse_profiles
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — POST /api/sleep-state
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR22–FR26, NFR4, NFR8]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Tests timezone fix: used local Date constructors instead of UTC ISO strings for getHeroDisplay tests
- actionWord fix: night-wake state should show "Réveillé" not "Endormi"

### Completion Notes List
- Types SleepState, TransitionAction, TransitionResult, HeroDisplay ajoutés (existaient partiellement)
- sleep-state-machine.ts : module pur avec getNextTransitions, getTheme, getHeroDisplay
- format.ts : formatDuration (Xh00/Xmin) et formatTime (14h30)
- Zod TransitionSchema pour validation API
- pousse_events déjà présent dans 001_init.sql — vérifié
- API route POST /api/sleep-state avec validation transition légale, clôture événement précédent
- 32 tests passent (transitions × bornes horaires, getTheme, getHeroDisplay)

### Change Log
- 2026-03-08: Story 2.1 implémentée — machine d'états sommeil, API transition, 32 tests

### File List
- src/types/index.ts (modifié — ajout TransitionAction, TransitionResult, HeroDisplay)
- src/lib/sleep-state-machine.ts (nouveau)
- src/lib/sleep-state-machine.test.ts (nouveau)
- src/lib/format.ts (nouveau)
- src/lib/schemas/sleep-state.ts (nouveau)
- src/app/api/sleep-state/route.ts (nouveau)
