# Story 4.1: Récap antéchronologique des événements

Status: review

## Story

As a parent,
I want voir la liste de tous les événements de la journée,
So that je sais exactement ce qui s'est passé d'un coup d'œil.

## Acceptance Criteria

1. **Given** le cycle en cours contient des biberons et des siestes terminées **When** j'ouvre le dashboard et je scrolle sous les KPI cards **Then** je vois le titre "Aujourd'hui" (uppercase, 9px, weight 700, textSec, margin-top 6px) suivi de la liste antéchronologique des événements

2. **Given** un biberon de 150 mL a été enregistré à 12h15 **When** la liste est affichée **Then** je vois une ligne : dot orange (5px) + "Biberon" (11px, weight 600) + "12h15" (10px, weight 600, textSec) + "150 mL" (11px, weight 700, couleur milk.icon)

3. **Given** une sieste de 1h23 a démarré à 14h30 et est terminée **When** la liste est affichée **Then** je vois une ligne : dot vert + "Sieste" + "14h30" + "1h23"

4. **Given** la nuit a duré de 19h30 à 5h50 avec un réveil nocturne de 3h15 à 3h27 **When** la liste est affichée **Then** je vois les lignes : "Nuit" (19h30–5h50, 10h20) + "Réveil nocturne" (3h15–3h27, 12min)

5. **Given** un import crèche "Matin" a été saisi sans heure précise **When** la liste est affichée **Then** la ligne affiche "Matin" au lieu de l'heure et est triée comme 12h00 en antéchrono

6. **Given** un événement dure ≥ 1h **When** affiché **Then** format "Xh00" (ex. "1h23", "10h20")

7. **Given** un événement dure < 1h **When** affiché **Then** format "Xmin" (ex. "12min", "45min")

8. **Given** une sieste ou nuit est en cours (pas terminée) **When** la liste est affichée **Then** l'événement en cours n'apparaît PAS dans le récap

9. **Given** aucun événement dans le cycle **When** la liste est affichée **Then** titre "Aujourd'hui" + placeholder "Les événements s'afficheront ici" (11px, textSec, centré)

10. **Given** le module `lib/format.ts` est implémenté **When** je lance vitest **Then** les tests de formatage passent

## Tasks / Subtasks

- [x] Task 1 — Créer `src/components/dashboard/RecapList.tsx` (AC: #1, #8, #9)
  - [x] Titre "AUJOURD'HUI" : uppercase, 9px, weight 700, textSec, mt-[6px]
  - [x] Consommer `useHousehold()` pour récupérer `events`
  - [x] Appeler `eventsInCycle(events)` de `@/lib/cycle-window` pour filtrer + trier
  - [x] Filtrer les événements en cours : exclure ceux avec `endedAt === null` ET type `nap|night|night-wake`
  - [x] Biberons : toujours affichés (pas de `endedAt`)
  - [x] État vide : "Les événements s'afficheront ici" (11px, textSec, text-center)
- [x] Task 2 — Créer `src/components/dashboard/RecapItem.tsx` (AC: #2, #3, #4, #5, #6, #7)
  - [x] Props : `event: BabyEvent`, `onTap: (event: BabyEvent) => void`
  - [x] Dot coloré 5px : `sleep.accent` (vert) pour nap/night/night-wake, `milk.accent` (orange) pour bottle
  - [x] Label : "Biberon" | "Sieste" | "Nuit" | "Réveil nocturne" — 11px, weight 600
  - [x] Heure : `formatTime(new Date(event.startedAt))` ou label moment ("Matin"/"Midi"/"Après-midi") — 10px, weight 600, textSec
  - [x] Pour nuit/night-wake avec startedAt ET endedAt : plage "Xh00–Xh00"
  - [x] Valeur : `formatDuration(event.value * 60000)` pour sommeil, `${event.value} mL` pour biberon — 11px, weight 700, couleur icon catégorie
  - [x] Séparateur : border-bottom 1px `border`
  - [x] Tap → `onTap(event)` (affordance cachée, pas de feedback visuel au tap)
- [x] Task 3 — Intégrer RecapList dans le dashboard (AC: #1)
  - [x] Remplacer le placeholder `<div className="mt-4" />` dans `src/app/(app)/dashboard/page.tsx`
  - [x] Passer un callback `onEventTap` pour préparer l'intégration du toast d'édition (Story 4.2)
- [x] Task 4 — Tests `lib/format.ts` (AC: #10)
  - [x] Vérifier que `src/lib/format.test.ts` existe et couvre : 0min, 12min, 45min, 1h00, 1h23, 10h20
  - [x] Vérifier `formatTime` : 5h50 (pas 05h50), 14h30, 0h05
  - [x] Ajouter les tests manquants si nécessaire

## Dev Notes

### Architecture — Composants à créer

```
src/components/dashboard/
  RecapList.tsx          ← Nouveau (orchestration liste + titre + état vide)
  RecapItem.tsx          ← Nouveau (ligne individuelle, tap handler)
```

### Données & tri

`eventsInCycle()` dans `src/lib/cycle-window.ts` retourne déjà les événements filtrés et triés en antéchrono. Le composant doit juste :
1. Appeler `eventsInCycle(events)`
2. Filtrer les événements en cours (sleep events sans `endedAt`)
3. Rendre chaque événement avec `RecapItem`

**Tri des imports sans heure :** `eventsInCycle()` utilise déjà `getEventTime()` qui mappe `moment` → heure approximative (`morning`→10h, `noon`→12h, `afternoon`→15h). Le tri est déjà correct.

ATTENTION : la spec UX `docs/ux-recap-today.md` dit le tri par **borne de fin du créneau** : Matin→12h00, Midi→13h00, Après-midi→17h00. Or `cycle-window.ts` utilise `morning→10h, noon→12h, afternoon→15h`. Il y a un décalage. **Décision : suivre la spec UX** — ajuster les constantes `MOMENT_HOURS` dans `cycle-window.ts` pour matcher la borne de fin du créneau :
```ts
const MOMENT_HOURS: Record<string, number> = {
  morning: 12,  // était 10
  noon: 13,     // était 12
  afternoon: 17, // était 15
}
```
Cet ajustement affectera aussi les KPI cards (même module) — vérifier que ça ne casse rien. Les heures de tri ne sont utilisées que pour l'ordre d'affichage, pas pour le calcul des valeurs.

### Labels moment en français

```ts
const MOMENT_LABELS: Record<string, string> = {
  morning: 'Matin',
  noon: 'Midi',
  afternoon: 'Après-midi',
}
```

### Anatomie visuelle d'une ligne

```
[dot 5px]  Label                    heure       valeur
    ●      Sieste                  14h30        1h23
    ●      Biberon                 12h15       150 mL
    ●      Biberon                 Matin       180 mL
    ●      Réveil nocturne      3h15–3h27       12min
    ●      Nuit                19h30–5h50      10h20
```

Layout : flex row, items-center, gap entre les éléments. Le label prend le flex-1, l'heure et la valeur sont à droite.

### Event type → display mapping

| `event.type` | Label | Dot color CSS var | Value color CSS var | Heure format |
|---|---|---|---|---|
| `bottle` | Biberon | `var(--milk-accent)` | `var(--milk-icon)` | `formatTime()` ou moment label |
| `nap` | Sieste | `var(--sleep-accent)` | `var(--sleep-icon)` | `formatTime()` |
| `night` | Nuit | `var(--sleep-accent)` | `var(--sleep-icon)` | Plage `startedAt–endedAt` |
| `night-wake` | Réveil nocturne | `var(--sleep-accent)` | `var(--sleep-icon)` | Plage `startedAt–endedAt` |

### Filtrage des événements en cours

Les événements de sommeil en cours (sieste ou nuit qui n'a pas encore de `endedAt`) ne doivent PAS apparaître. Règle :
- `type === 'bottle'` → toujours affiché (pas de endedAt pour les biberons)
- `type !== 'bottle'` ET `endedAt === null` → masqué (en cours)
- `type !== 'bottle'` ET `endedAt !== null` → affiché

### Durée des événements — calcul de la valeur affichée

`event.value` contient :
- **Biberons** : volume en mL → afficher `${event.value} mL`
- **Sommeil** : durée en minutes → `formatDuration(event.value * 60000)` (la fonction attend des ms)

### Plage horaire pour nuit et night-wake

Si `event.startedAt` ET `event.endedAt` existent :
```ts
`${formatTime(new Date(event.startedAt))}–${formatTime(new Date(event.endedAt))}`
// Ex: "19h30–5h50", "3h15–3h27"
```

### Modules existants à réutiliser

| Module | Import | Usage |
|---|---|---|
| `eventsInCycle` | `@/lib/cycle-window` | Filtrage cycle + tri antéchrono |
| `formatDuration` | `@/lib/format` | Durées "1h23" / "12min" |
| `formatTime` | `@/lib/format` | Heures "14h30" / "5h50" |
| `useHousehold` | `@/hooks/useHousehold` | Accès events + profile |
| `BabyEvent` | `@/types` | Type des événements |

### CSS variables disponibles (globals.css)

- `var(--milk-accent)` — orange, dot biberon
- `var(--milk-icon)` — couleur valeur biberon
- `var(--sleep-accent)` — vert, dot sommeil
- `var(--sleep-icon)` — couleur valeur sommeil
- `var(--text-sec)` — texte secondaire
- `var(--border)` — séparateur
- `var(--text)` — texte principal

### Anti-patterns à éviter

- NE PAS recalculer le tri manuellement — `eventsInCycle()` le fait déjà
- NE PAS utiliser de librairie de dates (date-fns, luxon) — `formatTime` et `formatDuration` natifs suffisent
- NE PAS ajouter d'emoji dans les lignes du récap — seul le dot coloré catégorise (spec UX)
- NE PAS afficher les phases d'éveil dans le récap — seuls biberons, siestes, nuits et réveils nocturnes
- NE PAS créer de scroll interne — la liste est inline dans la page, scroll natif
- NE PAS ajouter d'indication visuelle de tap (pas de hover/active state visible) — affordance cachée

### Dashboard page — modification attendue

Dans `src/app/(app)/dashboard/page.tsx`, remplacer :
```tsx
{/* Recap placeholder (Epic 4) */}
<div className="mt-4" />
```
Par :
```tsx
{/* Récap */}
<RecapList onEventTap={(event) => { /* Story 4.2 */ }} />
```

### Project Structure Notes

Fichiers à créer :
- `src/components/dashboard/RecapList.tsx`
- `src/components/dashboard/RecapItem.tsx`

Fichiers à modifier :
- `src/app/(app)/dashboard/page.tsx` — remplacer placeholder par RecapList
- `src/lib/cycle-window.ts` — ajuster `MOMENT_HOURS` pour matcher spec UX (borne de fin)

Fichiers de test :
- `src/lib/format.test.ts` — vérifier couverture existante, compléter si nécessaire

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: docs/ux-recap-today.md] — spec complète du récap (anatomie, tri, interactions, état vide)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Récap Aujourd'hui]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — composants dashboard/
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — durées, heures
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — organisation composants
- [Source: src/lib/cycle-window.ts] — eventsInCycle(), MOMENT_HOURS
- [Source: src/lib/format.ts] — formatDuration(), formatTime()
- [Source: src/types/index.ts] — BabyEvent, EventType, Moment
- [Source: src/app/(app)/dashboard/page.tsx] — placeholder récap existant
- [Source: _bmad-output/implementation-artifacts/3-3-header-dashboard-profil.md] — layout dashboard, gap-4

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Créé `RecapList.tsx` : orchestration liste antéchrono avec titre AUJOURD'HUI, filtrage événements en cours, état vide
- Créé `RecapItem.tsx` : ligne individuelle avec dot coloré, label, heure (simple ou plage), valeur formatée, tap handler
- Ajusté `MOMENT_HOURS` dans `cycle-window.ts` pour matcher la spec UX (borne de fin : morning→12, noon→13, afternoon→17)
- Intégré `RecapList` dans le dashboard en remplacement du placeholder Epic 4
- Complété les tests `format.test.ts` avec les cas spécifiques de la story (12min, 1h23, 10h20, 0h05)
- 80/80 tests passent, aucune régression

### File List

- `src/components/dashboard/RecapList.tsx` (nouveau)
- `src/components/dashboard/RecapItem.tsx` (nouveau)
- `src/app/(app)/dashboard/page.tsx` (modifié — import RecapList, remplacement placeholder)
- `src/lib/cycle-window.ts` (modifié — MOMENT_HOURS ajusté pour spec UX)
- `src/lib/format.test.ts` (modifié — ajout cas de test 12min, 1h23, 10h20, 0h05)

## Change Log

- 2026-03-08 : Implémentation complète du récap antéchronologique — composants RecapList/RecapItem, intégration dashboard, ajustement tri moments, tests formatage complétés
