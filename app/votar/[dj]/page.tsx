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

  // ================= SOM =================
  const beep = () => {
    const audio = new Audio('/beep.mp3')
    audio.play()
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
      beep()
      setSuccess(true)

      setTimeout(() => {
        router.push('/')
      }, 2500)
    }

    setLoading(false)
  }

  // ================= SCANNER =================
  const startScanner = async () => {
    setScanning(true)

    const scanner = new Html5Qrcode("reader")
    scannerRef.current = scanner

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        const match = decodedText.match(/PS-[A-Z0-9]{4}-\d{6}/)

        if (match) {
          const code = match[0]

          if (code === lastScan) return
          setLastScan(code)

          stopScanner()
          autoVote(code)
        }
      }
    )
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
      setScanning(false)
    }
  }

  if (!djData) return <p className="p-6">A carregar...</p>

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">

      <div className="max-w-md w-full">

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* IMAGE */}
          <div className="relative">
            <img
              src={djData.image_url}
              className="w-full h-64 object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30 flex items-end p-4">
              <h1 className="text-white text-2xl font-bold">
                {djData.name}
              </h1>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-5 space-y-4">

            {/* STATUS */}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-xl text-center font-bold">
                ✅ Voto registado!
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-500">
                A registar voto...
              </div>
            )}

            {/* BOTÕES */}
            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full py-4 rounded-xl text-white font-bold text-lg
                bg-gradient-to-r from-fuchsia-500 to-cyan-500
                hover:scale-105 transition"
              >
                📷 Votar com Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full py-4 rounded-xl text-white font-bold bg-red-500"
              >
                ❌ Parar Scanner
              </button>
            )}

            {/* SCANNER */}
            <div
              id="reader"
              className={`w-full overflow-hidden rounded-xl ${
                scanning ? 'block' : 'hidden'
              }`}
            />

          </div>

        </div>

      </div>

    </main>
  )
}