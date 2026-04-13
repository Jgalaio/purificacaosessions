import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { id, name } = await req.json()

  await supabase
    .from('djs')
    .update({ name })
    .eq('id', id)

  return NextResponse.json({ success: true })
}