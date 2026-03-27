import React, { useState } from 'react';

const Cifras = () => {
  const [showCifraBruta, setShowCifraBruta] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: 'Hotel California',
    artist: 'Eagles', 
    key: 'Em',
    raw: '',
    clean: `: Intro\nBm F# A E\n\n: Verso\nBm F# A E G D Em F#\n\n: Refrão x2\n( A E G D ) x2`
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-6">
      {/* HEADER */}
      <div className="bg-slate-800/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-700 shadow-2xl mb-8 rounded-2xl overflow-hidden">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              Gig Flow Real Book
            </div>
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-10 py-4 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
              📄 PDF Banda R$9
            </button>
          </div>
          
          {/* META INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Título</label>
              <input 
                className="w-full bg-slate-900/70 border-2 border-slate-700 hover:border-amber-400 focus:border-amber-400 bg-opacity-80 text-white p-5 rounded-2xl text-xl font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/30 shadow-lg transition-all duration-300"
                placeholder="Nome da música"
                value={currentSong.title}
                onChange={(e) => setCurrentSong({...currentSong, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Artista/Banda</label>
              <input 
                className="w-full bg-slate-900/70 border-2 border-slate-700 hover:border-amber-400 focus:border-amber-400 text-white p-5 rounded-2xl placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/30 shadow-lg transition-all duration-300"
                placeholder="Eagles, Led Zeppelin..."
                value={currentSong.artist}
                onChange={(e) => setCurrentSong({...currentSong, artist: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Tom</label>
              <select 
                className="w-full bg-slate-900/70 border-2 border-slate-700 hover:border-amber-400 focus:border-amber-400 text-xl font-bold p-5 rounded-2xl bg-opacity-80 text-white focus:outline-none focus:ring-4 focus:ring-amber-500/30 shadow-lg transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgPjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIGZpbGw9IiM5RjFGMTkiLz48L3N2Zz4=')] bg-no-repeat bg-right-4"
                value={currentSong.key}
              >
                <option>Em</option><option>Am</option><option>Dm</option><option>Gm</option>
                <option>C</option><option>F</option><option>Bb</option><option>Eb</option>
                <option>Ab</option><option>Db</option><option>Gb</option><option>B</option>
                <option>E</option><option>A</option><option>D</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr_1.2fr] gap-8 items-start min-h-[600px]">
        {/* Sidebar */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 h-fit sticky top-8">
          <div className="text-xs font-bold uppercase text-slate-400 mb-8 pb-6 border-b border-slate-700 tracking-wider">
            📋 Repertório
          </div>
          <div className="space-y-4 mb-10">
            <div className="group p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 border-slate-600 rounded-2xl hover:border-amber-400/70 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-amber-300">{currentSong.title}</div>
              <div className="text-amber-300 text-sm font-medium">{currentSong.artist}</div>
              <div className="text-xs text-slate-400 mt-2">Tom: {currentSong.key}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-sm">
                ➕ Nova
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-sm">
                📁 Carregar
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-700 space-y-3 overflow-auto max-h-64">
            <div className="p-4 text-sm rounded-xl bg-slate-700/30 hover:bg-slate-600 cursor-pointer transition-all">Hotel California</div>
            <div className="p-4 text-sm rounded-xl bg-slate-700/30 hover:bg-slate-600 cursor-pointer transition-all">Stairway to Heaven</
