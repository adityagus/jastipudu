import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { email } = await body(
    event,
    z.object({ email: z.string().trim().email().max(254) }).strict(),
  )
  const { error } = await database(event).auth.resend({ type: 'signup', email })
  if (error) {
    throw createError({
      statusCode: error.status === 429 ? 429 : 400,
      statusMessage:
        error.status === 429
          ? 'Terlalu banyak permintaan email. Tunggu beberapa saat sebelum mencoba lagi.'
          : 'Email konfirmasi belum dapat dikirim. Silakan coba lagi nanti.',
    })
  }
  return { success: true }
})
