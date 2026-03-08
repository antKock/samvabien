# Story 2.3: Time picker & ajustement horaire

Status: done

## Story

As a parent,
I want ajuster l'heure d'une transition sommeil via un sélecteur à rouleaux,
So that je peux corriger l'heure si je n'ai pas enregistré au moment exact.

## Acceptance Criteria

1. **Given** le toast de transition est affiché avec le cooldown actif **When** je tape sur l'heure affichée **Then** le toast s'agrandit et affiche un picker à rouleaux inline (colonne heures | colonne minutes) **And** le cooldown se met en pause

2. **Given** le time picker est ouvert **When** je fais défiler les rouleaux **Then** le scroll snap sur chaque valeur avec friction et momentum, un fade en haut/bas, et un highlight sur la sélection courante

3. **Given** le time picker est ouvert avec une heure modifiée **When** je tape "OK" **Then** le toast revient à sa taille normale avec la nouvelle heure affichée **And** le cooldown repart à 5s

4. **Given** le composant TimePicker est implémenté **When** il est utilisé dans d'autres toasts (biberon, édition) **Then** le même composant est réutilisé (composant partagé dans ui/)

## Tasks / Subtasks

- [x] Task 1 — Créer le composant ScrollWheels (AC: #2)
  - [x] `src/components/ui/ScrollWheels.tsx` — DÉJÀ EXISTANT depuis Story 1.1
  - [x] Réutilisable (poids onboarding + TimePicker)
- [x] Task 2 — Créer le composant TimePicker (AC: #1, #3)
  - [x] `src/components/ui/TimePicker.tsx`
  - [x] Props : `initialTime: Date`, `onConfirm: (time: Date) => void`
  - [x] Deux colonnes ScrollWheels : heures (0–23), minutes (00–59)
  - [x] Séparateur "h", bouton "OK"
  - [x] Initialisation sur l'heure passée en prop
- [x] Task 3 — Intégrer TimePicker dans ToastTransition (AC: #1, #3)
  - [x] `src/components/toasts/ToastTransition.tsx` modifié
  - [x] State local `isPickerOpen`, `selectedTime`
  - [x] Cooldown pause quand picker ouvert, reset à 5s au OK
  - [x] Heure modifiée passée au POST /api/sleep-state

## Dev Notes

### ScrollWheels — Composant partagé
Ce composant est conçu pour être réutilisé dans :
- **TimePicker** (cette story) — heures + minutes
- **OnboardingForm** (Story 1.1) — poids du bébé en kg (si pas déjà implémenté)
- **Toast biberon** (Story 3.x) — via TimePicker

L'architecture définit `ScrollWheels.tsx` dans `components/ui/` — c'est un composant présentationnel pur, pas d'accès Context.

### Scroll snap — Implémentation CSS native
Privilégier CSS natif plutôt qu'une librairie :
```css
.wheel-column {
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
}
.wheel-item {
  scroll-snap-align: center;
  height: 40px;
}
```

Le fade en haut/bas se fait avec un masque CSS gradient :
```css
mask-image: linear-gradient(
  to bottom,
  transparent 0%,
  black 30%,
  black 70%,
  transparent 100%
);
```

### Cooldown — Pause et reset
Le CooldownButton doit supporter :
- **pause()** : stopper l'animation sans reset (quand picker s'ouvre)
- **reset()** : relancer le cooldown à 5s (quand picker se ferme ou alt tapé)

Implémentation via une ref exposant ces méthodes, ou via un state `isPaused` + `resetKey`.

### Touch UX
- Les rouleaux doivent répondre au touch avec inertie naturelle iOS
- Le highlight central (sélection) : fond légèrement accentué ou bordures haut/bas
- Taille des items : 40px minimum pour respecter les touch targets ≥ 44px

### Pas de librairie externe
NE PAS utiliser `react-mobile-picker`, `swiper` ou autre. Le scroll snap CSS natif + touch scrolling natif iOS est suffisant et plus léger.

### Anti-patterns à éviter
- NE PAS créer un modal séparé pour le time picker — il est **inline** dans le toast
- NE PAS utiliser un input type="time" — le design exige des scroll wheels
- NE PAS dupliquer le composant ScrollWheels — il doit être partagé dans `ui/`

### Dépendances
- Story 2.2 : ToastTransition, Toast, CooldownButton
- Story 2.1 : sleep-state-machine (pour les transitions)

### Project Structure Notes
- `src/components/ui/ScrollWheels.tsx` — composant réutilisable scroll wheels
- `src/components/ui/TimePicker.tsx` — wrapper heures + minutes
- Modification : `src/components/toasts/ToastTransition.tsx` — ajout time picker inline

### References

- [Source: docs/ux-sleep-state-machine.md#Time picker (tap sur l'heure)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — components/ui/ pour les composants partagés
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Experience Mechanics] — scroll wheels, snap, friction
- [Source: docs/design-reference.html] — Maquette time picker
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- ScrollWheels préexistant réutilisé sans modification

### Completion Notes List
- TimePicker avec 2 colonnes ScrollWheels (heures 0-23, minutes 00-59) + séparateur "h" + bouton OK
- Intégration inline dans ToastTransition avec pause/reset cooldown via CooldownButtonHandle ref

### Change Log
- 2026-03-08: Story 2.3 implémentée — TimePicker + intégration ToastTransition

### File List
- src/components/ui/TimePicker.tsx (nouveau)
- src/components/toasts/ToastTransition.tsx (modifié)
