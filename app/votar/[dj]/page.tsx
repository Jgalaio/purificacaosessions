'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Tesseract from 'tesseract.js'

export default function VotePage() {
  const { dj } = useParams()
  const router = useRouter()

  const [code, setCode] = useState('')
  const [djData, setDjData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  // ================= FETCH DJ =================
  useEffect(() => {
    fetch(`/api/djs/${dj}`)
      .then(res => res.json())
      .then(setDjData)
  }, [dj])

  // ================= SCANNER =================
  const handleScan = async () => {
    try {
      setScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')

      await video.play()

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)

      stream.getTracks().forEach(track => track.stop())

      const image = canvas.toDataURL('image/png')

      const result = await Tesseract.recognize(image, 'eng')

      const text = result.data.text

      const match = text.match(/PS-[A-Z0-9]{4}-\d{6}/)

      if (match) {
        setCode(match[0])
      } else {
        alert('Código não reconhecido')
      }

    } catch (err) {
      console.error(err)
      alert('Erro ao usar câmara')
    }

    setScanning(false)
  }

  // ================= VOTAR =================
  const handleVote = async () => {
    if (!code) {
      alert('Insere ou lê um código')
      return
    }

    setLoading(true)

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        dj_id: dj,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
    } else {
      alert('✅ Voto registado!')

      // voltar à home após 3s
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }

    setLoading(false)
  }

  if (!djData) return <p className="p-6">A carregar...</p>

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">

      <div className="max-w-sm w-full text-center">

        <img
          src={djData.image_url}
          className="w-full h-60 object-cover rounded-xl mb-4"
        />

        <h1 className="text-2xl font-bold mb-4">
          {djData.name}
        </h1>

        {/* INPUT */}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          className="w-full border p-3 rounded mb-3 text-center tracking-widest"
        />

        {/* SCAN */}
        <button
          onClick={handleScan}
          className="w-full mb-3 py-3 bg-blue-600 text-white rounded"
        >
          {scanning ? 'A ler...' : '📷 Ler código'}
        </button>

        {/* VOTAR */}
        <button
          onClick={handleVote}
          className="w-full py-3 bg-black text-white rounded"
        >
          {loading ? 'A votar...' : 'Votar'}
        </button>

      </div>
    </main>
  )
}