import type { Order } from '#shared/types'
interface AdminOrderSummary { total_orders: number; pending_orders: number; processing_orders: number; secured_orders: number; completed_orders: number; completed_revenue: number }

export default defineEventHandler(async (event) => {
  const { db } = await identity(event, true)
  const [concerts, customers, summary, orders] = await Promise.all([
    db.from('concerts').select('id', { count: 'exact', head: true }),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    db.rpc('admin_order_stats').single(),
    db
      .from('orders')
      .select(
        'id,order_number,status,total,created_at,customer_id,concert_id,category_id,quantity,ticket_price,service_fee,concerts(*),ticket_categories(*)',
      )
      .order('created_at', { ascending: false })
      .limit(1000),
  ])
  dbError(concerts.error)
  dbError(customers.error)
  dbError(summary.error)
  dbError(orders.error)
  const rows = (orders.data || []) as unknown as Order[]
  const aggregate = summary.data as unknown as AdminOrderSummary
  const stats = {
    concerts: concerts.count || 0,
    customers: customers.count || 0,
    orders: Number(aggregate?.total_orders || 0),
    pending: Number(aggregate?.pending_orders || 0),
    processing: Number(aggregate?.processing_orders || 0),
    secured: Number(aggregate?.secured_orders || 0),
    completed: Number(aggregate?.completed_orders || 0),
    revenue: Number(aggregate?.completed_revenue || 0),
  }
  return {
    stats,
    urgent_orders: rows.filter((row) => ['pending', 'processing'].includes(row.status)).slice(0, 8),
    recent_orders: rows.slice(0, 8),
  }
})
