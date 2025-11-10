import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('butchers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch count' }, { status: 500 })
    }

    return Response.json({ count: count || 0 })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}