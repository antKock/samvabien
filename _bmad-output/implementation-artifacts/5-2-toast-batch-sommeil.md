# Story 5.2: Toast batch sommeil (import crèche)

Status: done

## Story

As a parent,
I want saisir plusieurs siestes en séquence depuis la KPI card sommeil,
So that je peux importer les données sommeil de la crèche rapidement.

## Acceptance Criteria

1. **Given** je suis sur le dashboard **When** je tape le CTA `+` de la KPI card sommeil **Then** un toast batch s'ouvre avec l'icône SVG import (accent vert), un slider durée (pas de volume), un sélecteur de moment optionnel, et les boutons "Suivant" / "Terminer"

2. **Given** le toast batch sommeil est ouvert **When** la valeur par défaut du slider est affichée **Then** elle est la moyenne des 10 dernières siestes (fallback : médiane de la range si aucun historique)

3. **Given** j'ai ajusté le slider à 1h15 et sélectionné "Matin" **When** je tape "Suivant" **Then** la sieste est enregistrée (POST /api/events type='nap', value=75, moment='morning') **And** le sélecteur de moment se reset, le slider revient à la valeur par défaut **And** la KPI card sommeil se met à jour immédiatement

4. **Given** j'ai saisi des siestes via le batch sommeil **When** je tape "Terminer" **Then** la dernière sieste est enregistrée et le toast se ferme

5. **Given** le dernier événement enregistré est un import batch (avec moment au lieu de startTime) **When** j'observe la hero card **Then** elle affiche l'état sans durée (ex. "☀️ Éveillé" sans "depuis X") car il n'y a pas de timestamp précis

6. **Given** le toast batch est ouvert **When** je tape ✕ ou je tape hors du toast **Then** le toast se ferme sans enregistrer l'entrée en cours, les entrées déjà ajoutées via "Suivant" restent

## Tasks / Subtasks

- [x] Task 1 — Créer `src/components/toasts/ToastBatchSleep.tsx` (AC: #1, #2, #3, #4, #6)
  - [x] Props : `onClose: () => void`
  - [x] Utiliser `useHousehold()` pour `profile`, `events`, `addEvent`
  - [x] Slider durée : réutiliser `Slider` avec `accentColor` vert (`var(--sleep-accent)`), `step=5`
  - [x] Range : `{ min: 5, max: 180, step: 5 }` (5 min à 3h)
  - [x] Unit : formater en `Xh00` si ≥ 60 min, `Xmin` si < 60 min (utiliser `formatDuration` de `lib/format.ts`)
  - [x] Valeur par défaut : moyenne des 10 dernières siestes (`type === 'nap'`), fallback médiane de la range
  - [x] MomentSelector : `value={selectedMoment}` initialisé à `null`, reset après chaque "Suivant"
  - [x] Bouton "Suivant" : appeler `addEvent({ type: 'nap', value: minutes, moment: selectedMoment })` — PAS de `startedAt`
  - [x] Bouton "Terminer" : même appel que "Suivant" puis `onClose()`
  - [x] Backdrop tap / ✕ : `onClose()` sans enregistrer l'entrée en cours
  - [x] PAS de CooldownButton — boutons simples
- [x] Task 2 — Ajouter `onPlusTap` dans `KpiCardSleep` (AC: #1)
  - [x] Ajouter `onPlusTap?: () => void` dans les props de `KpiCardSleep`
  - [x] Afficher le bouton `+` quand `onPlusTap` est fourni (même pattern que `KpiCardMilk`)
- [x] Task 3 — Brancher le toast batch dans le dashboard (AC: #1)
  - [x] State : `isBatchSleepOpen: boolean` dans `dashboard/page.tsx`
  - [x] Passer `onPlusTap={() => setIsBatchSleepOpen(true)}` à `KpiCardSleep`
  - [x] Render : `{isBatchSleepOpen && <ToastBatchSleep onClose={() => setIsBatchSleepOpen(false)} />}`
- [x] Task 4 — Vérifier le comportement hero card post-import (AC: #5)
  - [x] La hero card affiche déjà l'état sans durée quand le dernier événement a `moment` et pas `startedAt` (implémenté en Story 2.2/2.4)
  - [x] Vérifier avec un test : après import batch nap, hero card affiche "☀️ Éveillé" sans "depuis X"
- [x] Task 5 — Tests unitaires (AC: #1-#6)
  - [x] Test : le toast s'ouvre avec slider durée + moment selector + boutons
  - [x] Test : slider affiche la durée formatée (Xh00 / Xmin)
  - [x] Test : "Suivant" enregistre avec `type='nap'`, `moment`, sans `startedAt`
  - [x] Test : "Suivant" reset le moment selector et le slider
  - [x] Test : "Terminer" enregistre + ferme
  - [x] Test : backdrop tap ferme sans enregistrer

## Dev Notes

### Différences avec Story 5.1 (Toast batch lait)

| Aspect | ToastBatchMilk (5.1) | ToastBatchSleep (5.2) |
|--------|---------------------|----------------------|
| Type événement | `'bottle'` | `'nap'` |
| Valeur | Volume en mL | Durée en minutes |
| Slider step | 10 (mL) | 5 (minutes) |
| Slider range | `getMilkRange(weightHg)` | `{ min: 5, max: 180 }` |
| Couleur accent | Orange (`--milk-accent`) | Vert (`--sleep-accent`) |
| Formatage | `X mL` | `Xh00` / `Xmin` |
| Default | Avg 10 derniers biberons | Avg 10 dernières siestes |
| Impact hero card | Aucun (lait ≠ sommeil) | Affichage sans durée (AC #5) |

### Valeur par défaut du slider

```ts
const defaultValue = useMemo(() => {
  const naps = events
    .filter((e) => e.type === 'nap')
    .sort((a, b) => new Date(b.startedAt ?? b.createdAt).getTime() - new Date(a.startedAt ?? a.createdAt).getTime())
    .slice(0, 10)
  if (naps.length > 0) {
    const avg = naps.reduce((sum, e) => sum + e.value, 0) / naps.length
    return Math.round(avg / 5) * 5 // Arrondir au pas de 5
  }
  return Math.round((5 + 180) / 2 / 5) * 5 // Médiane = 90 min
}, [events])
```

### Formatage durée sur le slider

Utiliser `formatDuration` de `lib/format.ts` (déjà utilisé par RecapItem) :
- `75` → `"1h15"`
- `45` → `"45min"`
- `120` → `"2h00"`

Le Slider accepte `unit?: string` mais ici le format change selon la valeur. Deux options :
1. Passer une fonction de formatage au lieu d'un string `unit`
2. Utiliser le tooltip custom au-dessus du thumb avec `formatDuration(value)`

Vérifier le pattern exact du Slider — si `unit` est un string statique, il faudra adapter le tooltip pour afficher `formatDuration(value)` au lieu de `${value} ${unit}`.

### Appel addEvent — CRITIQUE

Identique à Story 5.1, NE PAS passer `startedAt` :

```ts
await addEvent({
  type: 'nap',
  value: minutes, // durée en minutes
  moment: selectedMoment ?? undefined,
  // PAS de startedAt — import crèche
})
```

### Hero card post-import (AC #5) — VÉRIFICATION

La hero card détecte déjà les événements moment-only via la logique dans `HeroCard.tsx`. Quand le dernier événement sommeil a `moment` sans `startedAt`, le chrono ne s'affiche pas car il n'y a pas de `sleepStateSince` précis.

**Important** : les imports batch sieste NE déclenchent PAS de transition d'état sommeil. La sieste batch est un événement historique, pas un changement d'état live. Le `sleepState` du profil reste inchangé. La hero card reflète le `sleepState` actuel du profil, pas le dernier événement.

### Ajout de `onPlusTap` à KpiCardSleep

`KpiCardMilk` a déjà `onPlusTap` dans ses props (Story 3.1). `KpiCardSleep` ne l'a probablement PAS encore. Copier le pattern de `KpiCardMilk` :

```tsx
interface KpiCardSleepProps {
  onTap?: () => void
  onPlusTap?: () => void  // ← Ajouter
}

// Dans le render, ajouter le bouton + (même style que KpiCardMilk)
{onPlusTap && (
  <button onClick={onPlusTap} className="...">+</button>
)}
```

### Structure visuelle du toast

```
┌─────────────────────────────────────────┐
│  ✕                    😴 Import         │  ← Icône SVG import verte
│                                         │
│  ──────────●────────────────            │  ← Slider durée (minutes)
│           1h15                          │  ← Tooltip formaté (Xh00/Xmin)
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
| `Slider` | `@/components/ui/Slider` | Slider durée minutes |
| `MomentSelector` | `@/components/ui/MomentSelector` | Sélecteur Matin/Midi/Après-midi |
| `useHousehold` | `@/hooks/useHousehold` | `addEvent()`, `events` |
| `formatDuration` | `@/lib/format` | Formatage durée (Xh00/Xmin) |
| `BabyEvent`, `Moment` | `@/types` | Types |
| `ToastBatchMilk` | `@/components/toasts/ToastBatchMilk` | Référence pattern (Story 5.1) |

### Anti-patterns à éviter

- NE PAS utiliser `CooldownButton` — le batch n'a pas d'auto-confirm
- NE PAS passer `startedAt` dans `addEvent()` — imports crèche = `moment` uniquement
- NE PAS appeler `transitionSleepState()` — les imports batch ne changent PAS l'état sommeil live
- NE PAS créer un nouveau endpoint API — réutiliser `POST /api/events`
- NE PAS fermer le toast après "Suivant" — il reste ouvert pour l'entrée suivante
- NE PAS pré-sélectionner un moment — le MomentSelector démarre avec `value={null}`
- NE PAS utiliser `getMilkRange()` — la range sommeil est fixe `{ min: 5, max: 180 }`
- NE PAS oublier de reset le moment après "Suivant" — `setSelectedMoment(null)`
- NE PAS dupliquer le code de ToastBatchMilk — les deux toasts partagent le même pattern, envisager une factorisation si le code est quasi-identique

### Dépendances

- Story 3.1 : KpiCardMilk avec `onPlusTap` (pattern de référence pour KpiCardSleep)
- Story 5.1 : ToastBatchMilk (pattern identique, créé juste avant)

### Project Structure Notes

Fichiers à créer :
- `src/components/toasts/ToastBatchSleep.tsx`

Fichiers à modifier :
- `src/components/dashboard/KpiCardSleep.tsx` — ajouter prop `onPlusTap` + bouton `+`
- `src/app/(app)/dashboard/page.tsx` — state `isBatchSleepOpen`, import ToastBatchSleep, wiring

Fichiers à vérifier (pas de modification attendue) :
- `src/components/dashboard/HeroCard.tsx` — affichage sans durée pour events moment-only (déjà implémenté)
- `src/app/api/events/route.ts` — POST gère déjà `moment` sans `startedAt`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR28, FR29, FR30] — batch siestes, moment association, enregistrement individuel
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — toasts architecture, optimistic updates
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — POST /api/events format
- [Source: docs/design-reference.html] — maquette toast batch sommeil avec icône import verte
- [Source: _bmad-output/implementation-artifacts/5-1-toast-batch-lait.md] — pattern de référence (story 5.1)
- [Source: src/components/toasts/ToastBottle.tsx] — pattern toast de référence
- [Source: src/components/ui/MomentSelector.tsx] — composant moment existant
- [Source: src/components/ui/Slider.tsx] — composant slider existant
- [Source: src/lib/format.ts] — formatDuration()
- [Source: src/components/dashboard/HeroCard.tsx] — affichage sans durée post-import crèche
- [Source: src/contexts/HouseholdContext.tsx] — addEvent() avec optimistic update

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun bug rencontré. Implémentation directe.

### Completion Notes List

- Créé `ToastBatchSleep.tsx` : toast batch avec slider durée (minutes), MomentSelector, boutons Suivant/Terminer
- Ajouté `formatValue` prop optionnel au Slider pour supporter le formatage dynamique (Xh00/Xmin)
- `addEvent()` appelé avec `type='nap'`, `value` (minutes), `moment` — SANS `startedAt`
- Ajouté `onPlusTap` prop + bouton `+` dans KpiCardSleep (même pattern que KpiCardMilk)
- Restructuré KpiCardSleep de `<button>` vers `<div>` + `<button>` interne pour permettre le bouton `+` absolu
- Hero card : comportement post-import vérifié — affiche l'état sans durée quand `sleepStateSince` est null (déjà implémenté)
- 6 tests unitaires ajoutés, tous passent
- Suite complète 93 tests : 0 régression

### Change Log

- 2026-03-08 : Implémentation story 5.2 — Toast batch sommeil (import crèche). Composant créé, KpiCardSleep modifié, wiring dashboard, 6 tests.
- 2026-03-08 : Code review — Corrections partagées avec story 5.1. ToastBatchSleep refactorisé via ToastBatch partagé. Slider labels min/max formatés (5min/3h00).

### File List

- `src/components/toasts/ToastBatch.tsx` (nouveau — composant partagé avec story 5.1)
- `src/components/toasts/ToastBatchSleep.tsx` (refactorisé — utilise ToastBatch)
- `src/components/toasts/__tests__/ToastBatchSleep.test.tsx` (nouveau)
- `src/components/dashboard/KpiCardSleep.tsx` (modifié — ajout onPlusTap, bouton +, restructuration)
- `src/components/ui/Slider.tsx` (modifié — formatValue appliqué aux labels min/max)
- `src/app/(app)/dashboard/page.tsx` (modifié — state isBatchSleepOpen, import ToastBatchSleep, wiring onPlusTap)
