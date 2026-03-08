export type SleepState = 'awake' | 'nap' | 'night' | 'night-wake' | 'night-sleep'

export type Moment = 'morning' | 'noon' | 'afternoon'

export type EventType = 'bottle' | 'nap' | 'night' | 'night-wake' | 'night-sleep'

export interface Profile {
  id: string
  babyName: string
  babyDob: string
  babyWeightHg: number
  joinCode: string
  sleepState: SleepState
  sleepStateSince: string | null
  sleepStateMoment: Moment | null
  weightReminder: boolean
  createdAt: string
}

export interface BabyEvent {
  id: string
  profileId: string
  type: EventType
  value: number
  startedAt: string | null
  endedAt: string | null
  moment: Moment | null
  createdAt: string
}

export interface DeviceSession {
  id: string
  profileId: string
  deviceName: string | null
  lastSeen: string
  createdAt: string
}

export interface TransitionAction {
  label: string
  emoji: string
  targetState: SleepState
}

export interface TransitionResult {
  primary: TransitionAction
  alt?: TransitionAction
}

export interface HeroDisplay {
  emoji: string
  baseLabel: string
  label: string
  duration: string | null
  subtitle: string | null
}
