# UX Design — Step 9 Session State

**Date:** 2026-03-07
**Statut:** Step 9 en cours (Design Directions) — pas encore validé (menu A/P/C)
**Fichier configurateur:** `_bmad-output/planning-artifacts/ux-design-directions.html`

---

## Direction choisie

**C2 — Hero Focus + Targets** : Large hero block (état actuel de Sam), KPI cards avec progress bars intégrées et CTAs, liste détail de la journée.

---

## Decisions de design validées

### Hero block
- **Tap hero = action immédiate live** (pas de menu de choix)
- Action contextuelle par défaut :
  - Jour + éveillé → démarre sieste
  - Soir + éveillé → démarre coucher du soir
  - Jour + dort → fin de sieste
  - Nuit → réveil nocturne
- **Confirmation toast** après le tap : check vert + description + lien "Annuler"
- Toast disparaît après ~5s
- Bouton "Plutôt" mini permet de corriger le type (ex: sieste → coucher)
- Hero = live tracking = **heure précise** (chrono en cours)

### KPI Cards (Lait + Sommeil)
- **Card entière cliquable** → ouvre vue tendance
- Bouton **"+"** en z-index au-dessus → ouvre quick-add
- **Progress bar** à 3 couches :
  1. Zone théorique (range shaded, left:52% width:36%)
  2. Marker tendance 3j à la même heure = **couleur de la range** (cohérence : cette couleur = théorie)
  3. Point blanc = **donnée du jour** (position = fill)
- **Check vert** (✓ dans cercle 22px) visible uniquement quand valeur dans la norme théorique — indépendant de la tendance perso
- Données varient selon le moment de la journée (momentProgress())

### Quick-add via "+" (rétro)
- **Biberon** : slider quantité (0-300 mL, défaut = moy. 10 derniers) + time chips (matin/midi/soir/maintenant)
  - ⚠️ **Question UX ouverte** : un seul CTA "+" pour le lait, pas de distinction live vs rétro. Options : toujours créneaux flous ? ou "maintenant" = heure précise auto ?
- **Sieste** : slider durée (5 min - 2h) + time chips (**matin/midi/après-midi** uniquement, pas de "maintenant" — pour le live utiliser hero)
- Boutons "Valider" + "Valider + ajouter un autre"

### Détail journée
- **Tap ligne = éditer**
- **Swipe gauche = supprimer** (pattern iOS, bouton rouge "Suppr.")
- Pas de mention "crèche" — juste "Biberon" ou "Sieste" peu importe le lieu
- Colonnes : dot couleur | label | time (right-aligned, 70px) | value (left-aligned, 56px)

### Mode nuit
- Hero élargi avec timer géant, pulse dot
- Bouton "Biberon nocturne" avec +
- Bouton discret "Réveil du matin"
- Message "Tout va bien" en fond

### Phone frame
- Max-width 375px, aspect-ratio 9/19.5 (proportions iPhone)
- Dynamic island simulée en haut

---

## Palettes disponibles
- **A — Violine** (violet/rose) — ⚠️ feedback femme en attente
- **B — Botanic** (vert/orange chaud)
- **C — Blossom** (rose/doré)
- **D — Océan** (bleu/turquoise)

Chaque palette a un mode day + night complet.

---

## Prochaines étapes
1. Feedback complémentaire d'Anthony + feedback femme sur palette
2. Résoudre la question UX ouverte (milk CTA live vs rétro)
3. Valider step 9 via menu A/P/C → "C" pour continuer
4. Step 10 : User Journeys
