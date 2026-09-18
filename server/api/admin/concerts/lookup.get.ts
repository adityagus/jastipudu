interface PublicEvent {
  name?: string
  info?: string
  pleaseNote?: string
  _embedded?: {
    attractions?: Array<{ name?: string }>
    venues?: Array<{ name?: string; city?: { name?: string } }>
  }
  dates?: { start?: { dateTime?: string } }
}
interface MusicArtist {
  name: string
  disambiguation?: string
}
export default defineEventHandler(async (event) => {
  await identity(event, true)
  const q = String(getQuery(event).q || '')
    .trim()
    .slice(0, 120)
  if (q.length < 2)
    throw createError({ statusCode: 422, statusMessage: 'Masukkan minimal 2 karakter.' })
  const config = useRuntimeConfig(event)
  if (config.ticketmasterApiKey) {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    url.searchParams.set('keyword', q)
    url.searchParams.set('size', '5')
    url.searchParams.set('apikey', config.ticketmasterApiKey)
    const response = await $fetch<{ _embedded?: { events?: PublicEvent[] } }>(url.toString())
    return (response?._embedded?.events || []).map((item) => ({
      title: item.name || q,
      artist: item._embedded?.attractions?.[0]?.name || q,
      description: item.info || item.pleaseNote || '',
      venue: item._embedded?.venues?.[0]?.name || '',
      city: item._embedded?.venues?.[0]?.city?.name || '',
      starts_at: item.dates?.start?.dateTime || '',
    }))
  }
  const response = await $fetch<{ artists?: MusicArtist[] }>(
    'https://musicbrainz.org/ws/2/artist/',
    {
      query: { query: q, fmt: 'json', limit: 5 },
      headers: { 'User-Agent': 'Jastipudu/1.0 (contact@jastipudu.local)' },
    },
  )
  return (response.artists || []).map((artist) => ({
    title: artist.name + ' Live',
    artist: artist.name,
    description: artist.disambiguation
      ? `${artist.name} — ${artist.disambiguation}`
      : `Data publik artis ${artist.name}. Lengkapi detail konser sebelum dipublikasikan.`,
    venue: '',
    city: '',
    starts_at: '',
  }))
})
