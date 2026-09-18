// Refresh page-request sessions on the outer response so rotated cookies reach the browser.
export default defineEventHandler(async (event) => {
  if (event.path.startsWith('/api/') || event.path.startsWith('/_') || event.path.includes('.'))
    return
  const config = useRuntimeConfig(event)
  if (!config.supabaseUrl || !config.supabaseAnonKey || !getHeader(event, 'cookie')) return
  await database(event).auth.getUser()
})
