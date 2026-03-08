# Story 3.2: Toast biberon (saisie live)

Status: done

## Story

As a parent,
I want enregistrer un biberon en ajustant la quantité avec un slider,
So that le suivi lait est mis à jour en quelques secondes.

## Acceptance Criteria

1. **Given** je suis sur le dashboard **When** je tape sur la KPI card lait **Then** un toast biberon apparaît avec un slider horizontal, une valeur par défaut = moyenne des 10 derniers biberons, l'heure actuelle, et un cooldown de 5s
2. **Given** il n'y a aucun historique de biberons **When** le toast biberon s'ouvre **Then** la valeur par défaut est la médiane de la range (range calculée selon le poids du bébé)
3. **Given** le toast biberon est affiché **When** je fais glisser le slider **Then** la valeur change par pas de 10 mL, affichée au-dessus du thumb (le doigt ne cache pas la valeur)
4. **Given** le toast biberon est affiché **When** je tape sur l'heure **Then** le TimePicker (scroll wheels, composant partagé de Story 2.3) s'ouvre, le cooldown se met en pause
5. **Given** le cooldown du toast biberon expire (5s) **When** je n'ai pas annulé **Then** le biberon est enregistré avec la quantité et l'heure affichées (POST /api/events type='bottle') et la KPI card lait se met à jour immédiatement (optimistic update < 200ms)
6. **Given** le toast biberon est affiché **When** je tape hors du toast **Then** le biberon est enregistré (équivaut à l'expiration du cooldown)
7. **Given** le toast biberon est affiché **When** je tape le bouton ↩ (annuler) **Then** le toast se ferme sans enregistrer de biberon

## Tasks / Subtasks

- [x] Task 1 — Créer `src/components/ui/Slider.tsx` (AC: #3)
  - [x] Props : `value`, `onChange`, `min`, `max`, `step`, `accentColor`
  - [x] Input range HTML natif stylé avec Tailwind
  - [x] Valeur affichée au-dessus du thumb (tooltip flottant)
  - [x] Pas de 10 mL
  - [x] Touch-friendly : zone de tap ≥ 44px de hauteur
- [x] Task 2 — Créer `src/app/api/events/route.ts` (AC: #5)
  - [x] POST : validation Zod (type, value, startedAt, moment optionnel)
  - [x] Vérification JWT + extraction profileId via guard.ts
  - [x] Insertion dans `pousse_events` via Supabase server client
  - [x] Mapping camelCase → snake_case
  - [x] Réponse : `{ data: { event: BabyEvent } }`
- [x] Task 3 — Créer le schema Zod `src/lib/schemas/event.ts` (AC: #5)
  - [x] `CreateEventSchema` : type (enum), value (number > 0), startedAt (ISO string optionnel), moment (enum optionnel)
- [x] Task 4 — Ajouter `addEvent` au HouseholdContext (AC: #5)
  - [x] Optimistic update : ajouter l'event au state immédiatement
  - [x] POST /api/events
  - [x] Rollback + toast erreur si échec
  - [x] Retourner l'event créé (avec l'id serveur)
- [x] Task 5 — Créer `src/components/toasts/ToastBottle.tsx` (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] Utilise Toast (container) + CooldownButton (5s) + Slider + TimePicker
  - [x] Calcule la valeur par défaut : moyenne 10 derniers biberons ou médiane de la range
  - [x] Layout : ↩ | CooldownButton (🍼 Biberon) | heure | + Slider en dessous
  - [x] onBackdropTap = confirmer (AC: #6)
  - [x] onCancel (↩) = fermer sans enregistrer (AC: #7)
  - [x] onExpire/onTap CooldownButton = enregistrer via addEvent (AC: #5)
  - [x] Tap heure → TimePicker inline, pause cooldown (AC: #4)
- [x] Task 6 — Brancher le toast dans KpiCardMilk (AC: #1)
  - [x] État `isBottleToastOpen` dans le dashboard page
  - [x] Tap KPI card lait → ouvrir ToastBottle
  - [x] Fermeture du toast → état reset

## Dev Notes

### Slider — Design specs

- **Input range HTML** stylé via Tailwind + CSS custom (`::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`)
- Thumb : cercle 28px, couleur accent catégorie (milk-accent)
- Track filled : couleur accent, track vide : couleur track
- **Tooltip valeur** : `<span>` positionné au-dessus du thumb, `position: absolute`, calcul left = `((value - min) / (max - min)) * 100%`
- Le tooltip est toujours visible (pas de hover) car le doigt couvre le thumb sur mobile
- Hauteur de la zone interactive : 44px minimum (touch target)
- Range bornes : calculées via `getMilkRange(profile.babyWeightHg)` de `medical-targets.ts` (Story 3.1)

### API route POST /api/events

Pattern identique aux routes existantes (`/api/profiles`, `/api/sleep-state`). Suivre exactement :
```ts
// src/app/api/events/route.ts
import { NextResponse } from 'next/server'
import { getProfileId } from '@/lib/auth/guard'
import { createServerClient } from '@/lib/supabase/server'
import { CreateEventSchema } from '@/lib/schemas/event'

export async function POST(request: Request) {
  const profileId = await getProfileId(request)
  if (!profileId) return NextResponse.json({ error: { message: 'Non autorisé' } }, { status: 401 })

  const body = await request.json()
  const parsed = CreateEventSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { message: 'Données invalides' } }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase.from('pousse_events').insert({
    profile_id: profileId,
    type: parsed.data.type,
    value: parsed.data.value,
    started_at: parsed.data.startedAt ?? new Date().toISOString(),
    moment: parsed.data.moment ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: { message: 'Erreur serveur' } }, { status: 500 })

  // Map snake_case → camelCase
  return NextResponse.json({ data: { event: mapEvent(data) } }, { status: 201 })
}
```

### Valeur par défaut — Calcul

```ts
function getDefaultValue(events: BabyEvent[], weightHg: number): number {
  const bottles = events.filter(e => e.type === 'bottle').slice(0, 10)
  if (bottles.length > 0) {
    return Math.round(bottles.reduce((sum, e) => sum + e.value, 0) / bottles.length / 10) * 10
  }
  // Fallback : médiane de la range
  const range = getMilkRange(weightHg)
  return Math.round((range.min + range.max) / 2 / 10) * 10
}
```

Les events doivent être triés par date décroissante (les 10 plus récents). Le HouseholdContext stocke les events — les filtrer côté composant.

### Optimistic update pattern

Suivre exactement le pattern de `transitionSleepState` dans HouseholdContext :
1. Sauvegarder l'état précédent
2. Mettre à jour le state immédiatement (optimistic)
3. Appeler l'API
4. Si échec → rollback + `setState(s => ({ ...s, error: 'message' }))`
5. Si succès → remplacer l'event optimistic par l'event serveur (avec l'id réel)

### TimePicker — Réutilisation

Le composant `src/components/ui/TimePicker.tsx` existe déjà (Story 2.3). L'utiliser identiquement au pattern de `ToastTransition.tsx` :
- Tap sur l'heure → `setIsPickerOpen(true)` + `cooldownRef.current?.pause()`
- `onConfirm` → `setSelectedTime(time)` + `setIsPickerOpen(false)` + `cooldownRef.current?.reset()`

### Layout du toast biberon

```
┌──────────────────────────────────┐
│  ↩      🍼          14h30       │
│       Biberon                    │
│                                  │
│  30 ═══════●═══════════════ 300  │
│           180 mL                 │
└──────────────────────────────────┘
```

- Ligne 1 : bouton annuler (↩), CooldownButton central (🍼 + "Biberon"), heure tappable
- Ligne 2 : Slider pleine largeur avec tooltip valeur au-dessus du thumb
- min/max du slider affichés aux extrémités (texte discret, text-sec)

### Anti-patterns à éviter
- NE PAS créer un nouveau composant Toast — réutiliser `src/components/ui/Toast.tsx`
- NE PAS créer un nouveau CooldownButton — réutiliser `src/components/ui/CooldownButton.tsx`
- NE PAS créer un nouveau TimePicker — réutiliser `src/components/ui/TimePicker.tsx`
- NE PAS stocker la valeur du slider dans un ref — utiliser useState (besoin de rerender pour le tooltip)
- NE PAS hardcoder les bornes du slider — les calculer via `getMilkRange()`
- NE PAS arrondir la valeur par défaut autrement qu'au multiple de 10 le plus proche

### Dépendances

| Module | Fichier | Usage |
|---|---|---|
| Toast | `src/components/ui/Toast.tsx` | Container toast (déjà implémenté) |
| CooldownButton | `src/components/ui/CooldownButton.tsx` | Cooldown 5s (déjà implémenté) |
| TimePicker | `src/components/ui/TimePicker.tsx` | Sélecteur heure (déjà implémenté) |
| medical-targets | `src/lib/medical-targets.ts` | `getMilkRange()` (Story 3.1) |
| HouseholdContext | `src/contexts/HouseholdContext.tsx` | `useHousehold()`, `addEvent()` (à ajouter) |
| format | `src/lib/format.ts` | `formatTime()` |
| guard | `src/lib/auth/guard.ts` | `getProfileId()` pour l'API route |
| supabase/server | `src/lib/supabase/server.ts` | Client Supabase serveur |
| ToastTransition | `src/components/toasts/ToastTransition.tsx` | Référence pattern (même structure) |

### Project Structure Notes

Fichiers à créer :
- `src/components/ui/Slider.tsx`
- `src/components/toasts/ToastBottle.tsx`
- `src/app/api/events/route.ts`
- `src/lib/schemas/event.ts`

Fichiers à modifier :
- `src/contexts/HouseholdContext.tsx` — ajouter `addEvent()`
- `src/app/(app)/dashboard/page.tsx` — brancher le toast biberon sur le tap KPI card lait

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: docs/ux-kpi-cards.md#Interactions] — Toast biberon complet (slider, défaut, cooldown, tap hors toast)
- [Source: _bmad-output/planning-artifacts/architecture.md#API Routes] — POST /api/events
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — ToastBottle, Slider
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns] — Optimistic update pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — snake_case DB, camelCase TS
- [Source: src/components/toasts/ToastTransition.tsx] — Pattern toast avec cooldown à reproduire
- [Source: src/components/ui/Toast.tsx] — Container toast réutilisable
- [Source: src/components/ui/CooldownButton.tsx] — Cooldown avec pause/resume/reset
- [Source: src/components/ui/TimePicker.tsx] — Sélecteur heure réutilisable
- [Source: src/contexts/HouseholdContext.tsx] — Pattern optimistic update (transitionSleepState)
- [Source: _bmad-output/planning-artifacts/prd.md#FR19–FR21]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Used `getSession` (not `getProfileId` as story mentioned) — matches actual guard.ts API
- Slider CSS uses custom properties `--slider-accent` and `--slider-pct` for gradient fill

### Completion Notes List

- Created `Slider.tsx` with native range input, tooltip above thumb, accent color support, CSS in globals.css
- Created POST `/api/events` route following exact pattern of `/api/sleep-state` (Zod validation, session auth, camelCase mapping)
- Created `CreateEventSchema` Zod schema with type enum, value > 0, optional startedAt and moment
- Added `addEvent` to HouseholdContext with full optimistic update pattern (temp ID, rollback on failure, replace on success)
- Created `ToastBottle` following `ToastTransition` pattern: cooldown 5s, cancel, backdrop confirm, time picker with pause
- Default bottle value: average of last 10 bottles (rounded to 10mL) or median of range
- Dashboard wired: tap KPI card lait → opens bottle toast, separate state from transition toast

### Change Log

- 2026-03-08: Story 3.2 implemented — Toast biberon with slider, API route, optimistic update, and dashboard integration
- 2026-03-08: Code review — Fixed: events not sorted before slice(0,10) for default value, Slider mL suffix hardcoded → added unit prop, HouseholdContext stale closure in addEvent

### File List

- `src/components/ui/Slider.tsx` (created)
- `src/components/toasts/ToastBottle.tsx` (created)
- `src/app/api/events/route.ts` (created)
- `src/lib/schemas/event.ts` (created)
- `src/contexts/HouseholdContext.tsx` (modified — added `addEvent` with optimistic update)
- `src/app/(app)/dashboard/page.tsx` (modified — added bottle toast state and wiring)
- `src/app/globals.css` (modified — added slider CSS)
