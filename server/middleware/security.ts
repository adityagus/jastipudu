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
    const mediaUpload =
      event.method === 'POST' &&
      /^\/api\/admin\/concerts\/[^/]+\/media\/?$/.test(event.path.split('?')[0] ?? '')
    const contentType = getHeader(event, 'content-type')?.split(';')[0]?.trim().toLowerCase()
    const expectedType = mediaUpload ? 'multipart/form-data' : 'application/json'
    if (contentType !== expectedType)
      throw createError({
        statusCode: 415,
        statusMessage: mediaUpload
          ? 'Gunakan formulir unggah gambar.'
          : 'Gunakan application/json.',
      })
  }
})
