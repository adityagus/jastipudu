-- Supabase's default privileges include direct role grants, not just PUBLIC.
-- Keep elevated implementations outside the exposed Data API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
alter function public.create_order(uuid,integer,uuid) set schema private;
alter function public.update_order_status(uuid,public.order_status,text) set schema private;
alter function public.handle_new_user() set schema private;
alter function public.record_order_history() set schema private;
alter function public.guard_category_quota() set schema private;
alter function public.touch_updated_at() set schema private;

-- Existing policies and triggers follow function OIDs to their new schema.
-- Preserve the helper name used in the PL/pgSQL status function body.
create function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
 select private.is_admin();
$$;
create function public.create_order(p_category_id uuid,p_quantity integer,p_request_id uuid)
returns public.orders language sql security invoker set search_path = '' as $$
 select private.create_order(p_category_id,p_quantity,p_request_id);
$$;
create function public.update_order_status(p_order_id uuid,p_status public.order_status,p_note text default '')
returns public.orders language sql security invoker set search_path = '' as $$
 select private.update_order_status(p_order_id,p_status,p_note);
$$;

revoke all on function private.is_admin(), private.create_order(uuid,integer,uuid),
 private.update_order_status(uuid,public.order_status,text), private.handle_new_user(),
 private.record_order_history(), private.guard_category_quota(), private.touch_updated_at()
 from public, anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.create_order(uuid,integer,uuid),
 private.update_order_status(uuid,public.order_status,text) to authenticated;

revoke all on function public.is_admin(), public.create_order(uuid,integer,uuid),
 public.update_order_status(uuid,public.order_status,text) from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.create_order(uuid,integer,uuid),
 public.update_order_status(uuid,public.order_status,text) to authenticated;

-- Some hosted projects include this event-trigger helper. It needs no API access.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
 end if;
end $$;
