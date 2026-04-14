import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 🔥 apagar TODOS os votos
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .not('id', 'is', null) // ✅ FIX REAL

    if (votesError) throw votesError

    // 🔥 reset códigos
    const { error: codesError } = await supabase
      .from('vote_codes')
      .update({
        used: false,
      })
      .not('id', 'is', null) // ✅ igual aqui

    if (codesError) throw codesError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('RESET ERROR:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}