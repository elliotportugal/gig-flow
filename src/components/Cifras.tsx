// src/components/Cifras.tsx
import { useEffect, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function Cifras() {
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // CDN ChordSheetJS + jsPDF
    const scripts = [
      'https://cdn.jsdelivr.net/npm/chordsheetjs@9.0.7/dist/chordsheetjs.umd.min.js',
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ]
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script')
        script.src = src
        document.head.appendChild(script)
      }
    })
  }, [])

  const generatePreview = () => {
    setLoading(true)
    setTimeout(() => {  // Simula async CDN
      try {
        const parser = new chordsheetjs.ChordsOverWordsParser()
        const song = parser.parse(textareaRef.current.value)
        const formatter = new chordsheetjs.HtmlDivFormatter()
        setPreview(formatter.format(song))
      } catch(e) {
        setPreview('<p>Erro na cifra. Use formato: G C ou :Intro</p>')
      }
      setLoading(false)
    }, 500)
  }

  const downloadPDF = () => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const parser = new chordsheetjs.ChordsOverWordsParser()
    const song = parser.parse(textareaRef.current.value)
    const formatter = new chordsheetjs.TextFormatter()
    doc.text(formatter.format(song), 10, 10)
    doc.save('cifra-realbook.pdf')
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Gerador Cifras Real Book</h2>
      <Textarea 
        ref={textareaRef}
        placeholder=": Intro
G   C   D   C
G   Em  C   D

[Refrão]
(A D E D)x2" 
        className="h-40 font-mono text-sm"
        defaultValue={`
:title Minha Música
: Intro
G C D C
G Em C D`}
      />
      <div className="flex gap-2">
        <Button onClick={generatePreview} disabled={loading}>
          {loading ? 'Carregando...' : 'Preview'}
        </Button>
        <Button onClick={downloadPDF} variant="outline">
          PDF Pro (R$9)
        </Button>
      </div>
      {preview && (
        <div className="p-4 border rounded-lg bg-white shadow-sm font-mono text-sm leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  )
}
