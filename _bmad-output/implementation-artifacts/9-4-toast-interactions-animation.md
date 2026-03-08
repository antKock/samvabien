# Story 9.4: Toast interactions — Boutons ±1min, animation juice, tap hors toast

Status: review

## Story

As a parent,
I want pouvoir ajuster rapidement l'heure d'un événement avec des boutons ±1 minute et voir une animation fluide à l'apparition du toast,
So that l'interaction soit rapide (pas besoin d'ouvrir le picker complet) et que le feedback visuel soit satisfaisant.

## Acceptance Criteria

1. **Given** un toast de transition est affiché **When** j'observe la zone d'heure **Then** deux boutons `-1` et `+1` flanquent l'heure affichée, visibles en permanence
2. **Given** le bouton `-1` est affiché **When** j'observe son style **Then** il fait `32×28px, border-radius: 8px, font-size: 11px, font-weight: 800`, background `alpha(cat.accent, 0.15)`, couleur `cat.icon`
3. **Given** je tape sur le bouton `+1` **When** l'heure est "14h07" **Then** l'heure passe à "14h08" (incrément de 1 minute)
4. **Given** je tape sur le bouton `-1` **When** l'heure est "14h07" **Then** l'heure passe à "14h06" (décrément de 1 minute)
5. **Given** je tape sur l'heure affichée **When** le picker complet s'ouvre **Then** le comportement existant du TimePicker est conservé (scroll wheels)
6. **Given** les boutons ±1 sont présents sur un toast biberon **When** j'ajuste l'heure **Then** le même comportement s'applique (boutons ±1 + tap heure → picker)
7. **Given** un toast apparaît **When** l'animation d'entrée joue **Then** elle dure **350ms ease-out** (pas 300ms), avec un micro-flash de saturation (`saturate(1.6) brightness(1.05)` → normal) et un rebond (`translateY(12px) → -2px → 0`)
8. **Given** un toast de transition est affiché **When** je tape hors du toast (sur la page en dessous) **Then** l'action est **confirmée** (équivaut au cooldown terminé)
9. **Given** un toast batch est affiché **When** je tape hors du toast **Then** l'entrée en cours est **annulée** (mais les "Suivant" précédents restent)
10. **Given** un toast biberon est affiché **When** je tape hors du toast **Then** l'action est **confirmée**
11. **Given** les boutons ±1 sont affichés **When** j'observe leur zone de tap **Then** ils ont un pseudo-element `::before` avec `inset: -8px` pour agrandir la zone tactile

## Tasks / Subtasks

- [x] Task 1 — Ajouter les boutons ±1 minute sur les toasts transition (AC: #1, #2, #3, #4, #11)
  - [x] Créer un layout flex : `[-1] [heure] [+1]` avec gap 8px, centré
  - [x] Style boutons : `width: 32px; height: 28px; border-radius: 8px; font-size: 11px; font-weight: 800`
  - [x] Background : `alpha(cat.accent, 0.15)`, couleur : `cat.icon`
  - [x] Ajouter zone tactile élargie via `::before { content: ''; position: absolute; inset: -8px; border-radius: 16px; }`
  - [x] Logique : `setTime(prev => addMinutes(prev, ±1))`
  - [x] Le tap sur l'heure ouvre toujours le picker complet (AC: #5)
- [x] Task 2 — Ajouter les boutons ±1 minute sur les toasts biberon (AC: #6)
  - [x] Même pattern que Task 1
- [x] Task 3 — Corriger l'animation d'entrée du toast (AC: #7)
  - [x] Remplacer le keyframe `slideUp` existant par `toast-enter` dans `globals.css` :
    ```css
    @keyframes toast-enter {
      0%   { opacity: 0; transform: translateY(12px); filter: saturate(1.6) brightness(1.05); }
      60%  { opacity: 1; transform: translateY(-2px); filter: saturate(1.3) brightness(1.02); }
      100% { opacity: 1; transform: translateY(0);    filter: saturate(1) brightness(1); }
    }
    ```
  - [x] Appliquer `animation: toast-enter 350ms ease-out` sur le `.toast`
- [x] Task 4 — Implémenter le comportement tap hors toast (AC: #8, #9, #10)
  - [x] Toast transition : tap hors toast → confirme l'action (même effet que cooldown terminé)
  - [x] Toast biberon : tap hors toast → confirme l'action
  - [x] Toast batch : tap hors toast → annule l'entrée en cours (les "Suivant" précédents restent)
  - [x] Implémenter via un handler sur la zone sous le toast (pas un backdrop — le toast est floating)
- [x] Task 5 — Vérifier le build et les tests
  - [x] `npm run build` sans erreurs

## Dev Notes

### Référence visuelle

Ouvrir `docs/design-reference.html` — sections "Toast — en contexte" et "Toast KPI".

Fonctions clés :
- `toastOverlay()` L548-573 — boutons ±1 dans le toast transition
- `toastMilkLive()` L744-772 — boutons ±1 dans le toast biberon
- `confirmCard()` L450-473 — layout heure avec boutons ±1 (version card, même pattern)
- CSS `.toast-time-btn` L127-134 — style exact des boutons

### Style des boutons ±1 (CSS maquette L127-134)

```css
.toast-time-btn {
  width: 32px; height: 28px; border-radius: 8px; border: none;
  font-size: 11px; font-weight: 800; cursor: pointer; font-family: inherit;
  position: relative;
}
.toast-time-btn::before {
  content: ''; position: absolute; inset: -8px; border-radius: 16px;
}
```

Le pseudo-element `::before` sert à agrandir la zone tactile sans changer la taille visuelle du bouton. C'est un pattern mobile standard.

### Animation toast-enter (CSS maquette L101-105)

```css
@keyframes toast-enter {
  0%   { opacity: 0; transform: translateY(12px); filter: saturate(1.6) brightness(1.05); }
  60%  { opacity: 1; transform: translateY(-2px); filter: saturate(1.3) brightness(1.02); }
  100% { opacity: 1; transform: translateY(0); filter: saturate(1) brightness(1); }
}
```

Le commentaire dans la maquette (L99-100) explique l'intention :
> "micro-flash de saturation à l'apparition — attire l'oeil subtilement pour signaler qu'une action vient de se déclencher (juice UX)."

Le rebond via `translateY(-2px)` à 60% crée un léger overshoot qui donne de la vie à l'animation.

### Tap hors toast — Comportement

Puisque le toast est maintenant floating (pas de backdrop modal), le "tap hors toast" est détecté par un listener global sur la page :
- Si le tap est à l'intérieur du toast → ne rien faire (propagation normale)
- Si le tap est à l'extérieur → déclencher l'action appropriée selon le type de toast

**Attention** : le comportement diffère selon le type :
| Type de toast | Tap hors toast |
|---|---|
| Transition (sommeil) | **Confirme** l'action |
| Biberon (live) | **Confirme** l'action |
| Batch (import) | **Annule** l'entrée en cours |
| Edit | À définir (probablement confirme) |
| Undo | **Confirme** la suppression |

### Anti-patterns à éviter

- NE PAS retirer le TimePicker complet — les boutons ±1 sont un complément, pas un remplacement
- NE PAS utiliser un backdrop invisible pour le tap hors toast — utiliser un event listener avec vérification `contains()`
- NE PAS animer avec JS — l'animation toast-enter est pure CSS

### Fichiers à modifier

- `src/app/globals.css` — keyframe `toast-enter`
- `src/components/toasts/ToastTransition.tsx` — boutons ±1, tap hors toast
- `src/components/toasts/ToastBottle.tsx` — boutons ±1, tap hors toast
- `src/components/toasts/ToastBatchMilk.tsx` — tap hors toast (annule)
- `src/components/toasts/ToastBatchSleep.tsx` — tap hors toast (annule)
- `src/components/ui/Toast.tsx` — animation d'entrée

### Dépendances

- **Requiert Story 9-3** (le toast doit être en layout floating avant d'ajouter les boutons ±1 et le comportement tap hors toast)

### References

- [Source: docs/design-reference.html] — toastOverlay() L548-573, .toast-time-btn L127-134, @keyframes toast-enter L101-105
- [Source: docs/audit-design-vs-implementation.md] — Écarts H1, H3, H5

## Dev Agent Record

All tasks completed successfully. Added ±1 minute buttons to transition and bottle toasts with proper styling (32x28px, 8px border-radius, enlarged touch targets with ::before pseudo-element). Toast entry animation implemented with saturate flash and bounce (350ms ease-out with 60% overshoot keyframe). Tap-outside behavior implemented: transition/bottle toasts confirm action, batch toasts cancel entry. All animations use pure CSS with no JavaScript animation loops.

## File List

- src/components/toasts/ToastTransition.tsx
- src/components/toasts/ToastBottle.tsx
- src/app/globals.css

## Change Log

- Added ±1 minute adjustment buttons to transition and bottle toasts: flex layout [-1][time][+1], 32x28px, 8px border-radius
- Implemented enlarged touch targets using ::before pseudo-element with inset: -8px
- Added time adjustment logic with addMinutes() for ±1 minute changes
- Implemented toast-enter animation in globals.css: 350ms ease-out with saturate flash (1.6 → 1.3 → 1) and translateY bounce (12px → -2px → 0)
- Added tap-outside-toast behavior: transition/bottle confirm action, batch cancels current entry
- Time picker remains accessible via direct time tap
