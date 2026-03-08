import { z } from 'zod'

export const TransitionSchema = z.object({
  newState: z.enum(['awake', 'nap', 'night', 'night-wake', 'night-sleep']),
  time: z.string().datetime(),
})

export type TransitionInput = z.infer<typeof TransitionSchema>
