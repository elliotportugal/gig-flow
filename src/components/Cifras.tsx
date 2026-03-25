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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Gerador Cifras Real Book</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          ref={textareaRef}
          placeholder={`: Intro
G   C   D   C
G   Em  C   D

[Refrão]
(A D E D A F#m D E)x2`}
          className="h-40 font-mono text-sm resize-none"
          defaultValue={`
:title Gig Flow Demo
: Intro
| G | C | D | C |
| G | Em | C | D |

[Verso]
C           G
Esta é uma cifra demo
Am          F
Do seu app SetlistPro
`}
        />
        <div className="flex gap-3">
          <Button onClick={generatePreview} disabled={loading} className="flex-1">
            {loading ? 'Gerando...' : 'Preview HTML'}
          </Button>
          <Button onClick={downloadPDF} variant="outline" className="px-6">
            💾 PDF Pro
          </Button>
        </div>
        {preview && (
          <div className="p-6 border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 font-mono text-sm leading-relaxed max-h-96 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        )}
        <p className="text-xs text-slate-500 text-center">
          Formato: :Intro | G | C | ou [Refrão] (acordes sobre letras)
        </p>
      </CardContent>
    </Card>
  )
}
