---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/brief.md
date: 2026-03-06
author: Anthony
---

# Product Brief: samvabien

## Executive Summary

samvabien est une PWA mobile de suivi quotidien du sommeil et de l'alimentation d'un bébé, conçue pour un couple de parents. Elle se distingue par sa flexibilité de saisie (temps réel + mode approximatif crèche), un dashboard immédiat sans clics superflus, et une approche **informative sans être anxiogène** : l'app surveille les tendances et n'alerte que si un pattern hors norme persiste sur plusieurs jours. Les métriques clés (lait, sommeil nocturne, réveils, siestes) sont accessibles en 1 clic, prêtes pour le suivi personnel comme pour le rendez-vous pédiatre.

---

## Core Vision

### Problem Statement

Les applications de suivi bébé existantes (comme Napper) imposent une saisie avec des horaires précis pour chaque événement. Or, dans la réalité quotidienne, les informations arrivent souvent de manière approximative — notamment via la crèche, qui communique des durées et des moments de la journée, pas des heures exactes. Cela crée une friction quotidienne : transcrire les infos, inventer des horaires, et jongler entre SMS et app. De plus, la consultation des données demande trop de clics, et aucune solution ne distingue une journée atypique d'une tendance réellement préoccupante.

### Problem Impact

- ~3 minutes par jour de saisie manuelle + charge mentale de "deviner" les horaires
- Double workflow : SMS pour transmettre les infos brutes de la crèche, puis retranscription dans l'app
- Consultation des totaux quotidiens et tendances nécessite plusieurs clics
- Absence de vigilance intelligente : soit on surveille soi-même les tendances (charge mentale), soit on passe à côté d'un pattern anormal
- Pas de vue synthétique prête pour le rendez-vous pédiatre

### Why Existing Solutions Fall Short

Napper est excellent pour les saisies live (chrono sieste, dernier biberon il y a X minutes), mais impose un format rigide pour toute saisie. Il n'existe pas de mode "import crèche" pour entrer des données approximatives rapidement. Les vues synthétiques demandent plusieurs interactions, et aucun système d'alerte ne distingue une journée basse d'une tendance multi-jours préoccupante.

### Proposed Solution

Une PWA mobile one-hand friendly avec :
1. **Double mode de saisie** : live (boutons rapides, chrono serveur-side) + mode crèche (durée + moment de la journée, sans horaires précis)
2. **Dashboard immédiat** : résumé de la journée (mL bus, sommeil, progression) visible dès l'ouverture
3. **Alertes intelligentes non anxiogènes** : affichage quotidien factuel et neutre, alerte proactive uniquement si un indicateur est hors norme depuis 3+ jours — "si l'app ne dit rien, tout va bien"
4. **Métriques clés en 1 clic** : lait moyen, sommeil nocturne, réveils, siestes — prêtes pour le suivi personnel et le rendez-vous pédiatre
5. **Accès partagé** par lien magique, sans compte ni login

### Key Differentiators

1. **Flexibilité de saisie unique** : mode live + mode approximatif crèche, là où les concurrents imposent un format rigide
2. **Dashboard immédiat** : totaux et progression dès l'ouverture, zéro clic
3. **Vigilance déléguée** : l'app surveille les tendances et alerte uniquement quand c'est pertinent — réduit la charge mentale parentale
4. **Vue pédiatre** : métriques clés moyennées, accessibles en 1 clic
5. **Zéro friction d'accès** : lien magique, pas de compte
6. **Sur-mesure** : co-conçu par et pour un couple de parents

---

## Target Users

### Primary Users

**Anthony — Papa data-driven**
- Parent actif, partage équitablement la saisie des données avec sa conjointe
- Gère le pickup crèche et la retranscription des infos approximatives
- Plus orienté tendances et analyse : consulte les métriques sur plusieurs jours, prépare les rendez-vous pédiatre
- Moments d'usage : saisie live (biberon, sieste), import crèche au pickup, consultation rapide ("il en est où ?"), et analyse tendances

**Conjointe d'Anthony — Maman pratico-pratique**
- Contribue de manière égale à la saisie des données
- Usage centré sur le temps réel et la journée en cours : "depuis quand il est éveillé ?", "il va bientôt réclamer à manger ?"
- Délègue l'analyse tendances à Anthony, mais consulte les données du jour activement
- Moments d'usage : saisie live, consultation rapide pour anticiper les besoins de Sam

### Secondary Users

N/A — Les grands-parents et autres aidants ne sont pas considérés comme utilisateurs de l'app pour l'instant.

### User Journey

**3 modes d'ouverture de l'app :**

1. **Saisie live** — Il se passe quelque chose maintenant : Sam mange, s'endort, ou se réveille. Action rapide one-hand, en quelques secondes.
2. **Import crèche** — Au pickup, la crèche donne des infos approximatives (durées, moments de la journée, quantités). Saisie rapide sans inventer d'horaires.
3. **Consultation** — "Il en est où dans sa journée ?" — vérifier les totaux, anticiper le prochain biberon ou la prochaine sieste. Le soir, voir le résumé de la journée.

**Moment "aha!"** : La première fois qu'au retour de la crèche, les infos sont saisies en 30 secondes au lieu de 3 minutes — et que le dashboard affiche immédiatement le résumé complet de la journée, crèche incluse.

**Routine long-terme** : L'app devient le réflexe naturel. On ne stresse plus sur les tendances parce qu'on sait que l'app alertera si quelque chose mérite attention. Le rendez-vous pédiatre se prépare en 1 clic.

---

## Success Metrics

**Critère de succès principal** : samvabien remplace Napper et est toujours utilisé après 1 mois d'usage quotidien.

**Indicateurs concrets :**
- Napper est désinstallé / plus ouvert
- La saisie crèche est perçue comme plus rapide et moins pénible qu'avant
- Les deux parents utilisent l'app au quotidien sans friction
- Le dashboard jour remplace le réflexe de "calculer de tête" ou de fouiller dans l'app
- On n'a plus besoin d'envoyer un SMS avec les infos crèche brutes

### Business Objectives

N/A — Projet personnel, pas d'objectif commercial.

### Key Performance Indicators

N/A — Pas de KPIs formels. Le seul indicateur : est-ce qu'on s'en sert tous les jours au bout d'un mois ?

---

## MVP Scope

### Core Features

**1. Profil bébé**
- Prénom, date de naissance, poids (sans calcul de ranges/objectifs pour le MVP)

**2. Saisie live**
- Biberon : quantité en mL, saisie libre uniquement (pas de boutons prédéfinis, la quantité varie trop)
- Sieste : bouton "endormi" (démarre chrono serveur-side) / "réveillé" (clôt la sieste)
- Nuit : heure de coucher, réveils nocturnes (heure réveil + heure re-endormissement), heure de lever

**3. Saisie crèche (mode approximatif)**
- Siestes : durée + moment de la journée (matin/midi/après-midi)
- Biberons : quantité en mL (sans horaire précis)

**4. Dashboard jour (vue principale)**
- Logique "journée" = coucher du soir au coucher suivant (pas minuit-à-minuit)
- Total mL bus depuis le dernier coucher
- Total heures/minutes de sommeil (siestes + nuit)
- "Dernier biberon il y a Xh"
- Sieste active en cours : "Bébé dort depuis Xh"
- Sync temps réel entre les deux parents

**5. Accès partagé**
- Lien magique (URL unique), partageable, sans login

### Out of Scope for MVP

- Ranges/objectifs basés sur âge et poids (normes pédiatriques)
- Alertes intelligentes multi-jours (vigilance déléguée)
- Vue tendances / métriques moyennées (vue pédiatre)
- Notifications push (sieste active, rappel poids)
- Export texte (3/7 derniers jours)
- Tags symptômes

### MVP Success Criteria

samvabien remplace Napper au quotidien après 1 mois d'usage par les deux parents.

### Future Vision

- **v2** : Ranges pédiatriques (objectifs min-max basés sur âge/poids), vue tendances 7j avec métriques moyennées, alertes non anxiogènes si hors norme 3+ jours
- **v3** : Export texte pour partage avec ChatGPT/pédiatre, notifications push, tags symptômes
- **À terme** : Ouverture possible à d'autres couples de parents
