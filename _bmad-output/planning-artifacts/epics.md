---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/design-reference.html
  - docs/ux-kpi-cards.md
  - docs/ux-recap-today.md
  - docs/ux-onboarding-profil.md
  - docs/ux-sleep-state-machine.md
---

# samvabien - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for samvabien, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Un visiteur peut créer un nouveau foyer en renseignant le prénom du bébé, sa date de naissance et son poids
FR2: Un visiteur peut rejoindre un foyer existant via un code d'invitation ou un lien d'invitation
FR3: Un visiteur peut essayer l'app en mode démo avec des données fictives
FR4: Le système génère un code d'invitation unique au format XXXX-0000 à la création d'un foyer
FR5: Un parent peut copier le lien d'invitation pour le partager
FR6: Le système crée une session persistante (~1 an) sur chaque appareil sans login explicite
FR7: Un parent peut voir la liste des appareils connectés à son foyer
FR8: Un parent peut révoquer l'accès d'un appareil spécifique
FR9: Un parent peut quitter le foyer (suppression de sa session)
FR10: Le système supprime le foyer et ses données quand le dernier membre quitte
FR11: Un parent peut voir l'état sommeil actuel du bébé (état + durée écoulée) dès l'ouverture de l'app
FR12: Un parent peut voir la progression de la quantité de lait consommée dans le cycle en cours
FR13: Un parent peut voir la progression du temps de sommeil dans le cycle en cours
FR14: Le système affiche une zone cible médicale basée sur le poids (lait) et l'âge (sommeil) du bébé
FR15: Le système affiche une moyenne glissante sur 3 jours contextualisée à l'heure actuelle
FR16: Le système affiche un checkmark quand la valeur du cycle atteint la zone cible
FR17: Un parent peut voir la liste antéchronologique des événements du cycle en cours (biberons, siestes, nuit, réveils nocturnes)
FR18: Le système calcule la fenêtre "journée" du coucher au coucher suivant (fallback : minuit)
FR19: Un parent peut enregistrer un biberon avec une quantité en mL
FR20: Le système propose une valeur par défaut basée sur la moyenne des 10 derniers biberons
FR21: Un parent peut ajuster l'heure d'un biberon via un sélecteur d'heure
FR22: Un parent peut déclencher une transition d'état sommeil (endormissement, réveil, coucher, réveil nocturne, rendormissement)
FR23: Le système propose l'action la plus probable selon l'heure et l'état actuel
FR24: Le système propose une action alternative dans les zones d'ambiguïté horaire
FR25: Un parent peut ajuster l'heure d'une transition d'état via un sélecteur d'heure
FR26: Le système persiste l'état sommeil et le timestamp de début côté serveur (survit à la fermeture de l'app)
FR27: Un parent peut enregistrer plusieurs biberons en séquence (mode batch)
FR28: Un parent peut enregistrer plusieurs siestes en séquence (mode batch)
FR29: Un parent peut associer un moment de la journée (Matin / Midi / Après-midi) à chaque saisie batch
FR30: Chaque entrée batch est enregistrée individuellement au tap sur "Suivant"
FR31: Un parent peut modifier la valeur (volume ou durée) d'un événement enregistré
FR32: Un parent peut modifier l'heure ou le moment d'un événement enregistré
FR33: Un parent peut supprimer un événement enregistré
FR34: Le système propose un undo temporaire après une suppression
FR35: Un parent peut modifier le prénom du bébé
FR36: Un parent peut modifier la date de naissance du bébé
FR37: Un parent peut modifier le poids du bébé
FR38: Le système recalcule les zones cibles immédiatement après un changement de poids ou de date de naissance
FR39: Un parent peut activer/désactiver un rappel mensuel de pesée
FR40: Le système fournit des données fictives conformes au scénario démo quel que soit le moment d'accès
FR41: Toutes les fonctionnalités sont opérationnelles en mode démo (saisie, édition, profil)
FR42: Les modifications du visiteur en démo sont isolées et n'altèrent pas les données de base
FR43: Les données saisies par un parent sont visibles par l'autre parent sans refresh manuel
FR44: Les saisies confirmées sont envoyées au serveur immédiatement (connexion réseau attendue)
FR45: Le système bascule entre thème jour et thème nuit en fonction de l'état sommeil du bébé

### NonFunctional Requirements

NFR1: Le dashboard est opérationnel (données chargées, KPI affichées) en < 3s après ouverture sur 4G
NFR2: Le feedback visuel après une saisie (mise à jour KPI card) se produit en < 200ms
NFR3: Le First Contentful Paint est < 2s sur 4G
NFR4: La durée affichée dans la hero card (chrono sieste/nuit) est correcte à la seconde près à la réouverture de l'app
NFR5: Les sessions sont stockées en cookies httpOnly (pas accessibles via JavaScript)
NFR6: Les codes d'invitation ne permettent pas d'énumérer les foyers existants (pas d'information leakage sur les codes invalides)
NFR7: Un appareil révoqué ne peut plus accéder aux données du foyer
NFR8: L'état sommeil (état + timestamp) est persisté côté serveur et survit à la fermeture de l'app, la perte réseau, et le redémarrage du téléphone
NFR9: Les données du mode démo ne sont jamais altérées par les actions d'un visiteur

### Additional Requirements

**Depuis l'Architecture :**
- Starter template : `create-next-app` (Next.js 16, TypeScript 5 strict, Tailwind CSS 4, App Router, src dir, alias @/*)
- Dépendances post-init : @supabase/supabase-js, jose, vitest, @testing-library/react, zod
- Schéma DB : 3 tables pousse_profiles, pousse_device_sessions, pousse_events avec RLS Supabase
- Auth : JWT via jose (HS256), cookies httpOnly, middleware Next.js pour protection des routes
- API Routes : 10 endpoints (events CRUD, sleep-state, profiles, join, household, devices, leave)
- Sync temps réel : Supabase Realtime (channel household:{profileId})
- State management : React Context (HouseholdContext) avec optimistic updates
- Machine d'états sommeil : module pur TypeScript (lib/sleep-state-machine.ts), fonctions pures, pas de librairie externe
- Thème jour/nuit : data-theme sur <html>, CSS variables Tailwind, ThemeContext
- Service CycleWindow : lib/cycle-window.ts (fenêtre coucher→coucher, eventsInCycle, rollingAverage)
- Mode démo : données statiques lib/demo-data.ts, mutations en mémoire React state, aucun appel API
- PWA : manifest.json + service worker (cache assets, pas de mode offline)
- Infrastructure : Vercel (même compte qu'atable), Supabase (même instance, tables préfixées pousse_)
- Structure du projet : organisation par feature (~60 fichiers), tests co-localisés
- Conventions : snake_case DB, camelCase TS, PascalCase composants, kebab-case fichiers lib
- Format API : { data: T } ou { error: { message, code? } }
- Gestion d'erreurs : pas de retry, pas de queue offline, toast d'erreur discret en français
- Optimistic updates : mise à jour UI immédiate, rollback si API échoue (NFR2 < 200ms)

**Depuis les specs UX :**
- Machine d'états sommeil : 5 états (awake, nap, night, night-wake, night-sleep), transitions contextuelles selon l'heure avec seuils (6h, 17h, 23h, 5h, 8h, 19h), action alt uniquement dans les zones d'ambiguïté
- Confirm card (toast) : cooldown 5s bordure animée anti-horaire, auto-dismiss, tap hors toast = confirme, boutons ±1min/↩/alt
- Time picker : scroll wheels inline (heures|minutes), cooldown en pause pendant l'édition, bouton OK relance le cooldown
- Hero card post-import crèche : affichage sans durée si dernier événement est un import (pas de startTime précis)
- KPI cards : progress bar avec bar-track/bar-fill/bar-now/bar-target/bar-avg, couleurs par catégorie (lait=orange, sommeil=vert), checkmark uniquement quand zone cible atteinte
- Fenêtre de données (cycle) : coucher→coucher, fallback minuit, reset au passage en état night
- Zone cible médicale : lait basé sur le poids, sommeil basé sur l'âge
- Moyenne glissante 3 jours : contextualisée à l'heure, gestion des événements sans heure précise (répartition linéaire)
- Toast biberon : slider horizontal par pas de 10mL, valeur au-dessus du thumb, range selon le poids, cooldown 5s auto-confirm, tap hors toast = valide
- Toast batch (CTA +) : sans cooldown, icône SVG import, sélecteur moment optionnel (Matin/Midi/Après-midi), boutons Suivant/Terminer, bouton ✕ ferme sans enregistrer l'entrée en cours
- Sommeil en temps réel : bar-fill s'incrémente pendant sieste/nuit (~1 min de pas)
- Récap Aujourd'hui : liste antéchrono, regroupement événements nocturnes (Nuit = plage début-fin, Réveils nocturnes = lignes séparées), format durées (≥1h: Xh00, <1h: Xmin), imports triés par borne fin du créneau
- Toast d'édition : tap sur ligne récap, slider prérempli, heure préremplie, boutons ✕/Supprimer/Enregistrer, pas de cooldown
- Toast undo suppression : cooldown 2s, bouton Annuler, tap hors toast = confirme suppression
- Onboarding : landing screen (3 CTA : Essayer la démo / Créer un profil / Rejoindre un foyer), formulaire 3 champs (prénom, DDN, poids via scroll wheels kg|hg), bouton "C'est parti" désactivé tant que 3 champs non remplis
- Poids picker : scroll wheels 2 colonnes (kg 2-15, hg 0-9), valeur par défaut 3kg5
- Banner de bienvenue : one-shot post-création, code XXXX-0000, bouton "Copier le lien", bouton ✕ ou tap hors banner pour fermer
- Rejoindre un foyer : champ texte avec auto-lookup (debounce 300ms), feedback spinner/erreur, lien d'invitation /join/[CODE]
- Mode démo : session éphémère, bébé "Léo" 4 mois, snapshot figé 17h30, bandeau "Mode démo — données non conservées" avec CTA "Quitter", données en session storage uniquement
- Page profil : édition inline (prénom, DDN, poids via scroll wheels), sauvegarde auto au blur, rappel de pesée mensuel (toggle on/off, jour naissance + 10 jours), gestion foyer (code, copier lien, appareils connectés, révoquer), bouton "Quitter le profil" destructif avec confirmation
- Accès profil : bouton "Prénom ⚙" inline avec la date dans le header
- Palette COLORS : tokens jour/nuit complets définis dans design-reference.html, police Nunito, arrondis généreux
- Design mobile-only : 375-430px, contenu centré sur écrans plus larges
- Accessibilité : contraste WCAG AA, touch targets ≥ 44px, taille police min 11px
- Animations potentielles identifiées : reset KPI au coucher, confirmation biberon, feedback ajout batch

### FR Coverage Map

FR1: Epic 1 — Création foyer (onboarding 3 champs)
FR2: Epic 1 — Rejoindre un foyer (code/lien d'invitation)
FR3: Epic 8 — Mode démo (session éphémère, données fictives)
FR4: Epic 1 — Génération code d'invitation XXXX-0000
FR5: Epic 1 — Copier le lien d'invitation
FR6: Epic 1 — Session persistante JWT (~1 an)
FR7: Epic 1 — Liste des appareils connectés
FR8: Epic 1 — Révoquer un appareil
FR9: Epic 1 — Quitter le foyer
FR10: Epic 1 — Suppression foyer quand dernier membre quitte
FR11: Epic 2 — État sommeil actuel (hero card + durée)
FR12: Epic 3 — Progression lait du cycle (KPI card)
FR13: Epic 3 — Progression sommeil du cycle (KPI card)
FR14: Epic 3 — Zone cible médicale (poids/âge)
FR15: Epic 3 — Moyenne glissante 3 jours contextualisée
FR16: Epic 3 — Checkmark zone cible atteinte
FR17: Epic 4 — Liste antéchronologique des événements (récap)
FR18: Epic 2 — Fenêtre journée coucher→coucher
FR19: Epic 3 — Enregistrer un biberon (mL)
FR20: Epic 3 — Valeur par défaut (moyenne 10 derniers biberons)
FR21: Epic 3 — Ajuster l'heure d'un biberon (time picker)
FR22: Epic 2 — Transition d'état sommeil (hero card tap)
FR23: Epic 2 — Action la plus probable selon l'heure
FR24: Epic 2 — Action alternative (zones d'ambiguïté)
FR25: Epic 2 — Ajuster l'heure de transition (time picker)
FR26: Epic 2 — Persistance état sommeil serveur-side
FR27: Epic 5 — Saisie batch biberons (import crèche)
FR28: Epic 5 — Saisie batch siestes (import crèche)
FR29: Epic 5 — Sélecteur moment de la journée (batch)
FR30: Epic 5 — Enregistrement individuel au "Suivant"
FR31: Epic 4 — Modifier la valeur d'un événement
FR32: Epic 4 — Modifier l'heure/moment d'un événement
FR33: Epic 4 — Supprimer un événement
FR34: Epic 4 — Undo temporaire après suppression
FR35: Epic 6 — Modifier le prénom du bébé
FR36: Epic 6 — Modifier la date de naissance
FR37: Epic 6 — Modifier le poids du bébé
FR38: Epic 6 — Recalcul zones cibles après changement poids/âge
FR39: Epic 6 — Toggle rappel de pesée mensuel
FR40: Epic 8 — Données fictives cohérentes chaque jour
FR41: Epic 8 — Toutes fonctionnalités opérationnelles en démo
FR42: Epic 8 — Isolation des modifications visiteur
FR43: Epic 7 — Sync temps réel sans refresh
FR44: Epic 7 — Envoi immédiat au serveur
FR45: Epic 2 — Bascule thème jour/nuit

## Epic List

### Epic 1: Création de foyer & accès
Les parents peuvent créer un foyer, inviter l'autre parent, et gérer les appareils connectés.
**FRs couverts:** FR1, FR2, FR4, FR5, FR6, FR7, FR8, FR9, FR10

### Epic 2: Suivi sommeil en temps réel (Hero Card)
Les parents suivent l'état de sommeil du bébé en temps réel via la hero card, avec bascule de thème jour/nuit.
**FRs couverts:** FR11, FR18, FR22, FR23, FR24, FR25, FR26, FR45

### Epic 3: Suivi lait & KPI quotidiens
Les parents enregistrent les biberons et voient la progression quotidienne lait + sommeil avec zones cibles médicales.
**FRs couverts:** FR12, FR13, FR14, FR15, FR16, FR19, FR20, FR21

### Epic 4: Journal de la journée & corrections
Les parents consultent tous les événements et peuvent corriger les erreurs.
**FRs couverts:** FR17, FR31, FR32, FR33, FR34

### Epic 5: Import données crèche
Un parent peut saisir les données crèche en moins de 30 secondes via le mode batch.
**FRs couverts:** FR27, FR28, FR29, FR30

### Epic 6: Profil bébé & paramètres
Les parents gèrent les informations du bébé et les zones cibles se recalculent automatiquement.
**FRs couverts:** FR35, FR36, FR37, FR38, FR39

### Epic 7: Synchronisation temps réel
Les deux parents voient les mises à jour de l'autre en temps réel, sans refresh.
**FRs couverts:** FR43, FR44

### Epic 8: Mode démo
Les visiteurs peuvent tester l'app avec des données réalistes avant de s'engager.
**FRs couverts:** FR3, FR40, FR41, FR42

---

## Epic 1: Création de foyer & accès

Les parents peuvent créer un foyer, inviter l'autre parent, et gérer les appareils connectés.

### Story 1.1: Landing screen & fondation projet

As a visiteur,
I want voir une page d'accueil à l'ouverture de l'app,
So that je peux choisir de créer un profil, rejoindre un foyer, ou essayer la démo.

**Acceptance Criteria:**

**Given** je suis un nouveau visiteur sans session active
**When** j'ouvre l'app pour la première fois
**Then** je vois la landing screen avec l'illustration bébé, le nom "pousse" (32px, font-weight 800, couleur sleep.icon), et la tagline "Suivi bébé simple et serein"
**And** je vois 3 boutons empilés : "Essayer la démo" (primary), "Créer un profil" (secondary), "Rejoindre un foyer" (lien discret)

**Given** le projet est initialisé
**When** un développeur examine la configuration
**Then** le projet utilise Next.js 16 (App Router, src dir, alias @/*), TypeScript strict, Tailwind CSS 4 avec la palette COLORS complète (day/night), la police Nunito, et les arrondis custom
**And** le manifest PWA est configuré (name "pousse", display standalone, icônes)
**And** la structure de dossiers respecte l'architecture définie (app/(landing), app/(app), components/, lib/, hooks/, contexts/, types/)

**Given** je suis sur un écran > 430px de large
**When** j'affiche la landing screen
**Then** le contenu est centré avec une largeur max (design mobile-only 375-430px)

### Story 1.2: Création de foyer (onboarding complet)

As a visiteur,
I want créer un foyer en renseignant le prénom, la date de naissance et le poids de mon bébé,
So that je peux commencer à suivre sa journée.

**Acceptance Criteria:**

**Given** je suis sur la landing screen
**When** je tape "Créer un profil"
**Then** je suis redirigé vers le formulaire d'onboarding avec 3 champs : prénom (texte), date de naissance (date picker scroll wheels), poids (scroll wheels kg 2-15 | hg 0-9, défaut 3kg5)
**And** le bouton "C'est parti" est désactivé tant que les 3 champs ne sont pas remplis

**Given** j'ai rempli les 3 champs correctement (prénom 1-30 caractères, DDN ≤ aujourd'hui, poids 2.0-15.0 kg)
**When** je tape "C'est parti"
**Then** le système crée un foyer en DB (table pousse_profiles avec baby_name, baby_dob, baby_weight_hg, sleep_state='awake', weight_reminder=true)
**And** le système génère un code d'invitation unique au format XXXX-0000 (4 lettres majuscules + 4 chiffres)
**And** le système crée une session device (table pousse_device_sessions)
**And** un cookie JWT httpOnly est posé (~1 an d'expiration, signé HS256 via jose)
**And** je suis redirigé vers le dashboard (shell vide pour l'instant)

**Given** je suis authentifié avec un JWT valide
**When** j'accède à une route protégée (app/)
**Then** le middleware Next.js vérifie le JWT et autorise l'accès

**Given** je n'ai pas de session active
**When** j'accède à une route protégée
**Then** je suis redirigé vers la landing screen

### Story 1.3: Rejoindre un foyer

As a visiteur,
I want rejoindre un foyer existant avec un code d'invitation ou un lien,
So that je peux accéder aux données du bébé partagées par l'autre parent.

**Acceptance Criteria:**

**Given** je suis sur la landing screen
**When** je tape "Rejoindre un foyer"
**Then** je vois un écran avec un champ texte unique (placeholder "Code d'invitation")

**Given** je suis sur l'écran de join
**When** je saisis un code au format XXXX-0000 (insensible à la casse, tiret optionnel)
**Then** le système lance un auto-lookup après 300ms de debounce
**And** un spinner s'affiche pendant la vérification

**Given** le code saisi correspond à un foyer existant
**When** la vérification est terminée
**Then** le système crée une session device pour ce foyer
**And** un cookie JWT httpOnly est posé
**And** je suis redirigé vers le dashboard avec les données du bébé

**Given** le code saisi ne correspond à aucun foyer
**When** la vérification est terminée
**Then** un message d'erreur s'affiche : "Code introuvable, vérifiez la saisie"
**And** la réponse API ne révèle pas si d'autres codes existent (NFR6)

**Given** un parent m'a envoyé un lien /join/[CODE]
**When** j'ouvre le lien
**Then** le code est pré-rempli et la validation se lance automatiquement

### Story 1.4: Banner de bienvenue & partage du code

As a parent,
I want voir le code d'invitation après la création du foyer et copier le lien de partage,
So that l'autre parent peut rejoindre facilement.

**Acceptance Criteria:**

**Given** je viens de créer un foyer (redirection post-onboarding)
**When** j'arrive sur le dashboard
**Then** un banner de bienvenue s'affiche en haut avec le texte "🎉 Bienvenue !", une explication, le code d'invitation en gros (16px, font-weight 700), et un bouton "Copier le lien"

**Given** le banner de bienvenue est affiché
**When** je tape "Copier le lien"
**Then** le lien d'invitation (/join/[CODE]) est copié dans le presse-papier

**Given** le banner de bienvenue est affiché
**When** je tape ✕ ou je tape hors du banner
**Then** le banner se ferme et ne réapparaît plus jamais (one-shot)

**Given** j'ai déjà fermé le banner de bienvenue
**When** je rouvre l'app
**Then** le banner ne s'affiche pas (le code reste accessible dans le profil)

### Story 1.5: Gestion des appareils & quitter le foyer

As a parent,
I want voir les appareils connectés, révoquer un appareil, ou quitter le foyer,
So that je contrôle qui a accès aux données.

**Acceptance Criteria:**

**Given** je suis sur le dashboard
**When** j'accède à la page profil
**Then** je vois une section "Foyer" avec le code d'invitation, un bouton "Copier le lien", et la liste des appareils connectés (nom/type + date de dernière connexion)

**Given** je vois la liste des appareils connectés
**When** je tape le bouton "Déconnecter" sur un appareil
**Then** une confirmation simple s'affiche ("Déconnecter cet appareil ?")
**And** si je confirme, l'appareil est révoqué (session supprimée en DB via DELETE /api/devices/[id])
**And** l'appareil révoqué ne peut plus accéder aux données du foyer (NFR7)

**Given** je suis le dernier membre du foyer
**When** je tape "Quitter le profil" (bouton destructif rouge) et je confirme ("Quitter le profil ? Vous perdrez l'accès aux données.")
**Then** ma session est supprimée, le foyer et toutes ses données sont supprimés définitivement (hard delete)
**And** je suis redirigé vers la landing screen

**Given** je ne suis pas le dernier membre du foyer
**When** je tape "Quitter le profil" et je confirme
**Then** ma session est supprimée, mais le foyer et ses données restent accessibles pour les autres membres
**And** je suis redirigé vers la landing screen

---

## Epic 2: Suivi sommeil en temps réel (Hero Card)

Les parents suivent l'état de sommeil du bébé en temps réel via la hero card, avec bascule de thème jour/nuit.

### Story 2.1: Machine d'états sommeil & API transition

As a parent,
I want déclencher une transition d'état sommeil,
So that l'app reflète en temps réel si mon bébé dort ou est éveillé.

**Acceptance Criteria:**

**Given** le module `lib/sleep-state-machine.ts` est implémenté
**When** j'appelle `getNextTransitions('awake', 14)`
**Then** l'action primaire est "😴 Sieste" et il n'y a pas d'alternative (14h est hors zone d'ambiguïté 6h–17h)

**Given** le module `lib/sleep-state-machine.ts` est implémenté
**When** j'appelle `getNextTransitions('awake', 18)`
**Then** l'action primaire est "🌙 Coucher du soir" et l'alternative est "😴 Sieste" (zone 17h–23h)

**Given** le bébé est en état `night` ou `night-sleep`
**When** j'appelle `getNextTransitions` à 6h
**Then** l'action primaire est "☀️ Réveil matin" et l'alternative est "🫣 Réveil nocturne" (zone 5h–8h)

**Given** le bébé est en état `nap`
**When** j'appelle `getNextTransitions`
**Then** l'action est "☀️ Fin de sieste" sans alternative (pas d'ambiguïté)

**Given** le bébé est en état `night-wake`
**When** j'appelle `getNextTransitions`
**Then** l'action est "🌙 Rendormi" sans alternative (pas d'ambiguïté)

**Given** je suis authentifié et le bébé est en état `awake`
**When** j'envoie POST /api/sleep-state avec newState='nap' et time=now
**Then** le champ `sleep_state` de pousse_profiles passe à 'nap', `sleep_state_since` est mis à jour, `sleep_state_moment` est null
**And** un événement de type 'nap' est créé dans pousse_events avec started_at = time
**And** la table pousse_events est créée si nécessaire (migration)

**Given** les tests unitaires de sleep-state-machine
**When** je lance vitest
**Then** tous les cas de la matrice transitions × seuils horaires passent (awake→nap, awake→night, night→night-wake, night-wake→night-sleep, night/night-sleep→awake, nap→awake)

### Story 2.2: Hero card & toast de transition

As a parent,
I want voir l'état de sommeil actuel avec la durée écoulée et confirmer les transitions via un toast,
So that je sais en un coup d'œil depuis combien de temps mon bébé dort ou est éveillé.

**Acceptance Criteria:**

**Given** le bébé est en état `awake` depuis 2h14
**When** j'ouvre l'app
**Then** la hero card affiche "☀️ Éveillé depuis 2h14" avec le subtitle "Réveillé à [heure]"
**And** le compteur se met à jour en temps réel (NFR4 — exact à la seconde près)

**Given** le bébé est en état `nap` depuis 45min
**When** j'ouvre l'app
**Then** la hero card affiche "😴 Dort depuis 45min"

**Given** le dernier changement d'état provient d'un import crèche (moment au lieu de startTime)
**When** j'ouvre l'app
**Then** la hero card affiche seulement "☀️ Éveillé" ou "😴 Dort" sans durée ni subtitle

**Given** la hero card est affichée
**When** je tape dessus
**Then** un toast apparaît en bas de l'écran avec l'action primaire contextuelle (selon l'heure et l'état), l'heure actuelle, et un cooldown de 5s (bordure animée anti-horaire depuis le haut)

**Given** le toast de transition est affiché avec un cooldown actif
**When** le cooldown expire (5s)
**Then** l'action primaire affichée est automatiquement confirmée, la hero card se met à jour

**Given** le toast de transition est affiché
**When** je tape hors du toast
**Then** l'action primaire est confirmée (équivaut à l'expiration du cooldown)

**Given** le toast affiche une action alternative (zone d'ambiguïté)
**When** je tape sur le bouton alt
**Then** primary et alt s'échangent dans le toast, le cooldown repart à 5s

**Given** le toast de transition est affiché
**When** je tape le bouton ↩ (annuler)
**Then** le toast se ferme sans effectuer de transition

### Story 2.3: Time picker & ajustement horaire

As a parent,
I want ajuster l'heure d'une transition sommeil via un sélecteur à rouleaux,
So that je peux corriger l'heure si je n'ai pas enregistré au moment exact.

**Acceptance Criteria:**

**Given** le toast de transition est affiché avec le cooldown actif
**When** je tape sur l'heure affichée
**Then** le toast s'agrandit et affiche un picker à rouleaux inline (colonne heures | colonne minutes)
**And** le cooldown se met en pause

**Given** le time picker est ouvert
**When** je fais défiler les rouleaux
**Then** le scroll snap sur chaque valeur avec friction et momentum, un fade en haut/bas, et un highlight sur la sélection courante

**Given** le time picker est ouvert avec une heure modifiée
**When** je tape "OK"
**Then** le toast revient à sa taille normale avec la nouvelle heure affichée
**And** le cooldown repart à 5s

**Given** le composant TimePicker est implémenté
**When** il est utilisé dans d'autres toasts (biberon, édition)
**Then** le même composant est réutilisé (composant partagé dans ui/)

### Story 2.4: Thème jour/nuit & cycle coucher→coucher

As a parent,
I want que l'app bascule automatiquement entre thème jour et thème nuit selon l'état du bébé,
So that l'interface s'adapte au contexte.

**Acceptance Criteria:**

**Given** le bébé est en état `awake`
**When** l'app est affichée
**Then** le thème jour est appliqué (data-theme="day" sur <html>, CSS variables COLORS.day)

**Given** le bébé est en état `nap`, `night`, `night-wake`, ou `night-sleep`
**When** l'app est affichée
**Then** le thème nuit est appliqué (data-theme="night" sur <html>, CSS variables COLORS.night)

**Given** le bébé passe de `awake` à `nap`
**When** la transition est confirmée
**Then** le thème bascule de jour à nuit avec une transition CSS douce

**Given** le module `lib/cycle-window.ts` est implémenté
**When** j'appelle `currentCycleStart()` et le dernier coucher (état `night`) était hier à 19h30
**Then** la fonction retourne le timestamp de 19h30 hier

**Given** aucun coucher n'a été enregistré
**When** j'appelle `currentCycleStart()`
**Then** la fonction retourne minuit du jour en cours (fallback)

**Given** j'appelle `eventsInCycle(events)`
**When** je passe la liste de tous les événements
**Then** seuls les événements dont le timestamp (started_at ou moment converti) est ≥ currentCycleStart sont retournés

**Given** les tests unitaires de cycle-window
**When** je lance vitest
**Then** les cas suivants passent : cycle normal (coucher→coucher), fallback minuit, événements en dehors du cycle filtrés

---

## Epic 3: Suivi lait & KPI quotidiens

Les parents enregistrent les biberons et voient la progression quotidienne lait + sommeil avec zones cibles médicales.

### Story 3.1: KPI cards lait & sommeil

As a parent,
I want voir la progression quotidienne de lait et de sommeil sur deux cartes KPI,
So that je sais en un coup d'œil où en est mon bébé dans sa journée.

**Acceptance Criteria:**

**Given** le bébé a consommé 300 mL de lait dans le cycle en cours
**When** j'ouvre le dashboard
**Then** la KPI card lait affiche "300 mL" (26px, weight 800) avec le label "Lait aujourd'hui"
**And** la progress bar montre bar-fill proportionnel au max de la barre, bar-now (cercle plein accent orange), bar-target (zone ombrée calculée à partir du poids du bébé)

**Given** le bébé a dormi 2h30 dans le cycle en cours (siestes terminées)
**When** j'ouvre le dashboard
**Then** la KPI card sommeil affiche "2h30" avec le label "Sommeil aujourd'hui"
**And** la progress bar utilise les couleurs sommeil (accent vert), bar-target calculée à partir de l'âge du bébé

**Given** le bébé est en sieste ou nuit en cours
**When** j'observe la KPI card sommeil
**Then** bar-fill et la valeur s'incrémentent en temps réel (~1 min de pas)

**Given** le module `lib/medical-targets.ts` est implémenté
**When** j'appelle `getMilkTarget(weightHg)` avec un poids de 42 (4,2 kg)
**Then** la zone cible retournée correspond à la formule médicale (min-max en mL)

**Given** le module `lib/medical-targets.ts` est implémenté
**When** j'appelle `getSleepTarget(dobDate)` avec un bébé de 4 mois
**Then** la zone cible retournée correspond au tableau de référence médical (min-max en minutes)

**Given** la valeur du cycle atteint la zone cible médicale
**When** la KPI card se met à jour
**Then** un checkmark apparaît (couleur accent de la catégorie : orange pour lait, vert pour sommeil)

**Given** la valeur du cycle n'a pas encore atteint la zone cible
**When** la KPI card est affichée
**Then** il n'y a pas de checkmark, pas de warning, pas d'alerte (l'absence n'est pas un signal négatif)

**Given** il y a au moins 3 jours d'historique
**When** la KPI card est affichée
**Then** bar-avg (anneau creux, bordure couleur bar-target, fond bar-track) est positionné à la moyenne glissante 3 jours contextualisée à l'heure actuelle
**And** bar-avg se déplace en continu au fil de la journée

**Given** c'est le premier jour d'utilisation (pas d'historique 3 jours)
**When** la KPI card est affichée
**Then** bar-fill est à 0%, valeur "0 mL" / "0h00", pas de bar-avg, bar-target visible normalement

**Given** la valeur dépasse le max de la barre
**When** la KPI card se met à jour
**Then** bar-fill est clampé à 100% (overflow géré)

**Given** les tests unitaires de medical-targets
**When** je lance vitest
**Then** les calculs de zones cibles lait (par poids) et sommeil (par âge) sont corrects

### Story 3.2: Toast biberon (saisie live)

As a parent,
I want enregistrer un biberon en ajustant la quantité avec un slider,
So that le suivi lait est mis à jour en quelques secondes.

**Acceptance Criteria:**

**Given** je suis sur le dashboard
**When** je tape sur la KPI card lait
**Then** un toast biberon apparaît avec un slider horizontal, une valeur par défaut = moyenne des 10 derniers biberons, l'heure actuelle, et un cooldown de 5s

**Given** il n'y a aucun historique de biberons
**When** le toast biberon s'ouvre
**Then** la valeur par défaut est la médiane de la range (range calculée selon le poids du bébé)

**Given** le toast biberon est affiché
**When** je fais glisser le slider
**Then** la valeur change par pas de 10 mL, affichée au-dessus du thumb (le doigt ne cache pas la valeur)
**And** le slider respecte les bornes min/max calculées selon le poids du bébé

**Given** le toast biberon est affiché
**When** je tape sur l'heure
**Then** le TimePicker (scroll wheels, composant partagé de Story 2.3) s'ouvre, le cooldown se met en pause

**Given** le cooldown du toast biberon expire (5s)
**When** je n'ai pas annulé
**Then** le biberon est enregistré avec la quantité et l'heure affichées (POST /api/events type='bottle')
**And** la KPI card lait se met à jour immédiatement (optimistic update, NFR2 < 200ms)

**Given** le toast biberon est affiché
**When** je tape hors du toast
**Then** le biberon est enregistré (équivaut à l'expiration du cooldown)

**Given** le toast biberon est affiché
**When** je tape le bouton ↩ (annuler)
**Then** le toast se ferme sans enregistrer de biberon

### Story 3.3: Header dashboard & accès profil

As a parent,
I want voir la date du jour et le prénom du bébé dans le header,
So that j'ai le contexte de la journée et un accès rapide au profil.

**Acceptance Criteria:**

**Given** je suis sur le dashboard
**When** l'écran est affiché
**Then** le header affiche la date à gauche (format "Vendredi 7 mars", 10px, font-weight 600, couleur textSec) et "Prénom ⚙" à droite (même style, icône SVG gear 12×12, gap 3px)

**Given** je suis sur le dashboard
**When** je tape sur "Prénom ⚙"
**Then** je suis redirigé vers la page profil (page shell, contenu complété dans Epic 6)

**Given** le dashboard est affiché
**When** j'observe le layout global
**Then** les composants sont empilés : header → hero card → KPI card lait → KPI card sommeil → zone récap (placeholder pour Epic 4)

---

## Epic 4: Journal de la journée & corrections

Les parents consultent tous les événements et peuvent corriger les erreurs.

### Story 4.1: Récap antéchronologique des événements

As a parent,
I want voir la liste de tous les événements de la journée,
So that je sais exactement ce qui s'est passé d'un coup d'œil.

**Acceptance Criteria:**

**Given** le cycle en cours contient des biberons et des siestes terminées
**When** j'ouvre le dashboard et je scrolle sous les KPI cards
**Then** je vois le titre "Aujourd'hui" (uppercase, 9px, weight 700, textSec, margin-top 6px) suivi de la liste antéchronologique des événements

**Given** un biberon de 150 mL a été enregistré à 12h15
**When** la liste est affichée
**Then** je vois une ligne : dot orange (5px) + "Biberon" (11px, weight 600) + "12h15" (10px, weight 600, textSec) + "150 mL" (11px, weight 700, couleur milk.icon)

**Given** une sieste de 1h23 a démarré à 14h30 et est terminée
**When** la liste est affichée
**Then** je vois une ligne : dot vert + "Sieste" + "14h30" + "1h23"

**Given** la nuit a duré de 19h30 à 5h50 avec un réveil nocturne de 3h15 à 3h27
**When** la liste est affichée
**Then** je vois 3 lignes regroupées : "Nuit" (19h30–5h50, 10h20) + "Réveil nocturne" (3h15–3h27, 12min) + les détails de la nuit
**And** les événements nocturnes sont regroupés en plages lisibles

**Given** un import crèche "Matin" a été saisi sans heure précise
**When** la liste est affichée
**Then** la ligne affiche "Matin" au lieu de l'heure et est triée comme 12h00 en antéchrono

**Given** les formats de durée
**When** un événement dure ≥ 1h
**Then** le format est "Xh00" (ex. "1h23", "10h20")

**Given** les formats de durée
**When** un événement dure < 1h
**Then** le format est "Xmin" (ex. "12min", "45min")

**Given** une sieste ou nuit est en cours (pas terminée)
**When** la liste est affichée
**Then** l'événement en cours n'apparaît PAS dans le récap (seuls les événements terminés)

**Given** aucun événement n'est enregistré dans le cycle
**When** la liste est affichée
**Then** le titre "Aujourd'hui" est affiché avec le placeholder "Les événements s'afficheront ici" (11px, textSec, centré)

**Given** le module `lib/format.ts` est implémenté
**When** je lance vitest
**Then** les tests de formatage durées (Xh00/Xmin) et heures (format court sans zéro initial) passent

### Story 4.2: Toast d'édition d'un événement

As a parent,
I want modifier un événement en tapant dessus dans le récap,
So that je peux corriger les erreurs de saisie.

**Acceptance Criteria:**

**Given** la liste récap est affichée
**When** je tape sur une ligne "Biberon — 12h15 — 150 mL"
**Then** un toast d'édition s'ouvre avec le titre "🍼 Biberon", l'heure préremplie à 12h15, et le slider prérempli à 150 mL

**Given** la liste récap est affichée
**When** je tape sur une ligne "Sieste — 14h30 — 1h23"
**Then** un toast d'édition s'ouvre avec le titre "😴 Sieste", l'heure préremplie à 14h30, et le slider prérempli à 1h23

**Given** le toast d'édition est ouvert pour un import sans heure précise
**When** le toast s'affiche
**Then** le sélecteur de moment (Matin/Midi/Après-midi) est prérempli au lieu du time picker

**Given** le toast d'édition est ouvert
**When** je modifie la valeur (slider) et/ou l'heure et tape "Enregistrer"
**Then** l'événement est mis à jour (PATCH /api/events/[id]), la ligne du récap reflète les nouvelles valeurs, les KPI cards se recalculent immédiatement

**Given** le toast d'édition est ouvert
**When** je tape ✕ ou je tape hors du toast
**Then** le toast se ferme sans modifier l'événement

**Given** le toast d'édition est ouvert
**When** j'observe le comportement
**Then** il n'y a PAS de cooldown — le parent modifie à son rythme

### Story 4.3: Suppression avec undo

As a parent,
I want supprimer un événement avec possibilité d'annuler,
So that je peux corriger sans risque de perte.

**Acceptance Criteria:**

**Given** le toast d'édition est ouvert
**When** je tape le bouton "Supprimer" (style secondary)
**Then** l'événement disparaît de la liste, le toast d'édition se ferme, les KPI cards se recalculent immédiatement
**And** un toast undo apparaît en bas de l'écran

**Given** le toast undo est affiché
**When** j'observe son contenu
**Then** il affiche "🗑️ Supprimé" (14px, weight 800, couleur text) et un bouton "Annuler" (style secondary)
**And** un cooldown de 2s est actif (même animation que les toasts de transition, bordure anti-horaire)

**Given** le toast undo est affiché
**When** le cooldown de 2s expire
**Then** la suppression devient définitive (DELETE /api/events/[id]), le toast disparaît

**Given** le toast undo est affiché
**When** je tape hors du toast
**Then** la suppression est confirmée immédiatement (équivaut à l'expiration)

**Given** le toast undo est affiché
**When** je tape "Annuler" avant l'expiration
**Then** l'événement réapparaît dans la liste, les KPI cards se restaurent, le toast se ferme

---

## Epic 5: Import données crèche

Un parent peut saisir les données crèche en moins de 30 secondes via le mode batch.

### Story 5.1: Toast batch lait (import crèche)

As a parent,
I want saisir plusieurs biberons en séquence depuis la KPI card lait,
So that je peux importer les données crèche rapidement.

**Acceptance Criteria:**

**Given** je suis sur le dashboard
**When** je tape le CTA `+` de la KPI card lait
**Then** un toast batch s'ouvre avec l'icône SVG import (flèche vers le bas + plateau ouvert, stroke 2px, couleur accent orange)
**And** le toast contient un slider volume (même composant que le toast biberon live), un sélecteur de moment optionnel (Matin/Midi/Après-midi, aucun pré-sélectionné), et les boutons "Suivant" et "Terminer"

**Given** le toast batch lait est ouvert
**When** j'observe le comportement
**Then** il n'y a PAS de cooldown (pas d'auto-confirm)

**Given** le toast batch lait est ouvert
**When** la valeur par défaut du slider est affichée
**Then** elle est la moyenne des 10 derniers biberons (fallback : médiane de la range si aucun historique)

**Given** j'ai ajusté le slider et sélectionné "Midi"
**When** je tape "Suivant"
**Then** le biberon est enregistré individuellement (POST /api/events type='bottle', moment='noon')
**And** le sélecteur de moment se reset (aucun pré-sélectionné), le slider revient à la valeur par défaut (moyenne)
**And** la KPI card lait se met à jour immédiatement

**Given** j'ai saisi plusieurs biberons via "Suivant"
**When** je tape "Terminer"
**Then** le dernier biberon est enregistré et le toast se ferme

**Given** le toast batch est ouvert
**When** je tape ✕ ou je tape hors du toast
**Then** le toast se ferme sans enregistrer l'entrée en cours
**And** les entrées déjà ajoutées via "Suivant" restent enregistrées

### Story 5.2: Toast batch sommeil (import crèche)

As a parent,
I want saisir plusieurs siestes en séquence depuis la KPI card sommeil,
So that je peux importer les données sommeil de la crèche rapidement.

**Acceptance Criteria:**

**Given** je suis sur le dashboard
**When** je tape le CTA `+` de la KPI card sommeil
**Then** un toast batch s'ouvre avec l'icône SVG import (accent vert), un slider durée (pas de volume), un sélecteur de moment optionnel, et les boutons "Suivant" / "Terminer"

**Given** le toast batch sommeil est ouvert
**When** la valeur par défaut du slider est affichée
**Then** elle est la moyenne des 10 dernières siestes (fallback : médiane de la range si aucun historique)

**Given** j'ai ajusté le slider à 1h15 et sélectionné "Matin"
**When** je tape "Suivant"
**Then** la sieste est enregistrée (POST /api/events type='nap', value=75, moment='morning')
**And** le sélecteur de moment se reset, le slider revient à la valeur par défaut
**And** la KPI card sommeil se met à jour immédiatement

**Given** j'ai saisi des siestes via le batch sommeil
**When** je tape "Terminer"
**Then** la dernière sieste est enregistrée et le toast se ferme

**Given** le dernier événement enregistré est un import batch (avec moment au lieu de startTime)
**When** j'observe la hero card
**Then** elle affiche l'état sans durée (ex. "☀️ Éveillé" sans "depuis X") car il n'y a pas de timestamp précis

**Given** le toast batch est ouvert
**When** je tape ✕ ou je tape hors du toast
**Then** le toast se ferme sans enregistrer l'entrée en cours, les entrées déjà ajoutées via "Suivant" restent

---

## Epic 6: Profil bébé & paramètres

Les parents gèrent les informations du bébé et les zones cibles se recalculent automatiquement.

### Story 6.1: Page profil — édition informations bébé

As a parent,
I want modifier le prénom, la date de naissance et le poids de mon bébé depuis le profil,
So that les informations restent à jour et les zones cibles sont correctes.

**Acceptance Criteria:**

**Given** je suis sur la page profil (accès via "Prénom ⚙" dans le header)
**When** la page s'affiche
**Then** je vois un bouton retour ← en haut à gauche et la section "Informations bébé" avec le prénom, la date de naissance formatée (ex. "7 mars 2026"), et le poids formaté (ex. "4,2 kg")

**Given** je suis sur la page profil
**When** je tape sur le prénom
**Then** le champ devient éditable (inline editing), avec validation identique à l'onboarding (1-30 caractères)
**And** la sauvegarde se fait automatiquement au blur (PATCH /api/profiles)

**Given** je suis sur la page profil
**When** je tape sur la date de naissance
**Then** un date picker scroll wheels s'ouvre (même composant que l'onboarding)
**And** la sauvegarde se fait automatiquement à la validation

**Given** je suis sur la page profil
**When** je tape sur le poids
**Then** les scroll wheels poids s'ouvrent inline (kg|hg, même composant que l'onboarding) avec un bouton "OK" pour confirmer
**And** la sauvegarde se fait à la confirmation (PATCH /api/profiles)

**Given** je viens de modifier le poids du bébé
**When** la sauvegarde est confirmée
**Then** les zones cibles des KPI cards (lait et range slider biberon) se recalculent immédiatement
**And** pas de message de confirmation, le recalcul est transparent

**Given** je viens de modifier la date de naissance
**When** la sauvegarde est confirmée
**Then** la zone cible sommeil se recalcule immédiatement

### Story 6.2: Rappel de pesée mensuel

As a parent,
I want activer ou désactiver un rappel mensuel de pesée,
So that je pense à mettre à jour le poids régulièrement.

**Acceptance Criteria:**

**Given** je suis sur la page profil
**When** je vois la section "Rappel de pesée"
**Then** elle affiche le label "Rappel de pesée", la description "Un rappel mensuel pour mettre à jour le poids", et un toggle on/off (activé par défaut)

**Given** le rappel est activé et le bébé est né le 15
**When** le système calcule la date du prochain rappel
**Then** le rappel est programmé pour le 25 de chaque mois (jour de naissance + 10 jours)

**Given** le bébé est né le 30
**When** le système calcule le rappel pour février
**Then** le rappel est programmé pour le 28 février (dernier jour du mois)

**Given** je tape le toggle pour désactiver le rappel
**When** le toggle change d'état
**Then** le rappel est désactivé (PATCH /api/profiles, weight_reminder=false)

**Given** le rappel se déclenche
**When** je tape sur la notification push locale
**Then** le picker de poids s'ouvre dans un toast (scroll wheels kg|hg)

---

## Epic 7: Synchronisation temps réel

Les deux parents voient les mises à jour de l'autre en temps réel, sans refresh.

### Story 7.1: Supabase Realtime — sync inter-appareils

As a parent,
I want voir les saisies de l'autre parent apparaître automatiquement sur mon écran,
So that on partage les mêmes données sans se les envoyer.

**Acceptance Criteria:**

**Given** je suis connecté au dashboard
**When** le composant (app)/layout.tsx se monte
**Then** le hook useRealtimeSync subscribe au channel Supabase Realtime `household:{profileId}`
**And** il écoute les événements INSERT, UPDATE, DELETE sur pousse_events et UPDATE sur pousse_profiles

**Given** l'autre parent enregistre un biberon sur son appareil
**When** l'événement INSERT est broadcasté par Supabase Realtime
**Then** le nouvel événement apparaît dans mon récap, la KPI card lait se met à jour, sans refresh manuel
**And** la latence est < 5s (NFR)

**Given** l'autre parent modifie un événement (PATCH)
**When** l'événement UPDATE est broadcasté
**Then** la valeur mise à jour est reflétée dans mon récap et mes KPI cards

**Given** l'autre parent supprime un événement (DELETE)
**When** l'événement DELETE est broadcasté
**Then** l'événement disparaît de mon récap et les KPI cards se recalculent

**Given** l'autre parent déclenche une transition sommeil
**When** l'UPDATE de pousse_profiles (sleep_state) est broadcasté
**Then** ma hero card se met à jour (nouvel état, compteur), le thème bascule si nécessaire

**Given** je suis en mode démo (isDemo = true)
**When** le composant se monte
**Then** aucune subscription Realtime n'est créée (pas d'appel réseau en démo)

---

## Epic 8: Mode démo

Les visiteurs peuvent tester l'app avec des données réalistes avant de s'engager.

### Story 8.1: Mode démo complet

As a visiteur,
I want essayer l'app avec des données fictives réalistes,
So that je peux voir comment elle fonctionne avant de créer mon propre profil.

**Acceptance Criteria:**

**Given** je suis sur la landing screen
**When** je tape "Essayer la démo"
**Then** une session éphémère est créée et je suis redirigé vers le dashboard avec les données fictives

**Given** je suis en mode démo
**When** le dashboard s'affiche
**Then** les données montrent le bébé "Léo", ~4 mois, avec une journée réaliste figée à 17h30 (historique cohérent de biberons et siestes)
**And** les KPI cards, le récap et la hero card reflètent ces données générées

**Given** je suis en mode démo
**When** j'observe le haut de l'écran
**Then** un bandeau discret affiche "Mode démo — données non conservées" avec un CTA "Quitter"

**Given** je suis en mode démo
**When** j'ajoute un biberon, déclenche une transition sommeil, ou modifie un événement
**Then** toutes les fonctionnalités répondent normalement (saisie, édition, suppression, profil)
**And** les mutations sont effectuées en mémoire React state uniquement (aucun appel API, aucune écriture Supabase)

**Given** je suis en mode démo et j'ai fait des modifications
**When** je rafraîchis la page
**Then** les données reviennent à l'état de base (snapshot Léo 17h30) — les modifications ne sont pas persistées

**Given** je suis en mode démo
**When** un autre visiteur accède à la démo en parallèle
**Then** mes actions n'ont aucun impact sur son expérience (isolation totale, NFR9)

**Given** je suis en mode démo
**When** je tape "Quitter" sur le bandeau
**Then** je retourne à la landing screen et la session éphémère est terminée

**Given** je suis en mode démo
**When** j'observe les fonctionnalités absentes
**Then** il n'y a pas de code d'invitation, pas de multi-appareil (ces features n'ont pas de sens en démo)

---

## Epic 9 — Alignement Design × Implémentation

**Objectif** : Corriger les 20 écarts identifiés entre la maquette de référence (`docs/design-reference.html`) et le code implémenté, afin de rétablir l'identité visuelle et les interactions prévues dans le design.

**Audit de référence** : `docs/audit-design-vs-implementation.md`

**Priorité** : Critique — L'identité visuelle de l'app est compromise.

### FR Coverage

Pas de nouvelles FR. Cet epic corrige l'implémentation des FR existantes pour les aligner avec le design approuvé.

| Écarts | Stories |
|---|---|
| C1, C2, C3 (Critiques) | 9-1, 9-2 |
| H1, H2, H3, H4, H5 (Hautes) | 9-3, 9-4 |
| M1–M9 (Moyennes) | 9-1, 9-3, 9-5, 9-6 |
| B1, B2, B3 (Basses) | 9-2, 9-6 |

### Stories

| Story | Titre | Écarts couverts | Priorité | Dépendances |
|---|---|---|---|---|
| **9-1** | Fondation thème : variables CSS manquantes + gradients page | C2, C3, M3 | Critique | — |
| **9-2** | Hero Card : gradient, shadow, layout durée | C1, B2, B3 | Critique | 9-1 |
| **9-3** | Toast floating + cooldown border SVG rect arrondi | H2, H4, M1 (toasts) | Haute | 9-1 |
| **9-4** | Toast interactions : boutons ±1min, animation juice, tap hors toast | H1, H3, H5 | Haute | 9-3 |
| **9-5** | KPI cards & Progress bar : range colors, checkmark, import icon | M2, M3, M4, M5, M6 | Moyenne | 9-1 |
| **9-6** | Polish : formats durée/heure, emoji night-wake, feuilles landing | M7, M8, M9, B1 | Moyenne | — |

### Ordre d'exécution

```
9-1 ──→ 9-2
  │
  ├──→ 9-3 ──→ 9-4
  │
  └──→ 9-5

9-6 (indépendant, parallélisable)
```

### Story 9.1 — Fondation thème : variables CSS manquantes + gradients page

**As a** parent,
**I want** que l'app ait un fond subtilement dégradé et des couleurs de range/target distinctes par catégorie,
**So that** l'identité visuelle de samvabien soit cohérente avec le design.

**Écarts corrigés** : C2 (couleurs range/target absentes), C3 (gradients page absents), M3 (progress bar zone target sans bordure)

**Fichiers** : `globals.css`, `ProgressBar.tsx`

### Story 9.2 — Hero Card : gradient, shadow, layout durée

**As a** parent,
**I want** que la hero card affiche un gradient vert forêt signature avec une typographie hiérarchisée,
**So that** le dashboard ait l'identité visuelle forte prévue dans le design.

**Écarts corrigés** : C1 (fond plat → gradient), B2 (emoji 32px → 28px), B3 (subtitle 12px → 9px)

**Fichiers** : `HeroCard.tsx`

### Story 9.3 — Toast floating + cooldown border SVG rect arrondi

**As a** parent,
**I want** que le toast apparaisse comme un élément flottant avec une bordure cooldown animée,
**So that** l'interaction soit légère et le temps restant clairement visible.

**Écarts corrigés** : H2 (cercle → rect arrondi), H4 (modal → floating), M1 (border-radius toasts)

**Fichiers** : `Toast.tsx`, tous les toasts, nouveau `CooldownBorder.tsx`

### Story 9.4 — Toast interactions : boutons ±1min, animation juice, tap hors toast

**As a** parent,
**I want** pouvoir ajuster rapidement l'heure avec ±1 minute et voir une animation fluide,
**So that** l'interaction soit rapide et satisfaisante.

**Écarts corrigés** : H1 (boutons ±1 absents), H3 (animation simplifiée), H5 (tap hors toast)

**Fichiers** : `globals.css`, `ToastTransition.tsx`, `ToastBottle.tsx`, `Toast.tsx`

### Story 9.5 — KPI cards & Progress bar : range colors, checkmark, import icon

**As a** parent,
**I want** que les cartes KPI affichent les éléments visuels conformes (checkmark plein, icône import SVG, bordures de zone),
**So that** l'interface soit soignée et les informations immédiatement compréhensibles.

**Écarts corrigés** : M2 (+ → SVG import), M3 (bordure zone), M4 (shadow now), M5 (bordure avg), M6 (checkmark stroke → badge)

**Fichiers** : `ProgressBar.tsx`, `KpiCardMilk.tsx`, `KpiCardSleep.tsx`

### Story 9.6 — Polish : formats durée/heure, emoji night-wake, feuilles landing

**As a** parent francophone,
**I want** que les durées et heures soient dans le format compact français standard,
**So that** l'affichage soit naturel ("1h23", "14h30") et l'app visuellement complète.

**Écarts corrigés** : M7 (format durée), M8 (emoji 🌙 → 🫣), M9 (format heure), B1 (feuilles landing)

**Fichiers** : `format.ts`, `ToastEdit.tsx`, `LandingScreen.tsx`
