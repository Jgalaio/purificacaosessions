import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data } = await supabaseAdmin
    .from('djs')
    .select('*')
    .eq('id', params.id)
    .single()

  return NextResponse.json(data)
}