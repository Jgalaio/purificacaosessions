return (
  <main className="p-6 max-w-7xl mx-auto">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-black">Admin Panel</h1>

      <div className="flex gap-2">
        <a
          href="/live"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold"
        >
          🎥 LIVE
        </a>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-xl"
        >
          Logout
        </button>
      </div>
    </div>

    {/* TABS */}
    <div className="flex gap-3 mb-8">
      <button onClick={() => setTab('djs')} className={tabBtn(tab === 'djs')}>DJs</button>
      <button onClick={() => setTab('ranking')} className={tabBtn(tab === 'ranking')}>Ranking</button>
      <button onClick={() => setTab('control')} className={tabBtn(tab === 'control')}>Controlo</button>
    </div>

    {/* ================= DJs ================= */}
    {tab === 'djs' && (
      <div>

        <div className="mb-8 p-4 border rounded-xl">
          <h3 className="font-bold mb-3">Adicionar DJ</h3>

          <input
            placeholder="Nome do DJ"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border p-2 w-full mb-3 rounded"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-3"
          />

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-black text-white rounded"
          >
            ➕ Adicionar
          </button>
        </div>

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
                }}>✏️</button>

                <button onClick={() => deleteDj(dj.id)}>❌</button>
              </div>
            </div>
          ))}
        </div>

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

        {/* ESTADO */}
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
            {votingOpen ? 'Fechar votação' : 'Abrir votação'}
          </button>
        </div>

        {/* RESET */}
        <div className="p-6 border rounded-xl">
          <h2 className="text-xl font-bold mb-2">Reset</h2>

          <button
            onClick={resetVotes}
            className="px-6 py-3 bg-red-500 text-white rounded-xl w-full"
          >
            Resetar votos
          </button>
        </div>

        {/* GERAR CÓDIGOS */}
        <div className="p-6 border rounded-xl">
          <h2 className="text-xl font-bold mb-3">Gerar códigos</h2>

          <input
            type="number"
            value={totalCodes}
            onChange={(e) => setTotalCodes(Number(e.target.value))}
            className="border p-3 rounded w-full mb-4"
          />

          <button
            onClick={handleGenerateCodes}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl w-full"
          >
            {loadingCodes ? 'A gerar...' : 'Gerar códigos'}
          </button>
        </div>

        {/* IMPRESSÃO */}
        <div className="p-6 border rounded-xl">
          <h2 className="text-xl font-bold mb-3">
            Impressão de senhas
          </h2>

          <a
            href="/admin/print"
            target="_blank"
            className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-xl"
          >
            🖨️ Abrir impressão de códigos
          </a>
        </div>

      </div>
    )}

  </main>
)