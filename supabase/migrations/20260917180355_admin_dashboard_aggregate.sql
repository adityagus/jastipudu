create function public.admin_order_stats()
returns table(total_orders bigint, pending_orders bigint, processing_orders bigint, secured_orders bigint, completed_orders bigint, completed_revenue numeric)
language sql stable security invoker set search_path = '' as $$
  select count(*)::bigint,
    count(*) filter (where status = 'pending')::bigint,
    count(*) filter (where status = 'processing')::bigint,
    count(*) filter (where status = 'secured')::bigint,
    count(*) filter (where status = 'completed')::bigint,
    coalesce(sum(total) filter (where status = 'completed'), 0)::numeric
  from public.orders
  where public.is_admin();
$$;
revoke all on function public.admin_order_stats() from public, anon;
grant execute on function public.admin_order_stats() to authenticated;
