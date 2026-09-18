export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)) {
    const origin = getHeader(event, 'origin')
    const host = getHeader(event, 'host')
    let originHost = ''
    try {
      originHost = origin ? new URL(origin).host : ''
    } catch {
      /* Reject malformed origins. */
    }
    if (!originHost || originHost !== host)
      throw createError({ statusCode: 403, statusMessage: 'Origin tidak diizinkan.' })
    if (!getHeader(event, 'content-type')?.startsWith('application/json'))
      throw createError({ statusCode: 415, statusMessage: 'Gunakan application/json.' })
  }
})
