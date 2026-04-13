import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const fileName = `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('djs')
    .upload(fileName, file)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage
    .from('djs')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: data.publicUrl })
}