import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔁 RESET START')

    // ================= APAGAR VOTOS =================
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .neq('id', 0)

    if (votesError) {
      console.error('❌ ERRO VOTES:', votesError)
      throw votesError
    }

    // ================= RESETAR CÓDIGOS =================
    const { error: codesError } = await supabase
      .from('vote_codes')
      .update({
        is_used: false,
        voted_dj_slug: null,
        voted_at: null,
      })
      .neq('code', '')

    if (codesError) {
      console.error('❌ ERRO CODES:', codesError)
      throw codesError
    }

    console.log('✅ RESET OK')

    return NextResponse.json({
      success: true,
    })

  } catch (error: any) {
    console.error('🔥 RESET FAIL:', error)

    return NextResponse.json(
      { error: error.message || 'Erro no reset' },
      { status: 500 }
    )
  }
}