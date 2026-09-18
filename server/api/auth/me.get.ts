export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null
  const db = database(event)
  const {
    data: { user },
  } = await db.auth.getUser()
  if (!user) return null
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single()
  dbError(error)
  return data
})
