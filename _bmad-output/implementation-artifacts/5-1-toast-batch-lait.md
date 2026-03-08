# Story 5.1: Toast batch lait (import crèche)

Status: done

## Story

As a parent,
I want saisir plusieurs biberons en séquence depuis la KPI card lait,
So that je peux importer les données crèche rapidement.

## Acceptance Criteria

1. **Given** je suis sur le dashboard **When** je tape le CTA `+` de la KPI card lait **Then** un toast batch s'ouvre avec l'icône SVG import (flèche vers le bas + plateau ouvert, stroke 2px, couleur accent orange) **And** le toast contient un slider volume (même composant que le toast biberon live), un sélecteur de moment optionnel (Matin/Midi/Après-midi, aucun pré-sélectionné), et les boutons "Suivant" et "Terminer"

2. **Given** le toast batch lait est ouvert **When** j'observe le comportement **Then** il n'y a PAS de cooldown (pas d'auto-confirm)

3. **Given** le toast batch lait est ouvert **When** la valeur par défaut du slider est affichée **Then** elle est la moyenne des 10 derniers biberons (fallback : médiane de la range si aucun historique)

4. **Given** j'ai ajusté le slider et sélectionné "Midi" **When** je tape "Suivant" **Then** le biberon est enregistré individuellement (POST /api/events type='bottle', moment='noon') **And** le sélecteur de moment se reset (aucun pré-sélectionné), le slider revient à la valeur par défaut (moyenne) **And** la KPI card lait se met à jour immédiatement

5. **Given** j'ai saisi plusieurs biberons via "Suivant" **When** je tape "Terminer" **Then** le dernier biberon est enregistré et le toast se ferme

6. **Given** le toast batch est ouvert **When** je tape ✕ ou je tape hors du toast **Then** le toast se ferme sans enregistrer l'entrée en cours **And** les entrées déjà ajoutées via "Suivant" restent enregistrées

## Tasks / Subtasks

- [x] Task 1 — Créer `src/components/toasts/ToastBatchMilk.tsx` (AC: #1, #2, #3, #4, #5, #6)
  - [x] Props : `onClose: () => void`
  - [x] Utiliser `useHousehold()` pour `profile`, `events`, `addEvent`
  - [x] Slider volume : réutiliser `Slider` avec `accentColor` orange, `unit='mL'`, `step=10`
  - [x] Range : `getMilkRange(profile.babyWeightHg)` (depuis `medical-targets.ts`)
  - [x] Valeur par défaut : moyenne des 10 derniers biberons, fallback médiane de la range
  - [x] MomentSelector : `value={selectedMoment}` initialisé à `null`, reset après chaque "Suivant"
  - [x] Bouton "Suivant" : appeler `addEvent({ type: 'bottle', value: mlValue, moment: selectedMoment })` — PAS de `startedAt`
  - [x] Bouton "Terminer" : même appel que "Suivant" puis `onClose()`
  - [x] Backdrop tap / ✕ : `onClose()` sans enregistrer l'entrée en cours
  - [x] PAS de CooldownButton — boutons simples
- [x] Task 2 — Ajouter le CTA `+` dans `KpiCardMilk` (AC: #1)
  - [x] Vérifier que `onPlusTap` est déjà dans les props (déjà fait en Story 3.1)
  - [x] S'assurer que le bouton `+` est visible et déclenche `onPlusTap`
- [x] Task 3 — Brancher le toast batch dans le dashboard (AC: #1)
  - [x] State : `isBatchMilkOpen: boolean` dans `dashboard/page.tsx`
  - [x] Passer `onPlusTap={() => setIsBatchMilkOpen(true)}` à `KpiCardMilk`
  - [x] Render : `{isBatchMilkOpen && <ToastBatchMilk onClose={() => setIsBatchMilkOpen(false)} />}`
- [x] Task 4 — Tests unitaires (AC: #1-#6)
  - [x] Test : le toast s'ouvre avec slider + moment selector + boutons
  - [x] Test : pas de cooldown (pas de CooldownButton)
  - [x] Test : "Suivant" enregistre l'événement avec `moment` et sans `startedAt`
  - [x] Test : "Suivant" reset le moment selector et le slider
  - [x] Test : "Terminer" enregistre + ferme
  - [x] Test : backdrop tap ferme sans enregistrer

## Dev Notes

### Pattern de référence : ToastBottle.tsx

Le toast batch lait est structurellement similaire à `ToastBottle` mais avec des différences clés :

| Aspect | ToastBottle (live) | ToastBatchMilk (batch) |
|--------|-------------------|------------------------|
| Cooldown | 5s auto-confirm via CooldownButton | PAS de cooldown |
| Confirmation | Backdrop tap = confirm | Boutons explicites "Suivant"/"Terminer" |
| Temps | `startedAt` (timestamp précis) | `moment` seulement (Matin/Midi/Après-midi) |
| Séquence | 1 entrée → ferme | N entrées → "Suivant" reset → "Terminer" ferme |
| TimePicker | Oui (ajuster l'heure) | Non (pas de temps précis) |

### Valeur par défaut du slider

Même calcul que `ToastBottle` — copier le `useMemo` existant :

```ts
const defaultValue = useMemo(() => {
  const bottles = events
    .filter((e) => e.type === 'bottle')
    .sort((a, b) => new Date(b.startedAt ?? b.createdAt).getTime() - new Date(a.startedAt ?? a.createdAt).getTime())
    .slice(0, 10)
  if (bottles.length > 0) {
    const avg = bottles.reduce((sum, e) => sum + e.value, 0) / bottles.length
    return Math.round(avg / 10) * 10
  }
  return Math.round((range.min + range.max) / 2 / 10) * 10
}, [events, range])
```

Après chaque "Suivant", la liste `events` est mise à jour (optimistic), donc le `useMemo` recalcule automatiquement.

### Appel addEvent — CRITIQUE

Pour les imports batch, NE PAS passer `startedAt`. Passer uniquement `moment` :

```ts
await addEvent({
  type: 'bottle',
  value: mlValue,
  moment: selectedMoment ?? undefined, // moment optionnel
  // PAS de startedAt — c'est un import crèche
})
```

Le `HouseholdContext.addEvent()` gère déjà l'optimistic update + POST /api/events + rollback.

### Icône SVG import

Icône : flèche vers le bas + plateau ouvert, `stroke: 2px`, couleur `var(--milk-accent)` (orange).
Voir `docs/design-reference.html` pour la maquette exacte. L'icône distingue visuellement le toast batch du toast live.

### Comportement Suivant / Terminer

```
Flux :
1. Toast s'ouvre → slider à la valeur par défaut, moment = null
2. User ajuste slider + sélectionne moment (optionnel)
3. Tap "Suivant" → addEvent() → reset moment à null, slider à default → reste ouvert
4. Répéter 2-3 pour chaque biberon
5. Tap "Terminer" → addEvent() → onClose()
6. Tap ✕ / backdrop → onClose() sans enregistrer l'entrée en cours
```

### Structure visuelle du toast

```
┌─────────────────────────────────────────┐
│  ✕                    🍼 Import         │  ← Icône SVG import orange
│                                         │
│  ──────────●────────────────            │  ← Slider volume (mL)
│           180 mL                        │  ← Tooltip au-dessus du thumb
│                                         │
│  [ Matin ] [ Midi ] [ Après-midi ]      │  ← MomentSelector (aucun pré-sélectionné)
│                                         │
│  [  Suivant  ]  [  Terminer  ]          │  ← Boutons d'action
└─────────────────────────────────────────┘
```

### Modules existants à réutiliser

| Module | Import | Usage |
|--------|--------|-------|
| `Toast` | `@/components/ui/Toast` | Container toast (backdrop, dismiss) |
| `Slider` | `@/components/ui/Slider` | Slider volume mL |
| `MomentSelector` | `@/components/ui/MomentSelector` | Sélecteur Matin/Midi/Après-midi |
| `useHousehold` | `@/hooks/useHousehold` | `addEvent()`, `profile`, `events` |
| `getMilkRange` | `@/lib/medical-targets` | Range min/max pour le slider |
| `BabyEvent`, `Moment` | `@/types` | Types |

### Anti-patterns à éviter

- NE PAS utiliser `CooldownButton` — le batch n'a pas d'auto-confirm
- NE PAS passer `startedAt` dans `addEvent()` — les imports crèche utilisent `moment` uniquement
- NE PAS créer un nouveau endpoint API — réutiliser `POST /api/events`
- NE PAS fermer le toast après "Suivant" — il reste ouvert pour l'entrée suivante
- NE PAS pré-sélectionner un moment — le MomentSelector démarre avec `value={null}`
- NE PAS dupliquer le calcul de la valeur par défaut — copier le pattern de `ToastBottle`
- NE PAS oublier de reset le moment après "Suivant" — `setSelectedMoment(null)`

### Dépendances

- Story 3.1 : KpiCardMilk avec prop `onPlusTap` (déjà implémenté)
- Story 3.2 : ToastBottle (pattern de référence)

### Project Structure Notes

Fichiers à créer :
- `src/components/toasts/ToastBatchMilk.tsx`

Fichiers à modifier :
- `src/app/(app)/dashboard/page.tsx` — state `isBatchMilkOpen`, import ToastBatchMilk, wiring

Fichiers à vérifier (pas de modification attendue) :
- `src/components/dashboard/KpiCardMilk.tsx` — `onPlusTap` déjà dans les props
- `src/app/api/events/route.ts` — POST gère déjà `moment` sans `startedAt`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR27, FR29, FR30] — batch mode, moment association, enregistrement individuel
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — toasts architecture, optimistic updates
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — POST /api/events format
- [Source: docs/design-reference.html] — maquette toast batch lait avec icône import
- [Source: src/components/toasts/ToastBottle.tsx] — pattern de référence (slider, default value, addEvent)
- [Source: src/components/ui/MomentSelector.tsx] — composant moment existant
- [Source: src/components/ui/Slider.tsx] — composant slider existant
- [Source: src/lib/medical-targets.ts] — getMilkRange(weightHg)
- [Source: src/contexts/HouseholdContext.tsx] — addEvent() avec optimistic update

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun bug rencontré. Implémentation directe.

### Completion Notes List

- Créé `ToastBatchMilk.tsx` : toast batch avec slider volume (mL), MomentSelector, boutons Suivant/Terminer
- Pas de CooldownButton — boutons explicites uniquement
- `addEvent()` appelé avec `type='bottle'`, `value`, `moment` (optionnel) — SANS `startedAt`
- "Suivant" reset le moment à null et le slider à la valeur par défaut (moyenne des 10 derniers biberons)
- "Terminer" enregistre + ferme le toast
- Backdrop tap / ✕ ferme sans enregistrer l'entrée en cours
- KpiCardMilk avait déjà `onPlusTap` (Story 3.1) — branché dans dashboard/page.tsx
- Icône SVG import (flèche vers le bas + plateau) avec couleur accent orange
- 7 tests unitaires ajoutés, tous passent
- Suite complète 87 tests : 0 régression

### Change Log

- 2026-03-08 : Implémentation story 5.1 — Toast batch lait (import crèche). Composant créé, wiring dashboard, 7 tests.
- 2026-03-08 : Code review — 9 issues trouvées (2 HIGH, 5 MEDIUM, 2 LOW), toutes corrigées. Factorisation ToastBatch partagé, fix startedAt null pour batch, fix Slider formatValue min/max, ajout test valeur par défaut, protection double-tap, message erreur générique.

### File List

- `src/components/toasts/ToastBatch.tsx` (nouveau — composant partagé)
- `src/components/toasts/ToastBatchMilk.tsx` (refactorisé — utilise ToastBatch)
- `src/components/toasts/__tests__/ToastBatchMilk.test.tsx` (modifié — ajout test valeur par défaut)
- `src/app/(app)/dashboard/page.tsx` (modifié — state isBatchMilkOpen, import, wiring onPlusTap)
- `src/contexts/HouseholdContext.tsx` (modifié — startedAt null pour batch, message erreur générique)
- `src/app/api/events/route.ts` (modifié — started_at null au lieu de now() par défaut)
- `src/components/ui/Slider.tsx` (modifié — formatValue appliqué aux labels min/max)
