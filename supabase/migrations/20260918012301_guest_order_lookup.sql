create or replace function public.lookup_order(p_order_number text)
returns table (
  order_number text,
  status public.order_status,
  quantity integer,
  total numeric,
  created_at timestamptz,
  concert_title text,
  artist text,
  venue text,
  city text,
  starts_at timestamptz,
  category_name text,
  status_history jsonb
)
language sql
security definer
set search_path = public, private
as $$
  select
    o.order_number,
    o.status,
    o.quantity,
    o.total,
    o.created_at,
    c.title,
    c.artist,
    c.venue,
    c.city,
    c.starts_at,
    tc.name,
    coalesce((
      select jsonb_agg(jsonb_build_object('status', h.status, 'note', h.note, 'created_at', h.created_at) order by h.created_at)
      from public.order_status_history h
      where h.order_id = o.id
    ), '[]'::jsonb)
  from public.orders o
  join public.concerts c on c.id = o.concert_id
  join public.ticket_categories tc on tc.id = o.category_id
  where upper(trim(o.order_number)) = upper(trim(p_order_number))
  limit 1;
$$;

revoke all on function public.lookup_order(text) from public, anon, authenticated;
grant execute on function public.lookup_order(text) to anon, authenticated;
