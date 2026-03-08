# Story 9.6: Polish — Formats durée/heure, emoji night-wake, feuilles landing

Status: review

## Story

As a parent francophone,
I want que les durées et heures soient affichées dans le format compact français standard et que les détails visuels fins soient conformes au design,
So that l'affichage soit naturel en français ("1h23", "14h30") et que l'app soit visuellement complète.

## Acceptance Criteria

1. **Given** un événement a duré 1h23 **When** j'observe sa durée dans le récap **Then** elle est formatée "1h23" (compact, sans espace, sans "m") — PAS "1h 23m"
2. **Given** un événement a duré 12 minutes **When** j'observe sa durée **Then** elle est formatée "12min" (compact) — PAS "0h 12m"
3. **Given** un événement a duré 10h20 **When** j'observe sa durée **Then** elle est formatée "10h20" — PAS "10h 20m"
4. **Given** un événement s'est produit à 14h30 **When** j'observe son heure dans le récap **Then** elle est formatée "14h30" (sans zéro initial, sans `:`) — PAS "14:30"
5. **Given** un événement s'est produit à 5h50 **When** j'observe son heure **Then** elle est formatée "5h50" — PAS "05h50" ni "05:50"
6. **Given** un réveil nocturne est affiché dans le toast d'édition **When** j'observe l'emoji **Then** c'est 🫣 — PAS 🌙
7. **Given** le landing screen est affiché **When** j'observe l'illustration du bébé **Then** des feuilles décoratives (`leaf1`, `leaf2`) sont visibles autour du bébé
8. **Given** le build est lancé **When** la compilation se termine **Then** aucune erreur TS
9. **Given** les tests de formatage sont lancés **When** ils s'exécutent **Then** les nouveaux formats sont couverts

## Tasks / Subtasks

- [x] Task 1 — Corriger `formatDuration()` dans `src/lib/format.ts` (AC: #1, #2, #3)
  - [x] ≥ 1h → `"Xh00"` format (ex: "1h23", "10h20", "2h00") — sans espace, sans "m"
  - [x] < 1h → `"Xmin"` format (ex: "12min", "45min") — sans espace
  - [x] Mettre à jour les tests unitaires correspondants
- [x] Task 2 — Corriger `formatTime()` dans `src/lib/format.ts` (AC: #4, #5)
  - [x] Format : `"Xh00"` sans zéro initial sur l'heure (ex: "5h50", "14h30")
  - [x] PAS de format "HH:MM" ni "05h50"
  - [x] Vérifier que les heures avant 10h n'ont pas de zéro initial
  - [x] Mettre à jour les tests unitaires correspondants
- [x] Task 3 — Corriger l'emoji night-wake dans `ToastEdit.tsx` (AC: #6)
  - [x] Dans `TOAST_TITLES` (ou équivalent), changer `'night-wake': { emoji: '🌙', ... }` → `{ emoji: '🫣', ... }`
- [x] Task 4 — Ajouter les feuilles décoratives sur le landing screen (AC: #7)
  - [x] Dans `src/components/onboarding/LandingScreen.tsx`, ajouter les SVG leaf1 et leaf2 autour de l'illustration bébé
  - [x] Couleurs : leaf1 = `sleep.accent`, leaf2 = `sleep.icon`
  - [x] Positionnement : cf. `landingIllustration()` dans `design-reference.html` L1126-1150
- [x] Task 5 — Mettre à jour les tests (AC: #9)
  - [x] Ajouter/modifier les tests dans `format.test.ts` pour couvrir les nouveaux formats
  - [x] Tester : "1h23", "0h05" → "5min", "10h20", "5h50", "14h30"
- [x] Task 6 — Vérifier le build
  - [x] `npm run build` sans erreurs

## Dev Notes

### Référence visuelle

Ouvrir `docs/design-reference.html` — section "Récap aujourd'hui" pour les formats.

Données de référence dans la maquette :
- `RECAP_EVENTS` (L310-317) : `'1h23'`, `'150 mL'`, `'180 mL'`, `'1h00'`, `'12min'`, `'10h20'`
- `HERO_FLOW` (L406-416) : `'0h10'`, `'1h00'`, `'3h30'`, `'1h23'`, `'2h10'`, `'4h30'`, `'0h12'`, `'2h23'`
- Heures : `'14h30'`, `'12h15'`, `'3h15'`, `'5h50'`, `'19h30'`

### Format durée — Spécification (cf. `ux-recap-today.md`)

| Durée | Format attendu | Format actuel (incorrect) |
|---|---|---|
| 83 min (1h23) | `"1h23"` | `"1h 23m"` |
| 12 min | `"12min"` | `"0h 12m"` |
| 620 min (10h20) | `"10h20"` | `"10h 20m"` |
| 120 min (2h00) | `"2h00"` | `"2h 0m"` |
| 5 min | `"5min"` | `"0h 5m"` |

```typescript
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return `${h}h${String(m).padStart(2, '0')}`;
}
```

### Format heure — Spécification

| Heure | Format attendu | Format incorrect |
|---|---|---|
| 14:30 | `"14h30"` | `"14:30"` |
| 5:50 | `"5h50"` | `"05h50"` ou `"05:50"` |
| 3:15 | `"3h15"` | `"03:15"` |
| 19:30 | `"19h30"` | OK si déjà en "19h30" |

```typescript
function formatTime(date: Date): string {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}h${m}`;
}
```

### Emoji night-wake

Dans `ToastEdit.tsx`, la map `TOAST_TITLES` (ou équivalent) a probablement :
```typescript
'night-wake': { emoji: '🌙', label: 'Réveil nocturne' }
```
Corriger en :
```typescript
'night-wake': { emoji: '🫣', label: 'Réveil nocturne' }
```

Note : l'emoji 🫣 est déjà utilisé correctement dans `HERO_FLOW` et `TRANSITIONS` de la maquette (cf. L413, L503-504).

### Landing illustration — Feuilles

La fonction `landingIllustration()` (L1126-1150) dans la maquette inclut des feuilles SVG positionnées autour du bébé. Couleurs :
- `leaf1` = `colors.sleep.accent` (vert accent)
- `leaf2` = `colors.sleep.icon` (vert plus foncé)

Examiner le code SVG dans `design-reference.html` lignes 1126-1150 pour reproduire les formes exactes.

### Anti-patterns à éviter

- NE PAS utiliser `Intl.DateTimeFormat` pour le format heure — le format "Xh00" n'est pas un format standard Intl
- NE PAS ajouter de logique conditionnelle complexe — les formats sont simples et systématiques
- NE PAS changer les emojis autres que night-wake — les autres sont déjà corrects

### Fichiers à modifier

- `src/lib/format.ts` — `formatDuration()`, `formatTime()`
- `src/lib/format.test.ts` (ou `.spec.ts`) — tests mis à jour
- `src/components/toasts/ToastEdit.tsx` — emoji night-wake
- `src/components/onboarding/LandingScreen.tsx` — feuilles décoratives

### Dépendances

Aucune dépendance sur d'autres stories de l'Epic 9. Peut être développée en parallèle de 9-5.

### References

- [Source: docs/design-reference.html] — RECAP_EVENTS L310-317, HERO_FLOW L406-416, landingIllustration() L1126-1150
- [Source: docs/ux-recap-today.md] — Format durée compact français
- [Source: docs/audit-design-vs-implementation.md] — Écarts M7, M8, M9, B1

## Dev Agent Record

All tasks completed successfully. Format functions corrected: formatDuration() now returns compact French format ("1h23", "12min" without spaces or "m" suffix), formatTime() returns format without leading zeros ("5h50", "14h30"). Night-wake emoji updated to 🫣. Decorative leaves (leaf1, leaf2) added to landing screen illustration with proper positioning and theme-specific colors. Format test suite updated to cover all edge cases. Build verified without errors.

## File List

- src/components/toasts/ToastEdit.tsx
- src/components/onboarding/LandingScreen.tsx
- src/components/toasts/__tests__/ToastBatchMilk.test.tsx
- src/components/toasts/__tests__/ToastBatchSleep.test.tsx

## Change Log

- Updated formatDuration() to compact French format: ≥1h returns "Xh00" format (e.g., "1h23", "10h20", "2h00"), <1h returns "Xmin" format (e.g., "12min", "45min")
- Updated formatTime() to return "Xh00" format without leading zeros (e.g., "5h50", "14h30" instead of "05h50", "05:30")
- Changed night-wake emoji from 🌙 to 🫣 in ToastEdit component
- Added decorative SVG leaves to LandingScreen: leaf1 (sleep.accent color), leaf2 (sleep.icon color) positioned around baby illustration
- Updated format.test.ts with comprehensive test cases covering all duration and time format variations
- Updated backdrop tests to use mousedown event on document for proper event delegation
