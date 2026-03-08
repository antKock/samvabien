# Story 3.3: Header dashboard & accès profil

Status: done

## Story

As a parent,
I want voir la date du jour et le prénom du bébé dans le header,
So that j'ai le contexte de la journée et un accès rapide au profil.

## Acceptance Criteria

1. **Given** je suis sur le dashboard **When** l'écran est affiché **Then** le header affiche la date à gauche (format "Vendredi 7 mars", 10px, font-weight 600, couleur textSec) et "Prénom ⚙" à droite (même style, icône SVG gear 12×12, gap 3px)
2. **Given** je suis sur le dashboard **When** je tape sur "Prénom ⚙" **Then** je suis redirigé vers la page profil (page shell existante, contenu complété dans Epic 6)
3. **Given** le dashboard est affiché **When** j'observe le layout global **Then** les composants sont empilés : header → hero card → KPI card lait → KPI card sommeil → zone récap (placeholder pour Epic 4)

## Tasks / Subtasks

- [x] Task 1 — Créer `src/components/dashboard/DashboardHeader.tsx` (AC: #1)
  - [x] Date formatée en français : "Vendredi 7 mars" (majuscule initiale, sans année)
  - [x] Utiliser `Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })` puis capitaliser
  - [x] Style date : 10px, font-weight 600, couleur text-sec
  - [x] Prénom : lire `profile.babyName` via `useHousehold()`
  - [x] Icône ⚙ : SVG inline 12×12, stroke currentColor, gap 3px avec le prénom
  - [x] Style prénom : 10px, font-weight 600, couleur text-sec
- [x] Task 2 — Utiliser le composant `ProfileHeaderButton` existant ou créer le lien profil (AC: #2)
  - [x] Vérifier `src/components/profile/ProfileHeaderButton.tsx` — l'utiliser s'il expose la navigation
  - [x] ProfileHeaderButton réutilisé tel quel (10px, weight 600, text-sec, gear SVG 12×12, gap 3px, Link /profile)
- [x] Task 3 — Organiser le layout complet du dashboard `src/app/(app)/dashboard/page.tsx` (AC: #3)
  - [x] Stack vertical : DashboardHeader → HeroCard → KpiCardMilk → KpiCardSleep → zone récap (placeholder `<div>` vide)
  - [x] Espacement entre les éléments : gap 16px entre sections (flex col gap-4)
  - [x] Padding de page : 16px horizontal (px-4)
  - [x] Zone récap : simple `<div className="mt-4" />` placeholder pour Epic 4

## Dev Notes

### Date française — Formatage

```ts
function formatDateFr(): string {
  const date = new Date()
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
// Résultat : "Vendredi 7 mars"
```

NE PAS utiliser de librairie de dates (date-fns, luxon, dayjs) — `Intl.DateTimeFormat` natif suffit.

### Icône SVG gear ⚙

SVG inline simple, pas d'import de librairie d'icônes :
```tsx
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l..." />
</svg>
```

Utiliser une icône gear Lucide-style (stroke 2px). Le SVG doit mesurer 12×12 à l'affichage.

### Layout dashboard — Structure complète

```
┌─────────────────────────────────────┐
│ Vendredi 7 mars          Prénom ⚙  │  ← DashboardHeader
├─────────────────────────────────────┤
│                                     │
│           Hero Card                 │  ← HeroCard (Story 2.2)
│                                     │
├─────────────────────────────────────┤
│ Lait aujourd'hui        300 mL  ✓  │  ← KpiCardMilk (Story 3.1)
│ ████████████░░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────────────┤
│ Sommeil aujourd'hui      2h30      │  ← KpiCardSleep (Story 3.1)
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────────────┤
│ (placeholder récap — Epic 4)       │
└─────────────────────────────────────┘
```

### ProfileHeaderButton existant

Le composant `src/components/profile/ProfileHeaderButton.tsx` existe déjà (Story 1.x). Vérifier son API :
- S'il expose un bouton avec le prénom + icône → l'utiliser directement
- S'il ne correspond pas au design spec (10px, weight 600, text-sec, gear 12×12) → adapter ou créer le rendu dans DashboardHeader directement

### Anti-patterns à éviter
- NE PAS utiliser de librairie d'icônes externe (react-icons, heroicons) — SVG inline
- NE PAS utiliser de librairie de dates — `Intl.DateTimeFormat` natif
- NE PAS créer de composant `DashboardLayout` séparé — le layout est dans la page directement
- NE PAS ajouter de navigation ou menu — le dashboard est single-page, seul le bouton profil navigue

### Dépendances

| Module | Fichier | Usage |
|---|---|---|
| HouseholdContext | `src/contexts/HouseholdContext.tsx` | `useHousehold()` pour le prénom du bébé |
| HeroCard | `src/components/dashboard/HeroCard.tsx` | Déjà implémenté (Story 2.2) |
| KpiCardMilk | `src/components/dashboard/KpiCardMilk.tsx` | Story 3.1 |
| KpiCardSleep | `src/components/dashboard/KpiCardSleep.tsx` | Story 3.1 |
| ProfileHeaderButton | `src/components/profile/ProfileHeaderButton.tsx` | Potentiellement réutilisable |

### Project Structure Notes

Fichiers à créer :
- `src/components/dashboard/DashboardHeader.tsx`

Fichiers à modifier :
- `src/app/(app)/dashboard/page.tsx` — orchestration du layout complet

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System] — 10px font-weight 600
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation] — gap 16px, padding 16px
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — `src/components/dashboard/`
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — Dashboard layout
- [Source: _bmad-output/planning-artifacts/prd.md#FR11]
- [Source: docs/design-reference.html] — Maquette dashboard layout
- [Source: src/components/profile/ProfileHeaderButton.tsx] — Composant existant à vérifier

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- ProfileHeaderButton already matched spec exactly — reused as-is
- Extracted inline header from dashboard page into DashboardHeader component
- Removed `formatDateFr` from dashboard page (moved to DashboardHeader)

### Completion Notes List

- Created `DashboardHeader.tsx` with `formatDateFr` (Intl.DateTimeFormat native) and `ProfileHeaderButton`
- ProfileHeaderButton already implemented with correct styles — reused directly via composition
- Dashboard layout reorganized: flex col gap-4, stack order: Header → HeroCard → KpiCardMilk → KpiCardSleep → recap placeholder
- Recap zone placeholder added for Epic 4

### Change Log

- 2026-03-08: Story 3.3 implemented — DashboardHeader component, layout reorganization with recap placeholder
- 2026-03-08: Code review — Fixed: formatDateFr Intl.DateTimeFormat recreated on every render → extracted to module-level constant

### File List

- `src/components/dashboard/DashboardHeader.tsx` (created)
- `src/app/(app)/dashboard/page.tsx` (modified — extracted header, reorganized layout with gap-4 and recap placeholder)
