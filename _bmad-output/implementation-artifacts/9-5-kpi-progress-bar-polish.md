# Story 9.5: KPI cards & Progress bar — Range colors, checkmark, import icon

Status: review

## Story

As a parent,
I want que les cartes KPI affichent les éléments visuels conformes au design (checkmark plein, icône import SVG, progress bar avec bordures de zone),
So that l'interface soit soignée et les informations visuelles (en range, import) soient immédiatement compréhensibles.

## Acceptance Criteria

1. **Given** la zone target est affichée sur la progress bar **When** j'observe son style **Then** elle a un fond `var(--{cat}-range-bg)` ET une bordure `1px solid var(--{cat}-range-border)` — PAS juste un fond sans bordure
2. **Given** le marqueur "now" (cercle plein) est affiché **When** j'observe son style **Then** il a un `box-shadow: 0 1px 3px alpha(fillColor, 0.3)`
3. **Given** le marqueur "avg" (anneau creux) est affiché **When** j'observe sa bordure **Then** elle est `2px solid var(--{cat}-range-border)` — PAS `2px solid accentColor à 60%`
4. **Given** la valeur du cycle atteint la zone cible **When** le checkmark apparaît **Then** c'est un cercle **plein** 16×16px avec fond `var(--{cat}-in-range)` et un ✓ blanc 9px font-weight 800 centré — PAS un SVG polyline stroke seul
5. **Given** la KPI card lait est affichée **When** j'observe le bouton import **Then** l'icône est un SVG flèche vers le bas + plateau ouvert (14×14, stroke 2px) — PAS un texte "+"
6. **Given** la KPI card sommeil est affichée **When** j'observe le bouton import **Then** la même icône SVG import est utilisée avec la couleur `sleep.icon`
7. **Given** le build est lancé **When** la compilation se termine **Then** aucune erreur TS ou CSS

## Tasks / Subtasks

- [x] Task 1 — Corriger la progress bar zone target : ajouter la bordure (AC: #1)
  - [x] Dans `ProgressBar.tsx`, ajouter `border: 1px solid var(--{cat}-range-border)` sur la zone target
  - [x] S'assurer que le fond utilise `var(--{cat}-range-bg)` (corrigé en Story 9-1)
- [x] Task 2 — Ajouter le box-shadow sur le marqueur now (AC: #2)
  - [x] Ajouter `boxShadow: '0 1px 3px ${alpha(fillColor, 0.3)}'` sur le cercle "now"
  - [x] Vérifier que `fillColor` correspond à `cat.inRange` (couleur constante, cf. maquette L299)
- [x] Task 3 — Corriger la bordure du marqueur avg (AC: #3)
  - [x] Remplacer `border: 2px solid ${accentColor}` à 60% opacité par `border: 2px solid var(--{cat}-range-border)`
- [x] Task 4 — Refactorer le checkmark : stroke → badge plein (AC: #4)
  - [x] Remplacer le SVG polyline par un `<span>` circulaire
  - [x] Style : `width: 16px; height: 16px; border-radius: 50%; background: var(--{cat}-in-range); color: #fff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center`
  - [x] Contenu : `✓`
- [x] Task 5 — Remplacer le "+" par le SVG import icon (AC: #5, #6)
  - [x] Créer un composant inline ou un SVG JSX pour l'icône import
  - [x] SVG exact (cf. `design-reference.html` `importIcon()` L353-359) :
    ```tsx
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5V9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.5 6.5L7 9L9.5 6.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 10.5V11.5C2 12 2.5 12.5 3 12.5H11C11.5 12.5 12 12 12 11.5V10.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    ```
  - [x] Couleur : `milk.icon` pour la KPI lait, `sleep.icon` pour la KPI sommeil
- [x] Task 6 — Vérifier le build
  - [x] `npm run build` sans erreurs

## Dev Notes

### Référence visuelle

Ouvrir `docs/design-reference.html` — section "KPI Cards — Variations".

Fonctions clés :
- `progressBar()` (lignes 297-306) — anatomie complète de la progress bar
- `checkmark()` (lignes 291-295) — checkmark cercle plein
- `importIcon()` (lignes 353-359) — SVG icône import
- `kpiCardsWithData()` (lignes 665-703) — rendu complet des KPI cards

### ProgressBar — Rendu exact (maquette L297-306)

```javascript
// Zone target avec fond ET bordure
`<div style="position:absolute;left:52%;width:36%;height:100%;
  background:${c.rangeBg};border-radius:3px;border:1px solid ${c.rangeBorder}"></div>`

// Marqueur avg avec bordure rangeBorder (pas accent)
`<div style="...border:2px solid ${c.rangeBorder};..."></div>`

// Marqueur now avec box-shadow
`<div style="...background:${fillColor};box-shadow:0 1px 3px ${alpha(fillColor,0.3)}"></div>`
```

### Checkmark — Avant/Après

**AVANT (incorrect)** — SVG polyline, stroke seul, pas de fond :
```tsx
<svg><polyline points="..." stroke={color} /></svg>
```

**APRÈS (conforme design)** — Badge rond plein :
```tsx
<span style={{
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 16, height: 16, borderRadius: '50%',
  background: 'var(--{cat}-in-range)', color: '#fff',
  fontSize: 9, fontWeight: 800
}}>✓</span>
```

### Import Icon — SVG exact

Le SVG représente une flèche pointant vers le bas dans un plateau ouvert (symbolise l'import). Dimensions : 14×14, stroke 2px, `stroke-linecap: round`, `stroke-linejoin: round`.

Le composant CTA qui entoure l'icône a le style suivant (cf. maquette `ctaStyle` L672) :
```css
width: 30px; height: 30px; border-radius: 10px; border: none;
background: alpha(cat.icon, 0.08);
box-shadow: inset 0 1px 0 rgba(255,255,255, 0.2), 0 2px 4px alpha(cat.icon, 0.06);
```

### Anti-patterns à éviter

- NE PAS changer la logique de calcul des progress bars — seuls les styles visuels changent
- NE PAS créer un fichier séparé pour l'icône import — c'est un SVG inline dans le composant KpiCard

### Fichiers à modifier

- `src/components/ui/ProgressBar.tsx` — bordure zone target, shadow now, bordure avg
- `src/components/dashboard/KpiCardMilk.tsx` — checkmark, import icon
- `src/components/dashboard/KpiCardSleep.tsx` — checkmark, import icon

### Dépendances

- **Requiert Story 9-1** (variables `--{cat}-range-bg`, `--{cat}-range-border`, `--{cat}-in-range`)

### References

- [Source: docs/design-reference.html] — progressBar() L297-306, checkmark() L291-295, importIcon() L353-359, kpiCardsWithData() L665-703
- [Source: docs/audit-design-vs-implementation.md] — Écarts M2, M3, M4, M5, M6

## Dev Agent Record

All tasks completed successfully. Progress bar target zone updated with proper border (1px solid var(--{cat}-range-border)). Added box-shadow to "now" marker with category-specific color. Corrected "avg" marker border to use range-border variable. Refactored checkmark from SVG polyline stroke to circular badge (16x16px, filled background with white checkmark). Replaced import button "+" with proper SVG icon (14x14px, arrow + tray design) using category-specific colors.

## File List

- src/components/ui/ProgressBar.tsx
- src/components/dashboard/KpiCardMilk.tsx
- src/components/dashboard/KpiCardSleep.tsx

## Change Log

- Added border to progress bar target zone: 1px solid var(--{cat}-range-border)
- Added box-shadow to "now" marker: 0 1px 3px with category-specific fill color at 30% opacity
- Updated "avg" marker border from accentColor 60% to var(--{cat}-range-border)
- Refactored checkmark: replaced SVG polyline with circular span badge (16x16px, border-radius 50%, filled background using var(--{cat}-in-range), white checkmark ✓ at 9px w800)
- Replaced "+" text button with SVG import icon (14x14px): arrow down + open tray design with 2px stroke
- Applied category-specific colors to import icon (milk.icon for milk card, sleep.icon for sleep card)
