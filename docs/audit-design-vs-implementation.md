# Audit UX — Maquette vs. Implémentation

> **Date** : 8 mars 2026
> **Référence** : `docs/design-reference.html` + docs UX (`ux-*.md`)
> **Audité par** : Sally (UX Designer)

---

## Résumé

20 écarts identifiés entre la maquette de référence et le code implémenté.

| Priorité | Écarts | Impact |
|----------|--------|--------|
| **Critique** | 3 | Identité visuelle compromise |
| **Haute** | 5 | Interactions manquantes ou dégradées |
| **Moyenne** | 9 | Écarts visuels notables |
| **Basse** | 3 | Détails fins |

---

## CRITIQUE — Identité visuelle compromise

### C1. Hero Card : fond plat au lieu du gradient signature

**Fichier** : `src/components/dashboard/HeroCard.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Background | `linear-gradient(160deg, heroG1, heroG3)` — dégradé vert forêt | `bg-surface` — fond blanc/gris plat |
| Shadow | Triple layer (2px + 8px + 16px) avec teinte verte | `0 2px 8px rgba(0,0,0,0.04)` — ombre générique |
| Durée | **36px**, font-weight 800, letter-spacing -1px — séparée du label | Fusionnée dans le label à 20px |
| Layout | emoji (28px) → label (13px) → **durée géante (36px)** → subtitle (9px) | emoji (32px) → label+durée (20px) → subtitle (12px) |

**Correctif** :
- Ajouter les variables CSS `--hero-g1` et `--hero-g3` (day: `#b8c4a0` → `#587044`, night: `#4a5434` → `#1a2210`)
- Appliquer `background: linear-gradient(160deg, var(--hero-g1), var(--hero-g3))` sur la hero card
- Appliquer la triple shadow avec teinte `heroG3`
- Séparer la durée dans son propre `<div>` à 36px bold, letter-spacing -1px
- Rétablir la hiérarchie : emoji 28px → label 13px → durée 36px → subtitle 9px

### C2. Couleurs range/target absentes du thème

**Fichier** : `src/app/globals.css`

Les variables `rangeBg`, `rangeBorder`, `inRange` ne sont pas définies. La progress bar utilise `accentColor` à 20% d'opacité comme approximation.

**Correctif** — ajouter dans `globals.css` :

```css
/* Day */
--sleep-range-bg: rgba(120,130,80,0.15);
--sleep-range-border: rgba(120,130,80,0.28);
--sleep-in-range: #8a9a5a;
--milk-range-bg: rgba(180,130,80,0.15);
--milk-range-border: rgba(180,130,80,0.28);
--milk-in-range: #c0945a;

/* Night */
--sleep-range-bg: rgba(120,140,70,0.15);
--sleep-range-border: rgba(130,150,80,0.25);
--sleep-in-range: #7a8a4a;
--milk-range-bg: rgba(160,120,60,0.15);
--milk-range-border: rgba(170,130,70,0.25);
--milk-in-range: #b08a4a;
```

Puis mettre à jour `ProgressBar.tsx` pour utiliser ces variables au lieu de l'approximation actuelle.

### C3. Gradients de page absents

**Fichier** : `src/app/globals.css`

| | Maquette | Implémenté |
|---|---|---|
| Page day | Gradient subtil multi-teintes (sleep + milk mélangés) | `bg-bg` plat (`#f6f5ee`) |
| Page night | Gradient sombre avec nuances vertes | `bg-bg` plat (`#181810`) |

**Correctif** — ajouter les variables `--page-bg1`, `--page-bg3` et appliquer le gradient sur le body/layout :

```css
/* Day */
--page-bg1: #a8b490;
--page-bg3: #6a8054;
background: var(--bg);
background-image: linear-gradient(170deg,
  rgba(var(--sleep-bg-rgb), 0.50),
  rgba(var(--page-bg1-rgb), 0.07),
  var(--bg),
  rgba(var(--milk-bg-rgb), 0.15));

/* Night */
--page-bg1: #3a4228;
--page-bg3: #222c16;
background-image: linear-gradient(170deg,
  rgba(var(--page-bg3-rgb), 0.38),
  var(--bg),
  rgba(var(--sleep-bg-rgb), 0.25));
```

---

## HAUTE — Interactions manquantes ou dégradées

### H1. Boutons ±1 minute absents des toasts

**Fichiers** : `src/components/toasts/ToastTransition.tsx`, `ToastBottle.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Ajustement temps | Boutons `-1` et `+1` visibles en permanence, flanquant l'heure (32×28px, radius 8px) | Uniquement TimePicker complet au tap sur l'heure |

**Correctif** :
- Ajouter deux boutons `-1` / `+1` de part et d'autre de l'heure affichée
- Style : `width: 32px; height: 28px; border-radius: 8px; font-size: 11px; font-weight: 800`
- Background : `alpha(sleep.accent, 0.15)`, couleur : `sleep.icon`
- Le tap sur l'heure ouvre toujours le picker complet (comportement existant conservé)

### H2. Cooldown SVG : cercle au lieu de rectangle arrondi

**Fichier** : `src/components/ui/CooldownButton.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Forme | SVG `<path>` traçant un **rectangle arrondi** autour du toast entier | SVG `<circle>` autour du bouton (72px) |
| Animation | `stroke-dashoffset` sur le périmètre du toast, sens anti-horaire | `stroke-dashoffset` sur le cercle du bouton |
| Visuel | La bordure du toast "se vide" — très lisible | Petit cercle sur le bouton — moins visible |

**Correctif** :
- Créer un composant `CooldownBorder` qui trace un `<path>` rect arrondi autour du toast (cf. `cooldownSVG()` dans la maquette)
- Le path démarre du milieu du bord top, sens anti-horaire
- Le périmètre est calculé post-rendu via `getBoundingClientRect()`
- Appliquer `stroke-dashoffset` animé de 0 → périmètre sur la durée du cooldown
- Remplacer le CooldownButton circulaire par un bouton simple + ce border overlay

### H3. Animation d'entrée du toast simplifiée

**Fichier** : `src/app/globals.css` (keyframes) + `src/components/ui/Toast.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Durée | 350ms ease-out | 300ms ease-out |
| Effet juice | `saturate(1.6) brightness(1.05)` → micro-flash de saturation | Aucun filtre |
| Rebond | translateY passe par -2px (overshoot) | Pas de rebond |

**Correctif** — remplacer le keyframe `slideUp` :

```css
@keyframes toast-enter {
  0%   { opacity: 0; transform: translateY(12px); filter: saturate(1.6) brightness(1.05); }
  60%  { opacity: 1; transform: translateY(-2px); filter: saturate(1.3) brightness(1.02); }
  100% { opacity: 1; transform: translateY(0);    filter: saturate(1) brightness(1); }
}
```

Durée : 350ms ease-out.

### H4. Toast transition : structure et theming différents

**Fichier** : `src/components/toasts/ToastTransition.tsx`, `src/components/ui/Toast.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Position | Toast **flottant** en bas de l'écran (bottom 16px, left/right 13px) | Modal **plein écran** avec backdrop noir 30% |
| Arrondi | `border-radius: 18px` (tous les coins) | `rounded-t-[20px]` (bottom sheet) |
| Background | `sleep.bg` avec bordure `sleep.accent` à 30% | `bg-surface` (blanc/gris générique) |
| Cancel | Bouton ↩ rond 28×28px en haut à droite | Texte ↩ avec padding |

**Correctif** :
- Remplacer le layout modal par un toast positionné `absolute bottom-16px left-13px right-13px`
- Appliquer `border-radius: 18px` sur les 4 coins
- Background thématisé : `var(--sleep-bg)` avec `border: 1.5px solid alpha(var(--sleep-accent), 0.3)`
- Shadow : `0 -4px 20px alpha(var(--sleep-accent), 0.15)`
- Cancel : bouton rond 28×28, border-radius 50%, top 10px right 10px

### H5. Tap hors toast : comportement divergent

| | Maquette | Implémenté |
|---|---|---|
| Transition toast | Tap hors toast = **confirme** l'action (équivaut au cooldown) | Backdrop tap = confirm ✓ |
| Biberon toast | Tap hors toast = **confirme** le biberon | Backdrop tap = confirm ✓ |
| Batch toast | Tap hors toast = **annule** l'entrée en cours (les "Suivant" restent) | À vérifier |

---

## MOYENNE — Écarts visuels notables

### M1. Border-radius inconsistants

**Fichiers** : multiples composants

| Élément | Maquette | Implémenté | Fichier |
|---|---|---|---|
| Hero card | 22px | 20px | `HeroCard.tsx` |
| Toast | 18px | 20px (top only) | `Toast.tsx` |
| KPI cards | Pas de wrap spécifique (inline) | 16px | `KpiCardMilk.tsx`, `KpiCardSleep.tsx` |

**Correctif** : aligner sur les valeurs de la maquette (22px hero, 18px toasts).

### M2. CTA Import : "+" au lieu du SVG import

**Fichiers** : `src/components/dashboard/KpiCardMilk.tsx`, `KpiCardSleep.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Icône | SVG flèche vers le bas + plateau ouvert (14×14, stroke 2px) | Texte "+" (18px) |

**Correctif** : remplacer le "+" par le SVG `importIcon()` défini dans la maquette. Le code SVG est disponible dans `design-reference.html` (lignes 353-359).

### M3. Progress Bar — Zone target sans bordure

**Fichier** : `src/components/ui/ProgressBar.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Background zone | `rangeBg` (couleur catégorie) | `accentColor` à 20% opacité |
| Bordure zone | `1px solid rangeBorder` | Pas de bordure |

**Correctif** : utiliser les variables `--{cat}-range-bg` et `--{cat}-range-border` (cf. C2).

### M4. Progress Bar — Shadow sur le marqueur now

**Fichier** : `src/components/ui/ProgressBar.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Shadow | `box-shadow: 0 1px 3px alpha(fillColor, 0.3)` | Pas de shadow |

**Correctif** : ajouter `boxShadow: '0 1px 3px ${alpha(accentColor, 0.3)}'` sur le cercle now.

### M5. Progress Bar — Avg marker opacité

**Fichier** : `src/components/ui/ProgressBar.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Bordure avg | `2px solid rangeBorder` (opaque) | `2px solid accentColor` à 60% opacité |

**Correctif** : utiliser `--{cat}-range-border` au lieu de l'accent à 60%.

### M6. Checkmark : stroke seul au lieu de badge rond

**Fichiers** : `src/components/dashboard/KpiCardMilk.tsx`, `KpiCardSleep.tsx`

| | Maquette | Implémenté |
|---|---|---|
| Forme | Cercle **plein** 16×16px, fond `cat.inRange`, ✓ blanc 9px bold | SVG polyline (stroke seul, pas de fond) |

**Correctif** :
- Ajouter un cercle plein de fond (`background: var(--{cat}-in-range)`)
- Check blanc centré dedans (9px, font-weight 800, color #fff)

### M7. Format des durées dans le récap

**Fichier** : `src/components/dashboard/RecapItem.tsx` (via `formatDuration`)

| | Maquette | Implémenté |
|---|---|---|
| ≥ 1h | "1h23" (compact, sans espace) | "2h 30m" (avec espace et "m") |
| < 1h | "12min" | Probablement "0h 30m" |

**Correctif** : adapter `formatDuration()` pour produire le format compact spécifié dans `ux-recap-today.md` :
- ≥ 1h → `"Xh00"` (ex. "1h23", "10h20")
- < 1h → `"Xmin"` (ex. "12min", "45min")

### M8. Emoji night-wake dans ToastEdit

**Fichier** : `src/components/toasts/ToastEdit.tsx`

| | Maquette | Implémenté |
|---|---|---|
| night-wake emoji | 🫣 | 🌙 |

**Correctif** : dans `TOAST_TITLES`, changer `'night-wake': { emoji: '🌙', label: 'Réveil nocturne' }` → `{ emoji: '🫣', label: 'Réveil nocturne' }`.

### M9. Format heures dans le récap

**Fichier** : `src/components/dashboard/RecapItem.tsx` (via `formatTime`)

| | Maquette | Implémenté |
|---|---|---|
| Format | "14h30" (sans zéro initial) | À vérifier — si `formatTime` utilise `Intl` ça peut donner "14:30" |

**Correctif** : s'assurer que `formatTime()` produit le format court français sans zéro initial ("5h50", "14h30", pas "05h50" ni "14:30").

---

## BASSE — Détails fins

### B1. Landing illustration — feuilles manquantes

**Fichier** : `src/components/onboarding/LandingScreen.tsx`

La maquette inclut des feuilles décoratives (`leaf1`, `leaf2`) autour du bébé. Le SVG implémenté a le bébé + couverture + "Zzz" mais pas de feuilles.

### B2. Hero card — taille emoji

| | Maquette | Implémenté |
|---|---|---|
| Emoji | 28px | 32px |

### B3. Subtitle hero card — taille et opacité

| | Maquette | Implémenté |
|---|---|---|
| Taille | 9px | 12px |
| Couleur | `alpha(sleep.bg, 0.65)` (jour) / `hero.text` (nuit) | `text-text-sec` |

---

## Éléments conformes ✓

| Élément | Statut |
|---|---|
| Palette couleurs de base (day + night, tous les hex) | ✓ |
| Font Nunito (famille, weights 600/700/800) | ✓ |
| Thème switching (data-theme, sleep state → day/night) | ✓ |
| Emojis par état (☀️ ✓, 😴 ✓, 🌙 ✓, 🫣 ✓) | ✓ |
| State machine sommeil (5 états, transitions) | ✓ |
| Cooldown durée : 5s transitions, 2s undo | ✓ |
| Alt button : échange primary/alt, reset cooldown | ✓ |
| Batch mode : Suivant/Terminer, MomentSelector | ✓ |
| Récap structure : dot + label + heure + valeur, antéchrono | ✓ |
| Onboarding 3 champs : prénom, DOB, poids | ✓ |
| Welcome Banner : code invitation, copier le lien | ✓ |
| Join Screen : auto-lookup, format XXXX-0000 | ✓ |
| Profil : sections info bébé, foyer, actions | ✓ |
| Weight reminder : toggle, picker inline | ✓ |
| ProfileHeaderButton : "Prénom ⚙", 10px, gear 12×12 | ✓ |
| DemoBanner : sticky top, texte + "Quitter" | ✓ |
| ScrollWheels : snap, fade gradients, highlight centre | ✓ |
