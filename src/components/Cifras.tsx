"use client"
import { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Cifras() {
  const [input, setInput] = useState(`[Intro]
Bm    F#    A    E
G    D    Em    F#

[Verso 1]
Bm                F#
On a dark desert highway
A                 E
Cool wind in my hair
G                  D
Warm smell of colitas
F#                 Bm
Rising up through the air`);
  const [preview, setPreview] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseChordPro = useCallback((text: string) => {
    const lines = text.split('\n');
    let html = '';
    lines.forEach(line => {
      if (line.startsWith('[')) {
        html += `<div class="font-bold text-blue-400 py-1">${line.slice(1, -1)}</div>`;
      } else {
        // Simple chord highlight (regex for common chords)
        const highlighted = line.replace(/(\b[A-G][#b]?(m7?|maj7?|dim|sus[24]?|add9?)?\b)/gi, '<span class="text-yellow-400 font-bold bg-black/30 px-1 rounded">$1</span>');
        html += `<div class="whitespace-pre-wrap text-sm leading-relaxed">${highlighted}</div>`;
      }
    });
    return html;
  }, []);

  const handleParse = () => {
    const parsed = parseChordPro(input);
    setPreview(parsed);
    // Scroll to preview
    const previewEl = document.getElementById('preview');
    previewEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClear = () => {
    setInput('');
    setPreview('');
    textareaRef.current?.focus();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Editor de Cifras (ChordPro)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cole sua cifra em ChordPro... ex: [Intro] Bm F# A E"
            className="min-h-[300px] font-mono text-sm"
            rows={15}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClear}>Limpar</Button>
            <Button onClick={handleParse}>Gerar Preview</Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card id="preview">
          <CardHeader>
            <CardTitle>Preview Renderizado</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              className="p-6 max-h-[500px] overflow-auto font-sans leading-6 bg-gradient-to-b from-slate-900 to-black"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
            <div className="p-4 border-t bg-slate-900/50 text-xs text-slate-400">
              💡 Pronto para PDF Pro (Stripe R$9) ou export iReal-like.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}