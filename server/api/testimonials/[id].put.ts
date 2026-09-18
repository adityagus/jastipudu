import { z } from 'zod'
export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const input = await body(
    event,
    z
      .object({
        customer_name: z.string().trim().min(2).max(120),
        content: z.string().trim().min(5).max(2000),
        rating: z.number().int().min(1).max(5),
        is_published: z.boolean(),
      })
      .strict(),
  )
  const { data, error } = await db
    .from('testimonials')
    .update(input)
    .eq('id', routeId(event))
    .select()
    .single()
  dbError(error)
  return data
})
