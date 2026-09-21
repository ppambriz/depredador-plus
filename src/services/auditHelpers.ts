import { supabase } from '@/lib/supabase'

export async function buildSoftDeletePayload() {
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  return {
    active: false,
    deleted_at: new Date().toISOString(),
    deleted_by: data.user?.id ?? null,
    deleted_user_agent: navigator.userAgent,
  }
}

export const RESTORE_PAYLOAD = {
  active: true,
  deleted_at: null,
  deleted_by: null,
  deleted_user_agent: null,
  deleted_ip: null,
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}