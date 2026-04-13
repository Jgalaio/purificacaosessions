'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function VotePage() {
  const params = useParams()
  const router = useRouter()
  const djId = params.dj as string

  const [dj, setDj] = useState<any>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDj()
  }, [])

  const fetchDj = async () => {
    try {
      const res = await fetch(`/api/djs/${djId}`)
      const data = await res.json()
      setDj(data)
    } catch {
      setMessage('Erro ao carregar DJ')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!code) {
      setMessage('Introduce o código')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, dj_id: djId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error)
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setSubmitting(false)

      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch {
      setMessage('Erro ao votar')
      setSubmitting(false)
    }
  }

  // LOADING
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="animate-pulse text-xl">
          A carregar DJ...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >

        {/* IMAGEM */}
        <div className="relative mb-6 rounded-3xl overflow-hidden shadow-xl">
          <img
            src={dj.image_url}
            className="w-full h-[320px] object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-black text-white drop-shadow-lg">
              {dj.name}
            </h1>
          </div>
        </div>

        {/* SUCESSO */}
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-6 bg-green-50 border border-green-300 rounded-2xl"
          >
            <p className="text-2xl font-bold text-green-600 mb-2">
              ✅ Voto registado!
            </p>

            <p className="text-sm text-zinc-600">
              Obrigado pela tua participação
            </p>

            <p className="text-xs text-zinc-400 mt-2">
              A redirecionar...
            </p>
          </motion.div>
        ) : (
          <>
            {/* INPUT */}
            <input
              placeholder="Código de voto"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-100 border border-zinc-300 mb-4 outline-none focus:ring-2 focus:ring-fuchsia-500"
            />

            {/* BOTÃO */}
            <button
              onClick={handleVote}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-md hover:scale-[1.02] transition disabled:opacity-50"
            >
              {submitting ? 'A votar...' : 'Votar'}
            </button>

            {/* ERRO */}
            {message && (
              <p className="mt-4 text-center text-red-500 font-medium">
                {message}
              </p>
            )}
          </>
        )}

      </motion.div>
    </main>
  )
}