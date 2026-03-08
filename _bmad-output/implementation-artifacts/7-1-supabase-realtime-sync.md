# Story 7.1: Supabase Realtime — sync inter-appareils

Status: ready-for-dev

## Story

As a parent,
I want voir les saisies de l'autre parent apparaître automatiquement sur mon écran,
So that on partage les mêmes données sans se les envoyer.

## Acceptance Criteria

1. **Given** je suis connecté au dashboard **When** le composant (app)/layout.tsx se monte **Then** le hook useRealtimeSync subscribe au channel Supabase Realtime `household:{profileId}` **And** il écoute les événements INSERT, UPDATE, DELETE sur pousse_events et UPDATE sur pousse_profiles

2. **Given** l'autre parent enregistre un biberon sur son appareil **When** l'événement INSERT est broadcasté par Supabase Realtime **Then** le nouvel événement apparaît dans mon récap, la KPI card lait se met à jour, sans refresh manuel **And** la latence est < 5s (NFR)

3. **Given** l'autre parent modifie un événement (PATCH) **When** l'événement UPDATE est broadcasté **Then** la valeur mise à jour est reflétée dans mon récap et mes KPI cards

4. **Given** l'autre parent supprime un événement (DELETE) **When** l'événement DELETE est broadcasté **Then** l'événement disparaît de mon récap et les KPI cards se recalculent

5. **Given** l'autre parent déclenche une transition sommeil **When** l'UPDATE de pousse_profiles (sleep_state) est broadcasté **Then** ma hero card se met à jour (nouvel état, compteur), le thème bascule si nécessaire

6. **Given** je suis en mode démo (isDemo = true) **When** le composant se monte **Then** aucune subscription Realtime n'est créée (pas d'appel réseau en démo)

## Tasks / Subtasks

- [ ] Task 1 — Créer `src/hooks/useRealtimeSync.ts` (AC: #1, #6)
  - [ ] Importer `supabase` depuis `@/lib/supabase/client`
  - [ ] Paramètres : `profileId: string | null`, `isDemo: boolean`
  - [ ] Guard : si `isDemo` ou `!profileId` → ne rien subscribe, retourner
  - [ ] Subscribe au channel `household:{profileId}` via `supabase.channel(...)`
  - [ ] Écouter les changements sur `pousse_events` filtrés par `profile_id=eq.{profileId}` — INSERT, UPDATE, DELETE
  - [ ] Écouter les changements sur `pousse_profiles` filtré par `id=eq.{profileId}` — UPDATE uniquement
  - [ ] Cleanup : `supabase.removeChannel(channel)` au démontage du composant
- [ ] Task 2 — Ajouter des méthodes de mutation interne au `HouseholdContext` (AC: #2, #3, #4, #5)
  - [ ] Ajouter `_ingestRealtimeEvent(type: 'INSERT' | 'UPDATE' | 'DELETE', payload: Record<string, unknown>)` — méthode interne
  - [ ] INSERT : mapper snake_case → camelCase, ajouter l'event au state (éviter les doublons par id)
  - [ ] UPDATE : mapper et mettre à jour l'event existant par id
  - [ ] DELETE : retirer l'event par `old.id`
  - [ ] Ajouter `_ingestRealtimeProfile(payload: Record<string, unknown>)` — mettre à jour le profile dans le state
  - [ ] Mapper `sleep_state` → `sleepState`, `sleep_state_since` → `sleepStateSince`, `sleep_state_moment` → `sleepStateMoment`, `baby_name` → `babyName`, etc.
- [ ] Task 3 — Brancher le hook dans `(app)/layout.tsx` (AC: #1)
  - [ ] Appeler `useRealtimeSync(profile?.id ?? null, isDemo)` dans le composant AppLayout
  - [ ] Passer les callbacks d'ingestion depuis le context
- [ ] Task 4 — Gérer les doublons optimistic vs Realtime (AC: #2, #3)
  - [ ] Quand un INSERT arrive par Realtime et que l'event a déjà le même `id` dans le state (suite à un optimistic update local) → ignorer l'INSERT
  - [ ] Quand un INSERT arrive avec un id inconnu → l'ajouter (c'est un event de l'autre appareil)
  - [ ] Quand un UPDATE arrive pour un event temp (`temp-*` id) → le remplacer par l'event serveur
- [ ] Task 5 — Tests unitaires (AC: #1-#6)
  - [ ] Test : useRealtimeSync subscribe au bon channel avec le profileId
  - [ ] Test : useRealtimeSync ne subscribe pas en mode démo
  - [ ] Test : INSERT broadcasté → event ajouté au state
  - [ ] Test : UPDATE broadcasté → event mis à jour
  - [ ] Test : DELETE broadcasté → event retiré
  - [ ] Test : UPDATE profiles → sleepState mis à jour dans le context
  - [ ] Test : doublon optimistic ignoré (même id)

## Dev Notes

### Architecture Supabase Realtime

L'architecture spécifie un **unique channel par foyer** : `household:{profileId}`. Supabase Realtime supporte l'écoute de changements sur des tables via `postgres_changes`.

```ts
const channel = supabase
  .channel(`household:${profileId}`)
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'pousse_events',
      filter: `profile_id=eq.${profileId}`,
    },
    (payload) => handleEventChange(payload)
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'pousse_profiles',
      filter: `id=eq.${profileId}`,
    },
    (payload) => handleProfileChange(payload)
  )
  .subscribe()
```

### Mapping snake_case → camelCase

Le Realtime payload arrive en **snake_case** (format DB). Il faut mapper vers camelCase avant d'injecter dans le state.

```ts
function mapEventFromDb(row: Record<string, unknown>): BabyEvent {
  return {
    id: row.id as string,
    profileId: row.profile_id as string,
    type: row.type as EventType,
    value: row.value as number,
    startedAt: (row.started_at as string) ?? null,
    endedAt: (row.ended_at as string) ?? null,
    moment: (row.moment as Moment) ?? null,
    createdAt: row.created_at as string,
  }
}

function mapProfileFromDb(row: Record<string, unknown>): Partial<Profile> {
  return {
    sleepState: row.sleep_state as SleepState,
    sleepStateSince: (row.sleep_state_since as string) ?? null,
    sleepStateMoment: (row.sleep_state_moment as Moment) ?? null,
    babyName: row.baby_name as string,
    babyDob: row.baby_dob as string,
    babyWeightHg: row.baby_weight_hg as number,
    weightReminder: row.weight_reminder as boolean,
  }
}
```

**Important** : extraire ces fonctions de mapping dans un fichier partagé `lib/supabase/mappers.ts` car le même mapping est nécessaire dans `api/household/route.ts`. NE PAS dupliquer la logique.

### Gestion des doublons optimistic

Le problème : quand je saisie un biberon, `addEvent()` crée un event optimistic avec id `temp-{timestamp}`, puis l'API retourne l'event serveur avec le vrai id et remplace le temp. Mais Supabase Realtime envoie aussi un INSERT pour le même event (vrai id).

**Solution** : dans le handler INSERT, vérifier si l'event existe déjà par `id`. Si oui → ignorer. Le flux est :
1. `addEvent()` → optimistic `temp-123` dans le state
2. API retourne → remplace `temp-123` par `real-uuid` dans le state
3. Realtime INSERT `real-uuid` → existe déjà → ignore

Pour les events de **l'autre appareil** :
1. Realtime INSERT `other-uuid` → n'existe pas → ajouter au state

### RLS Supabase — prérequis

Pour que Realtime fonctionne, il faut que les policies RLS soient configurées sur les tables `pousse_events` et `pousse_profiles`. Vérifier que la policy `SELECT` est en place pour le filtre `profile_id`.

**Si RLS n'est pas configuré** : Supabase Realtime ne filtrera pas correctement et pourrait exposer les events d'autres foyers. C'est un **prérequis critique**.

### Supabase client-side

Le fichier `src/lib/supabase/client.ts` exporte déjà un client Supabase browser-side. Réutiliser ce client pour les subscriptions Realtime.

### Anti-patterns à éviter

- NE PAS créer un polling/interval comme fallback — Supabase Realtime est la seule source
- NE PAS subscribe en mode démo — aucun appel réseau en démo (AC #6)
- NE PAS oublier le cleanup `removeChannel` — fuite mémoire sinon
- NE PAS dupliquer la logique de mapping snake_case — factoriser dans `lib/supabase/mappers.ts`
- NE PAS re-fetch toutes les données sur chaque changement — appliquer le diff incrémentiel
- NE PAS ignorer le cas DELETE — le payload DELETE a la structure `{ old: { id } }`, pas de `new`
- NE PAS oublier de trier les events après un INSERT Realtime — maintenir l'ordre antéchrono

### Project Structure Notes

Fichiers à créer :
- `src/hooks/useRealtimeSync.ts`
- `src/lib/supabase/mappers.ts` — fonctions de mapping snake_case ↔ camelCase

Fichiers à modifier :
- `src/contexts/HouseholdContext.tsx` — ajouter `_ingestRealtimeEvent`, `_ingestRealtimeProfile`, exporter les callbacks
- `src/app/(app)/layout.tsx` — brancher `useRealtimeSync`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR43, FR44] — sync temps réel sans refresh, envoi immédiat
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — Supabase Realtime, channel `household:{profileId}`
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns] — channel naming, events écoutés
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — state management, optimistic updates
- [Source: src/contexts/HouseholdContext.tsx] — context actuel sans Realtime
- [Source: src/lib/supabase/client.ts] — client Supabase browser-side
- [Source: src/app/(app)/layout.tsx] — layout authentifié où brancher le hook
- [Source: src/types/index.ts] — BabyEvent, Profile, SleepState types

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
