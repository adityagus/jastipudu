export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const { error } = await db.from('testimonials').delete().eq('id', routeId(event))
  dbError(error)
  return { success: true }
})
