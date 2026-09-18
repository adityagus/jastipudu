export default defineEventHandler(async (event) => {
  const { db } = await identity(event)
  const { data, error } = await db
    .from('orders')
    .select('*, concerts(*), ticket_categories(*), order_status_history(*)')
    .eq('id', routeId(event))
    .maybeSingle()
  dbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan.' })
  return data
})
