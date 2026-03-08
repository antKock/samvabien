import { z } from 'zod'

export const JoinSchema = z.object({
  joinCode: z
    .string()
    .regex(/^[A-Z]{4}-?\d{4}$/i, 'Code au format XXXX-0000 attendu')
    .transform((val) => {
      const clean = val.toUpperCase().replace('-', '')
      return `${clean.slice(0, 4)}-${clean.slice(4)}`
    }),
})

export type JoinInput = z.infer<typeof JoinSchema>
