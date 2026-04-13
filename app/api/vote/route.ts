import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { code, dj_id } = await req.json()

  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'

  // 🔒 verificar votação aberta
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

  // 🔐 verificar se código existe
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

  // 🚫 verificar se já foi usado
  if (voteCode.used) {
    return NextResponse.json(
      { error: 'Código já utilizado' },
      { status: 400 }
    )
  }

  // ⚖️ limite por IP (opcional)
  const LIMIT = 50

  const { count } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)

  if ((count || 0) > LIMIT) {
    return NextResponse.json(
      { error: 'Limite de votos atingido' },
      { status: 429 }
    )
  }

  // ✅ guardar voto
  await supabaseAdmin.from('votes').insert([
    {
      code,
      dj_id,
      ip,
    },
  ])

  // ✅ marcar código como usado
  await supabaseAdmin
    .from('vote_codes')
    .update({ used: true })
    .eq('code', code)

  return NextResponse.json({ success: true })
}