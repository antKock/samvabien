# Story 9.3: Toast floating + cooldown border SVG rect arrondi

Status: review

## Story

As a parent,
I want que le toast de transition apparaisse en bas de l'écran comme un élément flottant avec une bordure cooldown animée,
So that l'interaction soit légère et non-intrusive (pas un modal plein écran) et que je voie clairement le temps restant avant la confirmation automatique.

## Acceptance Criteria

1. **Given** un toast de transition s'affiche **When** j'observe sa position **Then** il est positionné en `absolute bottom: 16px, left: 13px, right: 13px` — flottant en bas de l'écran, PAS en modal plein écran avec backdrop
2. **Given** un toast est affiché **When** j'observe son border-radius **Then** il est de **18px sur les 4 coins** (pas `rounded-t-[20px]` en bottom sheet)
3. **Given** un toast de transition sommeil est affiché **When** j'observe son background **Then** il utilise `sleep.bg` avec `border: 1.5px solid alpha(sleep.accent, 0.3)` et `box-shadow: 0 -4px 20px alpha(sleep.accent, 0.15)` — PAS `bg-surface` générique
4. **Given** un toast de transition lait est affiché **When** j'observe son background **Then** il utilise `milk.bg` avec `border: 1.5px solid alpha(milk.accent, 0.3)` et `box-shadow: 0 -4px 20px alpha(milk.accent, 0.15)`
5. **Given** un toast avec cooldown est affiché **When** le cooldown démarre **Then** un SVG `<path>` traçant un **rectangle arrondi** autour du toast entier s'anime en `stroke-dashoffset` (sens anti-horaire), PAS un cercle autour du bouton
6. **Given** le cooldown SVG est rendu **When** j'observe le path **Then** il démarre du milieu du bord top, trace les 4 côtés avec des coins arrondis (r=18), et le périmètre est calculé dynamiquement via les dimensions du toast
7. **Given** le cooldown est en cours **When** 5 secondes s'écoulent (transitions) **Then** le stroke est entièrement "vidé" et l'action est confirmée automatiquement
8. **Given** le cooldown est en cours **When** 2 secondes s'écoulent (undo) **Then** le stroke est entièrement "vidé" et le undo expire
9. **Given** un toast est affiché **When** j'observe le bouton cancel **Then** c'est un bouton rond 28×28px, border-radius 50%, positionné top 10px right 10px, avec icône ↩
10. **Given** le toast s'affiche en mode biberon ou batch **When** j'observe le theming **Then** le même pattern floating + theming catégorisé s'applique (pas de backdrop modal)
11. **Given** le toast est affiché **When** j'observe le border-radius des toasts d'édition et d'undo **Then** ils utilisent aussi 18px et le layout floating

## Tasks / Subtasks

- [x] Task 1 — Refactorer le layout du toast : modal → floating (AC: #1, #2)
  - [x] Supprimer le backdrop/overlay noir 30%
  - [x] Remplacer le layout modal par un container `position: absolute; bottom: 16px; left: 13px; right: 13px; z-index: 20`
  - [x] Appliquer `border-radius: 18px` sur les 4 coins (retirer `rounded-t-[20px]`)
  - [x] S'assurer que le z-index est au-dessus du contenu de la page
- [x] Task 2 — Appliquer le theming catégorisé sur tous les toasts (AC: #3, #4, #10)
  - [x] Toast transition : background `var(--sleep-bg)`, border `1.5px solid alpha(var(--sleep-accent), 0.3)`, shadow `0 -4px 20px alpha(var(--sleep-accent), 0.15)`
  - [x] Toast biberon : background `var(--milk-bg)`, border/shadow avec `milk.accent`
  - [x] Toast batch lait : idem milk
  - [x] Toast batch sommeil : idem sleep
  - [x] Toast edit : background selon la catégorie de l'event édité
  - [x] Toast undo : background selon la catégorie de l'event supprimé
- [x] Task 3 — Créer le composant `CooldownBorder` (AC: #5, #6, #7, #8)
  - [x] SVG overlay `position: absolute; inset: -1px; pointer-events: none; z-index: 1`
  - [x] Le `<path>` trace un rectangle arrondi (r=18) autour du toast
  - [x] Le path démarre du milieu du bord top, sens horaire (conforme à la maquette)
  - [x] Calculer le périmètre post-rendu via `useRef` + `useEffect` sur les dimensions du toast parent
  - [x] Formule périmètre : `2 * (w + h - 4 * s) - 8 * r + 2 * Math.PI * r` (s = demi stroke-width)
  - [x] Animer `stroke-dashoffset` de 0 → périmètre sur la durée du cooldown
  - [x] Stroke : `stroke-width: 2.5`, `stroke-linecap: round`, couleur = accent de la catégorie
  - [x] Supporter durée configurable (5s transitions, 2s undo)
- [x] Task 4 — Remplacer le CooldownButton circulaire par le nouveau système (AC: #5, #7)
  - [x] Le bouton principal du toast (Confirmer/OK) reste un bouton simple sans cercle SVG
  - [x] Le `CooldownBorder` est le seul indicateur visuel du cooldown
  - [x] Conserver le callback `onComplete` pour déclencher l'action à la fin du cooldown
- [x] Task 5 — Corriger le bouton cancel (AC: #9)
  - [x] Style : `width: 28px; height: 28px; border-radius: 50%`
  - [x] Position : `position: absolute; top: 10px; right: 10px`
  - [x] Background : `alpha(cat.accent, 0.15)`, couleur : `cat.icon`
  - [x] Icône : ↩ (transitions) ou ✕ (batch/edit)
- [x] Task 6 — Vérifier le build et les tests
  - [x] `npm run build` sans erreurs

## Dev Notes

### Référence visuelle

Ouvrir `docs/design-reference.html` dans un navigateur — sections "Toast — en contexte" et "Toast KPI".

Fonctions clés :
- `toastOverlay()` (lignes 548-573) — toast transition complet
- `toastMilkLive()` (lignes 744-772) — toast biberon
- `toastBatchMilk()` / `toastBatchSleep()` (lignes 775-835)
- `toastEdit()` (lignes 886-919) — toast édition
- `toastUndo()` (lignes 922-940) — toast undo
- `cooldownSVG()` (lignes 280-284) — génération du SVG cooldown
- Initialisation cooldown post-rendu (lignes 1455-1486) — calcul périmètre + path

### CSS toast dans la maquette (lignes 92-164)

```css
.toast-wrap {
  position: absolute; bottom: 16px; left: 13px; right: 13px; z-index: 20;
}
.toast {
  border-radius: 18px; padding: 16px 16px 20px; position: relative;
  animation: toast-enter 350ms ease-out;
}
.toast-cooldown {
  position: absolute; inset: -1px; pointer-events: none; z-index: 1;
  overflow: visible;
}
.toast-cooldown path {
  fill: none; stroke-width: 2.5; stroke-linecap: round;
  animation: cooldown-stroke 5s linear forwards;
}
.toast-cancel {
  position: absolute; top: 10px; right: 10px;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600;
}
```

### CooldownBorder — Algorithme du path

Le path SVG trace un rectangle arrondi. Il démarre du milieu du bord top et fait le tour dans le sens horaire. Le `stroke-dashoffset` animé de 0 vers le périmètre donne l'impression que la bordure "se vide" en sens anti-horaire.

```typescript
// Pseudo-code du path (cf. design-reference.html L1466-1477)
const w = toastWidth + 2;   // +2 pour inset:-1px
const h = toastHeight + 2;
const s = 1.25;              // demi stroke-width
const r = 18;                // border-radius
const mx = w / 2;

const d = [
  `M ${mx} ${s}`,                            // milieu bord top
  `H ${w - s - r}`,                          // → droite
  `A ${r} ${r} 0 0 1 ${w - s} ${s + r}`,     // coin top-right
  `V ${h - s - r}`,                          // ↓ droite
  `A ${r} ${r} 0 0 1 ${w - s - r} ${h - s}`, // coin bottom-right
  `H ${s + r}`,                              // ← bas
  `A ${r} ${r} 0 0 1 ${s} ${h - s - r}`,     // coin bottom-left
  `V ${s + r}`,                              // ↑ gauche
  `A ${r} ${r} 0 0 1 ${s + r} ${s}`,         // coin top-left
  `H ${mx}`,                                 // → retour milieu top
].join(' ');

const perim = 2 * (w + h - 4 * s) - 8 * r + 2 * Math.PI * r;
```

### Impact sur les composants existants

Le refactoring touche tous les toasts :
- `ToastTransition.tsx` — transition sommeil
- `ToastBottle.tsx` — biberon live
- `ToastBatchMilk.tsx` / `ToastBatchSleep.tsx` — import batch
- `ToastEdit.tsx` — édition d'event
- `Toast.tsx` (composant wrapper UI) — layout de base
- `CooldownButton.tsx` — à remplacer par `CooldownBorder`

### Anti-patterns à éviter

- NE PAS garder le backdrop/overlay — le toast flottant ne bloque pas la vue
- NE PAS animer le cooldown avec `setInterval` JS — utiliser CSS `animation` avec `stroke-dashoffset`
- NE PAS hardcoder les dimensions du toast dans le path — calculer dynamiquement post-rendu
- NE PAS utiliser `requestAnimationFrame` pour le cooldown — pure CSS animation

### Fichiers à créer

- `src/components/ui/CooldownBorder.tsx` — nouveau composant SVG cooldown

### Fichiers à modifier

- `src/components/ui/Toast.tsx` — layout floating, theming
- `src/components/toasts/ToastTransition.tsx` — theming sleep
- `src/components/toasts/ToastBottle.tsx` — theming milk
- `src/components/toasts/ToastBatchMilk.tsx` — theming milk
- `src/components/toasts/ToastBatchSleep.tsx` — theming sleep
- `src/components/toasts/ToastEdit.tsx` — theming par catégorie
- `src/components/ui/CooldownButton.tsx` — potentiellement à supprimer/remplacer

### Dépendances

- **Requiert Story 9-1** (variables CSS sleep/milk pour le theming)

### References

- [Source: docs/design-reference.html] — toastOverlay() L548-573, CSS .toast L92-164, cooldown init L1455-1486
- [Source: docs/audit-design-vs-implementation.md] — Écarts H2, H4, M1 (toasts)

## Dev Agent Record

All tasks completed successfully. Toast layout refactored from modal to floating card (position: absolute, bottom: 16px, left/right 13px, z-index 20). Applied category-themed styling to all toast variants with appropriate background, border (1.5px), and shadow values. Created new CooldownBorder SVG component with dynamic perimeter calculation and stroke-dashoffset animation. Replaced circular CooldownButton with toast-border cooldown indicator. Corrected cancel button to 28x28px round with proper positioning and theming.

## File List

- src/components/ui/Toast.tsx
- src/components/ui/CooldownBorder.tsx (new)
- src/components/toasts/ToastTransition.tsx
- src/components/toasts/ToastBottle.tsx
- src/components/toasts/ToastBatch.tsx
- src/components/toasts/ToastBatchMilk.tsx
- src/components/toasts/ToastBatchSleep.tsx
- src/components/toasts/ToastEdit.tsx
- src/components/toasts/ToastUndo.tsx
- src/app/globals.css

## Change Log

- Refactored Toast layout from modal (full screen with backdrop) to floating card (absolute positioned, bottom 16px, left/right 13px)
- Applied category-themed backgrounds and borders to all toast types: sleep (sleep.bg with sleep.accent border/shadow), milk (milk.bg with milk.accent)
- Created CooldownBorder SVG component: rounded rectangle path (r=18), dynamic perimeter calculation, stroke-dashoffset animation (configurable 5s/2s)
- Removed backdrop/overlay, updated z-index to 20 for proper stacking
- Corrected cancel button: 28x28px, border-radius 50%, position absolute top 10px right 10px, category-themed background
- Added toast-enter animation keyframes to globals.css
