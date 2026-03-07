# UX — Machine d'états sommeil

## États

| Clé | Emoji | Thème | Description |
|-----|-------|-------|-------------|
| `awake` | ☀️ | Light | Bébé éveillé (jour) |
| `nap` | 😴 | Light | Sieste en cours |
| `night` | 🌙 | Dark | Nuit en cours |
| `night-wake` | 🫣 | Dark | Réveil nocturne (bébé éveillé la nuit) |
| `night-sleep` | 🌙 | Dark | Rendormi après réveil nocturne |

## Flows

```
Jour :   Éveillé → Sieste → Éveillé
Nuit :   Éveillé → Nuit (→ Réveil nocturne → Rendormi)* → Éveillé
```

Le cycle nuit peut contenir 0 à N réveils nocturnes.

## Transitions (hero tap)

Le tap sur la hero card déclenche une **confirm card** (toast) proposant l'action la plus probable selon l'heure. Une **alternative** est proposée dans les zones d'ambiguïté.

### Action primaire selon l'heure

| Heure | État actuel | Action primaire | Alternative |
|-------|------------|----------------|-------------|
| 6h–17h | `awake` | 😴 Sieste | 🌙 Coucher du soir |
| 17h–23h | `awake` | 🌙 Coucher du soir | 😴 Sieste |
| 23h–6h | `awake` | 🌙 Coucher du soir | *(pas d'alt)* |

### Réveil depuis la nuit

| Heure | État actuel | Action primaire | Alternative |
|-------|------------|----------------|-------------|
| 19h–5h | `night` / `night-sleep` | 🫣 Réveil nocturne | ☀️ Réveil matin |
| 5h–8h | `night` / `night-sleep` | ☀️ Réveil matin | 🫣 Réveil nocturne |
| après 8h | `night` / `night-sleep` | ☀️ Réveil matin | *(pas d'alt)* |

### Équivalence `night` / `night-sleep`

`night-sleep` (rendormi après réveil nocturne) suit **exactement les mêmes transitions** que `night`. Les tableaux ci-dessus s'appliquent aux deux états.

### Transitions sans ambiguïté (pas d'alt)

| État actuel | Action | Condition |
|------------|--------|-----------|
| `nap` | ☀️ Fin de sieste | Toujours |
| `night-wake` | 🌙 Rendormi | Toujours |

## Règle générale

> L'alt apparaît **uniquement dans les zones d'ambiguïté** (proches d'un seuil horaire). En dehors, pas d'alt — c'est du bruit inutile.

## Confirm card (toast)

- Apparaît en bas de l'écran au tap sur la hero card
- **Cooldown** : bordure animée 5s, auto-dismiss, sens anti-horaire depuis le haut
- **±1 min** : ajustement de l'heure (tap sur l'heure = édition précise)
- **↩** : annulation (retour à l'état précédent)
- **Alt** : bouton secondaire proposant l'action alternative (si applicable)
- **Expiration** : à la fin du cooldown (5s), l'action **primary affichée** est automatiquement confirmée — pas de tap requis
- **Tap hors toast** : équivaut à l'expiration — valide l'action primary et ferme le toast

### Time picker (tap sur l'heure)

1. Tap sur l'heure affichée → le toast **s'agrandit** avec un picker rouleaux inline (heures | minutes)
2. Le **cooldown se met en pause** pendant l'édition
3. Scroll vertical avec snap sur chaque colonne, fade en haut/bas, highlight sur la sélection
4. Tap "OK" → retour au toast normal avec la nouvelle heure, **cooldown repart à 5s**

### Comportement du bouton Alt

1. Tap sur alt → **primary et alt s'échangent** dans le toast
2. Le **cooldown repart à 5s**
3. L'utilisateur peut **re-alterner** autant de fois qu'il veut
4. À expiration du cooldown → l'action **primary affichée** est confirmée

## Bootstrap & persistance

- **État initial** : `awake` — au premier lancement, le bébé est considéré éveillé
- **Persistance** : l'état courant et l'heure de début sont sauvegardés localement. À la réouverture, l'app restaure l'état et recalcule la durée écoulée (ex. "Dort depuis 2h14")
- **Pas de transitions automatiques** : l'app ne change jamais d'état toute seule — seul le parent déclenche les transitions via le tap sur la hero card

## Hero card — Affichage post-import crèche

### Problème

Quand le dernier événement enregistré est un import crèche (pas d'heure précise, seulement un `moment` : "Matin" / "Midi" / "Après-midi"), la durée affichée ("Éveillé depuis X" / "Dort depuis X") n'a pas de sens — il n'y a pas de timestamp fiable pour calculer le temps écoulé.

### Comportement

- **Événement live** (avec `startTime` précis) : affichage normal — emoji + label + durée + subtitle.
  - Ex. : `☀️ Éveillé depuis 2h14` / `Réveillé à 15h53`
- **Événement import** (avec `moment` au lieu de `startTime`) : affichage **sans durée** — emoji + label seul, pas de compteur, pas de subtitle.
  - Ex. : `☀️ Éveillé` / `😴 Dort`

### Règle

> La durée n'est affichée que si le dernier changement d'état possède un `startTime` précis. Sinon, seul le label d'état est affiché.

Le passage à l'affichage normal se fait dès la prochaine transition live (tap sur hero card).

### Maquette

Cf. `design-reference.html` § Hero Card — Post-import crèche.

---

## Seuils horaires

Les seuils (6h, 17h, 5h, 8h, etc.) sont des valeurs par défaut raisonnables. Ils pourront être affinés avec l'usage réel, mais **pas de config utilisateur** — l'app doit être simple.

**Convention de bornes** : les plages sont **[début, fin[** (borne gauche inclusive, droite exclusive). Exemples : 6h–17h = de 6h00 à 16h59 ; 17h–23h = de 17h00 à 22h59.
