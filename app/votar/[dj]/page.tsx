'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

export default function VotePage() {
  const { dj } = useParams()
  const router = useRouter()

  const [djData, setDjData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)

  const scannerRef = useRef<any>(null)

  // ================= FETCH =================
  useEffect(() => {
    fetch(`/api/djs/${dj}`)
      .then(res => res.json())
      .then(setDjData)
  }, [dj])

  // ================= SOM + VIBRA =================
  const feedback = () => {
    const audio = new Audio('/beep.mp3')
    audio.play()

    if (navigator.vibrate) {
      navigator.vibrate(150)
    }
  }

  // ================= AUTO VOTE =================
  const autoVote = async (code: string) => {
    if (loading) return

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
      feedback()
      setSuccess(true)

      setTimeout(() => {
        router.push('/')
      }, 2000)
    }

    setLoading(false)
  }

  // ================= SCANNER =================
  const startScanner = async () => {
    setScanning(true)

    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    await scanner.start(
      { facingMode: 'environment' },
      { fps: 12, qrbox: 260 },
      (decodedText) => {
        const match = decodedText.match(/PS-[A-Z0-9]{4}-\d{6}/)

        if (match) {
          const code = match[0]

          if (code === lastScan) return
          setLastScan(code)

          stopScanner()
          autoVote(code)
        }
      },
      () => {}
    )
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
      setScanning(false)
    }
  }

  if (!djData) return null

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">

      <div className="max-w-md w-full">

        {/* CARD */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">

          {/* IMAGE + GLOW */}
          <div className="relative group">
            <img
              src={djData.image_url}
              className="w-full h-64 object-cover"
            />

            {/* NEON OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            {/* GLOW */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
              bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 blur-xl" />

            <h1 className="absolute bottom-4 left-4 text-white text-2xl font-black tracking-wide">
              {djData.name}
            </h1>
          </div>

          {/* CONTENT */}
          <div className="p-5 space-y-4">

            {/* SUCCESS */}
            {success && (
              <div className="bg-green-500 text-white p-3 rounded-xl text-center font-bold animate-pulse">
                ✅ VOTO REGISTADO
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="text-center text-gray-500 animate-pulse">
                A registar voto...
              </div>
            )}

            {/* BUTTON */}
            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full py-4 rounded-xl text-white font-bold text-lg
                bg-gradient-to-r from-fuchsia-500 to-cyan-500
                shadow-lg shadow-fuchsia-500/30
                hover:scale-105 transition-all duration-300"
              >
                📷 SCAN & VOTAR
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full py-4 rounded-xl text-white font-bold bg-red-500"
              >
                ❌ PARAR
              </button>
            )}

            {/* SCANNER BOX */}
            <div className="relative">
              <div
                id="reader"
                className={`w-full rounded-xl overflow-hidden ${
                  scanning ? 'block' : 'hidden'
                }`}
              />

              {/* LASER EFFECT */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-red-500 animate-[scan_2s_linear_infinite]" />
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ANIMAÇÃO LASER */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(250px); }
        }
      `}</style>

    </main>
  )
}