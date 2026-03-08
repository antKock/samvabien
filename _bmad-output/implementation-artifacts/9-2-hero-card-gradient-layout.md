# Story 9.2: Hero Card — Gradient, shadow et layout durée

Status: review

## Story

As a parent,
I want que la hero card affiche un gradient vert forêt signature avec une typographie hiérarchisée,
So that le dashboard ait l'identité visuelle forte prévue dans le design et que la durée soit immédiatement lisible.

## Acceptance Criteria

1. **Given** le thème day est actif **When** j'observe la hero card **Then** le fond est un `linear-gradient(160deg, alpha(heroG1, 0.93), heroG3)` — dégradé vert forêt, PAS un fond blanc/gris plat
2. **Given** le thème night est actif **When** j'observe la hero card **Then** le fond est un `linear-gradient(155deg, heroG1, heroG3)` — dégradé vert sombre
3. **Given** la hero card est affichée **When** j'observe l'ombre **Then** une triple shadow avec teinte verte est appliquée : `0 2px 6px alpha(heroG3, 0.19), 0 8px 20px alpha(heroG3, 0.15), 0 16px 40px alpha(heroG3, 0.08)` (day)
4. **Given** le bébé dort depuis 1h23 **When** j'observe la hero card **Then** la durée "1h23" est affichée dans son propre élément à **36px, font-weight 800, letter-spacing -1px**, séparée du label
5. **Given** la hero card est affichée **When** j'observe la hiérarchie visuelle **Then** l'ordre est : emoji (28px) → label (13px) → durée (36px bold) → subtitle (9px), et PAS emoji (32px) → label+durée (20px) → subtitle (12px)
6. **Given** le thème day est actif **When** j'observe le subtitle **Then** sa couleur est `alpha(sleep.bg, 0.65)` (teintée vert pâle), PAS `text-text-sec`
7. **Given** le thème night est actif **When** j'observe le subtitle **Then** sa couleur est `hero.text` (`#98a878`)
8. **Given** la hero card est affichée **When** j'observe le border-radius **Then** il est de **22px** (pas 20px)
9. **Given** le bébé est dans un état sans durée (post-import crèche) **When** j'observe la hero card **Then** le label est affiché à 16px sans durée ni subtitle, avec un padding vertical plus grand (24px 18px 22px)

## Tasks / Subtasks

- [x] Task 1 — Appliquer le gradient de fond sur `src/components/dashboard/HeroCard.tsx` (AC: #1, #2)
  - [x] Remplacer `bg-surface` par un gradient inline utilisant `var(--hero-g1)` et `var(--hero-g3)` (variables ajoutées en Story 9-1)
  - [x] Différencier day (angle 160deg, heroG1 à 93% opacité) et night (angle 155deg, heroG1 plein)
- [x] Task 2 — Appliquer la triple shadow (AC: #3)
  - [x] Day : `0 2px 6px alpha(heroG3, 0.19), 0 8px 20px alpha(heroG3, 0.15), 0 16px 40px alpha(heroG3, 0.08)`
  - [x] Night : `0 2px 6px alpha(heroG3, 0.21), 0 8px 22px alpha(heroG3, 0.15), 0 18px 44px alpha(heroG3, 0.09)`
  - [x] Ajouter `transform: translateY(-1px)` pour le micro lift
- [x] Task 3 — Refactorer le layout interne de la hero card (AC: #4, #5, #8, #9)
  - [x] Emoji : 28px (au lieu de 32px), margin-bottom 3px
  - [x] Label : 13px, font-weight 700, couleur conditionnelle (day: `sleep.bg`, night: `hero.text`)
  - [x] Durée : **son propre `<div>`** à 36px, font-weight 800, line-height 1, letter-spacing -1px
  - [x] Subtitle : 9px, font-weight 600, margin-top 2px
  - [x] Border-radius : 22px
  - [x] Padding : `20px 18px 16px` (avec durée) / `24px 18px 22px` (sans durée)
- [x] Task 4 — Corriger les couleurs du subtitle (AC: #6, #7)
  - [x] Day : `alpha(sleep.bg, 0.65)` — teintée, PAS `text-text-sec`
  - [x] Night : `hero.text` (`var(--hero-text)` ou `#98a878`)
- [x] Task 5 — Vérifier le build
  - [x] `npm run build` sans erreurs

## Dev Notes

### Référence visuelle

Ouvrir `docs/design-reference.html` dans un navigateur pour voir le rendu exact.

Fonctions clés dans le fichier de référence :
- `heroCard()` (lignes 418-432) — le rendu complet d'une hero card
- `render()` (lignes 366-380) — le hero style avec gradient + shadow
- `HERO_FLOW` (lignes 406-416) — toutes les variantes de la hero card
- `HERO_IMPORT_STATES` (lignes 1489-1494) — états post-import (sans durée)

### Gradient — Valeurs exactes

**Day** :
```
background: linear-gradient(160deg, rgba(184,196,160, 0.93), #587044)
```
Soit avec variables : `linear-gradient(160deg, rgba(var(--hero-g1-rgb), 0.93), var(--hero-g3))`

**Night** :
```
background: linear-gradient(155deg, #4a5434, #1a2210)
```
Soit avec variables : `linear-gradient(155deg, var(--hero-g1), var(--hero-g3))`

### Shadow — Valeurs exactes

**Day** :
```
box-shadow: 0 2px 6px rgba(88,112,68, 0.19),
            0 8px 20px rgba(88,112,68, 0.15),
            0 16px 40px rgba(88,112,68, 0.08);
transform: translateY(-1px);
```

**Night** :
```
box-shadow: 0 2px 6px rgba(26,34,16, 0.21),
            0 8px 22px rgba(26,34,16, 0.15),
            0 18px 44px rgba(26,34,16, 0.09);
transform: translateY(-1px);
```

### Layout hiérarchie — Avant/Après

**AVANT (incorrect)** :
```
emoji 32px
label + durée fusionnés 20px
subtitle 12px
```

**APRÈS (conforme design)** :
```
emoji 28px          ← margin-bottom: 3px
label 13px w700     ← ex: "Dort depuis"
durée 36px w800     ← ex: "1h23", letter-spacing: -1px, line-height: 1
subtitle 9px w600   ← ex: "Endormi à 14h30", margin-top: 2px
```

### Couleurs du texte hero

Le texte de la hero card n'utilise PAS les couleurs text/textSec standard.

- **Day** : label + durée → `sleep.bg` (crème clair `#eaecda`), subtitle → `alpha(sleep.bg, 0.65)`
- **Night** : label + durée + subtitle → `hero.text` (`#98a878`)

### État post-import (sans durée)

Quand `duration` est null (après import crèche, pas de tracking live) :
- Label passe à 16px (plus gros car il est seul)
- Pas de durée, pas de subtitle
- Padding vertical augmenté : `24px 18px 22px`

Cf. `design-reference.html` L1489-1494 (`HERO_IMPORT_STATES`).

### Anti-patterns à éviter

- NE PAS utiliser de classes Tailwind pour le gradient — les valeurs sont dynamiques (day/night), utiliser du style inline
- NE PAS garder le layout actuel qui fusionne label+durée — ce sont deux `<div>` séparés
- NE PAS utiliser `text-text-sec` pour le subtitle — la couleur est thématisée spécifiquement pour la hero card

### Fichiers à modifier

- `src/components/dashboard/HeroCard.tsx` — gradient, shadow, layout, couleurs

### Dépendances

- **Requiert Story 9-1** (variables `--hero-g1`, `--hero-g3` dans `globals.css`)

### References

- [Source: docs/design-reference.html] — heroCard() L418-432, render() L366-380, HERO_IMPORT_STATES L1489-1494
- [Source: docs/audit-design-vs-implementation.md] — Écarts C1, B2, B3

## Dev Agent Record

All tasks completed successfully. HeroCard component refactored with forest green gradient (day 160deg with 93% opacity, night 155deg full opacity). Applied triple shadow with theme-specific alpha values. Reorganized internal layout with proper typography hierarchy: emoji 28px, label 13px, duration as separate 36px element with 800 weight, subtitle 9px. Corrected subtitle colors (day: alpha(sleep.bg, 0.65), night: hero.text). Border-radius set to 22px with conditional padding for duration/no-duration states.

## File List

- src/components/dashboard/HeroCard.tsx

## Change Log

- Applied forest green gradient background: day linear-gradient(160deg, rgba(184,196,160, 0.93), #587044), night linear-gradient(155deg, #4a5434, #1a2210)
- Added triple shadow with theme-specific values and translateY(-1px) micro lift
- Refactored internal layout: separated emoji (28px) → label (13px w700) → duration (36px w800, -1px letter-spacing) → subtitle (9px w600)
- Fixed subtitle colors: day uses alpha(sleep.bg, 0.65), night uses hero.text
- Updated border-radius to 22px
- Added conditional padding: 20px 18px 16px (with duration) / 24px 18px 22px (without duration)
