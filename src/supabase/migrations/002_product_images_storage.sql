-- Bucket for product photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Anyone can view the photos (the store is public)
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Only the admin can upload, replace or delete them
create policy "admin upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "admin update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

create policy "admin delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');