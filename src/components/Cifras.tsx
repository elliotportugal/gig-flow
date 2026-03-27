import React, { useState, useEffect, useCallback } from 'react';
import GigLayout from './GigLayout';

const Cifras: React.FC = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [currentSong, setCurrentSong] = useState({
    title: 'Hotel California', artist: 'Eagles', key: 'Em', raw: '', clean: ''
  });
  const [showCifraBruta, setShowCifraBruta] = useState(false);
  const [activeTab, setActiveTab] = useState<'cs' | 'grid'>('cs');

  // ... (mantenha TODA lógica parseCS, norm, autoClean, etc. da versão anterior)

  return (
    <GigLayout onPrint={() => window.print()}>
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="w-72 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 flex flex-col">
          <div className="p-6 text-xs font-bold uppercase text-slate-400 border-b border-slate-700 tracking-wider">
            Repertório
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {songs.map((song) => (
              <div key={song.id} 
                   className={`p-4 rounded-xl text-sm cursor-pointer border-2 flex justify-between items-center transition-all group ${
                     currentId === song.id 
                       ? 'border-amber-400 bg-amber-500/10 scale-105 shadow-2xl' 
                       : 'border-slate-700 hover:border-amber-300 hover:bg-slate-700/50 hover:scale-102'
                   }`}
                   onClick={() => {
                     setCurrentId(song.id);
                     setCurrentSong(song);
                   }}
              >
                <div>
                  <div className="font-bold line-clamp-1">{song.title || 'Nova'}</div>
                  <div className="text-xs text-slate-400">{song.artist}</div>
                </div>
                <button className="text-red-400 hover:text-red-200 opacity-0 group-hover:opacity-100 px-2 rounded transition-all">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button className="mx-4 mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black font-bold py-3 px-6 rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all">
            + Nova Música
          </button>
        </div>

        {/* Main Content - FLEXIBLE */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
          {/* META HEADER (NOVO - sempre visível) */}
          <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Título</label>
                <input 
                  className="w-full bg-slate-900/50 border border-slate-600 hover:border-amber-400 focus:border-amber-400 text-white p-4 rounded-xl text-lg font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                  placeholder="Nome da música"
                  value={currentSong.title}
                  onChange={(e) => setCurrentSong({...currentSong, title: e.target.value})}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Artista/Banda</label>
                <input 
                  className="w-full bg-slate-900/50 border border-slate-600 hover:border-amber-400 focus:border-amber-400 text-white p-4 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                  placeholder="Artista"
                  value={currentSong.artist}
                  onChange={(e) => setCurrentSong({...currentSong, artist: e.target.value})}
                />
              </div>
              <div className="min-w-[120px]">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Tom</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-600 hover:border-amber-400 focus:border-amber-400 text-white p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                  value={currentSong.key}
                  onChange={(e) => setCurrentSong({...currentSong, key: e.target.value})}
                >
                  <option value="">Tom...</option>
                  <option>Em</option><option>Am</option><option>Dm</option><option>G</option>
                  <option>C</option><option>F</option><option>Bb</option><option>Eb</option>
                </select>
              </div>
            </div>
          </div>

          {/* CIFRA BRUTA - COLLAPSÍVEL */}
          {showCifraBruta && (
            <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-600 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-300">🎹 Cifra Bruta (Opcional)</h3>
                <button 
                  className="text-sm text-slate-400 hover:text-slate-200 font-bold px-4 py-1 rounded-lg border border-slate-600 hover:border-slate-400 transition-all"
                  onClick={() => setShowCifraBruta(false)}
                >
                  ↑ Ocultar
                </button>
              </div>
              <textarea 
                className="w-full h-48 bg-slate-900/70 border border-slate-600 hover:border-slate-400 focus:border-amber-400 text-slate-200 p-4 font-mono rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                placeholder="Cole a cifra aqui para auto-clean..."
                value={currentSong.raw}
                onChange={(e) => {
                  setCurrentSong({...currentSong, raw: e.target.value});
                  // autoClean logic aqui
                }}
              />
              <button className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 rounded-xl text-sm">
                ✨ Aplicar AutoClean
              </button>
            </div>
          )}

          {/* Mapa + Grid - FULL FLEX */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Mapa Texto */}
            <div className="flex-1 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold uppercase text-amber-400 tracking-wider">Mapa de Acordes</span>
              </div>
              <textarea 
                className="flex-1 bg-transparent text-slate-200 p-6 font-mono text-base leading-relaxed border-0 resize-none focus:outline-none"
                placeholder={`
: Intro
Bm F# A E

: Verso
Bm F# A E G D Em F#

: Refrão x2
( A E G D ) x2
                `.trim()}
                value={currentSong.clean}
                onChange={(e) => setCurrentSong({...currentSong, clean: e.target.value})}
              />
            </div>

            {/* Grid Preview */}
            <div className="flex-1 bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                <span className="text-sm font-bold uppercase text-amber-400 tracking-wider">Real Book Grade</span>
              </div>
              <div className="p-8 overflow-auto flex-1">
                {/* Grid render aqui */}
                <div className="max-w-2xl mx-auto font-patrick text-2xl text-black bg-white rounded-2xl p-12 shadow-2xl min-h-full">
                  Preview da grade Patrick Hand
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Cifra */}
          <button 
            className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all mx-auto"
            onClick={() => setShowCifraBruta(!showCifraBruta)}
          >
            {showCifraBruta ? '🙈 Ocultar Cifra Bruta' : '📝 Colar Cifra Bruta'}
          </button>
        </div>
      </div>
    </GigLayout>
  );
};

export default Cifras;
