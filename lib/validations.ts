import { z } from 'zod'

export const createSlamSchema = z.object({
  organizer_name: z.string().min(1, 'Nazwa organizatora jest wymagana').max(200),
  name: z.string().min(1, 'Nazwa jest wymagana').max(500),
  description: z.string().max(10000).optional(),
  event_date: z.string().min(1, 'Data jest wymagana'),
  max_participants: z
    .number()
    .int()
    .min(1, 'Minimum 1 uczestnik')
    .max(500, 'Maksimum 500 uczestników'),
  location: z.string().max(500).optional().or(z.literal('')),
  organizer_email: z.string().email('Nieprawidłowy adres email').optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  dashboard_password: z.string().min(4).max(100).optional().or(z.literal('')),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Imię lub pseudonim jest wymagany').max(200),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
})

export type CreateSlamInput = z.infer<typeof createSlamSchema>
export type RegisterInput = z.infer<typeof registerSchema>
