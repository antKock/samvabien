import { z } from 'zod'

export const CreateProfileSchema = z.object({
  babyName: z
    .string()
    .trim()
    .min(1, 'Le prénom est requis')
    .max(30, 'Le prénom ne doit pas dépasser 30 caractères'),
  babyDob: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime()) && date <= new Date()
      },
      { message: 'La date de naissance doit être valide et ne pas être dans le futur' }
    ),
  babyWeightHg: z
    .number()
    .int()
    .min(20, 'Le poids minimum est 2,0 kg')
    .max(150, 'Le poids maximum est 15,0 kg'),
})

export type CreateProfileInput = z.infer<typeof CreateProfileSchema>

export const UpdateProfileSchema = z
  .object({
    babyName: z
      .string()
      .trim()
      .min(1, 'Le prénom est requis')
      .max(30, 'Le prénom ne doit pas dépasser 30 caractères')
      .optional(),
    babyDob: z
      .string()
      .refine(
        (val) => {
          const date = new Date(val)
          return !isNaN(date.getTime()) && date <= new Date()
        },
        { message: 'La date de naissance doit être valide et ne pas être dans le futur' }
      )
      .optional(),
    babyWeightHg: z
      .number()
      .int()
      .min(20, 'Le poids minimum est 2,0 kg')
      .max(150, 'Le poids maximum est 15,0 kg')
      .optional(),
    weightReminder: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.babyName !== undefined ||
      data.babyDob !== undefined ||
      data.babyWeightHg !== undefined ||
      data.weightReminder !== undefined,
    { message: 'Au moins un champ doit être fourni' }
  )

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
