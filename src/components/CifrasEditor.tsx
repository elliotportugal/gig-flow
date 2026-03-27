"use client"
import { useState, useCallback } from 'react'
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
  const [raw, setRaw] = useState(cifra)

  const autoClean = useCallback(() => {
    const lines = raw.split('\n')
    const cleaned = lines
      .map(line => line.replace(/\[([^\]]+)\]/g, ': $1'))
      .filter(Boolean)
      .join('\n')
    
    onCifraChange(cleaned)
    onMapaChange(cleaned)
  }, [raw, onCifraChange, onMapaChange])

  return (
    <div className="space-y-4 p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
      {/* Header Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <Input 
          value={title} 
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Título"
          className="font-bold text-lg bg-slate-800/70"
        />
        <Input 
          value={artist} 
          onChange={e => onArtistChange(e.target.value)}
          placeholder="Artista"
        />
        <div className="flex gap-2">
          <Input 
            value={tom} 
            onChange={e => onTomChange(e.target.value)}
            placeholder="Tom"
            className="flex-1"
          />
          <Button onClick={() => onTranspose(-1)} size="sm" variant="outline" className="w-12 h-10">-</Button>
          <Button onClick={() => onTranspose(1)} size="sm" variant="outline" className="w-12 h-10">+</Button>
        </div>
      </div>

      {/* Cifra Editor */}
      <div>
        <label className="text-sm font-bold text-amber-400 mb-2 block">Cifra Bruta</label>
        <Textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Cole a cifra aqui... [Intro] Bm F# A E"
          className="min-h-[200px] font-mono bg-slate-800/70 border-2 border-slate-600/50 focus:border-amber-400 resize-vertical"
        />
        <Button onClick={autoClean} className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          ✨ AutoClean → Mapa + Grid
        </Button>
      </div>

      {/* Mapa Editável */}
      <div>
        <label className="text-sm font-bold text-amber-400 mb-2 block">Mapa de Acordes (Editável)</label>
        <Textarea
          value={mapa}
          onChange={e => onMapaChange(e.target.value)}
          placeholder="Mapa gerado: : Intro\nBm F# A E"
          className="min-h-[150px] font-mono bg-slate-800/70 border-2 border-slate-600/50 focus:border-amber-400 resize-vertical"
        />
      </div>

      {/* Grid Preview */}
      <div>
        <label className="text-sm font-bold text-amber-400 mb-2 block">Real Book Grid Preview</label>
        <div className="grid grid-cols-4 gap-2 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          {mapa.split('\n')[0]?.split(/\s+/).slice(0,4).map((chord, i) => (
            <div key={i} className="h-20 border-2 border-white/30 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl hover:bg-white/40 transition-all">
              {chord || '—'}
            </div>
          )) || Array(4).fill('').map((_, i) => (
            <div key={i} className="h-20 border-2 border-white/30 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
              —
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onGeneratePdf} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-lg font-bold h-14">
        🖨️ Exportar PDF Pro (R$9)
      </Button>
    </div>
  )
}