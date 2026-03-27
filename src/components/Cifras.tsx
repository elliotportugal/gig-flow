import React, { useState } from 'react';

const Cifras = () => {
  const [showCifraBruta, setShowCifraBruta] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: 'Hotel California',
    artist: 'Eagles',
    key: 'Em',
    raw: '',
    clean: `: Intro\nBm F# A E\n\n: Verso\nBm F# A E G D Em F#\n\n: Refrão x2\n(A E G D) x2`
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-gray-200 font-sans antialiased">
      {/* HEADER */}
      <header className="bg-gray-900/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-700 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Gig Flow Real Book PRO
            </h1>
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl self-start lg:self-center transition-all duration-300">
              📄 PDF Banda R$9
            </button>
          </div>
          
          {/* META INPUTS RESPONSIVO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Título</label>
              <input 
                className="w-full bg-gray-900 border border-gray-600 hover:border-amber-500 focus:border-amber-500 text-white p-4 rounded-xl font-semibold text-lg placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 shadow-md"
                placeholder="Hotel California"
                value={currentSong.title}
                onChange={(e) => setCurrentSong({...currentSong, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Artista</label>
              <input 
                className="w-full bg-gray-900 border border-gray-600 hover:border-amber-500 focus:border-amber-500 text-white p-4 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 shadow-md"
                placeholder="Eagles"
                value={currentSong.artist}
                onChange={(e) => setCurrentSong({...currentSong, artist: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Tom</label>
              <select 
                className="w-full bg-gray-900 border border-gray-600 hover:border-amber-500 focus:border-amber-500 text-lg font-semibold p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 shadow-md appearance-none"
                value={currentSong.key}
              >
                <option>Em</option>
                <option>Am</option>
                <option>Dm</option>
                <option>G</option>
                <option>C</option>
                <option>F</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 py-12">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700 p-8 max-h-screen lg:sticky lg:top-32 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-300 mb-8 pb-6 border-b border-gray-600 uppercase tracking-wider">
            📋 Repertório
          </h3>
          <div className="space-y-4 mb-12">
            <div className="p-6 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <div className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-amber-300">{currentSong.title}</div>
              <div className="text-amber-300 text-sm font-medium mb-2">{currentSong.artist}</div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Tom: <span className="font-bold text-amber-300">{currentSong.key}</span></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                ➕ Nova
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl
