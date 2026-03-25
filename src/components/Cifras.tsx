"use client"
import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Cifras() {
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // FUNÇÃO 1: Load CDN (DENTRO)
  const loadCDN = useCallback(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/chordsheetjs@9.0.7/dist/chordsheetjs.umd.min.js',
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ]
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        document.head.appendChild(script)
      }
    })
  }, [])

  // FUNÇÃO 2: Preview (DENTRO)
 const generatePreview = useCallback(async () => {
  setLoading(true)
  setPreview('<p class="text-blue-400 p-6 text-center animate-pulse">🔄 Carregando ChordSheetJS (3s)...</p>')
  
  // Wait 3s + poll
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 200))
    if (window.chordsheetjs && typeof window.chordsheetjs.ChordsOverWordsParser === 'function') {
      break
    }
  }
  
  if (!window.chordsheetjs) {
    setPreview('<p class="text-orange-400 p-8 text-center bg-orange-900/20 rounded-xl">⚠️ CDN lento hoje<br/>Tente Preview novamente ou em 10s</p>')
    setLoading(false)
    return
  }

  try {
    const parser = new window.chordsheetjs.ChordsOverWordsParser()
    const song = parser.parse(textareaRef.current?.value || '')
    const formatter = new window.chordsheetjs.HtmlDivFormatter()
    setPreview(formatter.format(song))
  } catch(e) {
    console.error(e)
    setPreview(`<p class="text-red-500 p-6 rounded-xl bg-red-900/20 border-2 border-red-500/50 text-center">Erro: ${e.message}<br/><small>Exemplo: <code>: Intro<br/>G C D</code></small></p>`)
  }
  setLoading(false)
}, [])

  // FUNÇÃO 3: PDF (DENTRO)
  const downloadPDF = useCallback(() => {
    if (!window.jspdf || !textareaRef.current?.value) {
      alert('Aguarde PDF library carregar')
      return
    }
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ format: 'a4' })
    try {
      const parser = new window.chordsheetjs.ChordsOverWordsParser()
      const song = parser.parse(textareaRef.current.value)
      const formatter = new window.chordsheetjs.TextFormatter()
      const text = formatter.format(song)
      doc.setFontSize(12)
      doc.text(text, 15, 20, { maxWidth: 170 })
      doc.save('gig-flow-cifra.pdf')
    } catch(e) {
      alert('Erro PDF: ' + e.message)
    }
  }, [])

  useEffect(() => {
    loadCDN()
  }, [loadCDN])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl mb-6">
            🎸 Gig Flow Cifras
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Cifras estilo Real Book para baixistas e bandas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-2xl ring-2 ring-purple-500/50 backdrop-blur-sm bg-white/5 border-white/20">
            <CardContent className="p-8 pt-6">
              <Textarea 
                ref={textareaRef}
                className="h-80 font-mono text-sm bg-slate-900/50 border-slate-700/50 focus-visible:ring-2 ring-purple-500 resize-none shadow-xl"
                placeholder="Sua cifra aqui..."
              />
              <div className="flex gap-4 mt-6">
                <Button onClick={generatePreview} disabled={loading} className="flex-1 shadow-xl hover:shadow-purple-500/50 bg-gradient-to-r from-purple-600 to-pink-600 h-12">
                  {loading ? '✨ Gerando...' : '✨ Preview HTML'}
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="px-8 shadow-xl h-12 border-white/30 hover:bg-white/10">
                  💾 PDF Pro
                </Button>
              </div>
            </CardContent>
          </Card>

          {preview && (
            <Card className="shadow-2xl ring-2 ring-emerald-500/50 backdrop-blur-sm bg-white/5 border-white/20 max-h-[600px] overflow-hidden">
              <div className="p-8 max-h-[600px] overflow-auto font-mono text-sm leading-6 bg-gradient-to-b from-emerald-900/30 to-slate-900/50 border-t-4 border-emerald-500/30">
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
