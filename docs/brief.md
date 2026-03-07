# Brief — Application Suivi Bébé

## Vision

Application mobile (PWA, raccourci écran d'accueil) pour suivre au quotidien le sommeil et l'alimentation d'un bébé. Conçue pour être utilisée par plusieurs aidants simultanément (parents, grands-parents). Usage rapide, one-hand friendly, sans compte ni login.

---

## Utilisateurs & accès

- **Cible** : 2 à 4 adultes, tous sur iPhone récent (≥ iOS 16.4)
- **Accès partagé** : lien magique (URL avec identifiant unique bébé), partageable via SMS / WhatsApp / etc.
- **Sécurité** : pas d'authentification nécessaire — aucune donnée sensible
- **Temps réel** : sync automatique entre utilisateurs en < 5 secondes, sans refresh manuel

---

## Configuration initiale (profil bébé)

| Donnée | Saisie |
|---|---|
| Prénom | À la création |
| Date de naissance | À la création — l'âge est calculé automatiquement |
| Poids | Saisie manuelle, modifiable à tout moment |

**Rappel poids** : une notification est envoyée au +10 jours après chaque anniversaire du mois (*"Bébé a X mois et 10 jours — tu veux mettre à jour son poids ?"*)

---

## Principe de saisie

> **Toutes les données peuvent être saisies en live OU à posteriori.** Aucune action n'est obligatoirement faite en temps réel.

---

## Données trackées

### 🍼 Lait

- Enregistrement d'un biberon : quantité en mL (0–400 mL)
- Heure associée (optionnelle, mais utile pour "dernier biberon il y a X heures")
- Boutons de saisie rapide avec valeurs prédéfinies (ex : 90 / 120 / 150 / 180 mL) basées sur les quantités habituelles + saisie libre

### 😴 Sommeil — 3 cas d'usage

**1. Sieste live**
- Un bouton "Bébé vient de s'endormir" démarre un chrono
- Le chrono tourne côté serveur (survit à la fermeture de l'app)
- À la réouverture : *"Bébé dort depuis 1h23"*
- Un bouton "Bébé s'est réveillé" clôt la sieste

**2. Import crèche (saisie a posteriori)**
- Saisie manuelle de siestes sans horaire précis
- Données : durée + moment de la journée (matin / midi / après-midi)

**3. Nuit**
- Heure de coucher
- Réveils nocturnes : heure réveil + heure re-endormissement (saisissables en live ou au matin)
- Heure de lever

### 🤒 Symptômes (bonus / optionnel)

Tags libres associés à une journée : selles molles, fièvre, ronchon, etc.

---

## Logique "journée"

La journée va du **coucher du soir au coucher suivant** (ex : 19h → 19h), pas de minuit à minuit. Tous les totaux (mL bus, heures de sommeil) sont calculés sur cette fenêtre.

---

## Objectifs & normes

Les objectifs quotidiens sont calculés selon **l'âge et le poids** de l'enfant. Ils s'expriment sous forme de **range** (min–max), pas d'une valeur cible rigide.

Exemples de normes utilisées :
- Quantité de lait journalière (mL) = f(poids, âge)
- Durée de sommeil recommandée = f(âge)
- Nombre de siestes recommandé = f(âge)

---

## Vues & visualisation

### Vue principale (aujourd'hui)

- Total mL bus depuis le dernier coucher + progression vers la range objectif
- Total heures/minutes de sommeil + progression
- **Indicateur contextuel** : *"À 14h, bébé est dans les temps pour atteindre son quota journalier"*
- Widget permanent : *"Dernier biberon il y a 2h15"*
- Sieste active le cas échéant : *"Bébé dort depuis 1h23"*

### Vue tendances

- Courbe sur les 7 derniers jours : mL/jour et heures de sommeil/jour
- Comparaison visuelle avec la range normative selon âge/poids

---

## Notifications (PWA iOS)

- Push notification pendant une sieste active (ex : toutes les 30 min ou à un seuil défini)
- Rappel mise à jour du poids (anniversaire du mois + 10 jours)

> ⚠️ Les **Live Activities** (Dynamic Island) ne sont pas accessibles via PWA — réservé aux apps natives iOS. Non implémentable dans ce contexte.

---

## Export

- Export des données des **3 ou 7 derniers jours** en texte brut
- Copier-coller en un clic, destiné à être partagé avec ChatGPT / Claude pour analyse

---

## Contraintes

- **Mobile uniquement** — pas de version desktop
- Interface pensée pour une utilisation **une main** (bébé dans l'autre)
- PWA installable sur écran d'accueil iPhone
- Tous les utilisateurs sont sur **iPhone récent (≥ iOS 16.4)**
