"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface CifrasEditorProps {
  title: string
  artist: string
  tom: string
  cifra: string
  mapa: string | MapaSecao[] 
  transpose: number
  onTitleChange: (title: string) => void
  onArtistChange: (artist: string) => void
  onTomChange: (tom: string) => void
  onCifraChange: (cifra: string) => void
  onMapaChange: (mapa: string) => void
  onTranspose: (delta: number) => void
  onGeneratePdf: () => void
}

export default function CifrasEditor({ 
  title, artist, tom, cifra, mapa, transpose,
  onTitleChange, onArtistChange, onTomChange, onCifraChange, onMapaChange, onTranspose, onGeneratePdf 
}: CifrasEditorProps) {
  const [raw, setRaw] = useState(cifra || '')
  const [activeTab, setActiveTab] = useState<'raw' | 'clean' | 'grid'>('raw')

  // SYNC CIFRA ↔ MAPA
  useEffect(() => {
    if (cifra !== raw) setRaw(cifra || '')
  }, [cifra])

  useEffect(() => {
    if (mapa && mapa !== raw) {
      setRaw(mapa)
      setActiveTab('clean')
    }
  }, [mapa])

  const autoClean = useCallback(() => {
    const cleaned = raw.split('\n')
      .map(line => line.replace(/\[([^\]]+)\]/g, ': $1'))
      .filter(Boolean)
      .join('\n')
    
    setRaw(cleaned)
    onCifraChange(cleaned)
    onMapaChange(cleaned)
    setActiveTab('grid')
  }, [raw, onCifraChange, onMapaChange])

  // ... seu código atual até autoClean

  return (
    <div className="flex h-full gap-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Repertório</h3>
        <div className="text-sm p-3 bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-600">
          Come Together
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_1.3fr] gap-6">
        {/* 1. Cifra Bruta */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
          <div className="p-4 bg-slate-900/50 border-b border-slate-700 text-xs font-bold uppercase text-amber-400">
            CIFRA BRUTA
          </div>
          <div className="p-4 border-b border-slate-700 grid grid-cols-3 gap-3">
            <Input value={title} onChange={e => onTitleChange(e.target.value)} />
            <Input value={artist} onChange={e => onArtistChange(e.target.value)} />
            <Input value={tom} onChange={e => onTomChange(e.target.value)} />
          </div>
          <Textarea 
            value={raw} 
            onChange={e => setRaw(e.target.value)}
            className="flex-1 font-mono text-sm bg-slate-900/80 resize-none border-0"
          />
          <Button onClick={autoClean} className="m-4">Auto Clean</Button>
        </div>

        {/* 2+3. Mapa + Grid */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
          <div className="flex bg-slate-900/50 border-b border-slate-700">
            <Button 
              className={`flex-1 p-3 text-xs uppercase font-bold border-b-2 ${activeTab === 'clean' ? 'border-amber-400 text-amber-300 bg-slate-900/50' : 'text-slate-400'}`}
              onClick={() => setActiveTab('clean')}
            >
              Mapa Texto
            </Button>
            <Button 
              className={`flex-1 p-3 text-xs uppercase font-bold border-b-2 ${activeTab === 'grid' ? 'border-amber-400 text-amber-300 bg-slate-900/50' : 'text-slate-400'}`}
              onClick={() => setActiveTab('grid')}
            >
              Real Book
            </Button>
          </div>

          {activeTab === 'clean' && (
            <div className="flex-1 p-6">
              <Textarea 
                value={mapa || raw} 
                onChange={e => onMapaChange(e.target.value)}
                className="w-full h-full font-mono text-sm bg-slate-900/80 resize-none border-0"
              />
            </div>
          )}

          {activeTab === 'grid' && (
            <div className="flex-1 overflow-auto p-8 bg-slate-900/20">
              <div className="max-w-2xl mx-auto">
                <div className="p-12 bg-white rounded-2xl shadow-2xl text-black font-mono">
                  <div className="mb-6">
                    <div className="inline-block border border-slate-500 text-xs px-3 py-1 mb-2 rounded-xl font-bold text-slate-600 bg-slate-100">
                      {title || 'INTRO'}
                    </div>
                    <div className="flex mb-1">
                      <div className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-3 hover:bg-slate-50">
                        <span className="font-bold text-lg text-slate-800">Bm</span>
                      </div>
                      <div className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-3 hover:bg-slate-50">
                        <span className="font-bold text-lg text-slate-800">F#</span>
                      </div>
                      <div className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-3 hover:bg-slate-50">
                        <span className="font-bold text-lg text-slate-800">A</span>
                      </div>
                      <div className="flex-1 min-h-[70px] border-r-2 border-l-2 border-slate-400 flex items-center justify-center p-3 hover:bg-slate-50">
                        <span className="font-bold text-lg text-slate-800">E</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}