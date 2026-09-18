import { whatsappUrl } from '../utils/phone'

export default defineEventHandler(async (event) => {
  const number = useRuntimeConfig(event).whatsappNumber
  if (!whatsappUrl(number, 'test')) return { url: null }
  let message = 'Halo, saya ingin bertanya tentang jasa titip tiket konser.'
  const orderId = getQuery(event).order
  if (orderId) {
    if (!uuid.safeParse(orderId).success)
      throw createError({ statusCode: 400, statusMessage: 'ID tidak valid.' })
    const { db } = await identity(event)
    const { data, error } = await db
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .maybeSingle()
    dbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan.' })
    message = 'Halo, saya ingin bertanya tentang pesanan ' + data.order_number + '.'
  }
  return { url: whatsappUrl(number, message) }
})
