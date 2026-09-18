export default defineEventHandler(async (event) => {
  const admin = getQuery(event).admin === 'true'
  const db = admin ? (await identity(event, true)).db : database(event)
  let query = db.from('concerts').select('*, ticket_categories(*)').order('starts_at')
  if (!admin) query = query.eq('is_active', true).gte('starts_at', new Date().toISOString())
  const { data, error } = await query.limit(200)
  dbError(error)
  return data
})
