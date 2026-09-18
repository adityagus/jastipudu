import { whatsappUrl } from '../../../utils/phone'
export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const id = routeId(event)
  const { data, error } = await db
    .from('profiles')
    .select('full_name,phone')
    .eq('id', id)
    .eq('role', 'customer')
    .maybeSingle()
  dbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Customer tidak ditemukan.' })
  return {
    url: data.phone
      ? whatsappUrl(
          data.phone,
          `Halo ${data.full_name || ''}, kami dari TitipTiket ingin membantu pesananmu.`.trim(),
        )
      : null,
  }
})
