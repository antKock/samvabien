# Story 1.3: Rejoindre un foyer

Status: done

## Story

As a visiteur,
I want rejoindre un foyer existant avec un code d'invitation ou un lien,
So that je peux accéder aux données du bébé partagées par l'autre parent.

## Acceptance Criteria

1. **Given** je suis sur la landing screen **When** je tape "Rejoindre un foyer" **Then** je vois un écran avec un champ texte unique (placeholder "Code d'invitation")

2. **Given** je suis sur l'écran de join **When** je saisis un code au format XXXX-0000 (insensible à la casse, tiret optionnel) **Then** le système lance un auto-lookup après 300ms de debounce **And** un spinner s'affiche pendant la vérification

3. **Given** le code saisi correspond à un foyer existant **When** la vérification est terminée **Then** le système crée une session device pour ce foyer **And** un cookie JWT httpOnly est posé **And** je suis redirigé vers le dashboard avec les données du bébé

4. **Given** le code saisi ne correspond à aucun foyer **When** la vérification est terminée **Then** un message d'erreur s'affiche : "Code introuvable, vérifiez la saisie" **And** la réponse API ne révèle pas si d'autres codes existent (NFR6)

5. **Given** un parent m'a envoyé un lien /join/[CODE] **When** j'ouvre le lien **Then** le code est pré-rempli et la validation se lance automatiquement

## Tasks / Subtasks

- [x] Task 1 — Créer le composant JoinScreen (AC: #1, #2, #4)
  - [x] `src/components/onboarding/JoinScreen.tsx`
  - [x] Champ texte unique, placeholder "Code d'invitation"
  - [x] Auto-format : insensible à la casse, tiret optionnel, normalisation en majuscules avec tiret
  - [x] Auto-lookup : détecte le format XXXX-0000 (8 caractères alphanumériques) → déclenche la vérification après debounce 300ms
  - [x] États visuels : idle, loading (spinner), error ("Code introuvable, vérifiez la saisie"), success (redirect)
  - [x] Pas de bouton "Valider" — la validation est automatique
- [x] Task 2 — Créer l'API route POST /api/join (AC: #3, #4)
  - [x] `src/app/api/join/route.ts`
  - [x] Validation Zod : `join_code` string, format XXXX-0000
  - [x] Normaliser le code : majuscules, retirer le tiret pour la recherche
  - [x] Recherche dans pousse_profiles par join_code
  - [x] Si trouvé : créer une session device (pousse_device_sessions), signer le JWT, poser le cookie, retourner `{ data: { profileId } }`
  - [x] Si non trouvé : retourner `{ error: { message: "Code introuvable" } }` avec status 404 — même réponse quel que soit le code (NFR6, pas d'info leakage)
- [x] Task 3 — Créer la page join avec support lien d'invitation (AC: #1, #5)
  - [x] `src/app/(landing)/join/page.tsx` — rend `<JoinScreen />`
  - [x] Support URL `/join/[CODE]` : créer `src/app/(landing)/join/[code]/page.tsx` OU extraire le code depuis les searchParams/pathname
  - [x] Si code présent dans l'URL → pré-remplir le champ et déclencher l'auto-lookup immédiatement
  - [x] Après succès → redirect vers `/(app)` (dashboard)
- [x] Task 4 — Créer le Zod schema JoinSchema
  - [x] `src/lib/schemas/join.ts` (ou ajouter dans profile.ts)
  - [x] `join_code` : string, regex `/^[A-Z]{4}-?\d{4}$/i`, transform uppercase + add dash

## Dev Notes

### Sécurité — Pas d'info leakage (NFR6)

L'API `/api/join` DOIT retourner exactement la même réponse (404 + message générique) pour :
- Code inexistant
- Code mal formaté
- Toute autre erreur de recherche

Cela empêche l'énumération des foyers existants. Ne jamais retourner un message différent selon que le code existe ou non.

### Auto-lookup — Comportement

1. L'utilisateur tape des caractères
2. Le composant normalise en temps réel (uppercase, ajout du tiret après 4 caractères)
3. Dès que le format complet est détecté (8 chars alphanumériques) → debounce 300ms → appel API
4. Pendant l'appel : spinner
5. Succès : redirect automatique vers le dashboard
6. Erreur : message inline, l'utilisateur peut corriger et retaper

### Lien d'invitation — Format

- URL complète : `[base_url]/join/OLVR-4821`
- Le code est dans le path, pas en query param
- Route Next.js : `src/app/(landing)/join/[code]/page.tsx` avec le code en param dynamique
- Le composant JoinScreen accepte un prop `initialCode` pour le pré-remplissage

### Auth — Même mécanisme que Story 1.2

- Réutilise `signJwt`, `setAuthCookie` de `src/lib/auth/`
- JWT payload identique : `{ profileId, sessionId }`
- Le device_name est extrait du User-Agent de la requête
- Cookie httpOnly, secure, sameSite=lax, ~1 an

### Dépendances

- Story 1.1 : fondation projet, structure de dossiers
- Story 1.2 : tables DB (pousse_profiles, pousse_device_sessions), auth (JWT, cookies, guard), middleware

### Project Structure Notes

- Fichiers créés : `src/components/onboarding/JoinScreen.tsx`, `src/app/api/join/route.ts`, `src/app/(landing)/join/page.tsx`, `src/app/(landing)/join/[code]/page.tsx`, `src/lib/schemas/join.ts`
- Le JoinScreen est dans `components/onboarding/` car il fait partie du flow d'accès initial

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: docs/ux-onboarding-profil.md#Rejoindre un foyer]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR2 FR4 FR6 NFR6]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- ✅ JoinScreen avec auto-format, debounce 300ms, auto-lookup
- ✅ API POST /api/join avec NFR6 (pas d'info leakage)
- ✅ Page /join et /join/[code] avec pré-remplissage
- ✅ Schema Zod JoinSchema avec normalisation
- ✅ 18 tests passent (5 nouveaux pour JoinSchema)

### Change Log
- 2026-03-08 : Story 1.3 implémentée — rejoindre un foyer

### File List
- src/components/onboarding/JoinScreen.tsx (créé)
- src/app/api/join/route.ts (créé)
- src/app/(landing)/join/page.tsx (modifié)
- src/app/(landing)/join/[code]/page.tsx (créé)
- src/lib/schemas/join.ts (créé)
- src/lib/schemas/__tests__/join.test.ts (créé)
