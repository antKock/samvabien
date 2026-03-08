# Story 6.2: Rappel de pesée mensuel

Status: review

## Story

As a parent,
I want activer ou désactiver un rappel mensuel de pesée,
So that je pense à mettre à jour le poids régulièrement.

## Acceptance Criteria

1. **Given** je suis sur la page profil **When** je vois la section "Rappel de pesée" **Then** elle affiche le label "Rappel de pesée", la description "Un rappel mensuel pour mettre à jour le poids", et un toggle on/off (activé par défaut)

2. **Given** le rappel est activé et le bébé est né le 15 **When** le système calcule la date du prochain rappel **Then** le rappel est programmé pour le 25 de chaque mois (jour de naissance + 10 jours)

3. **Given** le bébé est né le 30 **When** le système calcule le rappel pour février **Then** le rappel est programmé pour le 28 février (dernier jour du mois)

4. **Given** je tape le toggle pour désactiver le rappel **When** le toggle change d'état **Then** le rappel est désactivé (PATCH /api/profiles, weight_reminder=false)

5. **Given** le rappel se déclenche **When** je tape sur la notification push locale **Then** le picker de poids s'ouvre dans un toast (scroll wheels kg|hg)

## Tasks / Subtasks

- [x] Task 1 — Ajouter le toggle dans `ProfileScreen` (AC: #1, #4)
  - [x] Section "Rappel de pesée" : label 14px/800, description 12px/600 text-sec, toggle à droite
  - [x] Toggle visuel : `<button>` avec `role="switch"` et `aria-checked`, fond `accent` quand activé, fond `border` quand désactivé
  - [x] `onChange` → appeler `updateProfile({ weightReminder: !current })` (context, pas fetch direct)
- [x] Task 2 — Calcul de la prochaine date de rappel (AC: #2, #3)
  - [x] Créer `lib/weight-reminder.ts` : `getNextReminderDate(dob: string): Date`
  - [x] Logique : jour de naissance + 10 jours. Si > dernier jour du mois → clamp au dernier jour
  - [x] Retourner la prochaine date future (si la date du mois courant est passée, retourner le mois suivant)
  - [x] Tests unitaires pour les cas limites (né le 30 → février, né le 31, né le 1er)
- [x] Task 3 — Notification push locale (AC: #5)
  - [x] **Stratégie principale (fallback in-app)** : check au chargement du dashboard — si `weightReminder` activé et date rappel passée → afficher bandeau "Il est temps de peser [prénom] !" avec bouton pour ouvrir picker poids
  - [x] WeightReminderBanner intégré dans dashboard/page.tsx
  - [x] Note : notifications push natives non implémentées (non fiables PWA iOS, comme spécifié dans Dev Notes — stratégie principale = bandeau in-app)
- [x] Task 4 — Toast poids (rappel) (AC: #5)
  - [x] Réutiliser ScrollWheels kg|hg avec bouton "OK" (intégré dans WeightReminderBanner)
  - [x] Au confirm → `updateProfile({ babyWeightHg: newValue })`

## Dev Notes

### Notification push sur PWA iOS — limitation connue

Les notifications push locales (API Notification) ne fonctionnent **pas** de manière fiable sur PWA installée iOS avant 16.4, et même après, elles nécessitent une permission explicite. L'approche pragmatique :

1. **Stratégie principale** : vérification au chargement de l'app. À chaque ouverture du dashboard, si `profile.weightReminder === true` et que la date de rappel est passée (ou c'est aujourd'hui), afficher un toast/bandeau discret "Il est temps de peser [prénom] !" avec un bouton pour ouvrir le picker poids.

2. **Stratégie secondaire** (best effort) : si l'API Notification est disponible et la permission accordée, programmer une notification locale. Mais ne pas bloquer la feature si la permission est refusée.

### Logique de calcul du rappel

```ts
function getNextReminderDate(dob: string): Date {
  const birth = new Date(dob)
  const reminderDay = birth.getDate() + 10
  const now = new Date()

  // Try current month
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = Math.min(reminderDay, lastDayThisMonth)
  const candidate = new Date(now.getFullYear(), now.getMonth(), day)

  if (candidate > now) return candidate

  // Next month
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(reminderDay, lastDayNextMonth))
}
```

### Section toggle — structure visuelle

```
┌─────────────────────────────────────────┐
│ Rappel de pesée                [●━━━]   │
│ Un rappel mensuel pour mettre           │
│ à jour le poids                         │
└─────────────────────────────────────────┘
```

### Dépendances

- **Story 6.1** : `updateProfile()` dans le context et le PATCH /api/profiles doivent être implémentés en premier

### Anti-patterns à éviter

- NE PAS dépendre uniquement des notifications push — le fallback bandeau in-app est la stratégie principale
- NE PAS bloquer le toggle si la permission notification est refusée — le rappel in-app fonctionne sans permission
- NE PAS créer un scheduler complexe — un simple check au chargement suffit
- NE PAS utiliser de librairie externe pour les notifications — l'API Notification native suffit

### Project Structure Notes

Fichiers à créer :
- `src/lib/weight-reminder.ts` — calcul date rappel
- `src/lib/weight-reminder.test.ts` — tests

Fichiers à modifier :
- `src/components/profile/ProfileScreen.tsx` — toggle fonctionnel + handler
- `src/app/(app)/layout.tsx` ou `dashboard/page.tsx` — check rappel au chargement

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR39] — activer/désactiver rappel mensuel
- [Source: docs/ux-onboarding-profil.md#Rappel de pesée] — fréquence jour+10, toggle, notification → picker poids
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — weight_reminder boolean dans pousse_profiles
- [Source: src/components/profile/ProfileScreen.tsx:117-127] — section rappel actuelle (lecture seule)
- [Source: src/components/ui/ScrollWheels.tsx] — composant scroll wheels existant

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- ✅ Task 1 : Toggle fonctionnel avec `role="switch"`, `aria-checked`, transition visuelle, appel `updateProfile({ weightReminder })`
- ✅ Task 2 : `getNextReminderDate` + `shouldShowWeightReminder` créés avec 9 tests couvrant cas limites (fév, né le 31, né le 1er)
- ✅ Task 3 : WeightReminderBanner intégré dans le dashboard — stratégie principale in-app (pas de push native, non fiable PWA iOS)
- ✅ Task 4 : Picker poids intégré dans le bandeau rappel — ScrollWheels kg|hg + OK → `updateProfile({ babyWeightHg })`

### Change Log

- 2026-03-08 : Implémentation complète Story 6.2 — toggle rappel pesée, calcul date, bandeau in-app avec picker poids

### File List

- `src/components/profile/ProfileScreen.tsx` — modifié (section rappel de pesée → toggle fonctionnel avec description)
- `src/lib/weight-reminder.ts` — créé (getNextReminderDate, shouldShowWeightReminder)
- `src/lib/weight-reminder.test.ts` — créé (9 tests)
- `src/components/dashboard/WeightReminderBanner.tsx` — créé (bandeau rappel + picker poids inline)
- `src/app/(app)/dashboard/page.tsx` — modifié (ajout WeightReminderBanner)
- `src/components/profile/__tests__/ProfileScreen.test.tsx` — modifié (tests toggle switch + updateProfile)
