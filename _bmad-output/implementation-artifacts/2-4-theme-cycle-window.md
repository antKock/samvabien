# Story 2.4: Thème jour/nuit & cycle coucher→coucher

Status: done

## Story

As a parent,
I want que l'app bascule automatiquement entre thème jour et thème nuit selon l'état du bébé,
So that l'interface s'adapte au contexte.

## Acceptance Criteria

1. **Given** le bébé est en état `awake` **When** l'app est affichée **Then** le thème jour est appliqué (data-theme="day" sur `<html>`, CSS variables COLORS.day)

2. **Given** le bébé est en état `nap`, `night`, `night-wake`, ou `night-sleep` **When** l'app est affichée **Then** le thème nuit est appliqué (data-theme="night" sur `<html>`, CSS variables COLORS.night)

3. **Given** le bébé passe de `awake` à `nap` **When** la transition est confirmée **Then** le thème bascule de jour à nuit avec une transition CSS douce

4. **Given** le module `lib/cycle-window.ts` est implémenté **When** j'appelle `currentCycleStart()` et le dernier coucher (état `night`) était hier à 19h30 **Then** la fonction retourne le timestamp de 19h30 hier

5. **Given** aucun coucher n'a été enregistré **When** j'appelle `currentCycleStart()` **Then** la fonction retourne minuit du jour en cours (fallback)

6. **Given** j'appelle `eventsInCycle(events)` **When** je passe la liste de tous les événements **Then** seuls les événements dont le timestamp (started_at ou moment converti) est ≥ currentCycleStart sont retournés

7. **Given** les tests unitaires de cycle-window **When** je lance vitest **Then** les cas suivants passent : cycle normal (coucher→coucher), fallback minuit, événements en dehors du cycle filtrés

## Tasks / Subtasks

- [x] Task 1 — Configurer les CSS variables jour/nuit dans globals.css (AC: #1, #2)
  - [x] `src/app/globals.css` — DÉJÀ CONFIGURÉ depuis Story 1.1
  - [x] Tokens day/night définis avec toutes les couleurs requises
  - [x] Transition CSS douce ajoutée : `html { transition: background-color 0.5s ease, color 0.3s ease; }`
  - [x] Mapping Tailwind via `@theme inline` (Tailwind v4 natif)
- [x] Task 2 — Créer le ThemeContext (AC: #1, #2, #3)
  - [x] `src/contexts/ThemeContext.tsx`
  - [x] Lit sleepState depuis HouseholdContext, applique data-theme via useEffect
  - [x] Provider wrappé dans `src/app/(app)/layout.tsx` (inside HouseholdProvider)
  - [x] Valeur par défaut : 'day'
- [x] Task 3 — Créer le hook useTheme (AC: #1, #2)
  - [x] `src/hooks/useTheme.ts`
  - [x] Retourne `{ theme: 'day' | 'night' }`
- [x] Task 4 — Implémenter `lib/cycle-window.ts` (AC: #4, #5, #6)
  - [x] `src/lib/cycle-window.ts`
  - [x] `currentCycleStart(events)` — dernier 'night' event ou fallback minuit
  - [x] `eventsInCycle(events)` — filtrage ≥ cycleStart, ordre antéchronologique
  - [x] `rollingAverage(events, days, contextHour, type)` — moyenne contextualisée
  - [x] Support événements moment (crèche) avec heures approximatives
  - [x] Export nommé
- [x] Task 5 — Écrire les tests `lib/cycle-window.test.ts` (AC: #7)
  - [x] Test cycle normal : coucher hier 19h30 → cycleStart = hier 19h30
  - [x] Test fallback : aucun coucher → cycleStart = minuit aujourd'hui
  - [x] Test filtrage : événements avant cycleStart exclus, après inclus
  - [x] Test événements avec moment : correctement filtrés
  - [x] Test rollingAverage : moyenne sur 3 jours avec contextHour
  - [x] 9 tests passent

## Dev Notes

### Thème — data-attribute, pas media query
Le thème est piloté par l'**état du bébé**, PAS par les préférences système (`prefers-color-scheme`). La règle est simple :
- `awake` → `data-theme="day"`
- Tout autre état → `data-theme="night"`

### Transition CSS douce
La transition entre les thèmes doit être fluide (0.3-0.5s). Toutes les propriétés utilisant les CSS variables changeront automatiquement grâce au sélecteur `[data-theme]`.

Important : la transition se déclenche à chaque changement d'état sommeil (awake↔nap, awake↔night, etc.). L'optimistic update du HouseholdContext change le sleepState → le ThemeContext réagit → l'attribut data-theme change → les CSS variables transitionnent.

### Tailwind + CSS Variables
Tailwind CSS 4 supporte nativement les CSS variables comme valeurs de thème. Configuration dans `tailwind.config.ts` :
```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)',
      surface: 'var(--surface)',
      text: 'var(--text)',
      'text-sec': 'var(--text-sec)',
      'hero-text': 'var(--hero-text)',
      border: 'var(--border)',
      track: 'var(--track)',
      'sleep-bg': 'var(--sleep-bg)',
      'sleep-accent': 'var(--sleep-accent)',
      'milk-bg': 'var(--milk-bg)',
      'milk-accent': 'var(--milk-accent)',
    }
  }
}
```

### CycleWindow — Logique critique
Le cycle coucher→coucher est un cross-cutting concern utilisé par :
- KPI cards (total lait/sommeil du cycle)
- Récap (liste des événements du cycle)
- Reset des compteurs au coucher

La fonction `currentCycleStart` cherche le **dernier événement de type 'night'** dans les events. C'est le moment du coucher. Tout ce qui se passe après ce coucher fait partie du cycle en cours.

### Moment → heure approximative
Les événements import crèche ont un `moment` au lieu d'un `started_at`. Pour le filtrage et le tri :
- `'morning'` → 10h00
- `'noon'` → 12h00
- `'afternoon'` → 15h00

Ces heures approximatives servent uniquement au tri et au filtrage du cycle, pas à l'affichage.

### Ordre des événements dans eventsInCycle
Retourner les événements en ordre **antéchronologique** (plus récent en premier) — c'est l'ordre utilisé par le récap.

### Rolling average — Contextualisation
La moyenne 3 jours est contextualisée à l'heure courante. Exemple à 14h :
- Jour J-1 : compter seulement les événements avant 14h
- Jour J-2 : compter seulement les événements avant 14h
- Jour J-3 : compter seulement les événements avant 14h
- Moyenne = somme / 3

Pour les événements avec `moment` : utiliser les heures approximatives définies ci-dessus.

### Anti-patterns à éviter
- NE PAS utiliser `prefers-color-scheme` — le thème suit l'état du bébé
- NE PAS mettre la logique de cycle dans les composants — tout passe par `cycle-window.ts`
- NE PAS créer un service CycleWindow comme une classe — des fonctions pures suffisent
- NE PAS hardcoder les couleurs dans les composants — toujours utiliser les CSS variables via Tailwind

### Dépendances
- Story 2.1 : sleep-state-machine.ts (getTheme)
- Story 2.2 : HouseholdContext (sleepState), HeroCard (consomme le thème)
- Story 1.1 : globals.css, tailwind.config.ts

### Project Structure Notes
- `src/app/globals.css` — CSS variables day/night tokens
- `tailwind.config.ts` — mapping CSS variables → classes Tailwind
- `src/contexts/ThemeContext.tsx` — provider thème
- `src/hooks/useTheme.ts` — hook accès thème
- `src/lib/cycle-window.ts` — logique cycle coucher→coucher
- `src/lib/cycle-window.test.ts` — tests co-localisés

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — Palette COLORS complète day/night
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — ThemeProvider, CycleWindow
- [Source: _bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns] — Cycle coucher→coucher
- [Source: docs/ux-kpi-cards.md#Fenêtre de données] — Cycle coucher→coucher, fallback minuit
- [Source: docs/ux-sleep-state-machine.md] — getTheme : awake→day, reste→night
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR18, FR45]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- CSS variables day/night déjà configurées depuis Story 1.1
- Tailwind v4 @theme inline utilisé au lieu de tailwind.config.ts

### Completion Notes List
- ThemeContext lit sleepState, applique data-theme sur <html>, transition CSS douce
- useTheme hook expose le thème courant
- cycle-window.ts : currentCycleStart, eventsInCycle, rollingAverage — fonctions pures
- 9 tests cycle-window passent (cycle normal, fallback, filtrage, crèche, rolling average)

### Change Log
- 2026-03-08: Story 2.4 implémentée — ThemeContext + cycle-window.ts

### File List
- src/contexts/ThemeContext.tsx (nouveau)
- src/hooks/useTheme.ts (nouveau)
- src/lib/cycle-window.ts (nouveau)
- src/lib/cycle-window.test.ts (nouveau)
- src/app/globals.css (modifié — ajout transition CSS html)
- src/app/(app)/layout.tsx (modifié — ajout ThemeProvider)
