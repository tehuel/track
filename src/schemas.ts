import { z } from 'zod'

export const trackerTypeSchema = z.enum(['habit', 'numeric', 'text'])

export const createTrackerSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'ID must be at least 1 character')
    .max(100, 'ID must not exceed 100 characters')
    .regex(/^[a-z0-9-_]+$/, 'ID can only contain lowercase letters, numbers, hyphens, and underscores')
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  type: trackerTypeSchema.default('habit'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
})

export const createEventSchema = z.object({
  value: z
    .number()
    .optional()
    .nullable(),
  note: z
    .string()
    .trim()
    .max(500, 'Note must not exceed 500 characters')
    .optional()
    .nullable(),
  timestamp: z
    .string()
    .optional()
    .nullable(),
})
