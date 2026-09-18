export default defineEventHandler(async (event) => {
  const admin = getQuery(event).admin === 'true'
  const db = admin ? (await identity(event, true)).db : database(event)
  let query = db.from('testimonials').select('*').order('created_at', { ascending: false })
  if (!admin) query = query.eq('is_published', true)
  const { data, error } = await query.limit(100)
  dbError(error)
  return data
})
