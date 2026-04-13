'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Tab = 'djs' | 'ranking' | 'control'

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('djs')
  const [djs, setDjs] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [votingOpen, setVotingOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = () => {
    fetchDjs()
    fetchRanking()
    fetchSettings()
  }

  // ================= DJs =================
  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data || [])
  }

  const deleteDj = async (id: string) => {
    await fetch('/api/djs', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    fetchDjs()
  }

  const updateName = async (id: string) => {
    await fetch('/api/djs/update', {
      method: 'POST',
      body: JSON.stringify({ id, name: newName }),
    })
    setEditingId(null)
    fetchDjs()
  }

  // ================= RANKING =================
  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()
    setRanking(data || [])
  }

  useEffect(() => {
    const channel = supabase
      .channel('votes-pro')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        fetchRanking
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // ================= SETTINGS =================
  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setVotingOpen(data.voting_open)
  }

  const toggleVoting = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ voting_open: !votingOpen }),
    })
    setVotingOpen(!votingOpen)
  }

  const resetVotes = async () => {
    if (!confirm('Resetar TODOS os votos?')) return

    await fetch('/api/reset', { method: 'POST' })
    fetchRanking()
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Admin Panel</h1>

        <a
          href="/live"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold"
        >
          🎥 Abrir Live
        </a>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        {['djs', 'ranking', 'control'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as Tab)}
            className={`px-4 py-2 rounded-xl font-bold ${
              tab === t ? 'bg-black text-white' : 'bg-zinc-200'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= DJs ================= */}
      {tab === 'djs' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {djs.map((dj) => (
            <div key={dj.id} className="border rounded-xl p-3">
              <img src={dj.image_url} className="h-40 w-full object-cover rounded mb-2" />

              {editingId === dj.id ? (
                <>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border p-2 w-full mb-2"
                  />
                  <button onClick={() => updateName(dj.id)}>Guardar</button>
                </>
              ) : (
                <p className="font-bold">{dj.name}</p>
              )}

              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                  setEditingId(dj.id)
                  setNewName(dj.name)
                }}>
                  ✏️
                </button>

                <button onClick={() => deleteDj(dj.id)}>
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= RANKING ================= */}
      {tab === 'ranking' && (
        <div className="space-y-3">
          {ranking.map((dj, i) => (
            <div key={dj.id} className="flex items-center gap-4 border p-3 rounded-xl">
              <div className="w-10 font-black">#{i + 1}</div>
              <img src={dj.image_url} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1">{dj.name}</div>
              <div className="font-bold">{dj.votes}</div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CONTROL ================= */}
      {tab === 'control' && (
        <div className="space-y-6">

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-2">Estado da votação</h2>

            <p className="mb-4">
              <span className={votingOpen ? 'text-green-500' : 'text-red-500'}>
                {votingOpen ? 'ABERTA' : 'FECHADA'}
              </span>
            </p>

            <button
              onClick={toggleVoting}
              className="px-6 py-3 bg-black text-white rounded-xl"
            >
              {votingOpen ? 'Fechar' : 'Abrir'}
            </button>
          </div>

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-2">Reset</h2>

            <button
              onClick={resetVotes}
              className="px-6 py-3 bg-red-500 text-white rounded-xl"
            >
              Resetar votos
            </button>
          </div>

        </div>
      )}
    </main>
  )
}