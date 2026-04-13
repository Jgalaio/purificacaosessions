import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET
export async function GET() {
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  return NextResponse.json(data)
}

// POST (update)
export async function POST(req: Request) {
  const { voting_open } = await req.json()

  await supabase
    .from('settings')
    .update({ voting_open })
    .eq('id', 1)

  return NextResponse.json({ success: true })
}