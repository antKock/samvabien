# Story 4.3: Suppression avec undo

Status: review

## Story

As a parent,
I want supprimer un événement avec possibilité d'annuler,
So that je peux corriger sans risque de perte.

## Acceptance Criteria

1. **Given** le toast d'édition est ouvert **When** je tape "Supprimer" (style secondary) **Then** l'événement disparaît de la liste, le toast d'édition se ferme, les KPI cards se recalculent immédiatement **And** un toast undo apparaît en bas de l'écran

2. **Given** le toast undo est affiché **When** j'observe son contenu **Then** il affiche "🗑️ Supprimé" (14px, weight 800, couleur text) et un bouton "Annuler" (style secondary) **And** un cooldown de 2s est actif (même animation que les toasts de transition, bordure anti-horaire)

3. **Given** le toast undo est affiché **When** le cooldown de 2s expire **Then** la suppression devient définitive (DELETE /api/events/[id]), le toast disparaît

4. **Given** le toast undo est affiché **When** je tape hors du toast **Then** la suppression est confirmée immédiatement (équivaut à l'expiration)

5. **Given** le toast undo est affiché **When** je tape "Annuler" avant l'expiration **Then** l'événement réapparaît dans la liste, les KPI cards se restaurent, le toast se ferme

## Tasks / Subtasks

- [x] Task 1 — Ajouter DELETE dans `src/app/api/events/[id]/route.ts` (AC: #3)
  - [x] Vérifier JWT via `getSession()`
  - [x] DELETE Supabase `pousse_events` WHERE `id` + `profile_id`
  - [x] Retourner `{ data: { deleted: true } }` avec status 200
  - [x] 404 si event non trouvé ou pas au bon profil
- [x] Task 2 — Ajouter `deleteEvent` dans `HouseholdContext` (AC: #1, #5)
  - [x] Signature : `deleteEvent(id: string) => Promise<void>`
  - [x] Supprimer l'événement de `events[]` (optimistic)
  - [x] Appel `DELETE /api/events/${id}`
  - [x] Rollback + error toast si échec
- [x] Task 3 — Ajouter `restoreEvent` dans `HouseholdContext` (AC: #5)
  - [x] Signature : `restoreEvent(event: BabyEvent) => void`
  - [x] Réinsérer l'événement dans `events[]` à sa position chronologique
  - [x] Pas d'appel API (l'événement n'a pas été supprimé côté serveur si undo avant expiration)
- [x] Task 4 — Créer `src/components/toasts/ToastUndo.tsx` (AC: #2, #3, #4, #5)
  - [x] Props : `event: BabyEvent`, `onConfirm: () => void`, `onCancel: () => void`
  - [x] Titre : "🗑️ Supprimé" (14px, weight 800, couleur text)
  - [x] Bouton "Annuler" (style secondary = même style que les boutons secondaires des autres toasts)
  - [x] CooldownButton avec `duration={2000}` — animation bordure anti-horaire identique aux toasts de transition
  - [x] `onExpire` → `onConfirm()` (suppression définitive)
  - [x] Tap hors toast (`onBackdropTap`) → `onConfirm()` (suppression immédiate)
  - [x] Tap "Annuler" → `onCancel()`
- [x] Task 5 — Orchestrer le flux suppression/undo dans le dashboard (AC: #1, #3, #5)
  - [x] State : `undoEvent: BabyEvent | null`
  - [x] Bouton "Supprimer" dans ToastEdit → ferme le toast d'édition, retire l'événement du context (optimistic), ouvre ToastUndo
  - [x] ToastUndo `onConfirm` → `deleteEvent(id)` (appel API DELETE), `setUndoEvent(null)`
  - [x] ToastUndo `onCancel` → `restoreEvent(event)`, `setUndoEvent(null)`

## Dev Notes

### Flux complet suppression → undo

```
1. Parent tape "Supprimer" dans ToastEdit
   → Dashboard ferme ToastEdit (setEditingEvent(null))
   → Dashboard stocke l'événement (setUndoEvent(event))
   → Context retire l'événement de events[] (optimistic, sans appel API)
   → KPI cards se recalculent (car events[] a changé)
   → ToastUndo s'affiche

2a. Cooldown 2s expire OU parent tape hors du toast
   → Appel DELETE /api/events/${id} (suppression définitive)
   → setUndoEvent(null), toast disparaît

2b. Parent tape "Annuler" avant expiration
   → restoreEvent(event) → réinsérer dans events[]
   → KPI cards se restaurent
   → setUndoEvent(null), toast disparaît
```

### Architecture — suppression en deux temps

La suppression n'est PAS immédiate côté serveur. Le flux est :
1. **Optimistic remove** : retirer de `events[]` dans le Context (UI immédiate)
2. **Timer 2s** : pendant ce temps, l'événement est "en sursis"
3. **Confirmation** : après 2s (ou tap hors toast), l'API DELETE est appelée
4. **Undo** : si le parent annule, l'événement est remis dans le state (jamais supprimé côté serveur)

Cela implique que `deleteEvent` dans le Context doit SEULEMENT faire l'appel API (pas de remove optimistic — c'est le dashboard qui gère le remove/restore).

**Alternative plus propre :** Le Context expose `removeEventLocally(id)` et `restoreEvent(event)` pour la manipulation optimistic, et `deleteEvent(id)` pour l'appel API seul. Cela garde la logique de suppression atomique.

### API Route — DELETE /api/events/[id]

Ajouter dans le fichier `src/app/api/events/[id]/route.ts` créé en Story 4.2 :

```ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: { message: 'Non autorisé' } }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()

  const { error } = await supabase
    .from('pousse_events')
    .delete()
    .eq('id', id)
    .eq('profile_id', session.profileId)

  if (error) return NextResponse.json({ error: { message: 'Erreur serveur' } }, { status: 500 })
  return NextResponse.json({ data: { deleted: true } })
}
```

### ToastUndo — structure visuelle

```
┌─────────────────────────────────────┐
│                                     │
│  🗑️ Supprimé        [  Annuler  ]  │
│                                     │
│  ═══════════════════                │  ← Bordure cooldown 2s (anti-horaire)
└─────────────────────────────────────┘
```

Le toast undo est plus compact que les toasts normaux. Il utilise le même composant `Toast` mais avec un contenu minimal.

Pour le cooldown, réutiliser `CooldownButton` avec `duration={2000}` mais adapté :
- Même animation de bordure que les toasts de transition (cercle qui se vide)
- Mais ici le bouton contient juste le texte, pas un emoji dans un cercle
- **Alternative** : implémenter le cooldown de 2s avec un simple `setTimeout` + animation CSS sur la bordure du toast. Le CooldownButton est conçu pour un cercle avec emoji, pas pour un toast rectangulaire.

**Recommandation** : utiliser un `setTimeout(2000)` simple dans le dashboard pour le timer, et une animation CSS `border-bottom` qui se réduit sur 2s pour le feedback visuel. Plus simple et adapté au design du toast undo.

### CooldownButton vs timer custom

Le `CooldownButton` existant dessine un **cercle SVG** autour d'un emoji — design pensé pour les toasts de transition. Pour le toast undo, l'animation est sur la **bordure du toast** (pas un cercle). Options :

1. **Timer + CSS animation** (recommandé) : `setTimeout(2000)` + `@keyframes shrinkBorder` sur le bord inférieur du toast. Simple, pas de composant supplémentaire.
2. **Adapter CooldownButton** : complexe et inutile pour ce cas.

### Modules existants à réutiliser

| Module | Import | Usage |
|---|---|---|
| `Toast` | `@/components/ui/Toast` | Container toast |
| `useHousehold` | `@/hooks/useHousehold` | `deleteEvent()`, `restoreEvent()` |
| `BabyEvent` | `@/types` | Type événement |

### Anti-patterns à éviter

- NE PAS appeler DELETE immédiatement au clic "Supprimer" — attendre l'expiration du cooldown 2s
- NE PAS utiliser de modal de confirmation — le toast undo EST la confirmation
- NE PAS oublier de restaurer les KPI si l'utilisateur annule
- NE PAS réutiliser `CooldownButton` tel quel pour le toast undo — le design est différent (bordure linéaire vs cercle SVG)
- NE PAS créer un état "soft delete" côté serveur — la suppression est simple : remove optimistic → confirm → DELETE API

### Dépendances

- Story 4.1 : `RecapList` et `RecapItem` implémentés
- Story 4.2 : `ToastEdit` implémenté avec bouton "Supprimer", API route `[id]` créée, `updateEvent` dans Context

### Project Structure Notes

Fichiers à créer :
- `src/components/toasts/ToastUndo.tsx`

Fichiers à modifier :
- `src/app/api/events/[id]/route.ts` — ajouter export `DELETE`
- `src/contexts/HouseholdContext.tsx` — ajouter `deleteEvent()`, `removeEventLocally()`, `restoreEvent()`
- `src/app/(app)/dashboard/page.tsx` — state `undoEvent`, orchestration du flux

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: docs/ux-recap-today.md#Interactions] — spec undo complète (cooldown 2s, tap hors toast, annuler)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — optimistic updates
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — DELETE /api/events/[id]
- [Source: src/components/ui/CooldownButton.tsx] — animation cooldown de référence (mais ne pas réutiliser directement)
- [Source: src/components/ui/Toast.tsx] — container toast
- [Source: src/contexts/HouseholdContext.tsx] — pattern optimistic update existant

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ajouté DELETE handler dans `/api/events/[id]` avec auth JWT et filtre profile_id
- `deleteEvent`, `removeEventLocally`, `restoreEvent` étaient déjà implémentés dans le Context (Story 4.2 — anticipation)
- Créé `ToastUndo` avec timer 2s, barre de progression CSS, bouton Annuler, tap hors toast = confirm
- Orchestré le flux complet dans le dashboard : Supprimer → remove optimistic → ToastUndo → confirm/cancel
- 80/80 tests passent, aucune régression

### File List

- `src/app/api/events/[id]/route.ts` (modifié — ajout export DELETE)
- `src/components/toasts/ToastUndo.tsx` (nouveau)
- `src/app/(app)/dashboard/page.tsx` (modifié — import ToastUndo, state undoEvent, orchestration flux suppression/undo)

## Change Log

- 2026-03-08 : Implémentation complète de la suppression avec undo — DELETE API, ToastUndo avec cooldown 2s, orchestration dashboard
