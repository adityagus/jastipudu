import { z } from 'zod'
export default defineEventHandler(async (event) => {
  const input = await body(
    event,
    z
      .object({
        email: z.string().email().max(254),
        password: z.string().min(12).max(128),
        full_name: z.string().trim().min(2).max(120),
      })
      .strict(),
  )
  const { error } = await database(event).auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.full_name } },
  })
  if (error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Pendaftaran gagal. Coba kembali beberapa saat lagi.',
    })
  return { success: true }
})
