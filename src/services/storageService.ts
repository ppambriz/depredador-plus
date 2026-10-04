import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/image'

const PRODUCT_BUCKET = 'product-images'
const BANNER_BUCKET = 'banner-images'

async function upload(
  bucket: string,
  file: File,
  prefix: string,
  maxSize: number,
): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured')

  const compressed = await compressImage(file, maxSize)
  const path = `${prefix}-${Date.now()}.webp`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, { contentType: 'image/webp', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function removeByUrl(bucket: string, url: string | null): Promise<void> {
  if (!supabase || !url) return

  const marker = `/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return

  const path = url.slice(index + marker.length)
  await supabase.storage.from(bucket).remove([path])
}

export const storageService = {
  uploadProductImage: (file: File, code: string) =>
    upload(PRODUCT_BUCKET, file, code, 1200),

  removeByUrl: (url: string | null) => removeByUrl(PRODUCT_BUCKET, url),

  uploadBannerImage: (file: File, code: string) =>
    upload(BANNER_BUCKET, file, code, 1920),

  removeBannerByUrl: (url: string | null) => removeByUrl(BANNER_BUCKET, url),
}