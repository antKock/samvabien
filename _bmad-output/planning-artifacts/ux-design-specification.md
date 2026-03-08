---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastUpdated: 2026-03-07
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-samvabien-2026-03-06.md
  - docs/brief.md
  - docs/ux-kpi-cards.md
  - docs/ux-recap-today.md
  - docs/ux-onboarding-profil.md
  - docs/ux-sleep-state-machine.md
  - docs/design-reference.html
date: 2026-03-06
author: Anthony
---

# UX Design Specification samvabien

**Author:** Anthony
**Date:** 2026-03-06

---

## Executive Summary

### Project Vision

samvabien est une PWA mobile one-hand friendly de suivi quotidien du sommeil et de l'alimentation d'un bébé. Conçue pour un couple de parents, elle propose un double mode de saisie (live temps réel + mode approximatif crèche) et un dashboard immédiat accessible dès l'ouverture. L'app adopte une logique de journée coucher→coucher et synchronise les données en temps réel entre les deux parents via un simple lien magique, sans compte ni login.

### Target Users

**Anthony (utilisateur principal data-driven)**
- Usage main droite, debout, bébé rarement dans les bras au moment de la saisie
- Gère l'import crèche : reçoit le débrief oral de l'assistante maternelle au pickup (siestes, biberons, notes diverses) et saisit ensuite de mémoire
- Orienté efficacité : veut des totaux immédiats et un accès rapide aux tendances multi-jours
- Consultation dashboard : coup d'œil rapide au quotidien, consultation posée pour les tendances

**Conjointe d'Anthony (utilisatrice quotidienne pratico-pratique)**
- Usage centré sur le temps réel : "depuis quand il est éveillé ?", "dernier biberon ?"
- Sensibilité visuelle : avis sur les couleurs, le look and feel de l'app
- Veut une app simple, claire, douce — pas un tableau de bord technique

### Key Design Challenges

1. **Saisie crèche en contexte réel** — L'information arrive à l'oral en rafale au moment du pickup. Le flow de saisie doit permettre de tout capturer rapidement (siestes, biberons) de mémoire, sans friction.

2. **Deux profils utilisateurs, une seule interface** — Concilier l'efficacité data-driven d'Anthony avec la simplicité visuelle et pratique recherchée par sa conjointe, sans compromettre l'un pour l'autre.

3. **Modèle journée coucher→coucher** — Rendre intuitif un découpage temporel non standard pour que l'utilisateur comprenne toujours à quelle "journée" il contribue.

4. **Réduction des clics vs Napper** — Les totaux du jour et les tendances passées doivent être accessibles en 0 à 1 clic maximum, là où Napper en demande trop.

### Design Opportunities

1. **Flow crèche par CTA `+`** — Chaque KPI card (lait, sommeil) a un bouton d'import dédié. Le toast batch permet de saisir plusieurs entrées en séquence (Suivant/Terminer), avec un moment de la journée optionnel (Matin/Midi/Après-midi).

2. **Dashboard à deux niveaux** — Vue "coup d'œil" par défaut avec les essentiels du jour, extensible vers les tendances par simple scroll ou tap — une seule surface, deux profondeurs d'information.

3. **Identité visuelle douce et fonctionnelle** — Palette pastel et typographie douce pour le plaisir visuel, combinées à une hiérarchie d'information claire et directe pour l'efficacité.

## Core User Experience

### Defining Experience

L'expérience de samvabien repose sur une asymétrie intentionnelle : la **saisie est le coût d'entrée** — nécessaire mais sans valeur propre, elle doit être réduite au strict minimum en temps et en friction. La **consultation est la récompense** — c'est là que la valeur se crée, avec un accès immédiat et sans effort à l'état de la journée de Sam.

L'action la plus fréquente est la saisie rapide d'un événement (biberon, début/fin de sieste, import crèche). L'action la plus critique est la consultation du dashboard : elle doit répondre instantanément à "où en est Sam ?" sans aucune navigation.

### Platform Strategy

- **PWA mobile** installée sur écran d'accueil iPhone (≥ iOS 16.4)
- **Touch-first**, optimisée main droite, usage debout
- **Pas de mode offline** — connexion réseau toujours disponible
- **Sync temps réel** entre les deux parents via le même lien magique
- **Notifications push** incluses dans le MVP (sieste en cours, rappels)

### Effortless Interactions

1. **Saisie biberon** — Entrer une quantité en mL en moins de 5 secondes, sans navigation
2. **Saisie sieste** — Un seul tap pour démarrer/arrêter le chrono
3. **Import crèche** — Capturer le débrief complet (siestes + biberons) en 30 secondes max via les CTA `+`
4. **Consultation dashboard** — Ouvrir l'app = voir immédiatement le résumé du jour, zéro clic
5. **Partage implicite** — Plus besoin d'envoyer un SMS avec les infos crèche : la conjointe voit tout apparaître en temps réel dès la saisie

### Critical Success Moments

1. **Moment "wow"** — Retour crèche : les infos sont saisies en 30 secondes, la conjointe les voit instantanément dans son dashboard sans SMS intermédiaire
2. **Première ouverture quotidienne** — Le dashboard affiche tout ce qu'il faut savoir sans aucune action
3. **Saisie live** — Pendant un biberon ou une sieste, l'enregistrement est fait en quelques secondes, une seule main
4. **Rendez-vous pédiatre** (post-MVP) — Les tendances sont prêtes en 1 tap

### Experience Principles

1. **La saisie est invisible** — Chaque interaction de saisie doit être si rapide qu'elle ne pèse pas dans la journée. Si ça prend plus de 5 secondes pour un événement simple, c'est trop.
2. **Le dashboard parle tout seul** — Aucune question ne doit rester sans réponse à l'ouverture de l'app. L'info est là, immédiate, lisible.
3. **L'app remplace le SMS** — Le partage d'information entre parents est un effet de bord naturel de l'usage, pas une action supplémentaire.
4. **Doux dehors, efficace dedans** — L'esthétique est douce et rassurante (pastel, typographie claire), mais la hiérarchie d'information est rigoureuse et directe.

## Desired Emotional Response

### Primary Emotional Goals

1. **Sérénité** — L'ouverture de l'app doit immédiatement rassurer : "tout va bien, je sais où on en est". Pas de chiffres alarmistes, pas de rouge, pas de jugement.
2. **Libération mentale** — Après chaque saisie, le sentiment dominant est "hop c'est fait, je peux oublier cette info et me concentrer sur mon bébé". L'app absorbe la charge mentale.
3. **Connexion entre parents** — L'app crée un lien discret et bienveillant. La notification crèche n'est pas juste une donnée — c'est un signal : "il a récupéré Sam, voilà comment s'est passée sa journée".

### Emotional Journey Mapping

| Moment | Émotion visée |
|---|---|
| Ouverture de l'app | Sérénité — "tout est là, tout va bien" |
| Saisie live (biberon/sieste) | Fluidité — "c'est fait en 2 secondes, j'y pense déjà plus" |
| Import crèche | Soulagement — "plus de SMS, plus de retranscription" |
| Réception notification crèche (conjointe) | Connexion — "il a récupéré Sam, je sais comment sa journée s'est passée" |
| Consultation dashboard le soir | Satisfaction calme — "bonne journée, tout est dans les clous" |
| Erreur / oubli de saisie | Bienveillance — "pas grave, tu peux ajouter quand tu veux" |

### Micro-Emotions

**À cultiver :**
- **Confiance** — L'app est fiable, les données sont justes, le chrono tourne même app fermée
- **Douceur** — L'interface ne stresse pas, les couleurs apaisent, le ton est bienveillant
- **Complicité** — L'app est "notre outil à nous", co-construit, adapté à notre routine

**À éviter absolument :**
- **Anxiété** — Jamais de rouge alarmiste, jamais de "attention il n'a pas assez mangé !" sur une seule journée
- **Culpabilité** — Pas de reproche implicite si on oublie de saisir, pas de "données manquantes !"
- **Frustration** — Jamais plus de 2 taps pour une action courante

### Design Implications

- **Sérénité** → Palette nature/olive, couleurs douces. Vert pour le sommeil, orange/ambre pour le lait. Pas de rouge alarmiste. Le checkmark n'apparaît que quand la zone cible médicale est atteinte — l'absence de checkmark n'est pas un signal négatif
- **Libération mentale** → Cooldown auto-confirm 5s, pas de modal de confirmation, retour immédiat au dashboard
- **Connexion** → Notification crèche rédigée avec chaleur ("Sam a été récupéré — voici sa journée à la crèche"), pas un log technique
- **Anti-anxiété** → Les données sont présentées factuellement, sans jugement. La zone cible médicale est affichée comme référence visuelle discrète (zone ombrée), pas comme un objectif à atteindre. Pas d'emoji triste ou de couleur rouge
- **Anti-culpabilité** → Saisie a posteriori toujours possible et encouragée. Pas de timestamp "en retard" visible

### Emotional Design Principles

1. **Si l'app ne dit rien, tout va bien** — Le silence de l'app est rassurant, pas inquiétant. L'absence d'alerte = tout est normal.
2. **L'info sans le stress** — Chaque donnée affichée est factuelle et neutre. Les chiffres informent, ils ne jugent pas.
3. **La douceur n'est pas un détail** — L'esthétique douce (couleurs, arrondis, animations subtiles) est un choix fonctionnel qui soutient la sérénité, pas un gadget cosmétique.
4. **Chaque notification est un geste d'attention** — Les notifications ne sont pas des rappels anxiogènes mais des moments de connexion ou d'information utile.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Napper (concurrent direct)**
- **Forces UX :** Chrono sieste live bien exécuté (un bouton pour démarrer, un pour arrêter), affichage "dernier biberon il y a Xh" immédiat, interface relativement simple
- **Faiblesses UX :** Saisie rigide imposant des horaires précis, trop de clics pour accéder aux totaux du jour et aux tendances, pas de mode approximatif pour la crèche

**Apps de suivi santé/habitudes (pattern général)**
- **Force clé :** Dashboard d'ouverture qui résume l'essentiel en un coup d'œil (Apple Health, Sleep Cycle)
- **Pattern retenu :** La première chose visible = le résumé, pas un formulaire de saisie

**Apps de messagerie/partage familial**
- **Force clé :** Sync temps réel transparente — les données apparaissent sans action du destinataire
- **Pattern retenu :** Le partage comme effet de bord, pas comme fonctionnalité active

### Transferable UX Patterns

**Navigation :**
- **Dashboard-first** — L'écran d'accueil EST le dashboard : hero card + KPI cards + récap. Pas de menu, pas de navigation
- **Toast pour la saisie** — Les formulaires de saisie apparaissent en toast en bas de l'écran, avec cooldown auto-confirm (5s). Le dashboard reste visible en arrière-plan

**Interaction :**
- **Hero card = contrôle sommeil** — Tap sur la hero card → toast de transition d'état (machine d'états 5 états). Action primaire contextuelle selon l'heure, avec alternative dans les zones d'ambiguïté. Cf. `docs/ux-sleep-state-machine.md`
- **Slider pour les mL** — Slider horizontal par pas de 10 mL, valeur affichée au-dessus du thumb. Défaut = moyenne des 10 derniers biberons
- **CTA `+` = import crèche** — Bouton sur chaque KPI card pour la saisie batch (données crèche). Même toast mais sans cooldown, avec sélecteur de moment (Matin/Midi/Après-midi) et boutons Suivant/Terminer. Cf. `docs/ux-kpi-cards.md`
- **Cooldown auto-confirm** — Les toasts live expirent après 5s (bordure animée anti-horaire). Tap hors toast = confirme l'action

**Visuel :**
- **Typographie large et lisible** — Chiffres grands et gras pour les totaux (mL, heures), texte secondaire plus petit pour les détails
- **Couleurs sémantiques par catégorie** — Vert/olive pour le sommeil, orange/ambre pour le lait. Chaque catégorie utilise ses propres couleurs pour tous ses éléments

### Anti-Patterns to Avoid

1. **Formulaires longs avec champs obligatoires** — Jamais de validation bloquante sur la saisie. Si un champ est vide, on accepte quand même
2. **Historique chronologique comme vue par défaut** — La timeline détaillée n'est pas ce qu'on veut voir en premier. Le résumé agrégé prime
3. **Modals de confirmation** — "Êtes-vous sûr de vouloir enregistrer ce biberon ?" → Non. On enregistre, point. Undo silencieux si erreur
4. **Onboarding en 5 écrans** — Setup minimal : prénom du bébé, date de naissance, c'est parti. Le reste peut venir après
5. **Gamification / scores / badges** — Incompatible avec l'objectif de sérénité. Le suivi bébé n'est pas un jeu

### Design Inspiration Strategy

**Adopter :**
- Dashboard-first : hero card + KPI cards + récap, totaux visibles en 0 clic
- Toast avec cooldown auto-confirm pour les saisies rapides
- Machine d'états sommeil avec transitions contextuelles selon l'heure
- Sync temps réel transparente sans action utilisateur

**Adapter :**
- Le chrono sieste de Napper → hero card avec compteur temps réel, persisté côté serveur
- Les cards d'Apple Health → KPI cards avec progress bar, zone cible médicale, moyenne 3j
- Le pattern de notification de messagerie → notifications chaleur pour la conjointe

**Éviter :**
- La rigidité horaire de Napper
- Les dashboards cliniques/techniques type app santé adulte
- Toute forme de gamification ou de scoring parental

## Design System Foundation

### Design System Choice

**Tailwind CSS + composants headless** — Système thémable avec liberté visuelle totale.

- **Tailwind CSS** pour le styling utilitaire et la personnalisation complète de l'identité visuelle (palette pastel, arrondis, espacements)
- **Composants headless** (Radix UI / Headless UI) pour les interactions accessibles et fonctionnelles (bottom sheets, accordéons, toggles) sans style imposé
- Stack familière pour Anthony, utilisée sur tous ses projets

### Rationale for Selection

1. **Liberté visuelle totale** — L'identité douce et pastel de samvabien nécessite un contrôle complet sur chaque détail visuel, impossible avec un design system pré-stylé comme Material Design
2. **Vitesse de développement** — Tailwind + headless permet de prototyper et itérer rapidement, essentiel pour un projet personnel solo
3. **Expertise existante** — Anthony utilise déjà cette stack au quotidien, zéro courbe d'apprentissage
4. **Accessibilité intégrée** — Les composants headless gèrent nativement le focus, les rôles ARIA et la navigation clavier
5. **Maintenance légère** — Pas de dépendance à un design system tiers qui pourrait évoluer dans une direction non souhaitée

### Implementation Approach

- **Design tokens Tailwind** : palette pastel personnalisée, arrondis généreux, typographie douce définis dans `tailwind.config`
- **Composants headless** : toasts, time picker (scroll wheels), toggles — comportement accessible, style maison
- **Composants maison** : hero card, KPI cards, progress bars, sliders, récap — construits sur mesure avec Tailwind

### Customization Strategy

- **Palette de couleurs** : palette nature/olive — tons verts pour le sommeil, tons chauds orange/ambre pour le lait
- **Typographie** : police arrondie et douce, chiffres grands et lisibles pour les totaux
- **Arrondis et ombres** : coins généreux (rounded-2xl+), ombres douces pour la profondeur sans agressivité
- **Animations** : cooldown bordure animée (5s anti-horaire), transitions de thème jour/nuit, feedback toast — pas d'animations gratuites
- **Responsive** : design mobile-only, optimisé 375-430px de large (tailles iPhone standard)

## Core User Experience — Defining Interaction

### Defining Experience

> **"Saisis en 5 secondes, sache tout en un coup d'œil"**

samvabien est un **tableau de bord temps réel** de la journée de Sam. L'expérience définissante est le cycle **saisie→mise à jour immédiate du dashboard** : chaque donnée entrée met à jour les totaux visibles par les deux parents instantanément.

Le moment différenciant : le **retour crèche**. L'assistante maternelle donne le débrief oral, Anthony note les infos brutes dans un SMS, puis les traduit dans l'app en rentrant chez lui. 30 secondes de saisie → le dashboard se met à jour → sa conjointe reçoit une notification et voit la journée complète. Le SMS de résumé à la conjointe est mort.

### User Mental Model

**Modèle mental : tableau de bord**
- L'app est un écran de contrôle, pas un carnet qu'on remplit. On le consulte pour savoir "où en est Sam", on y entre des données pour le tenir à jour.
- Le dashboard EST l'app. La saisie est un moyen, pas une fin.

**Modèle actuel (Napper + SMS) :**
1. Saisie live dans Napper (biberon, sieste) — ça marche bien
2. Au pickup crèche : débrief oral → SMS à la conjointe avec les infos brutes
3. À la maison : retranscription du SMS dans Napper avec des horaires inventés
4. Consultation des totaux : plusieurs clics dans Napper

**Modèle cible (samvabien) :**
1. Saisie live dans samvabien — identique, mais plus rapide
2. Au pickup crèche : débrief oral → SMS mémo perso (habitude conservée)
3. À la maison : traduction du SMS dans le mode crèche (durées + moments, pas d'horaires) — 30 secondes
4. Consultation : ouvrir l'app = voir les totaux immédiatement

### Success Criteria

1. **Saisie biberon** : quantité entrée et dashboard mis à jour en < 5 secondes
2. **Saisie sieste** : 1 tap pour démarrer, 1 tap pour arrêter
3. **Import crèche** : débrief complet saisi en < 30 secondes
4. **Dashboard** : totaux du jour visibles en 0 clic à l'ouverture
5. **Sync** : la conjointe voit les nouvelles données en < 5 secondes
6. **Feedback** : pas de modal, pas de confirmation — le dashboard se met à jour, c'est tout

### Novel UX Patterns

**Patterns établis (pas besoin d'éduquer) :**
- Dashboard avec cartes de résumé (familier : apps santé, météo)
- Toast en bas de l'écran (familier : Material Design, iOS)
- Slider horizontal pour les valeurs numériques (familier)
- Scroll wheels pour le time picker (familier : iOS natif)

**Pattern adapté (légèrement nouveau) :**
- **Cooldown auto-confirm** — Le toast se confirme automatiquement après 5s (bordure animée). Réduit les taps sans surprendre, car l'action la plus probable est déjà sélectionnée.
- **Hero card comme contrôle d'état** — Tap sur la carte centrale déclenche la transition d'état du bébé. L'action proposée est contextuelle selon l'heure.
- **Import crèche via CTA `+`** — Saisie batch par moment de la journée (Matin/Midi/Après-midi) au lieu d'horaires précis.

**Aucun pattern vraiment novel** — samvabien combine des patterns familiers de manière intelligente, ce qui élimine toute courbe d'apprentissage.

### Experience Mechanics

**1. Saisie biberon (live) :**
- Initiation : tap sur la KPI card lait
- Interaction : toast biberon avec slider horizontal (pas de 10 mL), valeur par défaut = moyenne des 10 derniers biberons, tap sur l'heure → time picker (scroll wheels)
- Feedback : cooldown 5s → auto-confirm, KPI card se met à jour, événement apparaît dans le récap
- Durée cible : < 5 secondes
- Cf. `docs/ux-kpi-cards.md` § Interactions

**2. Transition sommeil (live) :**
- Initiation : tap sur la hero card
- Interaction : toast avec action primaire contextuelle (sieste/coucher/réveil selon l'heure et l'état), bouton alt dans les zones d'ambiguïté, cooldown 5s → auto-confirm
- Feedback : la hero card change d'état (emoji, label, compteur temps réel), le thème bascule jour/nuit
- Cf. `docs/ux-sleep-state-machine.md`

**3. Import crèche (batch) :**
- Initiation : tap sur le CTA `+` de la KPI card (lait ou sommeil)
- Interaction : toast sans cooldown, sélecteur de moment (Matin/Midi/Après-midi), slider volume ou durée, boutons Suivant (enregistre + réouvre) / Terminer (enregistre + ferme)
- Feedback : chaque "Suivant" enregistre l'entrée, les KPI cards se mettent à jour
- Chaque domaine est cloisonné : le `+` lait ne saisit que du lait
- Cf. `docs/ux-kpi-cards.md` § Tap sur le +

**4. Consultation dashboard :**
- Initiation : ouvrir l'app
- Interaction : aucune — tout est visible immédiatement
- Contenu : hero card (état sommeil + durée), 2 KPI cards (lait + sommeil avec progress bar, zone cible, moyenne 3j), récap antéchronologique
- Profondeur : scroll vers le bas pour le journal de la journée
- Cf. `docs/ux-recap-today.md`

## Visual Design Foundation

### Color System

**Palette retenue : Nature / Olive** — tons chauds et végétaux, validée.

Deux catégories de données, chacune avec sa propre palette :
- **Sommeil** : tons verts (olive, sauge)
- **Lait** : tons chauds (orange, ambre)

**Mode Jour :**
- **Background** : `#f6f5ee` (beige chaud)
- **Surface** : `#ffffff` (blanc pur pour les cartes)
- **Text** : `#32321e` (olive très foncé)
- **Text secondary** : `#8a8870` (olive grisé)
- **Sommeil** : bg `#eaecda` / accent `#8a9a6a` / icône `#6a7a4a`
- **Lait** : bg `#f5e6d6` / accent `#c08a60` / icône `#a06840`
- **Hero text** : `#4a5a32` (vert feuille)
- **Border** : `rgba(0,0,0,0.06)`
- **Track** (progress bar vide) : `#dce0cc`

**Mode Nuit :**
- **Background** : `#181810` (olive très sombre)
- **Surface** : `#22221a` (olive nuit)
- **Text** : `#c8c8b0` (beige clair)
- **Text secondary** : `#7a7a60`
- **Sommeil** : bg `#222818` / accent `#7a8a5a` / icône `#98a878`
- **Lait** : bg `#261e14` / accent `#b08050` / icône `#cca070`
- **Hero text** : `#98a878` (vert doux)
- **Border** : `rgba(255,255,255,0.06)`
- **Track** : `#3e402e`

**Bascule jour/nuit :**
- Pilotée par l'**état du bébé** (machine d'états sommeil), pas par les préférences système
- `awake` → thème jour (light)
- `nap`, `night`, `night-wake`, `night-sleep` → thème nuit (dark)
- Cf. `docs/ux-sleep-state-machine.md` pour la machine d'états complète

**Référence visuelle :** `docs/design-reference.html` — maquettes pixel-perfect avec les couleurs exactes

### Typography System

**Police principale : Nunito** (arrondie et douce)
- Disponible via Google Fonts, excellente lisibilité mobile
- Rondeur naturelle qui soutient l'identité douce de samvabien

**Échelle typographique :**
- **KPI values** : 26px, weight 800 — les chiffres dominants (480 mL, 12h40)
- **Timer/chrono** : 20px, weight 800 — durée sieste en cours
- **Baby name** : 24px, weight 800 — header dashboard
- **Section titles** : 16px, weight 800 — titres bottom sheet
- **Body/labels** : 13-14px, weight 600-700 — texte courant
- **Captions** : 11-12px, weight 600 — timestamps, sous-titres, détails
- **Micro** : 9-10px, weight 700 — labels swatches, badges

**Principes :**
- Les chiffres sont toujours plus gros que le texte
- Weight 800 pour tout ce qui est important, 600 pour le reste
- Jamais de weight 400 (trop léger sur mobile)

### Spacing & Layout Foundation

**Principe : Deux densités**
1. **Zone aérée (haut)** — Les 2-3 KPIs clés, sans scroll. Espacement généreux, cartes larges, chiffres dominants. C'est la zone "coup d'œil".
2. **Zone dense (scroll)** — Le détail chronologique de la journée. Espacement compact, lignes serrées, efficacité maximale.

**Système d'espacement :** base 4px
- `4px` : micro-gaps (entre label et value)
- `8px` : gap intra-composant
- `12px` : gap entre items de liste (zone dense)
- `16px` : padding de page, gap entre sections
- `20px` : padding des cartes KPI
- `24px` : gap entre sections majeures

**Arrondis :**
- `14-16px` : icônes, badges, status
- `20px` : cartes KPI, hero card, toast
- `32px` : phone frame, toast top corners

**Layout :**
- Single column, pleine largeur (375-430px)
- Pas de grille multi-colonnes
- Toasts : apparaissent en bas de l'écran, le dashboard reste visible en arrière-plan

### Accessibility Considerations

- **Contraste** : toutes les combinaisons texte/fond respectent WCAG AA (ratio ≥ 4.5:1 pour le texte, ≥ 3:1 pour les éléments UI)
- **Mode nuit** : conçu pour ne pas éblouir à 3h du matin, avec des accents suffisamment contrastés pour rester lisibles
- **Touch targets** : minimum 44px pour tous les boutons et éléments interactifs (guideline Apple)
- **Taille de police** : jamais en dessous de 11px, même pour les captions
- **Pas de couleur comme seul indicateur** : toujours un label ou une icône en complément

## Detailed UX Specifications

Les spécifications UX détaillées sont documentées dans des fichiers dédiés. Ce document reste la source de vérité pour la vision, les principes et le design system ; les docs ci-dessous spécifient le comportement exact de chaque composant.

### Machine d'états sommeil

**Fichier :** `docs/ux-sleep-state-machine.md`

5 états (`awake`, `nap`, `night`, `night-wake`, `night-sleep`) avec transitions contextuelles selon l'heure. Définit le comportement de la hero card (tap → toast de transition), les seuils horaires, les actions primaires/alternatives, le time picker, et le bootstrap/persistance.

### KPI Cards

**Fichier :** `docs/ux-kpi-cards.md`

Deux cartes (Lait + Sommeil) avec progress bar, zone cible médicale (basée sur le poids/âge du bébé), moyenne glissante 3 jours contextualisée à l'heure. Définit la fenêtre de données coucher→coucher, le comportement dynamique temps réel, le toast biberon (tap live), le mode batch import crèche (CTA `+`), et les états initiaux.

### Récap Aujourd'hui

**Fichier :** `docs/ux-recap-today.md`

Liste antéchronologique des événements du cycle en cours (nuit, réveils nocturnes, siestes, biberons). Définit l'anatomie des lignes, le regroupement des événements nocturnes, le tri des imports sans heure précise, le toast d'édition (tap sur une ligne), la suppression avec undo, et l'état vide.

### Onboarding & Profil

**Fichier :** `docs/ux-onboarding-profil.md`

Landing screen (3 CTA : démo, créer, rejoindre), onboarding 3 champs (prénom, date de naissance, poids via scroll wheels), banner de bienvenue avec code d'invitation, mode démo, page profil (édition inline, rappel de pesée, gestion foyer/appareils), sessions JWT. Basé sur le modèle foyer du projet atable.

### Maquettes de référence

**Fichier :** `docs/design-reference.html`

Maquettes pixel-perfect (~1500 lignes) couvrant toutes les vues : hero card (tous les états + flow), KPI cards (jour/nuit, avec/sans données), toasts (transition, biberon live, batch import, time picker, édition, undo), récap, landing, onboarding, profil, join, banner de bienvenue, mode démo, hero card post-import crèche. Contient les couleurs exactes (`COLORS` object) et les données de démo.
