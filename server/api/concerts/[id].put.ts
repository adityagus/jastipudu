export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const input = await body(event, concertSchema)
  const { data, error } = await db
    .from('concerts')
    .update(input)
    .eq('id', routeId(event))
    .select()
    .single()
  dbError(error)
  return data
})
