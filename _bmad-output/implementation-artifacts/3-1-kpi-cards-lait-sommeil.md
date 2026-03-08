# Story 3.1: KPI cards lait & sommeil

Status: done

## Story

As a parent,
I want voir la progression quotidienne de lait et de sommeil sur deux cartes KPI,
So that je sais en un coup d'œil où en est mon bébé dans sa journée.

## Acceptance Criteria

1. **Given** le bébé a consommé 300 mL de lait dans le cycle en cours **When** j'ouvre le dashboard **Then** la KPI card lait affiche "300 mL" (26px, weight 800) avec le label "Lait aujourd'hui"
2. **Given** la KPI card lait est affichée **When** j'observe la progress bar **Then** elle montre bar-fill proportionnel au max de la barre, bar-now (cercle plein accent orange), bar-target (zone ombrée calculée à partir du poids du bébé)
3. **Given** le bébé a dormi 2h30 dans le cycle en cours (siestes terminées) **When** j'ouvre le dashboard **Then** la KPI card sommeil affiche "2h30" avec le label "Sommeil aujourd'hui" et la progress bar utilise les couleurs sommeil (accent vert)
4. **Given** le bébé est en sieste ou nuit en cours **When** j'observe la KPI card sommeil **Then** bar-fill et la valeur s'incrémentent en temps réel (~1 min de pas)
5. **Given** le module `lib/medical-targets.ts` est implémenté **When** j'appelle `getMilkTarget(weightHg)` avec un poids de 42 (4,2 kg) **Then** la zone cible retournée correspond à la formule médicale (min-max en mL)
6. **Given** le module `lib/medical-targets.ts` est implémenté **When** j'appelle `getSleepTarget(dobDate)` avec un bébé de 4 mois **Then** la zone cible retournée correspond au tableau de référence médical (min-max en minutes)
7. **Given** la valeur du cycle atteint la zone cible médicale **When** la KPI card se met à jour **Then** un checkmark apparaît (couleur accent de la catégorie)
8. **Given** la valeur du cycle n'a pas encore atteint la zone cible **When** la KPI card est affichée **Then** il n'y a pas de checkmark, pas de warning, pas d'alerte
9. **Given** il y a au moins 3 jours d'historique **When** la KPI card est affichée **Then** bar-avg (anneau creux, bordure couleur bar-target, fond bar-track) est positionné à la moyenne glissante 3 jours contextualisée à l'heure actuelle
10. **Given** c'est le premier jour d'utilisation **When** la KPI card est affichée **Then** bar-fill est à 0%, valeur "0 mL" / "0h00", pas de bar-avg, bar-target visible normalement
11. **Given** la valeur dépasse le max de la barre **When** la KPI card se met à jour **Then** bar-fill est clampé à 100% (overflow géré)
12. **Given** les tests unitaires de medical-targets **When** je lance vitest **Then** les calculs de zones cibles lait (par poids) et sommeil (par âge) sont corrects

## Tasks / Subtasks

- [x] Task 1 — Créer `src/lib/medical-targets.ts` (AC: #5, #6)
  - [x] `getMilkTarget(weightHg: number): { min: number; max: number }` — formule médicale mL/jour basée sur le poids
  - [x] `getSleepTarget(dob: string): { min: number; max: number }` — minutes/jour basé sur l'âge (tableau de référence)
  - [x] `getMilkRange(weightHg: number): { min: number; max: number }` — bornes slider biberon (pour Story 3.2)
  - [x] Export nommé
- [x] Task 2 — Tests unitaires `src/lib/medical-targets.test.ts` (AC: #12)
  - [x] Test getMilkTarget : poids 42 (4,2 kg) → min/max cohérents
  - [x] Test getSleepTarget : bébé 4 mois → min/max cohérents
  - [x] Test getMilkRange : bornes slider par poids
  - [x] Test edge cases : nouveau-né, grand bébé
- [x] Task 3 — Créer `src/components/ui/ProgressBar.tsx` (AC: #2, #7, #8, #9, #10, #11)
  - [x] Props : `value`, `target: { min, max }`, `avg?`, `accentColor`, `trackColor`
  - [x] Rendu : bar-track, bar-fill (clampé à 100%), bar-now (cercle plein), bar-target (zone ombrée), bar-avg (anneau creux optionnel)
  - [x] Utiliser CSS variables Tailwind (pas de couleurs hardcodées)
- [x] Task 4 — Créer `src/components/dashboard/KpiCardMilk.tsx` (AC: #1, #2, #7, #8, #9, #10, #11)
  - [x] Utilise `useHousehold()` pour récupérer events + profile
  - [x] Utilise `eventsInCycle()` pour filtrer les events bottle du cycle
  - [x] Calcule le total mL du cycle
  - [x] Appelle `getMilkTarget(profile.babyWeightHg)` pour la zone cible
  - [x] Appelle `rollingAverage(events, 3, currentHour, 'bottle')` pour bar-avg
  - [x] Affiche checkmark si total >= target.min
  - [x] Expose `onTap` pour ouvrir le toast biberon (Story 3.2)
  - [x] Expose `onPlusTap` pour ouvrir le toast import crèche (future)
- [x] Task 5 — Créer `src/components/dashboard/KpiCardSleep.tsx` (AC: #3, #4, #7, #8, #9, #10, #11)
  - [x] Même structure que KpiCardMilk mais pour le sommeil
  - [x] Filtre events nap + night du cycle
  - [x] Calcule le total minutes du cycle (utilise `formatDuration` pour l'affichage)
  - [x] Si sieste/nuit en cours → ajouter la durée écoulée depuis `sleepStateSince`
  - [x] Mise à jour temps réel avec interval ~1 min pour la sieste en cours
  - [x] Appelle `getSleepTarget(profile.babyDob)` pour la zone cible
  - [x] Expose `onTap` pour ouvrir le toast transition (même que hero card)
- [x] Task 6 — Intégrer les KPI cards dans le dashboard `src/app/(app)/dashboard/page.tsx` (AC: #1, #3)
  - [x] Empiler sous le HeroCard : KpiCardMilk + KpiCardSleep
  - [x] Passer les handlers onTap/onPlusTap

## Dev Notes

### medical-targets.ts — Formules médicales

**Lait (par poids) :**
- Formule de base : 150 mL/kg/jour (recommandation OMS simplifiée)
- `min = poids_kg * 120`, `max = poids_kg * 180` (fourchette courante)
- Conversion : `weightHg / 10` pour obtenir le poids en kg
- Exemple : bébé 4,2 kg → min 504 mL, max 756 mL

**Sommeil (par âge) — tableau de référence :**
- 0–1 mois : 14–17h/jour
- 1–3 mois : 14–17h/jour
- 4–11 mois : 12–15h/jour
- 12–24 mois : 11–14h/jour
- En minutes par jour pour le calcul interne

**Range slider biberon (pour Story 3.2) :**
- `min = 30 mL` (fixe)
- `max = poids_kg * 50` clampé entre 150 et 350 mL
- `step = 10 mL`

### ProgressBar — Anatomie visuelle

```
bar-track (100% du rail, couleur track CSS variable)
├── bar-fill (0–100%, couleur accent catégorie, clampé)
│   └── bar-now (cercle plein, bout du fill, couleur accent)
├── bar-target (zone ombrée entre target.min et target.max, positionnée sur le rail)
└── bar-avg (anneau creux, bordure = couleur bar-target, fond = bar-track, optionnel)
```

- **max de la barre** = `target.max * 1.2` (marge 20% au-delà de la zone cible pour visualiser le dépassement)
- bar-fill en % = `Math.min(100, (value / barMax) * 100)`
- bar-target position = `(target.min / barMax * 100)%` à `(target.max / barMax * 100)%`

### KPI Cards — Pattern composant

Chaque KpiCard est un composant client (`'use client'`) qui :
1. Lit les données via `useHousehold()` (Context)
2. Calcule les valeurs dérivées (total cycle, zone cible, moyenne)
3. Rend : label, valeur, ProgressBar, checkmark conditionnel, boutons tap/+
4. **NE fait pas de fetch API** — tout passe par le Context

### Couleurs CSS variables (pas de hardcode)

- Lait : `var(--milk-bg)`, `var(--milk-accent)`, `var(--milk-icon)` (définis dans globals.css)
- Sommeil : `var(--sleep-bg)`, `var(--sleep-accent)`, `var(--sleep-icon)` (définis dans globals.css)
- Track : `var(--track)` (défini dans globals.css)

Vérifier que `globals.css` contient `--milk-icon` et `--sleep-icon`. Si absent, les ajouter :
- Day : milk-icon `#a06840`, sleep-icon `#6a7a4a`
- Night : milk-icon `#cca070`, sleep-icon `#98a878`

### Sommeil temps réel — Incrémentation

Quand `profile.sleepState` ∈ `['nap', 'night', 'night-sleep']` et `profile.sleepStateSince` est défini :
- Calculer `elapsedMs = Date.now() - new Date(sleepStateSince).getTime()`
- Ajouter `elapsedMs` au total sommeil du cycle
- Rafraîchir avec `setInterval` toutes les 60s (pas besoin de requestAnimationFrame ici)

### Anti-patterns à éviter
- NE PAS hardcoder les formules médicales dans les composants — tout passe par `medical-targets.ts`
- NE PAS créer de composant KpiCard générique avec des props conditionnelles — créer 2 composants spécialisés (`KpiCardMilk` + `KpiCardSleep`) car ils ont des comportements différents (temps réel vs événementiel)
- NE PAS mettre la logique de filtrage d'événements dans les composants — utiliser `eventsInCycle()` de `cycle-window.ts`
- NE PAS utiliser `useSleepChrono` pour la KPI card — ce hook est conçu pour le hero card (précision seconde). Utiliser un simple `setInterval` (précision minute suffit)
- NE PAS afficher de rouge, warning, ou signal négatif quand la zone cible n'est pas atteinte

### Dépendances existantes

| Module | Fichier | Usage |
|---|---|---|
| cycle-window | `src/lib/cycle-window.ts` | `eventsInCycle()`, `rollingAverage()` |
| format | `src/lib/format.ts` | `formatDuration()` pour l'affichage sommeil |
| HouseholdContext | `src/contexts/HouseholdContext.tsx` | `useHousehold()` pour les events, profile |
| Types | `src/types/index.ts` | `BabyEvent`, `Profile`, `SleepState` |

### Project Structure Notes

Fichiers à créer :
- `src/lib/medical-targets.ts`
- `src/lib/medical-targets.test.ts`
- `src/components/ui/ProgressBar.tsx`
- `src/components/dashboard/KpiCardMilk.tsx`
- `src/components/dashboard/KpiCardSleep.tsx`

Fichiers à modifier :
- `src/app/(app)/dashboard/page.tsx` — ajouter les KPI cards sous le HeroCard
- `src/app/globals.css` — ajouter `--milk-icon` et `--sleep-icon` si absents

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: docs/ux-kpi-cards.md] — Spécification complète des KPI cards
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — KpiCardMilk, KpiCardSleep, ProgressBar
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — `src/components/dashboard/`, `src/lib/`
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — Palette COLORS day/night
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System] — 26px weight 800 pour les valeurs KPI
- [Source: _bmad-output/planning-artifacts/prd.md#FR14–FR18]
- [Source: src/lib/cycle-window.ts] — eventsInCycle, rollingAverage (déjà implémenté Story 2.4)
- [Source: src/lib/format.ts] — formatDuration (déjà implémenté)
- [Source: src/contexts/HouseholdContext.tsx] — Pattern optimistic update, useHousehold

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed pre-existing TS error in HouseholdContext.tsx (missing `error` property in setState)
- Fixed ESLint `react-hooks/purity` error: `useState(Date.now())` → `useState(() => Date.now())`
- Removed unused `max` prop from ProgressBar (computed internally from `target.max * 1.2`)

### Completion Notes List

- Implemented `medical-targets.ts` with `getMilkTarget`, `getSleepTarget`, `getMilkRange` — all using named exports
- 10 unit tests covering all functions + edge cases (newborn, large baby, slider bounds clamping)
- `ProgressBar` renders bar-track, bar-fill (clamp 100%), bar-now (circle), bar-target (shaded zone), bar-avg (hollow ring)
- `KpiCardMilk` reads events via context, filters bottle events in cycle, shows total mL, checkmark when target reached
- `KpiCardSleep` same pattern + real-time increment via `setInterval(60s)` when baby is sleeping
- Dashboard layout: HeroCard → KpiCardMilk → KpiCardSleep stacked with gap-3
- All 80 tests pass, no regressions, lint clean

### Change Log

- 2026-03-08: Story 3.1 implemented — KPI cards lait & sommeil with medical targets, progress bars, and dashboard integration
- 2026-03-08: Code review — Fixed: KpiCardMilk nested buttons (HTML invalid) + missing relative positioning, test description mismatch (14-17h → 12-15h for 4-month-old)

### File List

- `src/lib/medical-targets.ts` (created)
- `src/lib/medical-targets.test.ts` (created)
- `src/components/ui/ProgressBar.tsx` (created)
- `src/components/dashboard/KpiCardMilk.tsx` (created)
- `src/components/dashboard/KpiCardSleep.tsx` (created)
- `src/app/(app)/dashboard/page.tsx` (modified — added KPI cards imports and layout)
- `src/contexts/HouseholdContext.tsx` (modified — fixed missing `error` property in setState)
