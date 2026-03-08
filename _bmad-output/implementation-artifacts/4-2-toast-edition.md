# Story 4.2: Toast d'édition d'un événement

Status: done

## Story

As a parent,
I want modifier un événement en tapant dessus dans le récap,
So that je peux corriger les erreurs de saisie.

## Acceptance Criteria

1. **Given** la liste récap est affichée **When** je tape sur une ligne "Biberon — 12h15 — 150 mL" **Then** un toast d'édition s'ouvre avec le titre "🍼 Biberon", l'heure préremplie à 12h15, et le slider prérempli à 150 mL

2. **Given** la liste récap est affichée **When** je tape sur une ligne "Sieste — 14h30 — 1h23" **Then** un toast d'édition s'ouvre avec le titre "😴 Sieste", l'heure préremplie à 14h30, et le slider prérempli à 1h23

3. **Given** le toast d'édition est ouvert pour un import sans heure précise **When** le toast s'affiche **Then** le sélecteur de moment (Matin/Midi/Après-midi) est prérempli au lieu du time picker

4. **Given** le toast d'édition est ouvert **When** je modifie la valeur et/ou l'heure et tape "Enregistrer" **Then** l'événement est mis à jour (PATCH /api/events/[id]), la ligne du récap reflète les nouvelles valeurs, les KPI cards se recalculent immédiatement

5. **Given** le toast d'édition est ouvert **When** je tape ✕ ou hors du toast **Then** le toast se ferme sans modifier l'événement

6. **Given** le toast d'édition est ouvert **When** j'observe le comportement **Then** il n'y a PAS de cooldown — le parent modifie à son rythme

## Tasks / Subtasks

- [x] Task 1 — Créer `UpdateEventSchema` dans `src/lib/schemas/event.ts` (AC: #4)
  - [x] Schema Zod : `{ value?: number.positive(), startedAt?: string.datetime(), moment?: enum(['morning','noon','afternoon']).nullable() }`
  - [x] Au moins un champ requis (`.refine()`)
- [x] Task 2 — Créer `src/app/api/events/[id]/route.ts` avec PATCH (AC: #4)
  - [x] Vérifier JWT via `getSession()`
  - [x] Valider body avec `UpdateEventSchema`
  - [x] UPDATE Supabase `pousse_events` WHERE `id` + `profile_id`
  - [x] Retourner `{ data: { event: ... } }` avec mapping snake_case → camelCase
  - [x] 404 si event non trouvé ou pas au bon profil
- [x] Task 3 — Ajouter `updateEvent` dans `HouseholdContext` (AC: #4)
  - [x] Signature : `updateEvent(id: string, data: { value?: number, startedAt?: string, moment?: Moment | null }) => Promise<void>`
  - [x] Optimistic update : modifier l'événement dans `events[]` immédiatement
  - [x] Appel `PATCH /api/events/${id}`
  - [x] Rollback + error toast si échec
- [x] Task 4 — Créer `src/components/ui/MomentSelector.tsx` (AC: #3)
  - [x] 3 boutons : "Matin" / "Midi" / "Après-midi"
  - [x] Props : `value: Moment | null`, `onChange: (moment: Moment | null) => void`
  - [x] Style : boutons pill, le sélectionné a bg accent, les autres bg surface + border
  - [x] Aucun pré-sélectionné possible (`value === null`)
- [x] Task 5 — Créer `src/components/toasts/ToastEdit.tsx` (AC: #1, #2, #3, #4, #5, #6)
  - [x] Props : `event: BabyEvent`, `onClose: () => void`, `onDelete: (event: BabyEvent) => void`
  - [x] Titre : emoji + label (🍼 Biberon / 😴 Sieste / 🌙 Nuit / 🌙 Réveil nocturne)
  - [x] Slider prérempli avec `event.value` (mL pour bottle, minutes pour sleep)
  - [x] Si `event.startedAt` → TimePicker prérempli
  - [x] Si `event.moment` (import sans heure) → MomentSelector prérempli
  - [x] Bouton "Enregistrer" (style primary) → `updateEvent()` puis `onClose()`
  - [x] Bouton "Supprimer" (style secondary) → `onDelete(event)` (délègue à Story 4.3)
  - [x] Bouton ✕ en haut à droite → `onClose()`
  - [x] Tap hors toast → `onClose()`
  - [x] PAS de cooldown — pas de CooldownButton
- [x] Task 6 — Intégrer ToastEdit dans le dashboard (AC: #1)
  - [x] State : `editingEvent: BabyEvent | null`
  - [x] RecapList `onEventTap` → `setEditingEvent(event)`
  - [x] Rendre `<ToastEdit>` quand `editingEvent !== null`
  - [x] onClose → `setEditingEvent(null)`

## Dev Notes

### API Route — PATCH /api/events/[id]

Fichier : `src/app/api/events/[id]/route.ts` — **ce fichier n'existe pas encore**. Le créer avec :

```ts
// Pattern identique à POST /api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/guard'
import { createServerClient } from '@/lib/supabase/server'
import { UpdateEventSchema } from '@/lib/schemas/event'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: { message: 'Non autorisé' } }, { status: 401 })

  const { id } = await params
  // Validate, update, return mapped event
}
```

**ATTENTION Next.js 16** : les `params` dans les route handlers sont une `Promise` — il faut `await params`. Pattern déjà utilisé dans le codebase.

### UpdateEventSchema — dans event.ts existant

Ajouter à `src/lib/schemas/event.ts` :

```ts
export const UpdateEventSchema = z.object({
  value: z.number().positive().optional(),
  startedAt: z.string().datetime().optional(),
  moment: z.enum(['morning', 'noon', 'afternoon']).nullable().optional(),
}).refine(
  (data) => data.value !== undefined || data.startedAt !== undefined || data.moment !== undefined,
  { message: 'Au moins un champ requis' }
)
```

### HouseholdContext — `updateEvent` à ajouter

Pattern identique à `addEvent` dans `src/contexts/HouseholdContext.tsx` :
- Optimistic update : `events.map(e => e.id === id ? { ...e, ...data } : e)`
- API call : `PATCH /api/events/${id}`
- Rollback si erreur

Ajouter aussi l'interface et l'export dans `HouseholdContextValue`.

### Slider — réutilisation

Le composant `src/components/ui/Slider.tsx` accepte `{ value, onChange, min, max, step, accentColor, unit }`.

Pour les biberons : `unit="mL"`, range de `getMilkRange()`.
Pour les siestes/nuits : `unit="min"`, range à définir. Utiliser un range raisonnable :
- min: 5 minutes, max: 180 minutes (3h), step: 5 minutes pour les siestes
- Pour les nuits : min: 30 minutes, max: 720 minutes (12h), step: 5 minutes

Il faudra potentiellement ajouter une fonction `getSleepRange()` dans `medical-targets.ts` ou calculer inline.

### MomentSelector — nouveau composant

Ce composant n'existe pas encore. Le créer dans `src/components/ui/MomentSelector.tsx`.

```tsx
// Boutons pill horizontaux : Matin | Midi | Après-midi
// Props : value: Moment | null, onChange: (m: Moment | null) => void
// Style : inline-flex gap-2, chaque bouton px-3 py-1 rounded-full text-sm font-semibold
// Sélectionné : bg-accent text-surface
// Non sélectionné : bg-surface text-text border border-border
```

### ToastEdit — structure

```
┌─────────────────────────────────────┐
│                              ✕      │  ← Bouton fermer
│  🍼 Biberon                        │  ← Titre avec emoji
│                                     │
│  [     Slider prérempli     ]       │  ← Slider (mL ou minutes)
│                                     │
│  [12h15]                            │  ← TimePicker (ou MomentSelector)
│                                     │
│  [  Supprimer  ]  [  Enregistrer ]  │  ← Actions
└─────────────────────────────────────┘
```

- Utiliser le composant `Toast` existant (`src/components/ui/Toast.tsx`)
- `onDismiss` et `onBackdropTap` → fermer sans modifier

### Event type → toast title mapping

```ts
const TOAST_TITLES: Record<EventType, { emoji: string; label: string }> = {
  bottle: { emoji: '🍼', label: 'Biberon' },
  nap: { emoji: '😴', label: 'Sieste' },
  night: { emoji: '🌙', label: 'Nuit' },
  'night-wake': { emoji: '🌙', label: 'Réveil nocturne' },
}
```

### Modules existants à réutiliser

| Module | Import | Usage |
|---|---|---|
| `Toast` | `@/components/ui/Toast` | Container toast bottom-sheet |
| `Slider` | `@/components/ui/Slider` | Slider volume/durée |
| `TimePicker` | `@/components/ui/TimePicker` | Sélecteur heure |
| `useHousehold` | `@/hooks/useHousehold` | `updateEvent()` + context |
| `getMilkRange` | `@/lib/medical-targets` | Range slider biberon |
| `formatTime` | `@/lib/format` | Affichage heure |

### Anti-patterns à éviter

- NE PAS utiliser CooldownButton — le toast d'édition n'a PAS de cooldown
- NE PAS dupliquer la logique du Slider — réutiliser le composant existant tel quel
- NE PAS accéder à Supabase depuis le composant — passer par `updateEvent()` du Context
- NE PAS créer de modal de confirmation pour l'enregistrement — un simple bouton suffit
- NE PAS oublier le mapping snake_case → camelCase dans l'API route

### Dépendances Story 4.1

Cette story dépend de Story 4.1 :
- `RecapList` et `RecapItem` doivent être implémentés
- Le callback `onEventTap` doit être câblé dans le dashboard
- Le bouton "Supprimer" dans ce toast délègue à Story 4.3

### Project Structure Notes

Fichiers à créer :
- `src/app/api/events/[id]/route.ts` (PATCH — DELETE ajouté en Story 4.3)
- `src/components/toasts/ToastEdit.tsx`
- `src/components/ui/MomentSelector.tsx`

Fichiers à modifier :
- `src/lib/schemas/event.ts` — ajouter `UpdateEventSchema`
- `src/contexts/HouseholdContext.tsx` — ajouter `updateEvent()`
- `src/app/(app)/dashboard/page.tsx` — state `editingEvent`, rendre ToastEdit

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: docs/ux-recap-today.md#Interactions] — toast d'édition spec complète
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — PATCH /api/events/[id]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — React Context actions
- [Source: src/components/toasts/ToastBottle.tsx] — pattern toast existant à suivre
- [Source: src/components/ui/Toast.tsx] — container toast (onDismiss, onBackdropTap)
- [Source: src/components/ui/Slider.tsx] — slider réutilisable
- [Source: src/components/ui/TimePicker.tsx] — time picker réutilisable
- [Source: src/lib/schemas/event.ts] — CreateEventSchema existant
- [Source: src/app/api/events/route.ts] — pattern API POST existant
- [Source: src/contexts/HouseholdContext.tsx] — pattern addEvent à suivre pour updateEvent

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Créé `UpdateEventSchema` Zod avec refine pour au moins un champ requis
- Créé API route PATCH `/api/events/[id]` avec auth JWT, validation, mapping snake_case→camelCase
- Ajouté `updateEvent` dans HouseholdContext avec optimistic update et rollback
- Ajouté `removeEventLocally`, `restoreEvent`, `deleteEvent` dans HouseholdContext (préparation Story 4.3)
- Créé `MomentSelector` : boutons pill Matin/Midi/Après-midi avec toggle
- Créé `ToastEdit` : titre emoji+label, slider prérempli, TimePicker ou MomentSelector, boutons Supprimer/Enregistrer
- Intégré ToastEdit dans le dashboard avec state `editingEvent`
- 80/80 tests passent, aucune régression

### File List

- `src/lib/schemas/event.ts` (modifié — ajout UpdateEventSchema)
- `src/app/api/events/[id]/route.ts` (nouveau — PATCH handler)
- `src/contexts/HouseholdContext.tsx` (modifié — ajout updateEvent, removeEventLocally, restoreEvent, deleteEvent)
- `src/components/ui/MomentSelector.tsx` (nouveau)
- `src/components/toasts/ToastEdit.tsx` (nouveau)
- `src/app/(app)/dashboard/page.tsx` (modifié — import ToastEdit, state editingEvent, câblage)

## Change Log

- 2026-03-08 : Implémentation complète du toast d'édition — schema, API PATCH, context update, MomentSelector, ToastEdit, intégration dashboard
