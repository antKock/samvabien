import type { BabyEvent, Profile, EventType, SleepState, Moment } from '@/types'

export function mapEventFromDb(row: Record<string, unknown>): BabyEvent {
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

export function mapProfileFromDb(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    babyName: row.baby_name as string,
    babyDob: row.baby_dob as string,
    babyWeightHg: row.baby_weight_hg as number,
    joinCode: row.join_code as string,
    sleepState: row.sleep_state as SleepState,
    sleepStateSince: (row.sleep_state_since as string) ?? null,
    sleepStateMoment: (row.sleep_state_moment as Moment) ?? null,
    weightReminder: row.weight_reminder as boolean,
    createdAt: row.created_at as string,
  }
}
