create type public.order_status as enum ('pending','confirmed','processing','secured','completed','cancelled');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '' check (length(full_name) <= 120),
 phone text not null default '' check (length(phone) <= 16),
 role text not null default 'customer' check (role in ('customer','admin')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.concerts (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 title text not null, artist text not null, description text not null,
 venue text not null, city text not null, starts_at timestamptz not null,
 is_active boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), check (length(title) between 3 and 160)
);
create table public.ticket_categories (
 id uuid primary key default gen_random_uuid(), concert_id uuid not null references public.concerts(id) on delete cascade,
 name text not null check (length(name) between 1 and 100),
 price bigint not null check (price between 0 and 100000000),
 service_fee bigint not null check (service_fee between 0 and 10000000),
 quota integer not null check (quota between 0 and 100000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique (concert_id,name), unique(id,concert_id)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number text not null unique default ('TT-' || upper(replace(gen_random_uuid()::text,'-',''))),
 customer_id uuid not null references public.profiles(id),
 concert_id uuid not null references public.concerts(id), category_id uuid not null,
 request_id uuid not null, quantity integer not null check (quantity between 1 and 6),
 ticket_price bigint not null check (ticket_price >= 0), service_fee bigint not null check (service_fee >= 0),
 total bigint generated always as ((ticket_price + service_fee) * quantity) stored,
 status public.order_status not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key (category_id,concert_id) references public.ticket_categories(id,concert_id),
 unique(customer_id,request_id)
);
create table public.order_status_history (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
 status public.order_status not null, note text not null default '' check (length(note) <= 1000),
 changed_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.testimonials (
 id uuid primary key default gen_random_uuid(), customer_name text not null check(length(customer_name) between 2 and 120),
 content text not null check(length(content) between 5 and 2000), rating integer not null check(rating between 1 and 5),
 is_published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index concerts_upcoming_idx on public.concerts(starts_at) where is_active;
create index orders_customer_idx on public.orders(customer_id,created_at desc);
create index orders_concert_idx on public.orders(concert_id);
create index orders_category_status_idx on public.orders(category_id,status);
create index orders_status_idx on public.orders(status,created_at desc);
create index history_order_idx on public.order_status_history(order_id,created_at);
create index history_actor_idx on public.order_status_history(changed_by);

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,full_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),120));
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger concerts_touch before update on public.concerts for each row execute function public.touch_updated_at();
create trigger categories_touch before update on public.ticket_categories for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
create trigger testimonials_touch before update on public.testimonials for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.concerts enable row level security;
alter table public.ticket_categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.testimonials enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profiles_edit on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy concerts_read on public.concerts for select using (is_active or public.is_admin());
create policy concerts_admin on public.concerts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy categories_read on public.ticket_categories for select using (exists(select 1 from public.concerts c where c.id = concert_id and (c.is_active or public.is_admin())));
create policy categories_admin on public.ticket_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy orders_read on public.orders for select to authenticated using(customer_id = (select auth.uid()) or public.is_admin());
create policy history_read on public.order_status_history for select to authenticated using(exists(select 1 from public.orders o where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_admin())));
create policy testimonials_read on public.testimonials for select using(is_published or public.is_admin());
create policy testimonials_admin on public.testimonials for all to authenticated using(public.is_admin()) with check(public.is_admin());

revoke all on public.profiles,public.concerts,public.ticket_categories,public.orders,public.order_status_history,public.testimonials from anon,authenticated;
grant select on public.concerts,public.ticket_categories,public.testimonials to anon,authenticated;
grant select on public.profiles,public.orders,public.order_status_history to authenticated;
grant update(full_name,phone) on public.profiles to authenticated;
grant insert,update,delete on public.concerts,public.ticket_categories,public.testimonials to authenticated;

-- Atomic reservation: database reads prices, locks category and checks available quota.
create function public.create_order(p_category_id uuid,p_quantity integer,p_request_id uuid) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare cat public.ticket_categories; result public.orders; used bigint;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_quantity is null or p_quantity not between 1 and 6 or p_request_id is null then raise exception 'Invalid order'; end if;
 select * into cat from public.ticket_categories where id = p_category_id for update;
 if not found then raise exception 'Category unavailable'; end if;
 select * into result from public.orders where customer_id = auth.uid() and request_id = p_request_id;
 if found then
   if result.category_id <> p_category_id or result.quantity <> p_quantity then raise exception 'Request already used'; end if;
   return result;
 end if;
 perform 1 from public.concerts where id = cat.concert_id and is_active and starts_at > now() for share;
 if not found then raise exception 'Concert unavailable'; end if;
 select coalesce(sum(quantity),0) into used from public.orders where category_id = cat.id and status <> 'cancelled';
 if used + p_quantity > cat.quota then raise exception 'Quota unavailable'; end if;
 insert into public.orders(customer_id,concert_id,category_id,quantity,ticket_price,service_fee,request_id)
 values(auth.uid(),cat.concert_id,cat.id,p_quantity,cat.price,cat.service_fee,p_request_id) returning * into result;
 return result;
end $$;

create function public.record_order_history() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if TG_OP = 'INSERT' then
  insert into public.order_status_history(order_id,status,changed_by,note) values(new.id,new.status,auth.uid(),'Pesanan dibuat');
 elsif old.status is distinct from new.status then
  insert into public.order_status_history(order_id,status,changed_by,note) values(new.id,new.status,auth.uid(),coalesce(current_setting('app.order_note',true),''));
 end if;
 return new;
end $$;
create trigger order_history after insert or update on public.orders for each row execute function public.record_order_history();
create function public.update_order_status(p_order_id uuid,p_status public.order_status,p_note text default '') returns public.orders
language plpgsql security definer set search_path = '' as $$
declare result public.orders;
begin
 if not public.is_admin() then raise exception 'Admin required'; end if;
 if p_note is null or length(p_note) > 1000 then raise exception 'Invalid note'; end if;
 select * into result from public.orders where id = p_order_id for update;
 if not found then raise exception 'Order unavailable'; end if;
 if not ((result.status = 'pending' and p_status in ('confirmed','cancelled')) or
 (result.status = 'confirmed' and p_status in ('processing','cancelled')) or
 (result.status = 'processing' and p_status in ('secured','cancelled')) or
 (result.status = 'secured' and p_status = 'completed')) then raise exception 'Invalid transition'; end if;
 perform set_config('app.order_note',p_note,true);
 update public.orders set status = p_status where id = p_order_id returning * into result;
 return result;
end $$;
revoke all on function public.is_admin(),public.handle_new_user(),public.touch_updated_at(),public.create_order(uuid,integer,uuid),public.record_order_history(),public.update_order_status(uuid,public.order_status,text) from public;
grant execute on function public.is_admin() to anon,authenticated;
grant execute on function public.create_order(uuid,integer,uuid),public.update_order_status(uuid,public.order_status,text) to authenticated;
