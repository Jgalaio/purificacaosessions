'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)

  const fetchData = async () => {
    const res = await fetch('/api/analytics')
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('analytics-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        fetchData
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!data) return <p className="p-6">A carregar...</p>

  const top3 = data.stats.slice(0, 3)

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">

      <h1 className="text-3xl font-black">📊 Analytics</h1>

      {/* TOTAL */}
      <div className="p-6 bg-black text-white rounded-2xl text-center">
        <p className="text-lg">Total de votos</p>
        <p className="text-4xl font-black">{data.totalVotes}</p>
      </div>

      {/* TOP 3 */}
      <div className="grid grid-cols-3 gap-4">
        {top3.map((dj: any, i: number) => (
          <div key={dj.id} className="p-4 border rounded-xl text-center">
            <img src={dj.image_url} className="h-24 w-full object-cover rounded mb-2" />
            <p className="font-bold">#{i + 1} {dj.name}</p>
            <p>{dj.votes} votos</p>
          </div>
        ))}
      </div>

      {/* LISTA + BARRAS */}
      <div className="space-y-3">
        {data.stats.map((dj: any) => (
          <div key={dj.id} className="border p-3 rounded-xl">

            <div className="flex justify-between mb-1">
              <span>{dj.name}</span>
              <span>{dj.percent}%</span>
            </div>

            <div className="w-full bg-zinc-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-3 rounded-full"
                style={{ width: `${dj.percent}%` }}
              />
            </div>

          </div>
        ))}
      </div>

    </main>
  )
}