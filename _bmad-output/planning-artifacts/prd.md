---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: brownfield
inputDocuments:
  - docs/brief.md
  - docs/ux-recap-today.md
  - docs/ux-kpi-cards.md
  - docs/ux-sleep-state-machine.md
  - docs/ux-onboarding-profil.md
  - _bmad-output/planning-artifacts/product-brief-samvabien-2026-03-06.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'prd'
documentCounts:
  briefs: 2
  research: 0
  brainstorming: 0
  projectDocs: 5
  uxDesign: 1
---

# Product Requirements Document - samvabien

**Author:** Anthony
**Date:** 2026-03-08

## Executive Summary

samvabien est une PWA mobile de suivi quotidien du sommeil et de l'alimentation d'un bébé, conçue pour un couple de parents. L'app propose un double mode de saisie — live (chrono serveur-side, biberons en un tap) et approximatif (durées + moments de la journée pour les retours crèche) — et un dashboard immédiat visible dès l'ouverture, sans navigation. Les données sont synchronisées en temps réel entre les deux parents via un foyer partagé par code d'invitation, sans compte individuel ni login.

L'app adopte une logique de journée coucher→coucher (pas minuit-à-minuit), une identité visuelle douce et non anxiogène (palette nature/olive), et une philosophie "si l'app ne dit rien, tout va bien". L'architecture reprend le modèle foyer/sessions/invitations du projet atable (JWT, Supabase).

Utilisateurs cibles : Anthony (data-driven, gère l'import crèche et les tendances) et sa conjointe (pratico-pratique, centrée sur le temps réel et la journée en cours). Deux profils, une seule interface simple.

### Ce qui rend samvabien unique

**Flexibilité de saisie unique.** Là où les concurrents (Napper) imposent des horaires précis pour chaque événement, samvabien accepte les données approximatives de la crèche — "1h de sieste le matin", "150 mL à midi" — sans inventer de timestamps. Le moment différenciant : le débrief crèche saisi en 30 secondes au lieu de 3 minutes, la conjointe qui voit tout apparaître instantanément dans son dashboard, le SMS de résumé devenu inutile.

**Asymétrie intentionnelle.** La saisie est un coût d'entrée minimisé (< 5s par événement, cooldown auto-confirm 5s, zéro modal). La consultation est la récompense : dashboard complet en 0 clic, KPI cards avec progression temps réel, zone cible médicale, moyenne glissante 3 jours.

**Sérénité par design.** Pas de rouge alarmiste, pas de culpabilité, pas de gamification. Les données informent sans juger. Le checkmark n'apparaît que quand la zone cible est atteinte — son absence n'est pas un signal négatif.

## Project Classification

- **Type :** Web app (PWA mobile-first, SPA, temps réel)
- **Domaine :** Général (suivi personnel/famille, pas de contrainte réglementaire)
- **Complexité :** Faible (2 utilisateurs, projet personnel, pas de compliance)
- **Contexte :** Brownfield (documentation UX détaillée existante, référence architecturale atable)

## Success Criteria

### User Success

- **L'app remplace Napper** et est utilisée quotidiennement par les deux parents après 1 mois
- **L'app est devenue invisible** dans la routine — on ne stresse plus sur le suivi, c'est un réflexe naturel qui ne pèse pas
- **Le SMS crèche est mort** — la conjointe n'a plus besoin qu'Anthony lui envoie un résumé, elle voit tout apparaître dans son dashboard
- **Saisie biberon** : quantité entrée et dashboard mis à jour en < 5 secondes
- **Saisie sieste** : 1 tap pour démarrer, 1 tap pour arrêter
- **Import crèche** : débrief complet saisi en < 30 secondes
- **Dashboard** : totaux du jour visibles en 0 clic à l'ouverture
- **Sync** : les nouvelles données apparaissent chez l'autre parent en < 5 secondes

### Business Success

N/A — Projet personnel. Le seul indicateur : est-ce qu'on s'en sert tous les jours au bout d'un mois ?

### Technical Success

- **Chrono serveur-side fiable** : le timer sieste/nuit survit à la fermeture de l'app, à la perte réseau, et au redémarrage du téléphone. À la réouverture, la durée écoulée est correcte à la seconde près.
- **Sync temps réel** : les données apparaissent sur l'autre appareil en < 5 secondes, sans refresh manuel
- **PWA installable** : fonctionne comme une app native depuis l'écran d'accueil sur iPhone ≥ iOS 16.4
- **Fiabilité réseau** : en cas de perte réseau pendant une saisie, un message d'erreur clair est affiché — la connexion réseau est attendue en usage normal

### Measurable Outcomes

| Indicateur | Cible |
|---|---|
| Napper désinstallé | Oui, dans les 2 premières semaines |
| Usage quotidien (2 parents) | ≥ 1 mois continu |
| Temps saisie biberon | < 5s |
| Temps import crèche complet | < 30s |
| Latence sync inter-appareils | < 5s |
| Taps pour voir les totaux du jour | 0 |

## Scope & Roadmap

### Stratégie MVP

**Approche : Experience MVP** — Le minimum n'est pas un produit dégradé, c'est l'expérience complète de suivi quotidien. Chaque feature du MVP existe parce qu'elle est nécessaire pour remplacer Napper au jour 1.

**Ressources** : 1 développeur (Anthony), assisté par IA.

**Critère de découpage** : le MVP est indivisible du point de vue utilisateur. L'ordre d'implémentation est une décision de développement — le produit n'est livré que quand tout est fonctionnel.

### MVP (Phase 1) — Intégralité de la spec UX

**Journeys supportés :** Import crèche, saisie live, join foyer, démo, édition/correction.

**Onboarding & Accès**
- Landing screen (démo, créer, rejoindre)
- Onboarding 3 champs (prénom, date de naissance, poids)
- Foyer partagé par code d'invitation (modèle atable)
- Sessions JWT, multi-appareil
- Mode démo avec données fictives

**Dashboard principal**
- Hero card avec machine d'états sommeil (5 états, transitions contextuelles selon l'heure)
- 2 KPI cards (lait + sommeil) avec progress bar, zone cible médicale, moyenne glissante 3 jours
- Récap antéchronologique des événements du cycle
- Logique journée coucher→coucher

**Saisie live**
- Toast biberon avec slider, cooldown auto-confirm 5s
- Transitions sommeil via hero card (sieste, nuit, réveils nocturnes)
- Time picker scroll wheels
- Chrono serveur-side

**Saisie crèche (batch)**
- CTA `+` sur chaque KPI card
- Saisie multiple (Suivant/Terminer)
- Sélecteur moment de la journée (Matin/Midi/Après-midi)

**Profil**
- Édition inline (prénom, date de naissance, poids)
- Rappel de pesée mensuel
- Gestion foyer (code, appareils, révoquer)

**Thème visuel**
- Palette nature/olive, bascule jour/nuit pilotée par l'état du bébé
- Police Nunito, design mobile-only (375-430px)

### Phase 2 — Growth

- Alertes intelligentes non anxiogènes (hors norme 3+ jours)
- Vue tendances 7 jours avec métriques moyennées
- Notifications push (sieste en cours, rappels)
- Export texte 3/7 jours pour partage avec ChatGPT/pédiatre

### Phase 3 — Vision

- Tags symptômes (selles, fièvre, etc.)
- Ouverture à d'autres couples de parents
- Bandeau sticky condensé au scroll

## User Journeys

### Journey 1 : Anthony — Import crèche au pickup

**Opening Scene.** 17h45, devant la crèche. L'assistante maternelle débriefe : "Il a bien dormi ce matin, 1h15 environ. Un biberon de 180 à midi, un petit de 120 dans l'après-midi, et une sieste de 45 minutes après le goûter." Anthony hoche la tête, installe Sam dans la voiture, et sort son téléphone.

**Rising Action.** Il ouvre samvabien. Le dashboard affiche l'état du matin — le dernier biberon de 150 mL donné avant la crèche, la sieste live de 45 minutes enregistrée par sa conjointe. Il tape le `+` de la carte lait. Toast batch : slider à 180 mL (moyenne des derniers biberons), sélecteur "Midi". Suivant. Slider à 120, sélecteur "Après-midi". Terminer. Puis le `+` de la carte sommeil : slider à 1h15, sélecteur "Matin". Suivant. Slider à 45 min, "Après-midi". Terminer.

**Climax.** 30 secondes. Les KPI cards se mettent à jour instantanément — 450 mL sur la journée, 2h45 de sommeil de jour. Le bar-fill progresse, la zone cible est presque atteinte. Au même moment, sa conjointe reçoit la mise à jour sur son téléphone. Pas de SMS envoyé. Pas de retranscription laborieuse. C'est fait.

**Resolution.** Anthony range son téléphone et démarre. En arrivant, sa conjointe a déjà vu la journée complète de Sam. "Il a bien mangé aujourd'hui." Pas de question, pas de SMS à relire. L'information a circulé toute seule.

### Journey 2 : Conjointe — Saisie live et consultation

**Opening Scene.** 14h, à la maison. Sam commence à frotter ses yeux. La conjointe le pose dans son lit et attrape son téléphone d'une main.

**Rising Action.** Elle ouvre samvabien. La hero card affiche "☀️ Éveillé depuis 3h12". Elle tape dessus. Le toast propose "😴 Sieste" en action primaire (on est à 14h, pas d'ambiguïté). Le cooldown de 5 secondes démarre. Elle ne touche à rien — la bonne action est déjà sélectionnée. Le toast se confirme automatiquement.

**Climax.** La hero card bascule en mode nuit : "😴 Dort depuis 0min". Le thème passe en dark. Le compteur tourne. Elle ferme l'app et vaque à ses occupations. 1h20 plus tard, Sam pleure. Elle rouvre l'app : "😴 Dort depuis 1h20". Tap sur la hero card → "☀️ Fin de sieste". Auto-confirm. La KPI sommeil se met à jour, la sieste apparaît dans le récap.

**Resolution.** Coup d'œil au dashboard : 300 mL de lait (le biberon du matin), 1h20 de sommeil, zone cible en bonne voie. "Il va bientôt réclamer à manger." Elle prépare le biberon. Quand Sam a bu, elle tape la carte lait : slider à 150 mL, cooldown, confirmé. Tout est à jour en 3 secondes.

### Journey 3 : Second parent — Rejoindre le foyer

**Opening Scene.** Jour J, Anthony vient de créer le foyer. Le banner de bienvenue s'affiche avec le code `OLVR-4821`. Il tape "Copier le lien" et l'envoie par iMessage à sa conjointe.

**Rising Action.** Elle reçoit le lien, tape dessus. Safari ouvre samvabien sur l'écran de join. Le code est pré-rempli (lien `/join/OLVR-4821`). Validation automatique — le foyer est trouvé. Session créée, cookie JWT posé.

**Climax.** Elle arrive sur le dashboard. Les données de Sam sont là — le prénom, l'âge, le poids, le biberon qu'Anthony vient d'enregistrer. C'est le même foyer, les mêmes données, instantanément.

**Resolution.** Elle ajoute samvabien sur son écran d'accueil (PWA). À partir de maintenant, chaque saisie de l'un est visible par l'autre en temps réel. Aucune config supplémentaire nécessaire.

### Journey 4 : Nouveau visiteur — Mode démo

**Opening Scene.** Un ami parent curieux reçoit le lien de samvabien. Il ouvre l'app et tombe sur le landing screen.

**Rising Action.** Il tape "Essayer la démo". Session éphémère créée. Le dashboard s'affiche avec les données fictives de "Léo", 4 mois — une journée réaliste figée à 17h30, avec biberons, siestes, KPI cards remplies, récap complet. Un bandeau discret en haut rappelle "Mode démo — données non conservées".

**Climax.** Il explore : tape sur la hero card pour voir le toast de transition, ajoute un biberon pour tester le slider, consulte le profil. Tout fonctionne normalement. Il comprend le concept en 30 secondes.

**Resolution.** S'il veut l'utiliser pour son propre bébé, il tape "Quitter" sur le bandeau démo, retourne au landing, et crée son propre profil. Les données démo ne polluent rien.

### Journey 5 : Anthony — Édition et correction d'erreur

**Opening Scene.** 20h, après le coucher de Sam. Anthony consulte le récap de la journée et remarque que le biberon de midi est enregistré à 120 mL — il se souvient que c'était 150 mL, il a fait une erreur à l'import crèche.

**Rising Action.** Il tape sur la ligne "Biberon — Midi — 120 mL" dans le récap. Le toast d'édition s'ouvre avec le slider prérempli à 120 mL. Il ajuste à 150 mL.

**Climax.** Il tape "Enregistrer". Le toast se ferme, la ligne du récap affiche "150 mL", la KPI card lait se recalcule instantanément (+30 mL).

**Resolution.** Correction faite en 3 secondes, pas de modal de confirmation, pas de friction. Les données sont justes.

### Journey Requirements Summary

| Journey | Capacités révélées |
|---|---|
| Import crèche | Toast batch, slider volume/durée, sélecteur moment, boutons Suivant/Terminer, sync temps réel |
| Saisie live + consultation | Hero card, machine d'états sommeil, toast transition avec cooldown, KPI cards temps réel, chrono serveur-side |
| Rejoindre le foyer | Landing screen, join flow avec auto-lookup, lien d'invitation, session JWT, PWA installable |
| Mode démo | Session éphémère, données fictives cohérentes, bandeau démo, isolation des données |
| Édition / correction | Toast d'édition depuis le récap, slider prérempli, recalcul KPI immédiat |

## Web App Specific Requirements

### Project-Type Overview

PWA mobile-first (SPA) installable sur écran d'accueil iPhone. Conçue et optimisée pour Safari iOS ≥ 16.4, mais ne doit pas casser sur Android ou desktop — dégradation gracieuse acceptable, pas de blocage.

### Browser & Platform Support

| Plateforme | Niveau de support |
|---|---|
| **Safari iOS ≥ 16.4** | Cible principale, optimisé et testé |
| **Android / Chrome mobile** | Ne doit pas casser, pas d'optimisation spécifique |
| **Desktop (Chrome, Safari, Firefox)** | Ne doit pas casser, pas d'optimisation spécifique |

### PWA Requirements

- **Manifest** : nom "pousse", icône, couleurs thème, display standalone
- **Installation** : installable sur écran d'accueil iOS via "Ajouter à l'écran d'accueil"
- **Service Worker** : cache des assets statiques pour un chargement rapide. Pas de mode offline — connexion réseau attendue.

### Real-time & Synchronisation

- **Besoin fonctionnel** : les données saisies par un parent apparaissent chez l'autre en quelques secondes, sans refresh manuel
- **Implémentation** : à définir avec l'architecte (Supabase Realtime, polling, SSE, ou autre). Le PRD ne prescrit pas la techno.
- **Chrono serveur-side** : l'état sommeil (état + timestamp de début) est persisté côté serveur. L'app calcule la durée écoulée côté client à partir de ce timestamp.

### Accessibility

- Contraste WCAG AA minimum
- Touch targets ≥ 44px
- Taille de police minimum 11px
- Pas de support lecteur d'écran prioritaire

### SEO

Aucun besoin. App privée, accès par lien d'invitation uniquement.

### Implementation Considerations

- **Stack de référence** : le projet atable fournit l'architecture de base (JWT, Supabase, sessions, foyer). L'architecte adaptera avec les tables préfixées `pousse_`.
- **Design tokens** : palette nature/olive, police Nunito, arrondis généreux — définis dans la config Tailwind
- **Responsive** : design mobile-only 375-430px. Sur écrans plus larges, le contenu est centré avec une largeur max (pas de layout desktop dédié).

## Risk Mitigation

**Risques techniques :**
- **Sync temps réel sur PWA iOS** — Les capacités PWA sur iOS sont plus limitées que sur Android (pas de background sync fiable, service workers limités). Mitigation : l'architecte évalue les options (Supabase Realtime, polling, SSE) et choisit la plus fiable sur Safari iOS.
- **Chrono serveur-side** — Le timer doit survivre à la fermeture de l'app. Mitigation : pas de timer client-side, seulement un timestamp de début persisté côté serveur. L'app recalcule la durée à chaque ouverture.
- **Mode démo sans pollution** — Les actions du visiteur ne doivent pas altérer les données de base. Mitigation : session storage uniquement, pas d'écriture en base.

**Risques produit :**
- **Adoption par la conjointe** — Si l'interface n'est pas assez simple ou douce, elle ne l'utilisera pas. Mitigation : co-design avec elle, itération rapide sur le look & feel.
- **Saisie crèche trop lente** — Si l'import batch prend plus de 30s, le SMS reste plus pratique. Mitigation : les valeurs par défaut (moyenne 10 derniers) et le sélecteur de moment réduisent le nombre de taps au minimum.

**Risques de ressources :**
- **Projet solo** — Un seul développeur. Mitigation : réutilisation maximale du code atable (auth, sessions, foyer), spec UX très détaillée qui réduit les allers-retours de décision.

## Functional Requirements

### Onboarding & Accès

- **FR1** : Un visiteur peut créer un nouveau foyer en renseignant le prénom du bébé, sa date de naissance et son poids
- **FR2** : Un visiteur peut rejoindre un foyer existant via un code d'invitation ou un lien d'invitation
- **FR3** : Un visiteur peut essayer l'app en mode démo avec des données fictives (cf. `docs/ux-onboarding-profil.md` § Données démo)
- **FR4** : Le système génère un code d'invitation unique au format `XXXX-0000` à la création d'un foyer
- **FR5** : Un parent peut copier le lien d'invitation pour le partager

### Sessions & Authentification

- **FR6** : Le système crée une session persistante (~1 an) sur chaque appareil sans login explicite
- **FR7** : Un parent peut voir la liste des appareils connectés à son foyer
- **FR8** : Un parent peut révoquer l'accès d'un appareil spécifique
- **FR9** : Un parent peut quitter le foyer (suppression de sa session)
- **FR10** : Le système supprime le foyer et ses données quand le dernier membre quitte

### Dashboard & Consultation

- **FR11** : Un parent peut voir l'état sommeil actuel du bébé (état + durée écoulée) dès l'ouverture de l'app
- **FR12** : Un parent peut voir la progression de la quantité de lait consommée dans le cycle en cours
- **FR13** : Un parent peut voir la progression du temps de sommeil dans le cycle en cours
- **FR14** : Le système affiche une zone cible médicale basée sur le poids (lait) et l'âge (sommeil) du bébé
- **FR15** : Le système affiche une moyenne glissante sur 3 jours contextualisée à l'heure actuelle
- **FR16** : Le système affiche un checkmark quand la valeur du cycle atteint la zone cible
- **FR17** : Un parent peut voir la liste antéchronologique des événements du cycle en cours (biberons, siestes, nuit, réveils nocturnes)
- **FR18** : Le système calcule la fenêtre "journée" du coucher au coucher suivant (fallback : minuit)

### Saisie Live — Lait

- **FR19** : Un parent peut enregistrer un biberon avec une quantité en mL
- **FR20** : Le système propose une valeur par défaut basée sur la moyenne des 10 derniers biberons
- **FR21** : Un parent peut ajuster l'heure d'un biberon via un sélecteur d'heure

### Saisie Live — Sommeil

- **FR22** : Un parent peut déclencher une transition d'état sommeil (endormissement, réveil, coucher, réveil nocturne, rendormissement)
- **FR23** : Le système propose l'action la plus probable selon l'heure et l'état actuel
- **FR24** : Le système propose une action alternative dans les zones d'ambiguïté horaire
- **FR25** : Un parent peut ajuster l'heure d'une transition d'état via un sélecteur d'heure
- **FR26** : Le système persiste l'état sommeil et le timestamp de début côté serveur (survit à la fermeture de l'app)

### Saisie Crèche (Batch)

- **FR27** : Un parent peut enregistrer plusieurs biberons en séquence (mode batch)
- **FR28** : Un parent peut enregistrer plusieurs siestes en séquence (mode batch)
- **FR29** : Un parent peut associer un moment de la journée (Matin / Midi / Après-midi) à chaque saisie batch
- **FR30** : Chaque entrée batch est enregistrée individuellement au tap sur "Suivant"

### Édition & Suppression

- **FR31** : Un parent peut modifier la valeur (volume ou durée) d'un événement enregistré
- **FR32** : Un parent peut modifier l'heure ou le moment d'un événement enregistré
- **FR33** : Un parent peut supprimer un événement enregistré
- **FR34** : Le système propose un undo temporaire après une suppression

### Profil Bébé

- **FR35** : Un parent peut modifier le prénom du bébé
- **FR36** : Un parent peut modifier la date de naissance du bébé
- **FR37** : Un parent peut modifier le poids du bébé
- **FR38** : Le système recalcule les zones cibles immédiatement après un changement de poids ou de date de naissance
- **FR39** : Un parent peut activer/désactiver un rappel mensuel de pesée

### Mode Démo

- **FR40** : Le système fournit des données fictives conformes au scénario démo (cf. `docs/ux-onboarding-profil.md` § Données démo) quel que soit le moment d'accès
- **FR41** : Toutes les fonctionnalités sont opérationnelles en mode démo (saisie, édition, profil)
- **FR42** : Les modifications du visiteur en démo sont isolées et n'altèrent pas les données de base

### Synchronisation

- **FR43** : Les données saisies par un parent sont visibles par l'autre parent sans refresh manuel
- **FR44** : Les saisies confirmées sont envoyées au serveur immédiatement (connexion réseau attendue)

### Thème Visuel

- **FR45** : Le système bascule entre thème jour et thème nuit en fonction de l'état sommeil du bébé

## Non-Functional Requirements

### Performance

- **NFR1** : Le dashboard est opérationnel (données chargées, KPI affichées) en < 3s après ouverture sur 4G
- **NFR2** : Le feedback visuel après une saisie (mise à jour KPI card) se produit en < 200ms
- **NFR3** : Le First Contentful Paint est < 2s sur 4G
- **NFR4** : La durée affichée dans la hero card (chrono sieste/nuit) est correcte à la seconde près à la réouverture de l'app

### Security

- **NFR5** : Les sessions sont stockées en cookies httpOnly (pas accessibles via JavaScript)
- **NFR6** : Les codes d'invitation ne permettent pas d'énumérer les foyers existants (pas d'information leakage sur les codes invalides)
- **NFR7** : Un appareil révoqué ne peut plus accéder aux données du foyer

### Reliability

- **NFR8** : L'état sommeil (état + timestamp) est persisté côté serveur et survit à la fermeture de l'app, la perte réseau, et le redémarrage du téléphone
- **NFR9** : Les données du mode démo ne sont jamais altérées par les actions d'un visiteur
