-- Bucket for banner images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banner-images',
  'banner-images',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "public read banner images" on storage.objects
  for select using (bucket_id = 'banner-images');

create policy "admin upload banner images" on storage.objects
  for insert to authenticated with check (bucket_id = 'banner-images');

create policy "admin update banner images" on storage.objects
  for update to authenticated using (bucket_id = 'banner-images');

create policy "admin delete banner images" on storage.objects
  for delete to authenticated using (bucket_id = 'banner-images');