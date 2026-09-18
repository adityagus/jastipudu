import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { H3Event } from 'h3'
export function database(event: H3Event) {
  const config = useRuntimeConfig(event)
  if (!config.supabaseUrl || !config.supabaseAnonKey)
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase belum dikonfigurasi. Isi environment variable terlebih dahulu.',
    })
  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll: () =>
        parseCookieHeader(getHeader(event, 'cookie') ?? '').map((c) => ({
          name: c.name,
          value: c.value ?? '',
        })),
      setAll: (cookies) => {
        const requestCookies = new Map(
          parseCookieHeader(getHeader(event, 'cookie') ?? '').map((c) => [c.name, c.value ?? '']),
        )
        cookies.forEach(({ name, value, options }) => {
          requestCookies.set(name, value)
          setCookie(event, name, value, {
            ...options,
            httpOnly: true,
            sameSite: 'lax',
            secure: !import.meta.dev,
          })
        })
        event.node.req.headers.cookie = [...requestCookies]
          .map(([name, value]) => `${name}=${value}`)
          .join('; ')
      },
    },
  })
}
export async function identity(event: H3Event, admin = false) {
  const db = database(event)
  const {
    data: { user },
    error,
  } = await db.auth.getUser()
  if (error || !user)
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu.' })
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || (admin && profile.role !== 'admin'))
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
  return { db, user, profile }
}
export function dbError(error: { code?: string; message: string } | null) {
  if (!error) return
  const conflict = ['23503', '23505', '23514', 'P0001'].includes(error.code ?? '')
  throw createError({
    statusCode: conflict ? 409 : 400,
    statusMessage: conflict
      ? 'Data tidak dapat diproses. Periksa kuota, status, atau data yang masih digunakan.'
      : 'Permintaan database gagal.',
  })
}
