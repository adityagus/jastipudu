const allowed = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export default defineEventHandler(async (event) => {
  const user = await identity(event, true)
  const id = routeId(event)
  const parts = await readMultipartFormData(event)
  const kind = parts?.find((part) => part.name === 'kind')?.data?.toString()
  const file = parts?.find((part) => part.name === 'file' && part.filename)
  if (kind !== 'poster' && kind !== 'layout')
    throw createError({ statusCode: 422, statusMessage: 'Jenis media tidak valid.' })
  if (!file?.data || !file.type || !allowed.has(file.type))
    throw createError({ statusCode: 422, statusMessage: 'Format gambar harus JPG, PNG, atau WebP.' })
  if (file.data.length > 5 * 1024 * 1024)
    throw createError({ statusCode: 422, statusMessage: 'Ukuran gambar maksimal 5 MB.' })

  const db = user.db
  const { data: concert, error: concertError } = await db.from('concerts').select('id').eq('id', id).single()
  if (concertError || !concert) throw createError({ statusCode: 404, statusMessage: 'Konser tidak ditemukan.' })
  const path = `${id}/${kind}-${Date.now()}.${allowed.get(file.type)}`
  const upload = await db.storage.from('concert-media').upload(path, file.data, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })
  if (upload.error) throw createError({ statusCode: 400, statusMessage: upload.error.message })
  const publicUrl = db.storage.from('concert-media').getPublicUrl(path).data.publicUrl
  const field = kind === 'poster' ? 'poster_url' : 'layout_url'
  const { error: updateError } = await db.from('concerts').update({ [field]: publicUrl }).eq('id', id)
  if (updateError) throw createError({ statusCode: 400, statusMessage: updateError.message })
  return { url: publicUrl, kind }
})
