export default defineNuxtRouteMiddleware(async (to) => {
  const { refresh } = useAuth()
  const user = await refresh()
  if (!user) return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
})
