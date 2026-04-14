import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { code, dj_id } = await req.json()

    // ================= IP REAL =================
    const rawIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const ip = rawIp.split(',')[0].trim()

    // ================= SETTINGS =================
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!settings?.voting_open) {
      return NextResponse.json(
        { error: 'Votação fechada' },
        { status: 403 }
      )
    }

    // ================= VALIDAR DJ =================
    const { data: dj } = await supabaseAdmin
      .from('djs')
      .select('*')
      .eq('id', dj_id)
      .single()

    if (!dj) {
      return NextResponse.json(
        { error: 'DJ inválido' },
        { status: 400 }
      )
    }

    // ================= VALIDAR CÓDIGO =================
    const { data: voteCode } = await supabaseAdmin
      .from('vote_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (!voteCode) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    // 🔥 CORREÇÃO AQUI
    if (voteCode.is_used) {
      return NextResponse.json(
        { error: 'Código já utilizado' },
        { status: 400 }
      )
    }

    // ================= LIMITE POR IP =================
    const LIMIT = 50

    const { count } = await supabaseAdmin
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)

    if ((count || 0) >= LIMIT) {
      return NextResponse.json(
        { error: 'Limite de votos atingido' },
        { status: 429 }
      )
    }

    // ================= INSERIR VOTO =================
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert([
        {
          code,
          dj_id,
          ip,
        },
      ])

    if (voteError) throw voteError

    // ================= ATUALIZAR CÓDIGO =================
    const { error: codeError } = await supabaseAdmin
      .from('vote_codes')
      .update({
        is_used: true,
        voted_dj_slug: dj.name, // ou dj.slug se tiveres
        voted_at: new Date().toISOString(),
      })
      .eq('code', code)

    if (codeError) throw codeError

    // ================= LOG =================
    console.log('✅ VOTO REGISTADO:', { code, dj: dj.name, ip })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('🔥 ERRO VOTO:', error)

    return NextResponse.json(
      { error: error.message || 'Erro ao votar' },
      { status: 500 }
    )
  }
}