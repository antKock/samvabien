import type { SleepState, TransitionAction, TransitionResult, HeroDisplay } from '@/types'
import { formatDuration } from './format'

const ACTIONS: Record<string, TransitionAction> = {
  nap: { label: 'Sieste', emoji: '😴', targetState: 'nap' },
  night: { label: 'Coucher du soir', emoji: '🌙', targetState: 'night' },
  napEnd: { label: 'Fin de sieste', emoji: '☀️', targetState: 'awake' },
  morningWake: { label: 'Réveil matin', emoji: '☀️', targetState: 'awake' },
  nightWake: { label: 'Réveil nocturne', emoji: '🫣', targetState: 'night-wake' },
  backToSleep: { label: 'Rendormi', emoji: '🌙', targetState: 'night-sleep' },
}

/**
 * Returns the next possible transitions based on current sleep state and hour.
 * Hour bounds are [start, end[ (inclusive start, exclusive end).
 */
export function getNextTransitions(state: SleepState, hour: number): TransitionResult {
  switch (state) {
    case 'awake': {
      if (hour >= 6 && hour < 17) {
        return { primary: ACTIONS.nap, alt: ACTIONS.night }
      }
      if (hour >= 17 && hour < 23) {
        return { primary: ACTIONS.night, alt: ACTIONS.nap }
      }
      // 23h–6h
      return { primary: ACTIONS.night }
    }

    case 'nap':
      return { primary: ACTIONS.napEnd }

    case 'night':
    case 'night-sleep': {
      if ((hour >= 19 && hour < 24) || (hour >= 0 && hour < 5)) {
        return { primary: ACTIONS.nightWake, alt: ACTIONS.morningWake }
      }
      if (hour >= 5 && hour < 8) {
        return { primary: ACTIONS.morningWake, alt: ACTIONS.nightWake }
      }
      // after 8h
      return { primary: ACTIONS.morningWake }
    }

    case 'night-wake':
      return { primary: ACTIONS.backToSleep }

    default:
      return { primary: ACTIONS.nap }
  }
}

/**
 * Returns the theme based on sleep state.
 * awake → day, everything else → night
 */
export function getTheme(state: SleepState): 'day' | 'night' {
  return state === 'awake' ? 'day' : 'night'
}

/**
 * Returns the hero card display info.
 */
export function getHeroDisplay(
  state: SleepState,
  since: string | null,
  _moment: string | null,
): HeroDisplay {
  const emojiMap: Record<SleepState, string> = {
    awake: '☀️',
    nap: '😴',
    night: '🌙',
    'night-wake': '🫣',
    'night-sleep': '🌙',
  }

  const labelMap: Record<SleepState, string> = {
    awake: 'Éveillé',
    nap: 'Dort',
    night: 'Dort',
    'night-wake': 'Réveillé',
    'night-sleep': 'Dort',
  }

  const emoji = emojiMap[state]
  const baseLabel = labelMap[state]

  if (since) {
    const delta = Date.now() - new Date(since).getTime()
    const duration = formatDuration(delta)
    const sinceDate = new Date(since)
    const sinceTime = `${sinceDate.getHours()}h${String(sinceDate.getMinutes()).padStart(2, '0')}`
    const actionWord = state === 'awake' || state === 'night-wake' ? 'Réveillé' : 'Endormi'
    return {
      emoji,
      baseLabel,
      label: `${baseLabel} depuis ${duration}`,
      duration,
      subtitle: `${actionWord} à ${sinceTime}`,
    }
  }

  // moment-only (crèche import): no duration, no subtitle
  return {
    emoji,
    baseLabel,
    label: baseLabel,
    duration: null,
    subtitle: null,
  }
}
