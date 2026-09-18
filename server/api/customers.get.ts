export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(500)
  dbError(error)
  return data
})
