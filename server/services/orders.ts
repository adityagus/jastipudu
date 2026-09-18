import type { H3Event } from 'h3'
export async function createOrder(event: H3Event) {
  const { db } = await identity(event)
  const input = await body(event, orderSchema)
  const { data, error } = await db.rpc('create_order', {
    p_category_id: input.category_id,
    p_quantity: input.quantity,
    p_request_id: input.request_id,
  })
  dbError(error)
  return data
}
export async function changeStatus(event: H3Event) {
  const { db } = await identity(event, true)
  const input = await body(event, statusSchema)
  const { data, error } = await db.rpc('update_order_status', {
    p_order_id: routeId(event),
    p_status: input.status,
    p_note: input.note,
  })
  dbError(error)
  return data
}
