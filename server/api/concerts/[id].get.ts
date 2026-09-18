export default defineEventHandler(async (event) => {
  const { data, error } = await database(event)
    .from('concerts')
    .select('*, ticket_categories(*)')
    .eq('id', routeId(event))
    .maybeSingle()
  dbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Konser tidak ditemukan.' })
  return data
})
