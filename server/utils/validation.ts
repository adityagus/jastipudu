import { z } from 'zod'
import type { H3Event } from 'h3'
export const uuid = z.string().uuid()
export const concertSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(160),
    artist: z.string().trim().min(2).max(160),
    description: z.string().trim().min(10).max(5000),
    venue: z.string().trim().min(2).max(200),
    city: z.string().trim().min(2).max(100),
    starts_at: z.string().datetime({ offset: true }),
    is_active: z.boolean(),
    poster_url: z.string().url().max(1000).nullable().default(null),
    layout_url: z.string().url().max(1000).nullable().default(null),
  })
  .strict()
export const categorySchema = z
  .object({
    concert_id: uuid,
    name: z.string().trim().min(1).max(100),
    price: z.number().int().min(0).max(100000000),
    service_fee: z.number().int().min(0).max(10000000),
    quota: z.number().int().min(0).max(100000),
  })
  .strict()
export const orderSchema = z
  .object({ category_id: uuid, quantity: z.number().int().min(1).max(6), request_id: uuid })
  .strict()
export const statusSchema = z
  .object({
    status: z.enum(['pending', 'confirmed', 'processing', 'secured', 'completed', 'cancelled']),
    note: z.string().trim().max(1000).default(''),
  })
  .strict()
export const profileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(120),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  })
  .strict()
export async function body<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.infer<T>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success)
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid.',
      data: result.error.flatten(),
    })
  return result.data
}
export function routeId(event: H3Event) {
  const result = uuid.safeParse(getRouterParam(event, 'id'))
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid.' })
  return result.data
}
