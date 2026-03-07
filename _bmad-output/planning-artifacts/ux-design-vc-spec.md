# samvabien — Spécification Design VC "Élevé"

> Version gagnante validée par Anthony. Fichier de référence : `Restored.html`
> Date : 7 mars 2026

---

## Philosophie du design

**VC "Élevé"** repose sur trois principes :

1. **Élévation par les ombres** — Le hero flotte au-dessus de la surface grâce à des ombres multi-couches (pas de bordure). Ça donne une profondeur naturelle, organique, sans artificialité.
2. **Palette Olive & Terre** — Deux familles chromatiques (olive/sommeil + terre/lait) créent un langage visuel intuitif sans avoir besoin de légendes.
3. **Contraste jour/nuit automatique** — Le thème bascule selon le moment de la journée, avec des valeurs calibrées pour le confort visuel.

---

## Palette de couleurs

### Mode Jour (Day)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#f6f5ee` | Fond de page principal |
| `sf` | `#ffffff` | Surface (cards, containers) |
| `tx` | `#32321e` | Texte principal |
| `txS` | `#8a8870` | Texte secondaire |
| **Sommeil (sl)** | | |
| `sl.bg` | `#eaecda` | Fond card sommeil |
| `sl.ac` | `#8a9a6a` | Accent sommeil |
| `sl.ic` | `#6a7a4a` | Icône/label sommeil |
| **Lait (mk)** | | |
| `mk.bg` | `#f5e6d6` | Fond card lait |
| `mk.ac` | `#c08a60` | Accent lait |
| `mk.ic` | `#a06840` | Icône/label lait |
| **Boutons** | | |
| `pr.bg` | `#6a7a4a` | Bouton primaire |
| `pr.tx` | `#ffffff` | Texte bouton primaire |
| `sc.bg` | `#eaecda` | Bouton secondaire |
| `sc.tx` | `#6a7a4a` | Texte bouton secondaire |
| **Avatar/Status** | | |
| `av.bg` | `#dde2c8` | Fond zone avatar |
| `av.dt` | `#8a9a6a` | Dot pulsant |
| `av.tx` | `#4a5a32` | Texte status |
| **Divers** | | |
| `ir.ac` | `#8a9a5a` | Checkmark "dans la norme" |
| `trk` | `#dce0cc` | Track progress bar |
| `avg` | `#a0a486` | Marker moyenne |
| `cta` | `rgba(138,154,106,0.2)` | Fond bouton CTA "+" |
| `bd` | `rgba(0,0,0,0.06)` | Bordures séparateurs |
| `hd` | `rgba(0,0,0,0.12)` | Bordure header |
| **Hero gradients** | | |
| `hg1` | `#a8b490` | Gradient stop 1 (clair) |
| `hg2` | `#8a9c72` | Gradient stop 2 (moyen) |
| `hg3` | `#6a8054` | Gradient stop 3 (foncé) |

### Mode Nuit (Night)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#181810` | Fond de page principal |
| `sf` | `#22221a` | Surface |
| `tx` | `#c8c8b0` | Texte principal |
| `txS` | `#7a7a60` | Texte secondaire |
| **Sommeil (sl)** | | |
| `sl.bg` | `#222818` | Fond card sommeil |
| `sl.ac` | `#7a8a5a` | Accent sommeil |
| `sl.ic` | `#98a878` | Icône/label sommeil |
| **Lait (mk)** | | |
| `mk.bg` | `#261e14` | Fond card lait |
| `mk.ac` | `#b08050` | Accent lait |
| `mk.ic` | `#cca070` | Icône/label lait |
| **Boutons** | | |
| `pr.bg` | `#4a5a32` | Bouton primaire |
| `sc.bg` | `#222818` | Bouton secondaire |
| `sc.tx` | `#7a8a5a` | Texte bouton secondaire |
| **Avatar/Status** | | |
| `av.bg` | `#282e1c` | Fond zone avatar |
| `av.dt` | `#7a8a5a` | Dot pulsant |
| `av.tx` | `#98a878` | Texte status |
| **Divers** | | |
| `ir.ac` | `#7a8a4a` | Checkmark "dans la norme" |
| `trk` | `#222618` | Track progress bar |
| `avg` | `#5a6a48` | Marker moyenne |
| `cta` | `rgba(122,138,90,0.2)` | Fond bouton CTA "+" |
| `bd` | `rgba(255,255,255,0.06)` | Bordures séparateurs |
| `hd` | `rgba(255,255,255,0.12)` | Bordure header |
| **Hero gradients** | | |
| `hg1` | `#3a4228` | Gradient stop 1 (clair relatif) |
| `hg2` | `#2e381e` | Gradient stop 2 (moyen) |
| `hg3` | `#222c16` | Gradient stop 3 (foncé) |

---

## Typographie

- **Police** : Nunito (Google Fonts), fallback `system-ui, -apple-system, sans-serif`
- **Graisses utilisées** : 400 (body), 600 (labels), 700 (titres), 800 (hero chiffres, titres forts)

| Élément | Taille | Poids | Couleur |
|---------|--------|-------|---------|
| Hero emoji | 28px | — | — |
| Hero titre | 13px | 700 | `#fff` |
| Hero valeur | 36px | 800 | `#fff`, letter-spacing -1px |
| Hero sous-titre | 9px | 600 | `rgba(255,255,255,0.55)` |
| KPI valeur | 22px | 800 | `cc.tx` |
| KPI label | 8px | 600 | `cc.*.ic` |
| Détail label | 10px | 600 | `cc.tx` |
| Détail valeur | 10px | 700 | `cc.*.ic` |
| Détail heure | 9px | 600 | `cc.txS` |
| Section titre | 8px | 700 | `cc.txS`, uppercase, letter-spacing 0.5px |
| Date | 9px | 600 | `cc.txS` |

---

## Composants

### 1. Hero VC — "Élevé"

Le composant signature de VC. Un bouton-card plein écran avec gradient olive et élévation par ombres multi-couches.

**Spécifications :**
- `border-radius: 22px`
- `padding: 20px 18px 16px`
- `margin-bottom: 12px`
- `border: none` (distinction clé vs VB)

**Variantes de style :**

| État | Gradient | Box-shadow | Transform |
|------|----------|------------|-----------|
| Jour éveillé | `linear-gradient(160deg, hg1, hg2dd)` | `0 2px 4px hg2+20, 0 6px 16px hg2+18, 0 14px 36px hg2+10` | — |
| Jour endormi | `linear-gradient(160deg, hg1+ee, hg3)` | `0 2px 6px hg3+30, 0 8px 20px hg3+25, 0 16px 40px hg3+15` | `translateY(-1px)` |
| Nuit | `linear-gradient(155deg, hg1, hg3)` | `0 2px 6px hg3+35, 0 8px 22px hg3+25, 0 18px 44px hg3+18` | `translateY(-1px)` |

**Contenu :**
- Emoji état (🌤️ éveillé, 😴 dort, 💤 nuit)
- Texte état ("Sam est réveillé" / "Sam dort")
- Durée en gros (ex: "2h40")
- Sous-texte contextuel
- Dot pulsant (si endormi/nuit) : `background: #fff`, `position: absolute; top: 13px; right: 13px`, `box-shadow: 0 0 10px rgba(255,255,255,0.3)`

### 2. KPI Cards (Lait & Sommeil)

Cards avec accent en bas, gradient teinté subtil, et bouton CTA "+".

**Structure commune :**
- `border-radius: 18px`
- `padding: 11px 11px 11px 14px`
- Emoji 16px + label 8px + valeur 22px + checkmark (si dans la norme) + bouton "+"

**Style Lait (jour) :**
```
background: linear-gradient(165deg, mk.bg, mk.ac+08)
border: 1px solid mk.ac+10
border-bottom: 2.5px solid mk.ac+40
box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 12px mk.ac+06
```

**Style Sommeil (jour) :**
```
background: linear-gradient(165deg, sl.bg, sl.ac+08)
border: 1px solid sl.ac+10
border-bottom: 2.5px solid sl.ac+40
box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 12px sl.ac+06
```

**Style nuit** : mêmes structures mais avec opacités ajustées (inset `0.04` au lieu de `0.35`, border-bottom `60` au lieu de `40`).

**Bouton CTA "+" :**
- `30x30px`, `border-radius: 10px`
- `background: ic+15`, `color: ic`
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px ic+10`

### 3. Progress Bar

- Track : `height: 6px`, `border-radius: 3px`, `background: cc.trk`
- Zone de norme : position absolute, `left: 52%; width: 36%`, `background: cc.rBg`, `border: 1px solid cc.rBd`
- Fill : opacité 0.8 (dans norme) ou 0.5 (hors norme)
- Marker moyen : `8x8px` cercle, `background: cc.rBd`
- Curseur position : `10x10px` cercle, `background: cc.sf`, `box-shadow: 0 0 0 1.5px fillColor`

### 4. Checkmark "Dans la norme"

- `16x16px` cercle
- `background: cc.ir.ac`
- `color: #fff`
- Contenu : "✓" en 9px/800

### 5. Section Détails (Aujourd'hui)

- Titre uppercase "AUJOURD'HUI" en 8px/700
- Liste avec dot coloré (5x5px) + label + heure + valeur
- Séparateur : `border-bottom: 1px solid cc.bd`

### 6. Mode Nuit (plein écran)

Quand `moment === 'night'` :
- Hero nuit (gradient foncé, dot pulsant)
- Card biberon nocturne (fond `mk.bg`, bouton "+")
- Bouton "Réveil du matin" (fond `sc.bg`)
- Message "Tout va bien" (opacité 0.25)

---

## Fond de page VC

| Mode | Background |
|------|------------|
| Jour | `linear-gradient(170deg, sl.bg+80, hg1+12, bg, mk.bg+25)` |
| Nuit | `linear-gradient(170deg, hg3+60, bg, sl.bg+40)` |

## Ombre du phone frame

| Mode | Box-shadow |
|------|------------|
| Jour | `0 4px 14px rgba(0,0,0,0.05), 0 14px 44px rgba(80,100,60,0.06)` |
| Nuit | `0 8px 34px rgba(0,0,0,0.5)` |

---

## Différences clés VC vs autres variantes

| Aspect | V0 Vanilla | VA Sous-bois | VB Bordé | **VC Élevé** |
|--------|-----------|-------------|---------|-------------|
| Hero style | Flat, aplat | Gradient olive, ombre simple | Gradient + border-bottom accent | **Gradient + multi-shadow, no border** |
| Hero élévation | Aucune | Moyenne (1 shadow) | Faible (border > shadow) | **Forte (3 couches d'ombre)** |
| Hero border | Aucune | Aucune | `1px solid + 3px bottom` | **Aucune** |
| KPI cards | Flat (bg uni) | Bottom accent + gradient | Bottom accent + gradient | **Bottom accent + gradient** |
| Page background | Uni (`sf`) | Gradient olive-terre | Gradient olive-terre | **Gradient olive-terre** |
| Personnalité | Neutre, clinique | Chaleureux, naturel | Structuré, bordé | **Aérien, flottant, premium** |

---

## Moments de la journée

| Clé | Label | Heure | Mode | État |
|-----|-------|-------|------|------|
| `morning` | Matin | 8:30 | jour | éveillé |
| `midday` | Midi | 12:15 | jour | éveillé |
| `afternoon` | Après-midi | 15:53 | jour | dort |
| `evening` | Soir | 18:45 | nuit | éveillé |
| `night` | Nuit | 3:12 | nuit | dort (plein écran) |

---

## Animation

- **Dot pulsant** : `pulse 2s ease-in-out infinite` — scale 1→0.7→1, opacity 1→0.5→1
- **Transitions globales** : `background 0.3s, color 0.3s` sur body et top-bar

---

## Espacements récurrents

- Phone frame : `width: 300px`, `border-radius: 36px`, `padding-top: 44px`, `aspect-ratio: 9/19.5`
- Inner padding : `0 13px` (`.pi`)
- Cards margin-bottom : lait `8px`, sommeil `10px`
- Hero margin-bottom : `12px`
- Section padding-top : `8px`
