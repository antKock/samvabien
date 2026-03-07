# UX — KPI Cards

## Vue d'ensemble

Deux cartes KPI sous la hero card : **Lait** 🍼 et **Sommeil** 😴. Chacune affiche la progression du cycle en cours, une zone cible médicale, et la moyenne glissante 3 jours.

**Couleurs par catégorie** : chaque carte utilise ses propres couleurs pour tous ses éléments (fill, zone, checkmark). Lait = tons chauds (orange/ambre), Sommeil = tons verts.

## Fenêtre de données ("aujourd'hui")

- **Cycle** : coucher → coucher. La "journée" commence au passage en état `night` (coucher du soir) et se termine au prochain coucher.
- **Durée variable** : un cycle ne fait pas exactement 24h — il est délimité par deux événements coucher.
- **Fallback** : si aucun coucher n'a été enregistré la veille (premier lancement, oubli), la fenêtre commence à **minuit**.
- **Reset** : les KPI cards se remettent à zéro au passage en état `night`.
  - *🎬 Animation potentielle : transition de reset au coucher*
- **Label** : "aujourd'hui" (simple, compris intuitivement par le parent).

## Zone cible (norme médicale)

- **Lait** : calculée à partir du **poids** du bébé (formule médicale).
- **Sommeil** : calculée à partir de l'**âge** du bébé (tableau de référence médical).
- Affichée comme une zone ombrée sur la progress bar (= **bar-target**).

## Marqueur moyenne 3 jours

- Moyenne glissante des **3 derniers jours**, contextualisée au **moment de la journée** (= **bar-avg**).
- Le marqueur progresse au fil de la journée : "en moyenne à cette heure-là, la quantité/durée était de X".
- Se met à jour en continu (pas besoin d'être à la seconde, mais pas besoin de refresh manuel).
- **⚠️ Attention dev** : le lissage de la moyenne horaire doit gérer les événements sans heure précise ("ce matin", "après-midi"). L'algo de lissage est à concevoir côté implémentation — l'attendu UX est une progression fluide et cohérente au fil de la journée.

## Checkmark ✓

- Apparaît **uniquement** quand la valeur du cycle en cours atteint la zone cible médicale.
- Couleur = couleur de la catégorie (orange pour lait, vert pour sommeil).
- Avant ça : rien. Pas de warning, pas d'alerte. L'absence de checkmark n'est pas un signal négatif.
- Pas d'état alarmiste — l'app reste zen en toute circonstance.

## Progress bar

### Terminologie

| Nom | Description | Visuel |
|-----|-------------|--------|
| **bar-track** | Rail vide (100%) | Fond de la barre |
| **bar-fill** | Progression de la journée | Remplissage coloré |
| **bar-now** | Position actuelle (bout du fill) | Cercle plein, couleur accent catégorie |
| **bar-target** | Zone recommandation médicale | Zone ombrée avec bordure |
| **bar-avg** | Moyenne 3j contextualisée | Anneau creux (bordure = couleur bar-target, fond = bar-track) |

### Choix visuels validés

- **bar-fill** : couleur constante (accent de la catégorie), ne change jamais selon l'état (pas de rouge/vert).
- **bar-target** : zone ombrée, toujours au même endroit. Couleurs propres à chaque catégorie.
- **bar-avg** : anneau creux — le fond laisse transparaître le bar-track, la bordure reprend la couleur du bar-target. Cela crée une hiérarchie visuelle claire : plein (bar-now) = "maintenant", creux (bar-avg) = "référence".
- **bar-now** : cercle plein, couleur accent de la catégorie.
- **bar-track** dark : `#3e402e` — suffisamment clair pour être visible sur les fonds de carte sombres.

## Comportement dynamique

- **Sommeil** : bar-fill et valeur s'incrémentent en temps réel pendant une sieste/nuit en cours. Mise à jour automatique à un pas raisonnable (~1 min).
- **Lait** : ne change qu'à l'ajout d'un biberon (événementiel).
- **bar-avg** : se déplace en continu pour lait et sommeil.
- **Overflow** : bar-fill est clampé à 100% — si le bébé dépasse le max de la barre, elle reste pleine.

## État initial (premier lancement / pas de données)

- bar-fill à **0%**, valeur affichée **0 mL** / **0h00**.
- **Pas de bar-avg** (aucun historique 3 jours).
- bar-target visible normalement (la zone cible médicale existe dès le renseignement du poids/âge).
- Pas de checkmark.

## Interactions

### Tap sur la carte (mode live — "ça vient d'arriver")

**Carte sommeil** : même comportement que le tap sur la hero card (raccourci). Même toast, même state machine.

**Carte lait** : toast biberon.
- Volume par défaut = **moyenne des 10 derniers biberons**. Fallback (aucun historique) = **médiane de la range**.
- **Slider horizontal** par pas de 10 mL, valeur affichée **au-dessus** du thumb (le doigt ne cache pas la valeur).
- Range du slider : bornes calculées selon le **poids** du bébé.
- Tap sur l'heure → time picker (composant partagé avec la hero card).
- **Cooldown 5s** → auto-confirm.
- **Bouton ↩** (annuler) : annule l'action en cours, le biberon n'est pas enregistré.
- Pas de bouton alt.
- *🎬 Animation potentielle : confirmation biberon*

### Tap sur le + (mode batch — "données crèche")

Le CTA `+` ouvre un mode de saisie multiple pour importer les données communiquées par la crèche à la récupération du petit.

**Icône** : SVG "import" — flèche vers le bas entrant dans un plateau ouvert (stroke 2px, couleur accent catégorie).

**Flow** :
- Même composant toast visuellement, mais **sans cooldown**.
- **Bouton ✕** (fermer) : ferme le toast sans enregistrer l'entrée en cours. Les entrées déjà ajoutées via "Suivant" restent enregistrées.
- Sélection **optionnelle** du **moment de la journée** : Matin / Midi / Après-midi (~8h–18h, découpage exact à affiner). Aucun créneau pré-sélectionné par défaut ; la valeur peut rester vide (= "au cours de la journée", sans précision).
- **Lait** : slider volume, même défaut (moyenne 10 derniers). Fallback = **médiane de la range**.
- **Sommeil** : slider durée, défaut = moyenne des 10 dernières siestes. Fallback = **médiane de la range**.
- Boutons **Suivant** (enregistre + réouvre un toast vierge) / **Terminer** (enregistre + ferme).
- **Suivant** : feedback visuel = reset du sélecteur de période + reset du slider à la valeur par défaut (moyenne).
- Pas de compteur — le parent verra les événements ajoutés dans la liste "Aujourd'hui".
- Chaque domaine reste cloisonné : le + de la carte lait ne saisit que du lait, idem pour le sommeil.
- *🎬 Animation potentielle : feedback d'ajout dans la liste "Aujourd'hui"*

## Points UI restants

- ~~bar-now~~ → **validé** : cercle plein accent catégorie
- ~~bar-avg~~ → **validé** : anneau creux, bordure bar-target
- ~~bar-track dark~~ → **validé** : `#3e402e`
- ~~Couleurs par catégorie~~ → **validé** : lait orange, sommeil vert
- ~~Icône du CTA batch~~ → **validé** : SVG import (flèche + plateau, stroke 2px)
- ~~Labels~~ → **validé** : "Lait aujourd'hui" / "Sommeil aujourd'hui"
- ~~Slider biberon~~ → **maquetté** : slider horizontal, valeur au-dessus du thumb, bornes min/max affichées
- ~~Toast batch import~~ → **maquetté** : sélecteur Matin/Midi/Après-midi + slider + Suivant/Terminer
