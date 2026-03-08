import type { Profile, BabyEvent } from '@/types'

function todayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function yesterdayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function babyDob(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 4)
  return d.toISOString().slice(0, 10)
}

const DEMO_PROFILE_ID = 'demo-profile'

export const DEMO_PROFILE: Profile = {
  id: DEMO_PROFILE_ID,
  babyName: 'Léo',
  babyDob: babyDob(),
  babyWeightHg: 62,
  joinCode: 'DEMO-0000',
  sleepState: 'awake',
  sleepStateSince: null,
  sleepStateMoment: null,
  weightReminder: true,
  createdAt: babyDob(),
}

export const DEMO_EVENTS: BabyEvent[] = [
  {
    id: 'demo-7',
    profileId: DEMO_PROFILE_ID,
    type: 'bottle',
    value: 120,
    startedAt: null,
    endedAt: null,
    moment: 'afternoon',
    createdAt: todayAt(16, 0),
  },
  {
    id: 'demo-6',
    profileId: DEMO_PROFILE_ID,
    type: 'bottle',
    value: 150,
    startedAt: todayAt(15, 30),
    endedAt: null,
    moment: null,
    createdAt: todayAt(15, 30),
  },
  {
    id: 'demo-5',
    profileId: DEMO_PROFILE_ID,
    type: 'nap',
    value: 90,
    startedAt: todayAt(13, 30),
    endedAt: todayAt(15, 0),
    moment: null,
    createdAt: todayAt(13, 30),
  },
  {
    id: 'demo-4',
    profileId: DEMO_PROFILE_ID,
    type: 'bottle',
    value: 200,
    startedAt: todayAt(12, 0),
    endedAt: null,
    moment: null,
    createdAt: todayAt(12, 0),
  },
  {
    id: 'demo-3',
    profileId: DEMO_PROFILE_ID,
    type: 'nap',
    value: 75,
    startedAt: todayAt(9, 30),
    endedAt: todayAt(10, 45),
    moment: null,
    createdAt: todayAt(9, 30),
  },
  {
    id: 'demo-2',
    profileId: DEMO_PROFILE_ID,
    type: 'bottle',
    value: 180,
    startedAt: todayAt(7, 30),
    endedAt: null,
    moment: null,
    createdAt: todayAt(7, 30),
  },
  {
    id: 'demo-1',
    profileId: DEMO_PROFILE_ID,
    type: 'night',
    value: 600,
    startedAt: yesterdayAt(21, 0),
    endedAt: todayAt(7, 0),
    moment: null,
    createdAt: yesterdayAt(21, 0),
  },
]
