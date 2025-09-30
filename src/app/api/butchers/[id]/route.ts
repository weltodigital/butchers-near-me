import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: butcher, error } = await supabase
      .from('butchers')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Butcher not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ butcher })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
