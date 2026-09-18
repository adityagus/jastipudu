-- Customers can still read concert/category metadata for their own historical orders.
-- These policies do not grant anonymous visitors access to inactive concerts.
create policy concerts_customer_archive on public.concerts for select to authenticated
using (exists(select 1 from public.orders o where o.concert_id = concerts.id and o.customer_id = (select auth.uid())));
create policy categories_customer_archive on public.ticket_categories for select to authenticated
using (exists(select 1 from public.orders o where o.category_id = ticket_categories.id and o.customer_id = (select auth.uid())));
