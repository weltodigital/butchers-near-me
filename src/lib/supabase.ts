import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      butchers: {
        Row: {
          id: string
          title: string
          image_url: string | null
          total_score: number | null
          reviews_count: number | null
          street: string | null
          city: string
          state: string | null
          country_code: string
          website: string | null
          phone: string | null
          category_name: string
          google_url: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url?: string | null
          total_score?: number | null
          reviews_count?: number | null
          street?: string | null
          city: string
          state?: string | null
          country_code: string
          website?: string | null
          phone?: string | null
          category_name: string
          google_url?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string | null
          total_score?: number | null
          reviews_count?: number | null
          street?: string | null
          city?: string
          state?: string | null
          country_code?: string
          website?: string | null
          phone?: string | null
          category_name?: string
          google_url?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}