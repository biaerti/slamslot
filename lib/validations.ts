import { z } from 'zod'

export const createSlamSchema = z.object({
  organizer_name: z.string().min(1, 'Nazwa organizatora jest wymagana').max(200, 'Nazwa organizatora może mieć max 200 znaków'),
  name: z.string().min(1, 'Nazwa slamu jest wymagana').max(500, 'Nazwa slamu może mieć max 500 znaków'),
  description: z.string().max(10000, 'Opis może mieć max 10 000 znaków').optional(),
  fb_event_url: z.string().url('Nieprawidłowy link do wydarzenia').optional().or(z.literal('')),
  event_date: z.string().min(1, 'Data jest wymagana'),
  max_participants: z
    .number()
    .int()
    .min(1, 'Minimum 1 uczestnik')
    .max(500, 'Maksimum 500 uczestników'),
  location: z.string().max(500, 'Lokalizacja może mieć max 500 znaków').optional().or(z.literal('')),
  organizer_email: z.string().email('Nieprawidłowy adres email').optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  show_spots: z.boolean().optional(),
  dashboard_password: z.string().min(4).max(100).optional().or(z.literal('')),
  contact_mode: z.enum(['auto', 'personal']).optional(),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Imię lub pseudonim jest wymagany').max(200),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
})

export type CreateSlamInput = z.infer<typeof createSlamSchema>
export type RegisterInput = z.infer<typeof registerSchema>
