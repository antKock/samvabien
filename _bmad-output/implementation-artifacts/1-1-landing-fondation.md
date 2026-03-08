# Story 1.1: Landing screen & fondation projet

Status: review

## Story

As a visiteur,
I want voir une page d'accueil à l'ouverture de l'app,
So that je peux choisir de créer un profil, rejoindre un foyer, ou essayer la démo.

## Acceptance Criteria

1. **Given** je suis un nouveau visiteur sans session active **When** j'ouvre l'app **Then** je vois la landing screen avec l'illustration bébé, le nom "pousse" (32px, font-weight 800, couleur `sleep.icon`), et la tagline "Suivi bébé simple et serein" (10px, font-weight 600, couleur `textSec`) **And** je vois 3 boutons empilés : "Essayer la démo" (primary), "Créer un profil" (secondary), "Rejoindre un foyer" (lien discret)

2. **Given** le projet est initialisé **When** un développeur examine la configuration **Then** le projet utilise Next.js 16 (App Router, src dir, alias @/*), TypeScript strict, Tailwind CSS 4 avec la palette COLORS complète (day/night), la police Nunito, et les arrondis custom **And** le manifest PWA est configuré (name "pousse", display standalone, icônes) **And** la structure de dossiers respecte l'architecture définie

3. **Given** je suis sur un écran > 430px de large **When** j'affiche la landing screen **Then** le contenu est centré avec une largeur max (design mobile-only 375-430px)

## Tasks / Subtasks

- [x] Task 1 — Initialiser le projet Next.js (AC: #2)
  - [x] `npx create-next-app@latest samvabien --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] Installer les dépendances : `@supabase/supabase-js`, `jose`, `vitest`, `@testing-library/react`, `zod`
  - [x] Configurer `vitest.config.ts`
- [x] Task 2 — Configurer Tailwind CSS 4 avec la palette COLORS (AC: #2)
  - [x] Importer la police Nunito (Google Fonts) dans `globals.css`
  - [x] Définir les CSS variables day/night dans `globals.css` avec `data-theme="day"` et `data-theme="night"`
  - [x] Configurer les arrondis custom (14-16px, 20px, 32px) et l'échelle d'espacement base 4px
- [x] Task 3 — Créer la structure de dossiers complète (AC: #2)
  - [x] `src/app/(landing)/page.tsx` — Landing
  - [x] `src/app/(landing)/onboarding/page.tsx` — placeholder
  - [x] `src/app/(landing)/join/page.tsx` — placeholder
  - [x] `src/app/(app)/layout.tsx` — placeholder
  - [x] `src/app/(app)/page.tsx` — placeholder (dashboard shell vide)
  - [x] `src/app/(app)/profile/page.tsx` — placeholder
  - [x] `src/app/api/` — créer les dossiers pour les routes API (events, sleep-state, profiles, join, household, devices, leave)
  - [x] `src/components/` — dashboard/, toasts/, onboarding/, profile/, ui/
  - [x] `src/lib/` — supabase/, auth/, schemas/
  - [x] `src/hooks/`, `src/contexts/`, `src/types/`
- [x] Task 4 — Configurer PWA manifest (AC: #2)
  - [x] `public/manifest.json` : name "pousse", short_name "pousse", display "standalone", background_color, theme_color, icons 192+512
  - [x] `public/sw.js` : service worker minimal (cache assets, pas de mode offline)
  - [x] Référencer le manifest dans `layout.tsx` (<link rel="manifest">)
- [x] Task 5 — Créer les types partagés et schemas Zod de base (AC: #2)
  - [x] `src/types/index.ts` : SleepState, BabyEvent, Profile, DeviceSession
  - [x] `src/types/api.ts` : ApiResponse<T>, ApiError
  - [x] `src/lib/schemas/profile.ts` : CreateProfileSchema (baby_name, baby_dob, baby_weight_hg)
- [x] Task 6 — Configurer le client Supabase (AC: #2)
  - [x] `src/lib/supabase/client.ts` — createClient browser
  - [x] `src/lib/supabase/server.ts` — createClient server/API routes
  - [x] `.env.local` et `.env.example` : SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
- [x] Task 7 — Créer le composant LandingScreen (AC: #1, #3)
  - [x] `src/components/onboarding/LandingScreen.tsx`
  - [x] Illustration bébé (SVG inline ou image)
  - [x] Nom "pousse" : 32px, font-weight 800, couleur `sleep.icon` (#6a7a4a jour)
  - [x] Tagline "Suivi bébé simple et serein" : 10px, font-weight 600, couleur `textSec`
  - [x] 3 boutons empilés : "Essayer la démo" (primary: accentColor bg, texte blanc), "Créer un profil" (secondary: fond accent/10, border accent/20), "Rejoindre un foyer" (lien discret, sans fond)
  - [x] Centré verticalement, fond `bg` (#f6f5ee)
  - [x] Max-width 430px, centré sur écrans larges
- [x] Task 8 — Créer la page landing et le routing (AC: #1)
  - [x] `src/app/(landing)/page.tsx` : rend `<LandingScreen />`
  - [x] Liens : "Créer un profil" → `/onboarding`, "Rejoindre un foyer" → `/join`, "Essayer la démo" → logique démo (placeholder pour Epic 8)

## Dev Notes

### Architecture & Stack

- **Commande init** : `npx create-next-app@latest samvabien --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- **Next.js 16** : App Router, React 19.2, Turbopack, React Compiler
- **Tailwind CSS 4** : via PostCSS, sans shadcn/ui — composants custom uniquement
- **Pas de CSS custom** : tout passe par Tailwind + CSS variables. Jamais de fichier .css séparé sauf globals.css

### Palette COLORS complète

```javascript
COLORS = {
  day: {
    bg:'#f6f5ee', surface:'#ffffff', text:'#32321e', textSec:'#8a8870',
    sleep: { bg:'#eaecda', accent:'#8a9a6a', icon:'#6a7a4a' },
    milk: { bg:'#f5e6d6', accent:'#c08a60', icon:'#a06840' },
    hero: { text:'#4a5a32' },
    border:'rgba(0,0,0,0.06)', track:'#dce0cc',
  },
  night: {
    bg:'#181810', surface:'#22221a', text:'#c8c8b0', textSec:'#7a7a60',
    sleep: { bg:'#222818', accent:'#7a8a5a', icon:'#98a878' },
    milk: { bg:'#261e14', accent:'#b08050', icon:'#cca070' },
    hero: { text:'#98a878' },
    border:'rgba(255,255,255,0.06)', track:'#3e402e',
  }
}
```

### Structure cible du projet

```
src/
  app/
    globals.css          # CSS variables (day/night tokens), Nunito import
    layout.tsx           # ThemeProvider wrapper, metadata, manifest link
    (landing)/
      page.tsx           # Landing (3 CTAs)
      onboarding/page.tsx # Placeholder
      join/page.tsx       # Placeholder
    (app)/
      layout.tsx          # Placeholder (auth guard + data loading ultérieur)
      page.tsx            # Placeholder (dashboard shell vide)
      profile/page.tsx    # Placeholder
    api/                  # Dossiers vides pour les routes API
  components/
    onboarding/LandingScreen.tsx
    dashboard/           # Vide (Epic 2+)
    toasts/              # Vide (Epic 2+)
    profile/             # Vide (Story 1.5)
    ui/                  # Vide (Story 1.2+)
  lib/
    supabase/client.ts, server.ts
    auth/                # Vide (Story 1.2)
    schemas/profile.ts
  hooks/                 # Vide
  contexts/              # Vide
  types/index.ts, api.ts
```

### Conventions de naming

- **DB** : snake_case — `baby_name`, `sleep_state`, `profile_id`
- **TypeScript** : camelCase — `sleepState`, `babyName`
- **Types/interfaces** : PascalCase — `SleepState`, `Profile`, `BabyEvent`
- **Constantes** : UPPERCASE — `SLEEP_THRESHOLDS`, `COLORS`
- **Fichiers lib/** : kebab-case — `sleep-state-machine.ts`
- **Composants React** : PascalCase fichier et export — `LandingScreen.tsx`
- **API responses** : `{ data: T }` ou `{ error: { message, code? } }`
- **Mapping** : snake_case ↔ camelCase dans les API routes, pas dans les composants

### Anti-patterns à éviter

- `any` en TypeScript — toujours typer explicitement
- CSS-in-JS ou fichiers .css séparés — Tailwind uniquement
- localStorage pour la persistance — Supabase (sauf mode démo = React state)
- Textes hardcodés en anglais — tout le contenu UI est en français
- Rouge alarmiste, emoji négatif — principe UX anti-anxiété

### Typographie Nunito

- KPI values : 26px, weight 800
- Timer/chrono : 20px, weight 800
- Baby name : 24px, weight 800
- Section titles : 16px, weight 800
- Body/labels : 13-14px, weight 600-700
- Captions : 11-12px, weight 600
- Micro : 9-10px, weight 700
- Jamais de weight 400 (trop léger sur mobile)

### Accessibilité

- Contraste WCAG AA minimum
- Touch targets ≥ 44px
- Taille de police minimum 11px

### Design mobile-only

- Optimisé 375-430px
- Contenu centré avec max-width sur écrans plus larges
- Single column, pas de grille multi-colonnes

### Project Structure Notes

- Cette story pose la fondation complète du projet : init, config, structure, types, premier composant UI
- Les placeholders permettent aux stories suivantes de s'insérer sans restructuration
- Le service worker est minimal (cache assets) — pas de mode offline

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure du Projet]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System]
- [Source: docs/ux-onboarding-profil.md#Landing screen]
- [Source: docs/design-reference.html#COLORS]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Build conflict résolu : route groups (app) et (landing) ne peuvent pas avoir page.tsx à `/` → dashboard déplacé vers `/dashboard`
- CSS @import order fixé : Google Fonts doit précéder @import "tailwindcss"

### Completion Notes List
- ✅ Projet Next.js 16 initialisé avec TypeScript, Tailwind CSS 4, ESLint, App Router, src dir
- ✅ Dépendances installées : @supabase/supabase-js, jose, zod, vitest, @testing-library/react
- ✅ Palette COLORS day/night complète via CSS variables + data-theme
- ✅ Police Nunito importée (weights 600, 700, 800)
- ✅ Structure de dossiers complète avec tous les placeholders
- ✅ PWA manifest configuré + service worker minimal
- ✅ Types partagés (SleepState, BabyEvent, Profile, DeviceSession, ApiResponse, ApiError)
- ✅ Schema Zod CreateProfileSchema
- ✅ Client Supabase (browser + server)
- ✅ LandingScreen avec illustration SVG, nom "pousse", tagline, 3 boutons
- ✅ 4 tests unitaires passent
- ✅ Build Next.js réussi

### Change Log
- 2026-03-08 : Story 1.1 implémentée — fondation projet complète

### File List
- src/app/globals.css (modifié)
- src/app/layout.tsx (modifié)
- src/app/(landing)/page.tsx (créé)
- src/app/(landing)/onboarding/page.tsx (créé)
- src/app/(landing)/join/page.tsx (créé)
- src/app/(app)/layout.tsx (créé)
- src/app/(app)/dashboard/page.tsx (créé)
- src/app/(app)/profile/page.tsx (créé)
- src/components/onboarding/LandingScreen.tsx (créé)
- src/components/onboarding/__tests__/LandingScreen.test.tsx (créé)
- src/types/index.ts (créé)
- src/types/api.ts (créé)
- src/lib/schemas/profile.ts (créé)
- src/lib/supabase/client.ts (créé)
- src/lib/supabase/server.ts (créé)
- src/test/setup.ts (créé)
- vitest.config.ts (créé)
- public/manifest.json (créé)
- public/sw.js (créé)
- .env.example (créé)
- .env.local (créé)
- .gitignore (modifié)
