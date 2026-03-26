import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'; // WORKER LOCAL!
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Cifras: React.FC = () => {
  const [selectedCifra, setSelectedCifra] = useState<number | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [textoCifra, setTextoCifra] = useState('');

  const cifrasManuais = [
    { id: 1, title: 'Hotel California', file: '/cifras/hotel-california.pdf', artist: 'Eagles' },
    { id: 2, title: 'Stairway', file: '/cifras/stairway.pdf', artist: 'Led Zeppelin' },
  ];

  const carregarPDF = async (filePath: string) => {
    const pdf = await pdfjsLib.getDocument(filePath).promise;
    setPdfDoc(pdf);
    
    // Extrai TEXTO REAL do PDF (sem CDN!)
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const texto = textContent.items.map((item: any) => item.str).join(' ');
    setTextoCifra(texto);
    setPageNum(1);
  };

  const highlightAcordes = (texto: string) => {
    return texto.replace(/\b([A-G][#b]?(?:m7?|sus|dim|aug)?)\b/gi, '<mark style="background:yellow">$1</mark>');
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pageNum);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    
    // Canvas render (funciona offline)
    const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cifras Offline 🚀</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Lista */}
        <div>
          <h2 className="text-2xl mb-4">Cifras Manuais</h2>
          {cifrasManuais.map(cifra => (
            <div key={cifra.id} className="p-4 border rounded-lg mb-4 cursor-pointer hover:bg-blue-50" 
                 onClick={() => carregarPDF(cifra.file)}>
              <h3 className="font-bold">{cifra.title}</h3>
              <p>{cifra.artist}</p>
            </div>
          ))}
        </div>

        {/* Preview PDF + Texto */}
        {pdfDoc && (
          <div>
            <canvas id="pdf-canvas" className="border w-full max-w-md mb-4" />
            
            <div className="mb-4">
              <p>Página {pageNum} de {pdfDoc.numPages}</p>
              <button onClick={() => setPageNum(p => p-1)} disabled={pageNum <= 1}>←</button>
              <button onClick={() => setPageNum(p => p+1)} disabled={pageNum >= pdfDoc.numPages}>→</button>
              <button onClick={() => renderPage(pageNum)}>Render</button>
            </div>

            {/* Acordes destacados (TEXTO REAL do PDF) */}
            {textoCifra && (
              <div className="p-4 bg-gray-50 rounded max-h-96 overflow-auto"
                   dangerouslySetInnerHTML={{ __html: highlightAcordes(textoCifra) }} />
            )}

            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold mt-6">
              PDF Pro Completo R$9 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cifras;
