# Story 1.5: Gestion des appareils & quitter le foyer

Status: done

## Story

As a parent,
I want voir les appareils connectés, révoquer un appareil, ou quitter le foyer,
So that je contrôle qui a accès aux données.

## Acceptance Criteria

1. **Given** je suis sur le dashboard **When** j'accède à la page profil **Then** je vois une section "Foyer" avec le code d'invitation, un bouton "Copier le lien", et la liste des appareils connectés (nom/type + date de dernière connexion)

2. **Given** je vois la liste des appareils connectés **When** je tape le bouton "Déconnecter" sur un appareil **Then** une confirmation simple s'affiche ("Déconnecter cet appareil ?") **And** si je confirme, l'appareil est révoqué (session supprimée en DB via DELETE /api/devices/[id]) **And** l'appareil révoqué ne peut plus accéder aux données du foyer (NFR7)

3. **Given** je suis le dernier membre du foyer **When** je tape "Quitter le profil" (bouton destructif rouge) et je confirme ("Quitter le profil ? Vous perdrez l'accès aux données.") **Then** ma session est supprimée, le foyer et toutes ses données sont supprimés définitivement (hard delete) **And** je suis redirigé vers la landing screen

4. **Given** je ne suis pas le dernier membre du foyer **When** je tape "Quitter le profil" et je confirme **Then** ma session est supprimée, mais le foyer et ses données restent accessibles pour les autres membres **And** je suis redirigé vers la landing screen

## Tasks / Subtasks

- [x] Task 1 — Créer l'API route GET /api/household (AC: #1)
  - [x] `src/app/api/household/route.ts`
  - [x] Auth guard : extraire profileId du JWT
  - [x] Charger depuis Supabase : profil (pousse_profiles), events (pousse_events), devices (pousse_device_sessions) filtrés par profile_id
  - [x] Retour : `{ data: { profile: {...}, events: [...], devices: [...] } }`
  - [x] Mapping snake_case → camelCase dans la response
- [x] Task 2 — Créer l'API route DELETE /api/devices/[id] (AC: #2)
  - [x] `src/app/api/devices/[id]/route.ts`
  - [x] Auth guard : extraire profileId du JWT
  - [x] Vérifier que le device appartient au même profile_id (sécurité)
  - [x] Supprimer la session dans pousse_device_sessions
  - [x] Retour : `{ data: { success: true } }`
  - [x] L'appareil révoqué ne pourra plus accéder : son sessionId dans le JWT ne correspond plus à aucune session → le middleware le rejettera
- [x] Task 3 — Créer l'API route POST /api/leave (AC: #3, #4)
  - [x] `src/app/api/leave/route.ts`
  - [x] Auth guard : extraire profileId et sessionId du JWT
  - [x] Compter le nombre de sessions actives pour ce profile_id
  - [x] Si dernière session → hard delete : supprimer pousse_events, pousse_device_sessions, pousse_profiles (CASCADE devrait gérer, mais vérifier)
  - [x] Si pas dernière session → supprimer uniquement cette session (pousse_device_sessions WHERE id = sessionId)
  - [x] Effacer le cookie auth dans la response
  - [x] Retour : `{ data: { deleted: boolean } }` (deleted = true si foyer supprimé)
- [x] Task 4 — Créer le composant ProfileScreen (AC: #1, #2, #3, #4)
  - [x] `src/components/profile/ProfileScreen.tsx`
  - [x] **Section Informations bébé** : prénom, date de naissance, poids — affichage lecture seule pour l'instant (édition inline dans Story 6.1)
  - [x] **Section Rappel de pesée** : toggle on/off — affichage lecture seule pour l'instant (Story 6.1)
  - [x] **Section Foyer** :
    - Code d'invitation en gros (16px, font-weight 700)
    - Bouton "Copier le lien" (même logique que WelcomeBanner)
    - Liste des appareils : nom/type + "Dernière connexion : [date]"
    - Bouton "Déconnecter" par appareil (sauf l'appareil courant — ne pas permettre l'auto-révocation ici, utiliser "Quitter" pour ça)
  - [x] **Section Actions** :
    - Bouton "Quitter le profil" : style destructif (rouge/danger), pleine largeur
    - Confirmation : dialog simple "Quitter le profil ? Vous perdrez l'accès aux données." avec boutons "Annuler" / "Quitter"
  - [x] Appel POST /api/leave après confirmation → effacer le cookie → redirect vers `/`
- [x] Task 5 — Créer le bouton d'accès profil dans le header (AC: #1)
  - [x] `src/components/profile/ProfileHeaderButton.tsx`
  - [x] Affichage : "[Prénom] ⚙" — inline avec la date dans le header dashboard
  - [x] Style : 10px, font-weight 600, couleur `textSec`, icône gear SVG 12×12 à droite du prénom, gap 3px
  - [x] `<button>` sans background, cursor pointer
  - [x] Navigation vers `/profile`
- [x] Task 6 — Créer la page profil (AC: #1)
  - [x] `src/app/(app)/profile/page.tsx`
  - [x] Rend `<ProfileScreen />`
  - [x] Bouton retour ← en haut à gauche pour revenir au dashboard
  - [x] Charge les données via GET /api/household (ou depuis le HouseholdContext)
- [x] Task 7 — Intégrer le header avec ProfileHeaderButton (AC: #1)
  - [x] Dans `src/app/(app)/page.tsx` ou layout : ajouter le header avec la date à gauche et `<ProfileHeaderButton />` à droite
  - [x] Format date : "Vendredi 7 mars" (en français, sans année)

## Dev Notes

### Middleware — Vérification de session valide

Le middleware (Story 1.2) vérifie le JWT. Pour que la révocation soit effective (NFR7), le middleware DOIT aussi vérifier que le sessionId du JWT correspond à une session existante en DB. Sinon un JWT valide mais révoqué continuerait à fonctionner.

**Option 1 (recommandée pour MVP)** : Le middleware vérifie uniquement le JWT. La vérification de session en DB se fait dans le `guard.ts` appelé par chaque API route. C'est suffisant car :
- Les API routes sont le seul accès aux données
- Les pages (app) chargent les données via les API routes
- Un appareil révoqué ne pourra plus charger de données

**Option 2 (plus sécurisé)** : Le middleware fait un lookup DB à chaque requête. Plus lourd mais bloque l'accès même aux pages statiques. À évaluer selon les besoins.

### Hard delete — Cascade

Les tables ont des FK avec ON DELETE CASCADE :
- Supprimer un pousse_profiles → supprime automatiquement pousse_device_sessions et pousse_events associés
- Vérifier que la migration SQL (Story 1.2) inclut bien ON DELETE CASCADE

### Appareils — Identification

Le `device_name` est extrait du User-Agent lors de la création de la session. Format simplifié : "iPhone Safari", "Chrome Android", etc. Pas besoin d'une lib complète — un parsing basique suffit.

L'appareil courant est identifié par le sessionId du JWT. Ne pas afficher le bouton "Déconnecter" sur son propre appareil (utiliser "Quitter le profil" pour se déconnecter soi-même).

### Confirmation — Dialog simple

Pas de modal complexe. Un `window.confirm()` suffit pour le MVP, ou un petit composant dialog inline si on veut garder le style cohérent avec le design system (fond surface, border-radius 20px).

Exception au principe "pas de modal" du design system : ici c'est une action destructive irréversible (suppression de données), la confirmation est justifiée.

### Profil — Sections lecture seule

Les sections "Informations bébé" et "Rappel de pesée" sont en lecture seule dans cette story. L'édition inline sera ajoutée dans l'Epic 6 (Stories profil bébé & paramètres). Afficher les valeurs sans le comportement d'édition.

### Header du dashboard

Le header contient :
- À gauche : date du jour en français ("Vendredi 7 mars"), 10px, font-weight 600, couleur `textSec`
- À droite : `[Prénom] ⚙`, même style

Pour le formatage de date en français, utiliser `Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })`. Première lettre en majuscule.

### Dépendances

- Story 1.1 : fondation projet, structure
- Story 1.2 : auth, tables DB, middleware, API profiles
- Story 1.3 : API join (les appareils provenant du join apparaissent dans la liste)

### Project Structure Notes

- Fichiers créés : `src/app/api/household/route.ts`, `src/app/api/devices/[id]/route.ts`, `src/app/api/leave/route.ts`, `src/components/profile/ProfileScreen.tsx`, `src/components/profile/ProfileHeaderButton.tsx`, `src/app/(app)/profile/page.tsx`
- Le ProfileScreen et ProfileHeaderButton sont dans `components/profile/`
- L'API household est le point central de chargement des données du foyer — il sera réutilisé par le HouseholdContext (Epic 2+)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: docs/ux-onboarding-profil.md#Page profil]
- [Source: docs/ux-onboarding-profil.md#Accès au profil]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/prd.md#FR7 FR8 FR9 FR10 NFR7]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- ✅ API GET /api/household — chargement profil + devices + events avec mapping camelCase
- ✅ API DELETE /api/devices/[id] — révocation appareil avec vérification profile_id
- ✅ API POST /api/leave — quitter foyer avec hard delete si dernier membre
- ✅ ProfileScreen — sections informations bébé, rappel pesée, foyer, appareils, quitter
- ✅ ProfileHeaderButton — "[Prénom] ⚙" dans le header dashboard
- ✅ Confirmation dialog pour révocation appareil et quitter foyer
- ✅ Copier le lien dans la page profil
- ✅ Page profil avec chargement dynamique
- ✅ Header dashboard intégré avec date FR et accès profil
- ✅ 22 tests passent, build Next.js OK

### Change Log
- 2026-03-08 : Story 1.5 implémentée — gestion appareils, profil, quitter foyer

### File List
- src/app/api/household/route.ts (créé — Story 1.4)
- src/app/api/devices/[id]/route.ts (créé)
- src/app/api/leave/route.ts (créé)
- src/components/profile/ProfileScreen.tsx (créé)
- src/components/profile/ProfileHeaderButton.tsx (créé)
- src/app/(app)/profile/page.tsx (modifié)
- src/app/(app)/dashboard/page.tsx (modifié — ajout ProfileHeaderButton)
