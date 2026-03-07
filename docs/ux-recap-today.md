# UX — Récap Aujourd'hui

## Vue d'ensemble

Liste antéchronologique de tous les événements du cycle en cours, affichée sous les KPI cards. C'est le journal de la journée du bébé — le parent y retrouve tout ce qui s'est passé d'un coup d'œil.

## Fenêtre de données

Même cycle que les KPI cards (cf. `ux-kpi-cards.md` § Fenêtre de données) :
- **Cycle** : coucher → coucher.
- **Fallback** : minuit si aucun coucher enregistré la veille.
- **Reset** : la liste se vide au passage en état `night` (nouveau cycle).

## Événements listés

Les événements nocturnes sont **regroupés en plages** pour être lisibles d'un coup d'œil. Le parent pense "il y a eu un réveil cette nuit", pas "transition night-wake à 3h15 puis night-sleep à 3h27".

| Type | Dot | Label | Heure | Valeur |
|------|-----|-------|-------|--------|
| Nuit | `sleep.accent` | Nuit | Plage début–fin (ex. "19h30–5h50") | Durée totale (ex. "10h20") |
| Réveil nocturne | `sleep.accent` | Réveil nocturne | Plage début–fin (ex. "3h15–3h27") | Durée (ex. "12min") |
| Sieste | `sleep.accent` | Sieste | Heure de début (ex. "14h30") | Durée (ex. "1h23") |
| Biberon | `milk.accent` | Biberon | Heure (ex. "12h15") | Volume (ex. "150 mL") |

**Non listés** : les phases d'éveil. Elles n'apportent pas d'information actionnable dans le récap.

### Format des durées

- **≥ 1h** : format "Xh00" (ex. "1h23", "10h20")
- **< 1h** : format "Xmin" (ex. "12min", "45min") — pas de "0h12"

## Anatomie d'une ligne

```
[dot]  Label                        heure      valeur
 ●     Sieste                      14h30       1h23
 ●     Biberon                     12h15      150 mL
 ●     Biberon                     matin      180 mL
 ●     Réveil nocturne          3h15–3h27      12min
 ●     Nuit                   19h30–5h50      10h20
```

| Élément | Description |
|---------|-------------|
| **Dot** | Cercle 5px, couleur accent de la catégorie (sommeil = vert, lait = orange) |
| **Label** | Nom de l'événement, 11px, font-weight 600 |
| **Heure** | Heure précise, plage, ou moment de la journée. 10px, font-weight 600, couleur `textSec` |
| **Valeur** | Durée ou volume, 11px, font-weight 700, couleur icon de la catégorie |

Pas d'emoji — le dot coloré suffit à catégoriser. Les emoji attireraient trop l'attention sur une liste qui doit rester calme.

## Tri

**Antéchronologique** : le plus récent en haut.

### Événements sans heure précise (imports crèche)

Même style que les événements timés, seul le label d'heure change ("Matin" au lieu de "14h30").

Tri par **borne de fin du créneau** :
- "Matin" → trié comme 12h00
- "Midi" → trié comme 13h00
- "Après-midi" → trié comme 17h00

Les imports tombent naturellement vers le bas de la liste en antéchrono (plus anciens).

## Séparateurs

Chaque ligne est séparée par un `border-bottom` de 1px (`colors.border`). Pas de séparateur spécial pour les imports — ils sont visuellement identiques aux événements précis.

## Titre de section

Label "Aujourd'hui" en uppercase, 9px, font-weight 700, couleur `textSec`. Séparé du contenu au-dessus par `margin-top: 6px` pour respirer des KPI cards. Pas de `border-top` — la transition est douce, sans séparateur visible.

## Interactions

### Tap sur une ligne → toast d'édition

Le tap sur un événement ouvre un **toast d'édition** (même composant toast que le reste de l'app). L'édition n'est pas signalée visuellement — rien n'indique qu'on peut taper, c'est une affordance cachée.

**Contenu du toast d'édition :**
- **Titre** : emoji + label de l'événement (ex. "🍼 Biberon", "😴 Sieste")
- **Heure** : préremplie avec l'heure de l'événement. Tap sur l'heure → time picker (composant partagé). Pour les imports sans heure : sélecteur de moment (Matin/Midi/Après-midi) prérempli.
- **Valeur** : slider prérempli (volume pour lait, durée pour sommeil)
- **Bouton ✕** (fermer) : en haut à droite, ferme sans modifier
- **Tap hors toast** : même effet que ✕ — ferme sans modifier
- **Bouton Supprimer** : style secondary, suppression directe (pas de confirmation)
- **Bouton Enregistrer** : style primary, enregistre les modifications

**Pas de cooldown** — le parent modifie à son rythme, pas d'auto-confirm en édition.

**Comportement de la suppression** :
- Tap sur Supprimer → l'événement disparaît de la liste, le toast d'édition se ferme.
- Un **toast undo** apparaît en bas de l'écran (même composant toast que le reste de l'app) :
  - Titre : "🗑️ Supprimé" (14px, font-weight 800, couleur `text`) — même style que les titres des autres toasts
  - Bouton "Annuler" : style secondary (`toast-action-btn`), même style que le bouton "Supprimer" du toast d'édition
  - **Cooldown 2s** : même animation que les toasts de transition, mais plus court (2s vs 5s pour les transitions). À la fin du cooldown, la suppression devient définitive et le toast disparaît.
  - **Tap hors toast** : équivaut à l'expiration — confirme la suppression et ferme le toast.
  - Tap sur Annuler → l'événement réapparaît, le toast se ferme.
- Les KPI cards se recalculent immédiatement (le biberon supprimé réduit le total lait, etc.). Si le parent annule, les KPI se restaurent.

## Format des heures

Convention : format court sans zéro initial ("5h50", "14h30", pas "05h50" ni "14:30").

## État vide

Quand aucun événement n'est enregistré dans le cycle :
- Le titre "Aujourd'hui" reste affiché
- En dessous : texte placeholder discret, 11px, couleur `textSec`, centré
- Texte : "Les événements s'afficheront ici"
- Pas d'illustration, pas de CTA — juste le texte

## Scroll

La liste est inline dans la page (pas de scroll interne). Si la journée a beaucoup d'événements, le parent scrolle la page naturellement. La hero card et les KPI disparaissent vers le haut.

> **Idée future** : un micro-bandeau sticky pourrait apparaître au scroll avec l'état condensé ("😴 1h23") pour garder le contexte visible. À évaluer en usage réel — pas nécessaire pour le MVP.

## Notes d'implémentation

### Données

Chaque événement dans la liste est un objet avec :
- `type` : 'night' | 'nap' | 'night-wake' | 'bottle'
- `startTime` : timestamp début (précis ou `null` pour les imports)
- `endTime` : timestamp fin (pour nuit et réveils nocturnes) ou `null`
- `moment` : 'morning' | 'noon' | 'afternoon' | `null` (si heure précise). Labels d'affichage : `{ morning: 'Matin', noon: 'Midi', afternoon: 'Après-midi' }`
- `value` : durée en minutes (sommeil) ou volume en mL (lait)
- `id` : identifiant unique pour l'édition/suppression

### Regroupement nuit

Les transitions de la state machine (`night` → `night-wake` → `night-sleep` → ... → `awake`) sont regroupées à l'affichage :
- **Nuit** : du coucher (`night`) au réveil matin (`awake`), durée totale. Si aucun réveil nocturne, une seule ligne "Nuit".
- **Réveil nocturne** : du `night-wake` au `night-sleep` suivant, durée de l'éveil. Une ligne par réveil (ex. 3 réveils = 3 lignes "Réveil nocturne" distinctes).

### Événements en cours

Seuls les événements **terminés** apparaissent dans le récap. Une nuit ou sieste en cours n'est pas affichée — elle apparaîtra une fois que le bébé sera réveillé.

### Contraintes de saisie

- **Biberon** : le volume minimum est > 0 mL. Pas de biberon à 0 mL (si le bébé n'a pas bu, on ne crée pas d'événement).

### Service

La liste consomme `CycleWindow.eventsInCycle()` (cf. `ux-kpi-cards.md` § Notes d'implémentation) et les trie par heure décroissante.
