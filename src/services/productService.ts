import type { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { buildSoftDeletePayload, getCurrentUserId, RESTORE_PAYLOAD } from '@/services/auditHelpers'

export type ProductVisibility = 'all' | 'public' | 'internal'

export type ProductFilters = {
  showActive: boolean
  showInactive: boolean
  categoryId?: string | 'all'
  visibility?: ProductVisibility
  search?: string
}

export type ProductInput = {
  code: string
  name: string
  slug: string
  description: string
  price: number
  cost: number
  image_url: string | null
  category_id: string | null
  visible_public: boolean
  active_ingredient: string | null
  usage_instructions: string | null
  warnings: string | null
  stock: number
  min_stock: number
}

export const productService = {
  // ---------- Public store ----------

  async listPublic(): Promise<Product[]> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('visible_public', true)
      .order('name')

    if (error) throw error
    return data as Product[]
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .eq('visible_public', true)
      .single()

    if (error) return null
    return data as Product
  },

  async listByCategory(categoryId: string): Promise<Product[]> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('active', true)
      .eq('visible_public', true)
      .order('name')

    if (error) throw error
    return data as Product[]
  },

  // ---------- Admin ----------

  async listAdmin(filters: ProductFilters): Promise<Product[]> {
    if (!supabase) return []
    if (!filters.showActive && !filters.showInactive) return []

    let query = supabase.from('products').select('*')

    if (filters.showActive && !filters.showInactive) query = query.eq('active', true)
    if (!filters.showActive && filters.showInactive) query = query.eq('active', false)

    if (filters.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.visibility === 'public') query = query.eq('visible_public', true)
    if (filters.visibility === 'internal') query = query.eq('visible_public', false)

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('code')
    if (error) throw error
    return data as Product[]
  },

  async getById(id: string): Promise<Product | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Product
  },

  async create(input: ProductInput): Promise<Product> {
    if (!supabase) throw new Error('Supabase is not configured')

    const createdBy = await getCurrentUserId()

    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, created_by: createdBy })
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async update(id: string, input: Omit<ProductInput, 'code'>): Promise<Product> {
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async softDelete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured')

    const payload = await buildSoftDeletePayload()
    const { error } = await supabase.from('products').update(payload).eq('id', id)

    if (error) throw error
  },

  async restore(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured')

    const { error } = await supabase.from('products').update(RESTORE_PAYLOAD).eq('id', id)

    if (error) throw error
  },
}