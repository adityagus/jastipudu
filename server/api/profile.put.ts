export default defineEventHandler(async (event) => {
  const { db, user } = await identity(event)
  const input = await body(event, profileSchema)
  const { data, error } = await db
    .from('profiles')
    .update(input)
    .eq('id', user.id)
    .select()
    .single()
  dbError(error)
  return data
})
