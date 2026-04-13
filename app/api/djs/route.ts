import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET
export async function GET() {
  const { data } = await supabase.from('djs').select('*').order('created_at')
  return NextResponse.json(data)
}

// POST (CRIAR DJ)
export async function POST(req: Request) {
  const { name, image_url } = await req.json()

  await supabase.from('djs').insert([
    {
      name,
      image_url,
    },
  ])

  return NextResponse.json({ success: true })
}

// DELETE
export async function DELETE(req: Request) {
  const { id } = await req.json()

  await supabase.from('djs').delete().eq('id', id)

  return NextResponse.json({ success: true })
}