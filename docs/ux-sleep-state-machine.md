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

## Seuils horaires

Les seuils (6h, 17h, 5h, 8h, etc.) sont des valeurs par défaut raisonnables. Ils pourront être affinés avec l'usage réel, mais **pas de config utilisateur** — l'app doit être simple.
