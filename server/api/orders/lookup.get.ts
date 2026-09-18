import { z } from 'zod'

const lookupSchema = z.string().trim().regex(/^TT-[A-Z0-9]{20,40}$/i, 'Kode pemesanan tidak valid.')

export default defineEventHandler(async (event) => {
  const raw = getQuery(event).code
  const parsed = lookupSchema.safeParse(typeof raw === 'string' ? raw : '')
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Masukkan kode pemesanan yang valid.' })
  const db = database(event)
  const { data, error } = await db.rpc('lookup_order', { p_order_number: parsed.data.toUpperCase() })
  if (error) throw createError({ statusCode: 400, statusMessage: 'Pencarian pesanan gagal.' })
  const order = Array.isArray(data) ? data[0] : data
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan. Periksa kembali kode pemesanan.' })
  return order
})
