import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  await supabase.from('votes').delete().neq('id', '')
  return NextResponse.json({ success: true })
}