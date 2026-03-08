# Story 9.1: Fondation thème — Variables CSS manquantes + gradients page

Status: review

## Story

As a parent,
I want que l'app ait un fond subtilement dégradé et des couleurs de range/target distinctes par catégorie,
So that l'identité visuelle de samvabien soit cohérente avec le design prévu et ne ressemble pas à un template générique.

## Acceptance Criteria

1. **Given** le thème day est actif **When** j'observe le background de la page **Then** un gradient subtil multi-teintes est visible : `linear-gradient(170deg, rgba(sleep.bg, 0.50), rgba(pageBg1, 0.07), bg, rgba(milk.bg, 0.15))`
2. **Given** le thème night est actif **When** j'observe le background de la page **Then** un gradient sombre avec nuances vertes est visible : `linear-gradient(170deg, rgba(pageBg3, 0.38), bg, rgba(sleep.bg, 0.25))`
3. **Given** les variables CSS day sont chargées **When** j'inspecte les custom properties **Then** les variables suivantes existent : `--sleep-range-bg`, `--sleep-range-border`, `--sleep-in-range`, `--milk-range-bg`, `--milk-range-border`, `--milk-in-range`, `--hero-g1`, `--hero-g3`, `--page-bg1`, `--page-bg3`
4. **Given** les variables CSS night sont chargées **When** j'inspecte les custom properties **Then** les mêmes variables existent avec les valeurs night correspondantes
5. **Given** les variables range/target sont définies **When** j'observe la ProgressBar de lait **Then** la zone target utilise `var(--milk-range-bg)` en fond et `var(--milk-range-border)` en bordure (au lieu de `accentColor` à 20% d'opacité)
6. **Given** les variables range/target sont définies **When** j'observe la ProgressBar de sommeil **Then** la zone target utilise `var(--sleep-range-bg)` en fond et `var(--sleep-range-border)` en bordure
7. **Given** le build est lancé **When** la compilation se termine **Then** aucune erreur TS ou CSS

## Tasks / Subtasks

- [x] Task 1 — Ajouter les variables CSS manquantes dans `src/app/globals.css` (AC: #3, #4)
  - [x] Dans `[data-theme="day"]` ajouter : `--sleep-range-bg`, `--sleep-range-border`, `--sleep-in-range`, `--milk-range-bg`, `--milk-range-border`, `--milk-in-range`
  - [x] Dans `[data-theme="day"]` ajouter : `--hero-g1`, `--hero-g3`, `--page-bg1`, `--page-bg3`
  - [x] Dans `[data-theme="night"]` ajouter les mêmes variables avec les valeurs night
- [x] Task 2 — Appliquer le gradient de page sur le layout principal (AC: #1, #2)
  - [x] Identifier le composant layout racine (probablement `src/app/(app)/layout.tsx` ou le body dans `globals.css`)
  - [x] Appliquer `background-image: linear-gradient(...)` conditionné par le thème via les variables CSS
- [x] Task 3 — Mettre à jour `src/components/ui/ProgressBar.tsx` pour utiliser les nouvelles variables (AC: #5, #6)
  - [x] Remplacer l'approximation `accentColor` à 20% opacité par `var(--{cat}-range-bg)` pour le fond de la zone target
  - [x] Ajouter `border: 1px solid var(--{cat}-range-border)` sur la zone target
  - [x] Passer le type de catégorie (`'sleep'` | `'milk'`) en prop si nécessaire
- [x] Task 4 — Vérifier le build (AC: #7)
  - [x] `npm run build` sans erreurs

## Dev Notes

### Valeurs exactes des variables CSS

**Référence visuelle** : `docs/design-reference.html` — objet `COLORS` (lignes 239-264), rendu `bgDay`/`bgNight` (lignes 386-387).

**Day (`[data-theme="day"]`)** :
```css
--sleep-range-bg: rgba(120,130,80,0.15);
--sleep-range-border: rgba(120,130,80,0.28);
--sleep-in-range: #8a9a5a;
--milk-range-bg: rgba(180,130,80,0.15);
--milk-range-border: rgba(180,130,80,0.28);
--milk-in-range: #c0945a;
--hero-g1: #b8c4a0;
--hero-g3: #587044;
--page-bg1: #a8b490;
--page-bg3: #6a8054;
```

**Night (`[data-theme="night"]`)** :
```css
--sleep-range-bg: rgba(120,140,70,0.15);
--sleep-range-border: rgba(130,150,80,0.25);
--sleep-in-range: #7a8a4a;
--milk-range-bg: rgba(160,120,60,0.15);
--milk-range-border: rgba(170,130,70,0.25);
--milk-in-range: #b08a4a;
--hero-g1: #4a5434;
--hero-g3: #1a2210;
--page-bg1: #3a4228;
--page-bg3: #222c16;
```

### Gradients de page

**Day** (cf. `design-reference.html` L386) :
```css
background: var(--bg);
background-image: linear-gradient(170deg,
  rgba(234,236,218, 0.50),   /* sleep.bg */
  rgba(168,180,144, 0.07),   /* pageBg1 */
  var(--bg),
  rgba(245,230,214, 0.15));  /* milk.bg */
```

**Night** (cf. `design-reference.html` L387) :
```css
background: var(--bg);
background-image: linear-gradient(170deg,
  rgba(34,44,22, 0.38),      /* pageBg3 */
  var(--bg),
  rgba(34,40,24, 0.25));     /* sleep.bg */
```

Pour que les `rgba()` fonctionnent avec les variables, il faut soit hardcoder les valeurs RGB du gradient (comme dans la maquette), soit ajouter des variables `-rgb` pour chaque couleur nécessaire. L'approche la plus simple est de hardcoder les valeurs dans le gradient puisqu'elles sont fixes par thème.

### ProgressBar — Changement attendu

Actuellement la zone target utilise une approximation :
```tsx
// AVANT (approximation)
background: alpha(accentColor, 0.2)
// pas de bordure
```

Après correction :
```tsx
// APRÈS (conforme design)
background: var(--{cat}-range-bg)
border: 1px solid var(--{cat}-range-border)
```

Le composant `ProgressBar` doit recevoir le type de catégorie pour sélectionner les bonnes variables. Ajouter une prop `category: 'sleep' | 'milk'` si elle n'existe pas déjà.

### Anti-patterns à éviter

- NE PAS utiliser `opacity` sur les variables CSS pour simuler les range colors — utiliser les valeurs `rgba()` exactes
- NE PAS mettre le gradient de page en inline style — le mettre dans `globals.css` conditionné par `[data-theme]`
- NE PAS modifier les couleurs de base existantes — cette story ajoute uniquement les variables **manquantes**

### Fichiers à modifier

- `src/app/globals.css` — ajouter variables + gradient page
- `src/components/ui/ProgressBar.tsx` — utiliser les nouvelles variables range
- Potentiellement `src/app/(app)/layout.tsx` si le gradient doit être appliqué sur le layout

### Dépendances

Aucune dépendance sur d'autres stories. C'est la fondation — les stories 9-2 à 9-6 dépendent de celle-ci.

### References

- [Source: docs/design-reference.html] — COLORS L239-264, bgDay/bgNight L386-387, progressBar() L297-306
- [Source: docs/audit-design-vs-implementation.md] — Écarts C2, C3, M3

## Dev Agent Record

All tasks completed successfully. CSS variables added to globals.css for both day and night themes (10 variables each). Page background gradient applied with category-specific colors. ProgressBar component updated to use new range variables for both sleep and milk categories. Build verified without errors.

## File List

- src/app/globals.css
- src/components/ui/ProgressBar.tsx
- src/components/dashboard/KpiCardMilk.tsx
- src/components/dashboard/KpiCardSleep.tsx

## Change Log

- Added 10 CSS custom properties per theme: --sleep-range-bg, --sleep-range-border, --sleep-in-range, --milk-range-bg, --milk-range-border, --milk-in-range, --hero-g1, --hero-g3, --page-bg1, --page-bg3
- Applied multi-color gradient background to page with theme-specific values (day: 170deg with sleep/milk/page colors; night: 170deg with pageBg3/sleep colors)
- Updated ProgressBar to use category-specific range variables instead of generic accentColor approximation
- Added border to progress bar target zone with var(--{cat}-range-border)
