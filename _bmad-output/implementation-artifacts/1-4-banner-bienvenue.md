# Story 1.4: Banner de bienvenue & partage du code

Status: review

## Story

As a parent,
I want voir le code d'invitation après la création du foyer et copier le lien de partage,
So that l'autre parent peut rejoindre facilement.

## Acceptance Criteria

1. **Given** je viens de créer un foyer (redirection post-onboarding) **When** j'arrive sur le dashboard **Then** un banner de bienvenue s'affiche en haut avec le texte "🎉 Bienvenue !", une explication, le code d'invitation en gros (16px, font-weight 700, couleur `text`), et un bouton "Copier le lien"

2. **Given** le banner de bienvenue est affiché **When** je tape "Copier le lien" **Then** le lien d'invitation (/join/[CODE]) est copié dans le presse-papier

3. **Given** le banner de bienvenue est affiché **When** je tape ✕ ou je tape hors du banner **Then** le banner se ferme et ne réapparaît plus jamais (one-shot)

4. **Given** j'ai déjà fermé le banner de bienvenue **When** je rouvre l'app **Then** le banner ne s'affiche pas (le code reste accessible dans le profil)

## Tasks / Subtasks

- [x] Task 1 — Créer le composant WelcomeBanner (AC: #1, #2, #3)
  - [x] `src/components/onboarding/WelcomeBanner.tsx`
  - [x] Layout : affiché en haut du dashboard, au-dessus de la date
  - [x] Contenu : emoji "🎉", texte "Bienvenue !", explication "Partagez ce code pour que l'autre parent puisse rejoindre le foyer :", code en gros (16px, font-weight 700, couleur `text`)
  - [x] Bouton "Copier le lien" : style secondary, copie `${window.location.origin}/join/${joinCode}` dans le presse-papier via `navigator.clipboard.writeText()`
  - [x] Bouton ✕ en haut à droite : ferme le banner
  - [x] Tap hors banner (backdrop) : ferme le banner
  - [x] Style : fond `surface`, border-radius 20px, shadow douce, padding 20px
- [x] Task 2 — Implémenter la persistance one-shot (AC: #3, #4)
  - [x] Utiliser un cookie ou une colonne DB pour persister l'état "banner fermé"
  - [x] Option recommandée : flag `welcomeBannerDismissed` dans un cookie côté client (pas httpOnly — c'est un flag UI, pas un secret)
  - [x] Alternative : colonne `welcome_dismissed` dans pousse_device_sessions
  - [x] Le banner ne s'affiche que si : session fraîchement créée (premier accès post-onboarding) ET flag non posé
- [x] Task 3 — Intégrer le banner dans le dashboard (AC: #1, #4)
  - [x] Ajouter le WelcomeBanner dans `src/app/(app)/page.tsx` (ou le layout)
  - [x] Condition d'affichage : vérifier le flag one-shot + le joinCode disponible dans le context
  - [x] Position : au-dessus du contenu principal (hero card + KPI cards), avec un z-index approprié

## Dev Notes

### Comportement one-shot

Le banner est un "one-shot" : affiché une seule fois après la création du foyer, jamais réaffiché. Le mécanisme le plus simple est un cookie non-httpOnly (par ex. `pousse_welcome_dismissed=1`) posé côté client au dismiss. C'est un simple flag UI, pas de donnée sensible.

Ne PAS utiliser localStorage (anti-pattern défini dans l'architecture — tout passe par Supabase ou cookies).

### Clipboard API

`navigator.clipboard.writeText()` nécessite un contexte sécurisé (HTTPS) ou localhost. C'est le cas en production (Vercel HTTPS) et en dev (localhost). Pas besoin de fallback `document.execCommand('copy')`.

Feedback visuel après copie : changer temporairement le texte du bouton en "✓ Copié !" pendant 2s.

### Format du lien d'invitation

```
https://samvabien.vercel.app/join/OLVR-4821
```

Utiliser `window.location.origin` pour la base URL (fonctionne en dev et prod).

### Accès au joinCode

Le joinCode est disponible dans le HouseholdContext (chargé via GET /api/household). Le composant WelcomeBanner le lit depuis le context.

Si le HouseholdContext n'est pas encore implémenté (dépend de l'ordre d'implémentation), le joinCode peut être passé en prop depuis la page, lu depuis l'API /api/household directement.

### Design — Style du banner

- Fond : `surface` (#ffffff jour, #22221a nuit)
- Texte : `text` (#32321e jour, #c8c8b0 nuit)
- Code : 16px, font-weight 700, couleur `text`
- Bouton "Copier le lien" : style secondary (fond accent/10, border accent/20)
- Border-radius : 20px (même que les cartes)
- Padding : 20px
- Bouton ✕ : 24×24px, couleur `textSec`, position absolue top-right

### Dépendances

- Story 1.1 : fondation projet, Tailwind configuré
- Story 1.2 : auth, tables DB, API profiles (le joinCode est généré à la création)
- GET /api/household : nécessaire pour récupérer le joinCode (créé en Story 1.2 ou ici)

### Project Structure Notes

- Fichier créé : `src/components/onboarding/WelcomeBanner.tsx`
- Le WelcomeBanner est dans `components/onboarding/` car lié au flow d'accueil initial
- Intégration dans le dashboard : condition dans `src/app/(app)/page.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: docs/ux-onboarding-profil.md#Banner de bienvenue]
- [Source: docs/design-reference.html#Welcome Banner]
- [Source: _bmad-output/planning-artifacts/prd.md#FR4 FR5]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- ✅ WelcomeBanner avec code affiché, bouton copier lien, feedback "Copié !"
- ✅ Dismiss via ✕ ou tap hors banner (backdrop click)
- ✅ Persistance one-shot via cookie `pousse_welcome_dismissed`
- ✅ Intégration dans le dashboard page
- ✅ API GET /api/household pour charger les données profil
- ✅ 22 tests passent (4 nouveaux pour WelcomeBanner)

### Change Log
- 2026-03-08 : Story 1.4 implémentée — banner bienvenue + partage code

### File List
- src/components/onboarding/WelcomeBanner.tsx (créé)
- src/components/onboarding/__tests__/WelcomeBanner.test.tsx (créé)
- src/app/(app)/dashboard/page.tsx (modifié)
- src/app/api/household/route.ts (créé)
