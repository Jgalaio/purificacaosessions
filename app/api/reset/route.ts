import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 🔥 apagar votos
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .neq('id', '') // 👈 FIX

    if (votesError) throw votesError

    // 🔥 reset códigos
    const { error: codesError } = await supabase
      .from('vote_codes')
      .update({
        used: false,
        voted_dj_slug: null,
        voted_at: null,
      })
      .neq('code', '') // 👈 opcional mas seguro

    if (codesError) throw codesError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

