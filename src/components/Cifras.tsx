"use client"
import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Cifras() {
  const [currentSong, setCurrentSong] = useState({
    title: 'Hotel California',
    artist: 'Eagles',
    key: 'Em',
    raw: `[Intro]
Bm    F#    A    E
G    D    Em    F#`,
    clean: ''
  })
  const [activeTab, setActiveTab] = useState<'raw' | 'clean' | 'grid'>('raw')

  const autoClean = () => {
    const lines = currentSong.raw.split('\n')
    const out = lines.map(line => line.replace(/\[([^\]]+)\]/g, ': $1')).join('\n')
    setCurrentSong(prev => ({ ...prev, clean: out }))
  }

  const gridData = [
    { name: 'Intro', rows: [['Bm', 'F#', 'A', 'E'], ['G', 'D', 'Em', 'F#']] }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-4">
      <header className="bg-slate-800/80 backdrop-blur-md h-14 flex items-center px-6 border-b border-slate-700 rounded-xl mb-6">
        <div className="text-2xl font-bold text-amber-400">Gig Flow Real Book</div>
        <Button className="ml-auto bg-amber-500 text-black font-bold px-6 py-2 rounded-lg">PDF</Button>
      </header>

      <div className="flex h-[calc(100vh-140px)] gap-6">
        <div className="w-64 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
          <div className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-700">Repertório</div>
          <div className="flex-1 p-2 space-y-1">
            <div className="p-3 text-sm rounded-xl bg-slate-700/30 hover:bg-slate-600 cursor-pointer border border-slate-700">
              Hotel California
            </div>
          </div>
          <Button className="m-3 bg-amber-500 text-black font-bold py-2 rounded-lg">+ Nova</Button>
        </div>

        <div className="flex-1 grid grid-cols-[1fr_1.3fr] gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
            <div className="p-4 bg-slate-900/50 border-b border-slate-700 text-xs font-bold uppercase text-amber-400">
              01: CIFRA BRUTA
            </div>
            <div className="p-4 border-b border-slate-700 grid grid-cols-3 gap-3">
              <Input value={currentSong.title} onChange={e => setCurrentSong({...currentSong, title: e.target.value})} />
              <Input value={currentSong.artist} />
              <Input value={currentSong.key} />
            </div>
            <Textarea 
              value={currentSong.raw}
              onChange={e => setCurrentSong({...currentSong, raw: e.target.value})}
              className="flex-1 bg-slate-900/80 font-mono text-sm resize-none border-0"
            />
            <div className="p-4">
              <Button onClick={autoClean} className="w-full">Auto Clean</Button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
            <div className="flex bg-slate-900/50 border-b border-slate-700">
              <Button 
                className={`flex-1 p-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'clean' ? 'border-amber-400 text-amber-300 bg-slate-900/50' : 'text-slate-400'}`}
                onClick={() => setActiveTab('clean')}
              >
                02. Mapa de Texto
              </Button>
              <Button 
                className={`flex-1 p-3 text-xs font-bold uppercase border-b-2 ${activeTab === 'grid' ? 'border-amber-400 text-amber-300 bg-slate-900/50' : 'text-slate-400'}`}
                onClick={() => setActiveTab('grid')}
              >
                03. Grade Real Book
              </Button>
            </div>

            {activeTab === 'clean' && (
              <div className="flex flex-col h-full">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 text-xs font-bold uppercase text-amber-400">
                  EDITAR ROTEIRO
                </div>
                <Textarea 
                  value={currentSong.clean}
                  onChange={e => setCurrentSong({...currentSong, clean: e.target.value})}
                  className="flex-1 bg-slate-900/80 font-mono text-sm resize-none border-0"
                />
              </div>
            )}

            {activeTab === 'grid' && (
              <div className="flex-1 overflow-auto p-8 bg-slate-900/20">
                <div className="max-w-2xl mx-auto">
                  <div className="p-12 bg-white rounded-2xl shadow-2xl text-black" style={{ fontFamily: "'Patrick Hand', 'Lato', cursive" }}>
                    {gridData.map((sec, secIdx) => (
                      <div key={secIdx} className="mb-6">
                        {sec.name && (
                          <div className="inline-block border border-slate-500 text-xs px-3 py-1 mb-2 rounded-xl font-bold text-slate-600 bg-slate-100">
                            {sec.name.toUpperCase()}
                          </div>
                        )}
                        {sec.rows.map((row, rowIdx) => (
                          <div key={rowIdx} className="flex mb-1">
                            {row.map((chord, colIdx) => (
                              <div key={colIdx} className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-3 relative hover:bg-slate-50">
                                <span className="font-bold text-lg text-slate-800" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                  {chord || ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}