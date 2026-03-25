import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Exemplo de cifras manuais (adicione mais PDFs na pasta public/cifras/)
const cifrasManuais = [
  { id: 1, title: 'Hotel California', file: '/cifras/hotel-california.pdf', artist: 'Eagles' },
  { id: 2, title: 'Stairway to Heaven', file: '/cifras/stairway.pdf', artist: 'Led Zeppelin' },
  // Adicione aqui: baixe cifras em PDF e coloque em public/cifras/
];

const Cifras: React.FC = () => {
  const [selectedCifra, setSelectedCifra] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isPro, setIsPro] = useState<boolean>(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const highlightAcordes = (text: string) => {
    const acordes = text.match(/\b[A-G][#b]?(?:m7?|sus|dim|aug)?\b/gi) || [];
    return text.replace(/\b([A-G][#b]?(?:m7?|sus|dim|aug)?)\b/gi, '<mark>$1</mark>');
  };

  // Simula extração de texto do PDF (use pdfjs para real)
  const extractTextFromPDF = (file: string) => {
    // Placeholder: integre pdfjs.getDocument para texto real
    return `Texto extraído: ${file.split('/').pop()} com acordes destacados.`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cifras Gig Flow 🚀</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Lista de Cifras */}
        <div>
          <h2 className="text-2xl mb-4">Escolha sua cifra (Grátis Preview)</h2>
          <ul className="space-y-4">
            {cifrasManuais.map((cifra) => (
              <li key={cifra.id} className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedCifra(cifra.id)}>
                <h3 className="font-bold">{cifra.title}</h3>
                <p>{cifra.artist}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview PDF + Highlight */}
        {selectedCifra && (
          <div>
            <h2 className="text-2xl mb-4">Preview: {cifrasManuais.find(c => c.id === selectedCifra)?.title}</h2>
            <Document file={cifrasManuais.find(c => c.id === selectedCifra)?.file} onLoadSuccess={onDocumentLoadSuccess} className="mb-4">
              <Page pageNumber={pageNumber} width={400} />
            </Document>
            <p className="mb-4">Página {pageNumber} de {numPages}</p>
            
            {/* Highlight de Texto */}
            <div className="p-4 bg-gray-50 rounded" 
                 dangerouslySetInnerHTML={{ __html: highlightAcordes(extractTextFromPDF(cifrasManuais.find(c => c.id === selectedCifra)?.file || '')) }} />
            
            {!isPro ? (
              <button 
                onClick={() => {/* Stripe trigger */ }} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold mt-6"
              >
                PDF Pro Completo + Download - R$9
              </button>
            ) : (
              <p className="text-green-600 font-bold">✅ PDF Pro desbloqueado!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cifras;
