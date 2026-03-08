import { z } from 'zod'

export const CreateEventSchema = z.object({
  type: z.enum(['bottle', 'nap', 'night', 'night-wake']),
  value: z.number().positive(),
  startedAt: z.string().datetime().optional(),
  moment: z.enum(['morning', 'noon', 'afternoon']).optional(),
})

export type CreateEventInput = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = z.object({
  value: z.number().positive().optional(),
  startedAt: z.string().datetime().optional(),
  moment: z.enum(['morning', 'noon', 'afternoon']).nullable().optional(),
}).refine(
  (data) => data.value !== undefined || data.startedAt !== undefined || data.moment !== undefined,
  { message: 'Au moins un champ requis' }
)

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
