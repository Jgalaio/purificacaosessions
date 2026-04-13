'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function VotePage() {
  const params = useParams()
  const djId = params.dj as string

  const [dj, setDj] = useState<any>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDj()
  }, [])

  const fetchDj = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()

    const found = data.find((d: any) => d.id === djId)
    setDj(found)
  }

  const handleVote = async () => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, dj_id: djId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error)
      return
    }

    setMessage('✅ Voto registado!')
  }

  if (!dj) return <p className="p-6">A carregar...</p>

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">

        <img
          src={dj.image_url}
          className="w-full h-64 object-cover rounded-xl mb-4"
        />

        <h1 className="text-3xl font-black mb-4">
          {dj.name}
        </h1>

        <input
          placeholder="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <button
          onClick={handleVote}
          className="w-full bg-black text-white py-3 rounded"
        >
          Votar
        </button>

        {message && (
          <p className="mt-4 font-medium">{message}</p>
        )}
      </div>
    </main>
  )
}