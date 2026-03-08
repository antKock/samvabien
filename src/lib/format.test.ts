import { describe, it, expect } from 'vitest'
import { formatDuration, formatTime } from './format'

describe('formatDuration', () => {
  it('returns "0min" for less than 1 minute', () => {
    expect(formatDuration(0)).toBe('0min')
    expect(formatDuration(30000)).toBe('0min')
    expect(formatDuration(59999)).toBe('0min')
  })

  it('returns "Xmin" for less than 1 hour', () => {
    expect(formatDuration(60000)).toBe('1min')
    expect(formatDuration(12 * 60000)).toBe('12min')
    expect(formatDuration(45 * 60000)).toBe('45min')
    expect(formatDuration(59 * 60000)).toBe('59min')
  })

  it('returns "XhMM" for 1 hour or more', () => {
    expect(formatDuration(60 * 60000)).toBe('1h00')
    expect(formatDuration(83 * 60000)).toBe('1h23')
    expect(formatDuration(90 * 60000)).toBe('1h30')
    expect(formatDuration(134 * 60000)).toBe('2h14')
    expect(formatDuration(600 * 60000)).toBe('10h00')
    expect(formatDuration(620 * 60000)).toBe('10h20')
  })

  it('pads minutes with leading zero', () => {
    expect(formatDuration(65 * 60000)).toBe('1h05')
  })
})

describe('formatTime', () => {
  it('formats time without leading zero for hours', () => {
    expect(formatTime(new Date(2026, 0, 1, 5, 50))).toBe('5h50')
    expect(formatTime(new Date(2026, 0, 1, 14, 30))).toBe('14h30')
    expect(formatTime(new Date(2026, 0, 1, 0, 0))).toBe('0h00')
  })

  it('pads minutes with leading zero', () => {
    expect(formatTime(new Date(2026, 0, 1, 0, 5))).toBe('0h05')
    expect(formatTime(new Date(2026, 0, 1, 9, 5))).toBe('9h05')
  })
})
