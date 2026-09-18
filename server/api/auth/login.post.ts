import { z } from 'zod'
export default defineEventHandler(async (event) => {
  const input = await body(
    event,
    z
      .object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) })
      .strict(),
  )
  const { error } = await database(event).auth.signInWithPassword(input)
  if (error) {
    const unconfirmed = error.code === 'email_not_confirmed'
    const invalid = error.code === 'invalid_credentials'
    const limited = error.status === 429 || error.code === 'over_request_rate_limit'
    throw createError({
      statusCode: limited ? 429 : unconfirmed ? 403 : invalid ? 401 : 503,
      statusMessage: limited
        ? 'Terlalu banyak percobaan masuk. Tunggu beberapa menit, lalu coba lagi.'
        : unconfirmed
          ? 'Email belum dikonfirmasi. Buka link konfirmasi di inbox atau folder spam, lalu masuk kembali.'
          : invalid
            ? 'Email atau password kamu salah'
            : 'Layanan login sedang tidak tersedia. Silakan coba lagi sebentar.',
      data: { code: error.code },
    })
  }
  return { success: true }
})
