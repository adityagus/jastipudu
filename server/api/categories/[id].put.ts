export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const input = await body(event, categorySchema)
  const { data, error } = await db
    .from('ticket_categories')
    .update(input)
    .eq('id', routeId(event))
    .select()
    .single()
  dbError(error)
  return data
})
