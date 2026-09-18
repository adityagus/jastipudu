import type { Profile } from '#shared/types'
export function useAuth() {
  const profile = useState<Profile | null>('profile', () => null)
  const request = useRequestFetch()
  async function refresh() {
    profile.value = await request<Profile | null>('/api/auth/me')
    return profile.value
  }
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST', body: {} })
    profile.value = null
    await navigateTo('/')
  }
  return { profile, refresh, logout }
}
