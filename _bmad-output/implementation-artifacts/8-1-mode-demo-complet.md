# Story 8.1: Mode démo complet

Status: ready-for-dev

## Story

As a visiteur,
I want essayer l'app avec des données fictives réalistes,
So that je peux voir comment elle fonctionne avant de créer mon propre profil.

## Acceptance Criteria

1. **Given** je suis sur la landing screen **When** je tape "Essayer la démo" **Then** une session éphémère est créée et je suis redirigé vers le dashboard avec les données fictives

2. **Given** je suis en mode démo **When** le dashboard s'affiche **Then** les données montrent le bébé "Léo", ~4 mois, avec une journée réaliste figée à 17h30 (historique cohérent de biberons et siestes) **And** les KPI cards, le récap et la hero card reflètent ces données générées

3. **Given** je suis en mode démo **When** j'observe le haut de l'écran **Then** un bandeau discret affiche "Mode démo — données non conservées" avec un CTA "Quitter"

4. **Given** je suis en mode démo **When** j'ajoute un biberon, déclenche une transition sommeil, ou modifie un événement **Then** toutes les fonctionnalités répondent normalement (saisie, édition, suppression, profil) **And** les mutations sont effectuées en mémoire React state uniquement (aucun appel API, aucune écriture Supabase)

5. **Given** je suis en mode démo et j'ai fait des modifications **When** je rafraîchis la page **Then** les données reviennent à l'état de base (snapshot Léo 17h30) — les modifications ne sont pas persistées

6. **Given** je suis en mode démo **When** un autre visiteur accède à la démo en parallèle **Then** mes actions n'ont aucun impact sur son expérience (isolation totale, NFR9)

7. **Given** je suis en mode démo **When** je tape "Quitter" sur le bandeau **Then** je retourne à la landing screen et la session éphémère est terminée

8. **Given** je suis en mode démo **When** j'observe les fonctionnalités absentes **Then** il n'y a pas de code d'invitation, pas de multi-appareil (ces features n'ont pas de sens en démo)

## Tasks / Subtasks

- [ ] Task 1 — Créer `src/lib/demo-data.ts` (AC: #2)
  - [ ] Exporter `DEMO_PROFILE: Profile` — bébé "Léo", né il y a ~4 mois (calculer dynamiquement depuis la date courante), poids 62 hg (6,2 kg), `sleepState: 'awake'`, `sleepStateSince: null`, `sleepStateMoment: null`, `weightReminder: true`, `joinCode: 'DEMO-0000'`
  - [ ] Exporter `DEMO_EVENTS: BabyEvent[]` — snapshot figé à 17h30 d'une journée réaliste :
    - Nuit de la veille : type `'night'`, value 600 (10h), startedAt ~21h00 veille
    - Biberon matin 7h30 : type `'bottle'`, value 180
    - Sieste matin 9h30–10h45 : type `'nap'`, value 75, startedAt ~9h30
    - Biberon midi 12h00 : type `'bottle'`, value 200
    - Sieste après-midi 13h30–15h00 : type `'nap'`, value 90, startedAt ~13h30
    - Biberon 15h30 : type `'bottle'`, value 150
    - Événement crèche (sans heure) : type `'bottle'`, value 120, moment `'afternoon'`
  - [ ] Tous les events ont des `id` stables (ex. `'demo-1'`, `'demo-2'`, etc.)
  - [ ] Toutes les dates sont calculées dynamiquement par rapport à la date courante pour que le snapshot soit toujours "aujourd'hui"
- [ ] Task 2 — Créer `src/hooks/useDemo.ts` (AC: #4, #5, #6)
  - [ ] Exporter un hook qui retourne l'interface `HouseholdState` + les actions
  - [ ] State initialisé à partir de `DEMO_PROFILE` et `DEMO_EVENTS`
  - [ ] `addEvent()` : créer un event avec id `demo-new-{timestamp}`, l'ajouter au state local — AUCUN fetch
  - [ ] `updateEvent()` : modifier l'event dans le state local — AUCUN fetch
  - [ ] `deleteEvent()` / `removeEventLocally()` : retirer du state local — AUCUN fetch
  - [ ] `transitionSleepState()` : mettre à jour le profile local + créer l'event de transition — AUCUN fetch
  - [ ] `updateProfile()` : mettre à jour le profile dans le state local — AUCUN fetch
  - [ ] Refresh de la page → le hook se ré-initialise avec les données de base (React state = éphémère)
- [ ] Task 3 — Brancher le mode démo dans `HouseholdContext` (AC: #4, #5)
  - [ ] Ajouter un state `isDemo: boolean` dans le provider
  - [ ] Mécanisme d'activation : quand `isDemo` est true, toutes les actions (addEvent, transitionSleepState, etc.) opèrent en mémoire au lieu d'appeler les API
  - [ ] Option 1 (recommandée) : `HouseholdProvider` accepte une prop `demo?: boolean`. Si `demo`, initialiser le state avec `DEMO_PROFILE` + `DEMO_EVENTS` au lieu de fetcher `/api/household`
  - [ ] Option 2 : créer un `DemoHouseholdProvider` séparé qui wraps les mêmes callbacks mais en mémoire
  - [ ] Choisir l'option qui minimise la duplication de code — le context expose la même interface dans les deux modes
- [ ] Task 4 — Bandeau démo (AC: #3, #7)
  - [ ] Créer `src/components/ui/DemoBanner.tsx`
  - [ ] Texte : "Mode démo — données non conservées" (12px, weight 600, couleur text-sec)
  - [ ] CTA : bouton "Quitter" (style lien, même couleur)
  - [ ] Style : sticky en haut, fond surface, border-bottom, z-index au-dessus du contenu
  - [ ] Au tap "Quitter" → router.push('/') (retour landing)
  - [ ] Affiché conditionnellement dans `(app)/layout.tsx` quand `isDemo === true`
- [ ] Task 5 — Bouton "Essayer la démo" dans LandingScreen (AC: #1)
  - [ ] Le composant `src/components/onboarding/LandingScreen.tsx` a déjà le bouton "Essayer la démo" (primary)
  - [ ] Au tap → naviguer vers `/dashboard?demo=true` (ou une route dédiée)
  - [ ] Le layout `(app)/layout.tsx` détecte le paramètre `demo` et active le mode démo dans le provider
  - [ ] Pas de session serveur, pas de cookie JWT — tout est client-side
- [ ] Task 6 — Masquer les features sans sens en démo (AC: #8)
  - [ ] `ProfileScreen` : masquer la section "Foyer" (code invitation, copier lien, appareils) quand `isDemo`
  - [ ] `ProfileScreen` : masquer le bouton "Quitter le profil" quand `isDemo` (le bouton du bandeau suffit)
  - [ ] `ProfileHeaderButton` : toujours visible (le profil est consultable en démo)
- [ ] Task 7 — Tests unitaires (AC: #1-#8)
  - [ ] Test : DEMO_EVENTS contient un historique cohérent (nuit + biberons + siestes)
  - [ ] Test : useDemo addEvent ajoute un event au state local sans fetch
  - [ ] Test : useDemo transitionSleepState met à jour le profile local
  - [ ] Test : DemoBanner s'affiche avec le bon texte et le bouton Quitter
  - [ ] Test : ProfileScreen masque la section Foyer en mode démo
  - [ ] Test : HouseholdContext en mode démo n'appelle aucune API

## Dev Notes

### Architecture du mode démo

L'architecture spécifie clairement la frontière :
- `isDemo = false` → appels API → Supabase → Realtime broadcast
- `isDemo = true` → mutations React state en mémoire, aucun appel réseau

Le `HouseholdContext` est le point de branchement unique. Les composants UI sont **identiques** — la frontière est dans le context.

### Données démo — snapshot figé 17h30

Le fichier `lib/demo-data.ts` génère des données **relatives à la date courante** pour que le snapshot soit toujours "aujourd'hui à 17h30". Les timestamps sont calculés dynamiquement :

```ts
function todayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function yesterdayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}
```

### Branchement du mode démo dans le provider

L'approche recommandée est une **prop `demo` sur `HouseholdProvider`** :

```tsx
// Dans (app)/layout.tsx
const searchParams = useSearchParams()
const isDemo = searchParams.get('demo') === 'true'

<HouseholdProvider demo={isDemo}>
  {isDemo && <DemoBanner />}
  {children}
</HouseholdProvider>
```

Dans le provider, quand `demo` est true :
- Le `useEffect` d'initialisation charge `DEMO_PROFILE` + `DEMO_EVENTS` au lieu de fetcher l'API
- Toutes les actions mutent le state local sans appeler fetch
- `isDemo` est exposé dans le context pour les composants qui en ont besoin

### Pas de Realtime en démo

Le hook `useRealtimeSync` (Story 7.1) est conditionné par `isDemo === false`. En mode démo, aucune subscription Realtime n'est créée.

### Isolation — NFR9

Chaque visiteur a son propre React state en mémoire. Pas de session server, pas de données partagées. L'isolation est garantie par le fait que le state React est local au navigateur.

### Pas de cookie/session en démo

Le mode démo ne crée **aucun cookie JWT**, **aucune entrée dans `pousse_device_sessions`**. Le middleware doit laisser passer les routes `/dashboard?demo=true` sans exiger de session.

**Important** : vérifier que le middleware `src/middleware.ts` ne bloque pas l'accès au dashboard quand aucun JWT n'est présent et que `demo=true`. Ajouter une exception si nécessaire.

### Anti-patterns à éviter

- NE PAS écrire en Supabase en mode démo — tout est en mémoire React
- NE PAS créer de session/cookie pour la démo — purement client-side
- NE PAS hardcoder des dates absolues dans demo-data — utiliser des dates relatives
- NE PAS dupliquer les actions du context — brancher dans le même provider
- NE PAS oublier de masquer les features multi-appareil dans ProfileScreen
- NE PAS oublier le middleware bypass — sinon le dashboard sera inaccessible en démo
- NE PAS utiliser localStorage/sessionStorage — React state suffit (refresh = reset, AC #5)

### Project Structure Notes

Fichiers à créer :
- `src/lib/demo-data.ts` — DEMO_PROFILE + DEMO_EVENTS
- `src/hooks/useDemo.ts` — hook mode démo (si approche hook séparée)
- `src/components/ui/DemoBanner.tsx` — bandeau mode démo

Fichiers à modifier :
- `src/contexts/HouseholdContext.tsx` — prop `demo`, branchement mémoire
- `src/app/(app)/layout.tsx` — détection `demo` param, DemoBanner
- `src/components/onboarding/LandingScreen.tsx` — handler bouton démo
- `src/components/profile/ProfileScreen.tsx` — masquer section Foyer en démo
- `src/middleware.ts` — exception pour les routes démo

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR40, FR41, FR42] — données fictives, fonctionnalités opérationnelles, isolation
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — mode démo, données en mémoire, isDemo branchement
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure du Projet] — demo-data.ts, useDemo.ts, HouseholdContext
- [Source: docs/ux-onboarding-profil.md#Mode démo] — données Léo 4 mois, bandeau, session éphémère
- [Source: src/contexts/HouseholdContext.tsx] — context actuel à adapter
- [Source: src/components/onboarding/LandingScreen.tsx] — bouton démo existant
- [Source: src/middleware.ts] — middleware auth à adapter
- [Source: src/components/profile/ProfileScreen.tsx] — sections à masquer en démo

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
