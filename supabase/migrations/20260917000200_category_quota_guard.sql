create function public.guard_category_quota() returns trigger language plpgsql security definer set search_path = '' as $$
declare used bigint;
begin
 select coalesce(sum(quantity),0) into used from public.orders where category_id = new.id and status <> 'cancelled';
 if new.quota < used then raise exception 'Quota cannot be less than reserved tickets'; end if;
 return new;
end $$;
revoke all on function public.guard_category_quota() from public;
create trigger category_quota_guard before update on public.ticket_categories for each row execute function public.guard_category_quota();
