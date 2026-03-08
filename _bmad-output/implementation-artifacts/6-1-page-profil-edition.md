# Story 6.1: Page profil — édition informations bébé

Status: done

## Story

As a parent,
I want modifier le prénom, la date de naissance et le poids de mon bébé depuis le profil,
So that les informations restent à jour et les zones cibles sont correctes.

## Acceptance Criteria

1. **Given** je suis sur la page profil (accès via "Prénom ⚙" dans le header) **When** la page s'affiche **Then** je vois un bouton retour ← en haut à gauche et la section "Informations bébé" avec le prénom, la date de naissance formatée (ex. "7 mars 2026"), et le poids formaté (ex. "4,2 kg")

2. **Given** je suis sur la page profil **When** je tape sur le prénom **Then** le champ devient éditable (inline editing), avec validation identique à l'onboarding (1-30 caractères) **And** la sauvegarde se fait automatiquement au blur (PATCH /api/profiles)

3. **Given** je suis sur la page profil **When** je tape sur la date de naissance **Then** un date picker scroll wheels s'ouvre (même composant que l'onboarding) **And** la sauvegarde se fait automatiquement à la validation

4. **Given** je suis sur la page profil **When** je tape sur le poids **Then** les scroll wheels poids s'ouvrent inline (kg|hg, même composant que l'onboarding) avec un bouton "OK" pour confirmer **And** la sauvegarde se fait à la confirmation (PATCH /api/profiles)

5. **Given** je viens de modifier le poids du bébé **When** la sauvegarde est confirmée **Then** les zones cibles des KPI cards (lait et range slider biberon) se recalculent immédiatement **And** pas de message de confirmation, le recalcul est transparent

6. **Given** je viens de modifier la date de naissance **When** la sauvegarde est confirmée **Then** la zone cible sommeil se recalcule immédiatement

## Tasks / Subtasks

- [x] Task 1 — Ajouter le endpoint PATCH dans `src/app/api/profiles/route.ts` (AC: #2, #3, #4)
  - [x] Importer `getSession` depuis `@/lib/auth/guard` (adapté du pattern existant — `getProfileFromRequest` n'existait pas)
  - [x] Créer `UpdateProfileSchema` dans `src/lib/schemas/profile.ts` (Zod) : `babyName?`, `babyDob?`, `babyWeightHg?`, `weightReminder?` — au moins un champ requis
  - [x] PATCH handler : vérifier JWT, valider body, UPDATE `pousse_profiles` via Supabase, retourner `{ data: { profile } }` avec mapping snake_case → camelCase
  - [x] Mapping camelCase → snake_case pour l'écriture DB : `babyName` → `baby_name`, `babyDob` → `baby_dob`, `babyWeightHg` → `baby_weight_hg`, `weightReminder` → `weight_reminder`
- [x] Task 2 — Ajouter `updateProfile` dans `HouseholdContext` (AC: #2, #3, #4, #5, #6)
  - [x] Ajouter `updateProfile: (data: UpdateProfileParams) => Promise<void>` dans `HouseholdContextValue`
  - [x] `interface UpdateProfileParams { babyName?: string; babyDob?: string; babyWeightHg?: number; weightReminder?: boolean }`
  - [x] Optimistic update du profile dans state, rollback si PATCH échoue
  - [x] Appel `PATCH /api/profiles` avec le body
  - [x] Les KPI cards se recalculent automatiquement car elles lisent `profile.babyWeightHg` et `profile.babyDob` depuis le context
- [x] Task 3 — Rendre `ProfileScreen` éditable (AC: #1, #2, #3, #4)
  - [x] Ajouter `useHousehold()` pour accéder au `profile` et `updateProfile`
  - [x] **Prénom** : état `isEditingName` → au tap, remplacer le `<span>` par un `<input>` — validation 1-30 chars — `onBlur` → `updateProfile({ babyName })`
  - [x] **Date de naissance** : état `isEditingDob` → au tap, ouvrir un composant ScrollWheels date (réutiliser le pattern de l'onboarding) — à la validation → `updateProfile({ babyDob })`
  - [x] **Poids** : état `isEditingWeight` → au tap, ouvrir ScrollWheels kg|hg inline avec bouton "OK" — à la confirmation → `updateProfile({ babyWeightHg })`
  - [x] Supprimer les props `profile`, `devices`, `currentSessionId` — utiliser le context à la place
- [x] Task 4 — Adapter la page `(app)/profile/page.tsx` (AC: #1)
  - [x] Simplifier : `ProfileScreen` ne reçoit plus de props, il utilise `useHousehold()`
  - [x] Supprimer le fetching côté serveur si existant — tout passe par le context
- [x] Task 5 — Tests unitaires (AC: #1-#6)
  - [x] Test PATCH /api/profiles : validation Zod via UpdateProfileSchema (9 tests ajoutés)
  - [x] Test ProfileScreen : tap prénom → input éditable → blur → appel updateProfile
  - [x] Test ProfileScreen : tap poids → scroll wheels → OK → boutons visibles
  - [x] Test ProfileScreen : affichage infos, bouton retour, rappel pesée

## Dev Notes

### État actuel de ProfileScreen

Le composant `src/components/profile/ProfileScreen.tsx` affiche actuellement les infos bébé en **lecture seule** (lignes 101-114). Il reçoit `profile`, `devices` et `currentSessionId` en props.

**Changement principal** : passer d'un affichage statique à un inline editing. Le composant doit utiliser `useHousehold()` au lieu de recevoir les données en props, pour avoir accès à `updateProfile()`.

### API PATCH /api/profiles — à créer

Le fichier `src/app/api/profiles/route.ts` ne contient actuellement que POST (création). Ajouter un export `PATCH` dans le même fichier.

Pattern à suivre (identique aux autres routes) :
```ts
export async function PATCH(request: NextRequest) {
  const { profileId } = await getProfileFromRequest(request)
  // validate body with UpdateProfileSchema
  // update pousse_profiles where id = profileId
  // return { data: { profile: mappedProfile } }
}
```

### Mapping snake_case ↔ camelCase

Le mapping est fait dans la route API, pas dans les composants :
- `baby_name` ↔ `babyName`
- `baby_dob` ↔ `babyDob`
- `baby_weight_hg` ↔ `babyWeightHg`
- `weight_reminder` ↔ `weightReminder`

Réutiliser le même pattern que dans `api/household/route.ts`.

### Recalcul des zones cibles (AC #5, #6)

Les KPI cards utilisent `getMilkTarget(profile.babyWeightHg)` et `getSleepTarget(profile.babyDob)` depuis `lib/medical-targets.ts`. Comme ces fonctions prennent les valeurs directement du profile, le recalcul est **automatique** dès que `profile` est mis à jour dans le context. Aucun code supplémentaire n'est nécessaire côté KPI.

### ScrollWheels pour le poids et la date

Le composant `src/components/ui/ScrollWheels.tsx` existe déjà (utilisé par l'onboarding). Réutiliser le même composant pour l'édition inline dans le profil.

Pour le poids : deux colonnes kg|hg, valeur initiale = poids actuel du bébé, bouton "OK" pour confirmer.
Pour la date : réutiliser le date picker de l'onboarding (si ScrollWheels supporte le mode date).

### Anti-patterns à éviter

- NE PAS créer un formulaire séparé ou une page d'édition — l'édition est inline
- NE PAS afficher de toast/message de confirmation — le recalcul est silencieux et transparent
- NE PAS appeler l'API directement depuis le composant — passer par `updateProfile()` du context
- NE PAS dupliquer la logique de validation — réutiliser les schémas Zod existants
- NE PAS oublier le mapping snake_case dans la route PATCH — le composant manipule du camelCase

### Project Structure Notes

Fichiers à créer :
- (aucun nouveau fichier — tout s'intègre dans les fichiers existants)

Fichiers à modifier :
- `src/app/api/profiles/route.ts` — ajouter export PATCH
- `src/lib/schemas/profile.ts` — ajouter `UpdateProfileSchema`
- `src/contexts/HouseholdContext.tsx` — ajouter `updateProfile()`
- `src/components/profile/ProfileScreen.tsx` — inline editing + useHousehold()
- `src/app/(app)/profile/page.tsx` — simplifier (plus de props)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR35, FR36, FR37, FR38] — édition prénom/DDN/poids, recalcul zones
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — PATCH /api/profiles
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — pousse_profiles schema
- [Source: docs/ux-onboarding-profil.md#Page profil] — spécification édition inline, scroll wheels, sauvegarde auto
- [Source: src/components/profile/ProfileScreen.tsx] — composant actuel (lecture seule)
- [Source: src/app/api/profiles/route.ts] — route actuelle (POST uniquement)
- [Source: src/contexts/HouseholdContext.tsx] — context sans updateProfile
- [Source: src/lib/medical-targets.ts] — getMilkTarget, getSleepTarget, getMilkRange
- [Source: src/lib/schemas/profile.ts] — CreateProfileSchema existant
- [Source: src/components/ui/ScrollWheels.tsx] — composant scroll wheels existant

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `getProfileFromRequest` n'existait pas dans `@/lib/auth/guard` — utilisé `getSession` (pattern existant dans household/route.ts)

### Completion Notes List

- ✅ Task 1 : PATCH endpoint ajouté avec UpdateProfileSchema, camelCase→snake_case mapping, auth via getSession
- ✅ Task 2 : `updateProfile` avec optimistic update et rollback ajouté dans HouseholdContext
- ✅ Task 3 : ProfileScreen refactoré — inline editing pour prénom (input+blur), DDN (ScrollWheels date), poids (ScrollWheels kg|hg + OK)
- ✅ Task 4 : page.tsx simplifié à un simple `<ProfileScreen />` sans props
- ✅ Task 5 : 9 tests UpdateProfileSchema + 7 tests ProfileScreen ajoutés — tous passent (110/110)
- ✅ AC #5/#6 : Recalcul automatique des zones cibles — aucun code supplémentaire requis (KPI cards lisent le profile context)

### Change Log

- 2026-03-08 : Implémentation complète Story 6.1 — édition inline profil bébé (prénom, DDN, poids) avec PATCH API, optimistic updates, et tests

### File List

- `src/app/api/profiles/route.ts` — modifié (ajout PATCH handler + imports)
- `src/lib/schemas/profile.ts` — modifié (ajout UpdateProfileSchema)
- `src/contexts/HouseholdContext.tsx` — modifié (ajout updateProfile + UpdateProfileParams)
- `src/components/profile/ProfileScreen.tsx` — modifié (refactoré : props → useHousehold, inline editing)
- `src/app/(app)/profile/page.tsx` — modifié (simplifié : plus de props ni fetch)
- `src/lib/schemas/__tests__/profile.test.ts` — modifié (ajout 9 tests UpdateProfileSchema)
- `src/components/profile/__tests__/ProfileScreen.test.tsx` — créé (7 tests)
