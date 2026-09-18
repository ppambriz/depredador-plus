import { supabase } from '@/lib/supabase'

export const authService = {
  async login(email: string, password: string) {
    //console.log('Supabase client:', supabase ? 'connected' : 'NULL')

    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async logout() {
    if (!supabase) return
    await supabase.auth.signOut()
  },

  async getSession() {
    if (!supabase) return null

    const { data } = await supabase.auth.getSession()
    return data.session
  },

  onAuthChange(callback: (session: unknown) => void) {
    if (!supabase) return { unsubscribe: () => {} }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })

    return { unsubscribe: () => data.subscription.unsubscribe() }
  },
}