export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const { error } = await db.from('ticket_categories').delete().eq('id', routeId(event))
  dbError(error)
  return { success: true }
})
