export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const input = await body(event, concertSchema)
  const { data, error } = await db.from('concerts').insert(input).select().single()
  dbError(error)
  setResponseStatus(event, 201)
  return data
})
