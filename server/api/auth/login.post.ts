import { z } from 'zod'
export default defineEventHandler(async (event) => {
  const input = await body(
    event,
    z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) }).strict(),
  )
  const { error } = await database(event).auth.signInWithPassword(input)
  if (error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Login gagal. Periksa email, password, dan konfirmasi email.',
    })
  return { success: true }
})
