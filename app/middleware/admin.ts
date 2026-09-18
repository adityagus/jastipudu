export default defineNuxtRouteMiddleware(async (to) => {
  const { refresh } = useAuth()
  const user = await refresh()
  if (!user) return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  if (user.role !== 'admin')
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Halaman khusus admin.' }))
})
