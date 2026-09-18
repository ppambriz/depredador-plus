import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// console.log('ENV URL:', JSON.stringify(supabaseUrl))
// console.log('ENV KEY:', JSON.stringify(supabaseAnonKey?.slice(0, 20)))

export const supabase = 
    supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null