export default defineEventHandler(async (event) => {
  const { db } = await identity(event)
  const { data, error } = await db
    .from('orders')
    .select('*, concerts(*), ticket_categories(*)')
    .order('created_at', { ascending: false })
    .limit(500)
  dbError(error)
  return data
})
