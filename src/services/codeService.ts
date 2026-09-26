import type { CodeEntity, CodeSequence } from "@/types";
import { supabase } from "@/lib/supabase";

export const codeService = {
  async getSequence(entity: CodeEntity): Promise<CodeSequence | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("code_sequences")
      .select("*")
      .eq("entity", entity)
      .single();

    if (error) return null;
    return data as CodeSequence;
  },

  async updateSequence(entity: CodeEntity, prefix: string, padding: number) {
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase
      .from("code_sequences")
      .update({ prefix, padding, updated_at: new Date().toISOString() })
      .eq("entity", entity);

    if (error) throw error;
  },

  async suggestNextCode(entity: CodeEntity): Promise<string> {
    const sequence = await this.getSequence(entity);
    if (!sequence || !supabase) return "";

    // Look up the permanent registry, not the entity table:
    // a code stays reserved even if its record was hard-deleted.
    const { data } = await supabase
      .from("used_codes")
      .select("code")
      .eq("entity", entity)
      .like("code", `${sequence.prefix}%`)
      .order("code", { ascending: false })
      .limit(1);

    let nextNumber = 1;

    if (data && data.length > 0) {
      const lastCode = (data[0] as { code: string }).code;
      const numericPart = lastCode.replace(sequence.prefix, "");
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }

    return sequence.prefix + String(nextNumber).padStart(sequence.padding, "0");
  },

  async isCodeAvailable(_entity: CodeEntity, code: string): Promise<boolean> {
    if (!supabase) return true;

    const { data } = await supabase
      .from("used_codes")
      .select("code")
      .eq("code", code)
      .limit(1);

    return !data || data.length === 0;
  },

  async registerCode(entity: CodeEntity, code: string): Promise<void> {
    if (!supabase) return;

    await supabase.from("used_codes").insert({ code, entity });
  },
};
