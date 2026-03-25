"use client"
import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Cifras() {
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // CDN ChordSheetJS + jsPDF
    const loadScripts = () => {
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
    }
    loadScripts()
  }, [])

  const generatePreview = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        if (window.chordsheetjs) {
          const parser = new window.chordsheetjs.ChordsOverWordsParser()
          const song = parser.parse(textareaRef.current?.value || '')
          const formatter = new window.chordsheetjs.HtmlDivFormatter()
          setPreview(formatter.format(song))
        } else {
          setPreview('<p>Carregando biblioteca... tente novamente</p>')
        }
      } catch(e) {
        setPreview('<p class="text-red-500">Formato inválido. Use: G C ou :Intro</p>')
      }
      setLoading(false)
    }, 800)
  }

  const downloadPDF = () => {
    if (!window.jspdf || !textareaRef.current?.value) return
    
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    try {
      const parser = new window.chordsheetjs.ChordsOverWordsParser()
      const song = parser.parse(textareaRef.current.value)
      const formatter = new window.chordsheetjs.TextFormatter()
      doc.text(formatter.format(song), 10, 10)
      doc.save('cifra-realbook.pdf')
    } catch(e) {
      alert('Erro PDF - verifique formato da cifra')
    }
  }

  
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-12 px-4">
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
          🎸 Gig Flow Cifras
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed">
          Crie e exporte cifras estilo Real Book para seus shows em segundos
        </p>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input */}
        <Card className="shadow-2xl ring-2 ring-purple-500/50 backdrop-blur-sm bg-white/5 border-white/20">
          <CardContent className="p-8 pt-6">
            <Textarea 
              ref={textareaRef}
              placeholder="Cole sua cifra aqui...
: Intro
| G | C | D | C |
| G | Em | C | D |

[Refrão]
(A D E D)x2"
              className="h-80 font-mono text-sm bg-slate-900/50 border-white/20 resize-none shadow-inner focus-visible:ring-purple-500"
            />
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={generatePreview} 
                disabled={loading}
                className="flex-1 shadow-xl hover:shadow-purple-500/50 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading ? '✨ Gerando...' : '✨ Preview HTML'}
              </Button>
              <Button 
                onClick={downloadPDF} 
                variant="outline" 
                className="px-8 shadow-xl border-white/30 hover:bg-white/10"
              >
                💾 PDF Pro R$9
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card className="shadow-2xl ring-2 ring-emerald-500/50 backdrop-blur-sm bg-white/5 border-white/20 max-h-[500px] overflow-hidden">
            <div className="p-8 max-h-[500px] overflow-auto font-mono text-sm leading-6 bg-gradient-to-b from-emerald-900/20 to-slate-900/50">
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          </Card>
        )}
      </div>

      <div className="text-center text-sm text-slate-500 max-w-2xl mx-auto">
        Formato suportado: :Intro | G | C | [Refrão] (acordes sobre letras) | (x2)
      </div>
    </div>
  </div>
)

}
