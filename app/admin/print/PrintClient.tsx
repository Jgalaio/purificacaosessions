'use client'

import { useEffect, useState } from 'react'

export default function PrintClient() {
  const [codes, setCodes] = useState<any[]>([])

  useEffect(() => {
    fetchCodes()
  }, [])

const fetchCodes = async () => {
  try {
    const res = await fetch('/api/codes')
    const data = await res.json()

    console.log('CODES:', data) // 👈 DEBUG

    setCodes(data)
  } catch (err) {
    console.error('Erro ao buscar códigos', err)
  }
}

  return (
    <main className="bg-white flex flex-col items-center p-4 font-mono">

      {/* BOTÃO */}
      <div className="mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-black text-white rounded"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* TALÕES */}
      <div className="flex flex-col gap-4">

        {codes.map((item, i) => (
          <div
            key={i}
            className="w-[260px] border border-black px-3 py-2 text-center bg-[repeating-linear-gradient(white,white_10px,#f7f7f7_11px)]"
          >

            <p className="text-[10px]">
              VOTA NO TEU DJ PREFERIDO
            </p>

            <p className="text-[9px] text-gray-600">
              Quarentões 26 Sessions
            </p>

            <p className="text-[10px]">
              --------------------
            </p>

            <p className="text-xl font-bold tracking-[0.3em]">
              {item.code}
            </p>

            <p className="text-[10px]">
              --------------------
            </p>

            <p className="text-[9px]">
              Obrigado 🎧
            </p>

            <div className="border-t border-dashed border-black text-[9px] mt-1">
              ✂ cortar aqui
            </div>

          </div>
        ))}

      </div>
    </main>
  )
}