alter table public.concerts
  add column if not exists poster_url text,
  add column if not exists layout_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'concert-media',
  'concert-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists concert_media_public_read on storage.objects;
create policy concert_media_public_read on storage.objects
  for select to public
  using (bucket_id = 'concert-media');

drop policy if exists concert_media_admin_insert on storage.objects;
create policy concert_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'concert-media' and (select public.is_admin()));

drop policy if exists concert_media_admin_update on storage.objects;
create policy concert_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'concert-media' and (select public.is_admin()))
  with check (bucket_id = 'concert-media' and (select public.is_admin()));

drop policy if exists concert_media_admin_delete on storage.objects;
create policy concert_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'concert-media' and (select public.is_admin()));
