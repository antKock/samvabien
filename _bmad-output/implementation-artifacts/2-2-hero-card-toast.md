# Story 2.2: Hero card & toast de transition

Status: done

## Story

As a parent,
I want voir l'état de sommeil actuel avec la durée écoulée et confirmer les transitions via un toast,
So that je sais en un coup d'œil depuis combien de temps mon bébé dort ou est éveillé.

## Acceptance Criteria

1. **Given** le bébé est en état `awake` depuis 2h14 **When** j'ouvre l'app **Then** la hero card affiche "☀️ Éveillé depuis 2h14" avec le subtitle "Réveillé à [heure]" **And** le compteur se met à jour en temps réel (exact à la seconde près — NFR4)

2. **Given** le bébé est en état `nap` depuis 45min **When** j'ouvre l'app **Then** la hero card affiche "😴 Dort depuis 45min"

3. **Given** le dernier changement d'état provient d'un import crèche (moment au lieu de startTime) **When** j'ouvre l'app **Then** la hero card affiche seulement "☀️ Éveillé" ou "😴 Dort" sans durée ni subtitle

4. **Given** la hero card est affichée **When** je tape dessus **Then** un toast apparaît en bas de l'écran avec l'action primaire contextuelle (selon l'heure et l'état), l'heure actuelle, et un cooldown de 5s (bordure animée anti-horaire depuis le haut)

5. **Given** le toast de transition est affiché avec un cooldown actif **When** le cooldown expire (5s) **Then** l'action primaire affichée est automatiquement confirmée, la hero card se met à jour

6. **Given** le toast de transition est affiché **When** je tape hors du toast **Then** l'action primaire est confirmée (équivaut à l'expiration du cooldown)

7. **Given** le toast affiche une action alternative (zone d'ambiguïté) **When** je tape sur le bouton alt **Then** primary et alt s'échangent dans le toast, le cooldown repart à 5s

8. **Given** le toast de transition est affiché **When** je tape le bouton ↩ (annuler) **Then** le toast se ferme sans effectuer de transition

## Tasks / Subtasks

- [x] Task 1 — Créer le composant HeroCard (AC: #1, #2, #3)
  - [x] `src/components/dashboard/HeroCard.tsx`
  - [x] Props : reçoit les données via `useHousehold()` (sleepState, sleepStateSince, sleepStateMoment)
  - [x] Appeler `getHeroDisplay(state, since, moment)` de sleep-state-machine pour obtenir emoji, label, durée, subtitle
  - [x] Affichage avec durée (since non-null) : emoji + label + durée temps réel + subtitle "Réveillé/Endormi à [heure]"
  - [x] Affichage sans durée (moment, pas de since) : emoji + label seul — cf. HeroCardCreche dans architecture
  - [x] Style : fond surface, border-radius 20px, padding 20px, ombre douce
  - [x] Emoji : 32-40px, label : 20px weight 800, subtitle : 12px weight 600 couleur textSec
  - [x] `<button>` — toute la carte est tappable, cursor pointer
- [x] Task 2 — Créer le hook useSleepChrono (AC: #1, #2)
  - [x] `src/hooks/useSleepChrono.ts`
  - [x] Input : `sleepStateSince: string | null`
  - [x] Output : durée formatée (string) mise à jour en temps réel
  - [x] Utiliser `requestAnimationFrame` ou `setInterval(1000)` pour mettre à jour chaque seconde
  - [x] Calculer delta : `Date.now() - new Date(sleepStateSince).getTime()`
  - [x] Formater avec `formatDuration()` de `lib/format.ts`
  - [x] Si since est null → retourner null (pas de durée à afficher)
  - [x] Cleanup : annuler l'interval/RAF au unmount
- [x] Task 3 — Créer le composant Toast générique (AC: #4)
  - [x] `src/components/ui/Toast.tsx`
  - [x] Container bottom sheet : fond surface, border-radius 20px en haut, padding 16-20px
  - [x] Overlay semi-transparent derrière le toast
  - [x] Props : `children`, `onDismiss`, `onBackdropTap`
  - [x] Animation d'entrée : slide-up depuis le bas
  - [x] Le backdrop tap appelle `onBackdropTap` (pas onDismiss — comportement différent selon le toast)
- [x] Task 4 — Créer le composant CooldownButton (AC: #4, #5)
  - [x] `src/components/ui/CooldownButton.tsx`
  - [x] Bordure animée SVG : cercle/rectangle arrondi dont le stroke se réduit de 100% à 0% en 5s, sens anti-horaire depuis le haut
  - [x] Props : `duration` (ms, défaut 5000), `onExpire`, `onTap`, `label`, `emoji`
  - [x] À l'expiration → appelle `onExpire`
  - [x] Au tap → appelle `onTap` (confirmation manuelle immédiate)
  - [x] Le cooldown peut être reset (via ref/key) quand on échange primary/alt
- [x] Task 5 — Créer le composant ToastTransition (AC: #4–#8)
  - [x] `src/components/toasts/ToastTransition.tsx`
  - [x] Au montage : appeler `getNextTransitions(currentState, currentHour)` pour obtenir primary + alt
  - [x] Afficher : action primaire avec CooldownButton, heure actuelle (tappable → Story 2.3), bouton ↩ annuler
  - [x] Si alt existe : bouton secondaire avec l'action alternative
  - [x] **Cooldown expire** → appeler POST /api/sleep-state avec l'action primaire affichée, fermer le toast
  - [x] **Tap hors toast** → même comportement que l'expiration (confirme primary)
  - [x] **Tap alt** → échanger primary et alt dans le state local, reset cooldown à 5s
  - [x] **Tap ↩** → fermer le toast sans transition
  - [x] Optimistic update : mettre à jour le HouseholdContext immédiatement, rollback si API échoue
- [x] Task 6 — Créer le HouseholdContext minimal (AC: #1–#8)
  - [x] `src/contexts/HouseholdContext.tsx`
  - [x] State : `{ profile, events, devices, isDemo, isLoading }`
  - [x] Fonction `transitionSleepState(newState, time)` :
    1. Optimistic update du profile.sleepState + sleepStateSince
    2. POST /api/sleep-state
    3. Si erreur → rollback + toast d'erreur
  - [x] Hook `useHousehold()` dans `src/hooks/useHousehold.ts`
  - [x] Chargement initial via GET /api/household (créé en Story 1.5)
  - [x] Provider wrappé dans `src/app/(app)/layout.tsx`
- [x] Task 7 — Intégrer la hero card dans le dashboard (AC: #1–#8)
  - [x] Dans `src/app/(app)/dashboard/page.tsx` : rendre `<HeroCard />`
  - [x] Au tap hero card → ouvrir `<ToastTransition />`
  - [x] State local `isToastOpen` pour gérer l'affichage du toast

## Dev Notes

### Chrono temps réel — NFR4
Le chrono DOIT être exact à la seconde près. Le calcul se fait côté client à partir de `sleep_state_since` (timestamp serveur persisté en DB). Pas de timer serveur, pas de WebSocket pour le chrono — juste un delta `Date.now() - since`.

`requestAnimationFrame` est préférable à `setInterval` pour la fluidité, mais `setInterval(1000)` est acceptable si RAF est trop lourd.

### Optimistic updates — NFR2
Feedback visuel < 200ms. La hero card se met à jour AVANT la confirmation API :
1. UI update immédiat (state local)
2. POST /api/sleep-state en parallèle
3. Si erreur → rollback + message d'erreur

### Toast — Backdrop tap = confirme
Contrairement aux toasts classiques (backdrop = fermer/annuler), ici le **tap hors toast confirme l'action** (= cooldown expire). C'est un choix UX documenté dans `docs/ux-sleep-state-machine.md`.

### Cooldown — Animation SVG
Bordure animée anti-horaire depuis le haut. Implémentation recommandée :
- SVG `<circle>` ou `<rect rx>` avec `stroke-dasharray` et `stroke-dashoffset`
- CSS animation de 5s linear sur `stroke-dashoffset` de 0 à la longueur totale
- Sens anti-horaire = rotation de -90deg initiale

### HouseholdContext — Premier squelette
Cette story crée le HouseholdContext minimal. Il sera enrichi dans les stories suivantes (KPI cards, récap, mode démo). Pour l'instant :
- Charger profil + events + devices via GET /api/household
- Exposer transitionSleepState
- Pas encore de Supabase Realtime (Epic séparé)

### Format d'heure dans le toast
L'heure actuelle affichée dans le toast : format "14h30" (sans zéro initial pour les heures, cf. architecture § Format Patterns). Utiliser `lib/format.ts` → `formatTime(date)`.

### Palette couleurs hero card
- Thème jour (awake) : fond `#ffffff` (surface), texte hero `#4a5a32`, textSec `#8a8870`
- Thème nuit (nap, night, etc.) : fond `#22221a` (surface), texte hero `#98a878`, textSec `#7a7a60`
- La bascule de thème est gérée par Story 2.4 — pour l'instant, la hero card utilise les couleurs day

### Dépendances
- Story 2.1 : sleep-state-machine.ts, API /api/sleep-state, types SleepState
- Story 1.5 : API GET /api/household
- Story 1.1 : structure projet, Tailwind
- Story 1.2 : auth, guard.ts

### Anti-patterns à éviter
- NE PAS créer un composant HeroCardCreche séparé — un seul HeroCard avec affichage conditionnel (si since = null → pas de durée)
- NE PAS utiliser `useEffect` pour le chrono — utiliser un hook dédié `useSleepChrono`
- NE PAS mettre le state du toast dans le Context — c'est du state local au dashboard
- NE PAS hardcoder les couleurs — utiliser les CSS variables Tailwind du design system

### Project Structure Notes
- `src/components/dashboard/HeroCard.tsx` — composant principal
- `src/components/toasts/ToastTransition.tsx` — toast de transition
- `src/components/ui/Toast.tsx` — container toast réutilisable
- `src/components/ui/CooldownButton.tsx` — bouton avec cooldown
- `src/hooks/useSleepChrono.ts` — chrono temps réel
- `src/hooks/useHousehold.ts` — accès Context
- `src/contexts/HouseholdContext.tsx` — state global foyer
- `src/lib/format.ts` — formatage durée/heure (créer si absent)

### References

- [Source: docs/ux-sleep-state-machine.md] — Confirm card, cooldown, alt, time picker
- [Source: docs/ux-sleep-state-machine.md#Hero card — Affichage post-import crèche]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — HouseholdContext, ThemeProvider
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Optimistic updates
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation] — Palette COLORS
- [Source: docs/design-reference.html] — Maquettes pixel-perfect hero card + toast
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR11, FR22–FR26, NFR2, NFR4]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Dashboard refactored from standalone fetch to useHousehold() context
- HouseholdProvider wrapped in (app)/layout.tsx

### Completion Notes List
- HeroCard avec affichage conditionnel durée/moment, chrono temps réel via useSleepChrono
- Toast générique avec backdrop, slide-up animation, escape key
- CooldownButton avec SVG animé, pause/resume/reset via ref
- ToastTransition avec swap alt, cooldown expire, backdrop confirm, cancel
- HouseholdContext avec optimistic updates et rollback
- Dashboard intégré avec HeroCard + ToastTransition

### Change Log
- 2026-03-08: Story 2.2 implémentée — hero card, toast transition, HouseholdContext

### File List
- src/components/dashboard/HeroCard.tsx (nouveau)
- src/components/ui/Toast.tsx (nouveau)
- src/components/ui/CooldownButton.tsx (nouveau)
- src/components/toasts/ToastTransition.tsx (nouveau)
- src/hooks/useSleepChrono.ts (nouveau)
- src/hooks/useHousehold.ts (nouveau)
- src/contexts/HouseholdContext.tsx (nouveau)
- src/app/(app)/layout.tsx (modifié — ajout HouseholdProvider)
- src/app/(app)/dashboard/page.tsx (modifié — intégration HeroCard + ToastTransition)
