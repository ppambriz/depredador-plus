import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITTE_SUPABASE_URL
const supabaseAnonkey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = 
    supabaseUrl && supabaseAnonkey
    ? createClient(supabaseUrl, supabaseAnonkey)
    : null