import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image";

const BUCKET = "product-images";

export const storageService = {
  async uploadProductImage(file: File, productCode: string): Promise<string> {
    if (!supabase) throw new Error("Supabase is not configured");

    const compressed = await compressImage(file);
    const path = `${productCode}-${Date.now()}.webp`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { contentType: "image/webp", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async removeByUrl(url: string | null): Promise<void> {
    if (!supabase || !url) return;

    const marker = `/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return;

    const path = url.slice(index + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  },
  // async removeByUrl(url: string | null): Promise<void> {
  //   if (!supabase || !url) return;

  //   const marker = `/${BUCKET}/`;
  //   const index = url.indexOf(marker);
  //   if (index === -1) return;

  //   const path = url.slice(index + marker.length);
  //   console.log("REMOVING:", path);

  //   const { data, error } = await supabase.storage.from(BUCKET).remove([path]);
  //   console.log("REMOVE RESULT:", { data, error });
  // },
};
