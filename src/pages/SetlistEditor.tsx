import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Music, Plus, ChevronLeft, Trash2, FileText, 
  X, ChevronRight, GripVertical, Download, Moon, Sun 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
// Importamos a função centralizada (certifique-se de que o arquivo existe em src/lib/music-utils.ts)
import { parseTextoParaGridData } from "@/lib/music-utils";

// --- MOCK DATA INICIAL ---
const initialMusicas = [
  { id: "1", titulo: "Yesterday", artista: "The Beatles", tom: "C", cifra: ":INTRO\nC G Am F\n\n:VERSO\nC Bm E7 Am G" },
  { id: "2", titulo: "Blackbird", artista: "The Beatles", tom: "G", cifra: ":INTRO\nG Am G/B C" }
];

export default function SetlistEditor() {
  // --- PERSISTÊNCIA: CARREGAR DADOS ---
  const [musicas, setMusicas] = useState(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("gigflow_musicas");
      if (salvo) {
        try { return JSON.parse(salvo); } 
        catch (e) { return initialMusicas; }
      }
    }
    return initialMusicas;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return musicas.length > 0 ? musicas[0].id : null;
  });

  const [activeTab, setActiveTab] = useState<'mapa' | 'grid'>('mapa');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Novo Estado Dark Mode
  const [currentPage, setCurrentPage] = useState(0); 
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", tom: "C" });

  const selectedMusica = musicas.find(m => m.id === selectedId);

  // --- PERSISTÊNCIA: SALVAR DADOS ---
  useEffect(() => {
    localStorage.setItem("gigflow_musicas", JSON.stringify(musicas));
  }, [musicas]);

  // --- SUPORTE A TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showMode) return;
      if (e.key === "ArrowRight") setCurrentPage(p => Math.min(p + 1, musicas.length));
      if (e.key === "ArrowLeft") setCurrentPage(p => Math.max(p - 1, 0));
      if (e.key === "Escape") setShowMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMode, musicas.length]);

  // --- FUNÇÃO PDF ---
  const handleExportPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0,
        filename: `GigFlow_Repertorio.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, width: 794 },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break-before', avoid: '.avoid-break' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) { console.error(error); }
  };

  // --- HANDLERS ---
  const handleAdicionarMusica = () => {
    if (!novaMusica.titulo) return;
    const nova = { id: Date.now().toString(), ...novaMusica, cifra: ":INTRO\n\n:VERSO" };
    setMusicas([nova, ...musicas]);
    setSelectedId(nova.id);
    setIsModalOpen(false);
    setNovaMusica({ titulo: "", artista: "", tom: "C" });
  };

  const handleExcluirMusica = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remover música?")) {
      const novaLista = musicas.filter(m => m.id !== id);
      setMusicas(novaLista);
      if (selectedId === id) setSelectedId(novaLista[0]?.id || null);
    }
  };

  const updateMusica = (id: string, patch: any) => {
    setMusicas((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      
      {/* --- SHOW MODE --- */}
      <AnimatePresence>
        {showMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className={`fixed inset-0 z-[200] flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            
            <div className={`flex justify-between items-center p-4 border-b backdrop-blur-md ${isDarkMode ? 'bg-black/40 border-slate-800' : 'bg-white/70 border-slate-200'}`}>
              <span className="font-black text-slate-400 tracking-tighter uppercase italic">GigFlow Pro</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)} className={isDarkMode ? 'bg-slate-800 text-yellow-400 border-slate-700' : ''}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2"><Download className="w-4 h-4" /> PDF</Button>
                <Button variant="ghost" onClick={() => { setShowMode(false); setCurrentPage(0); }}><X className="w-6 h-6" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center">
              <div id="pdf-content" className="w-full max-w-3xl">
                {/* CAPA */}
                {currentPage === 0 && (
                  <div className={`p-12 min-h-[1050px] w-[794px] page-break-before avoid-break shadow-2xl rounded-sm mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <div className={`border-b-4 border-double pb-4 mb-8 ${isDarkMode ? 'border-slate-700' : 'border-slate-900'}`}>
                      <h1 className="text-6xl font-bold uppercase tracking-tighter">Rock Night</h1>
                      <p className="text-xl opacity-60">Setlist Oficial</p>
                    </div>
                    <div className="space-y-4 text-left">
                      {musicas.map((m, idx) => (
                        <div key={m.id} className={`flex items-end gap-4 text-2xl border-b pb-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          <span className="text-slate-400 text-lg w-8 font-sans">{idx + 1}.</span>
                          <span className="flex-1 font-bold">{m.titulo}</span>
                          <span className="opacity-50 text-lg font-sans">{m.tom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MÚSICAS */}
                {musicas.map((m, mIdx) => (
                  <div key={m.id} className={`${currentPage !== 0 && currentPage !== mIdx + 1 ? 'hidden' : 'block'} p-12 min-h-[1050px] w-[794px] shadow-2xl rounded-sm mb-8 page-break-before transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <div className={`flex justify-between items-end border-b-2 mb-8 pb-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                      <div className="text-left"><h2 className="text-5xl font-bold">{m.titulo}</h2><p className="text-xl opacity-60 italic">{m.artista}</p></div>
                      <div className="text-right"><span className="text-xs font-bold uppercase font-sans">Tom</span><span className="text-4xl font-bold">{m.tom}</span></div>
                    </div>
                    {parseTextoParaGridData(m.cifra).map((sec, idx) => (
                      <div key={idx} className="mb-8 avoid-break text-left">
                        {sec.name && (
                          <div className={`inline-block border text-[10px] px-3 py-1 mb-2 rounded-xl font-bold uppercase font-sans ${isDarkMode ? 'bg-slate-800 border-slate-700 text-primary' : 'bg-slate-100 border-slate-500 text-slate-600'}`}>
                            {sec.name}
                          </div>
                        )}
                        {sec.rows.map((row, ridx) => (
                          <div key={ridx} className="flex mb-1">
                            {row.map((chord, cidx) => (
                              <div key={cidx} className={`flex-1 min-h-[80px] border-l-2 flex items-center justify-center p-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-400'}`}>
                                <span className={`font-bold text-3xl ${isDarkMode ? 'text-primary' : 'text-slate-800'}`}>{chord}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 border-t flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Button variant="ghost" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className={isDarkMode ? 'text-white' : ''}><ChevronLeft className="w-8 h-8" /></Button>
              <div className="flex gap-4 items-center">
                <span className={`font-bold font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentPage === 0 ? "CAPA" : `${currentPage}/${musicas.length}`}</span>
              </div>
              <Button variant="neon" size="lg" disabled={currentPage === musicas.length} onClick={() => setCurrentPage(p => p + 1)}>
                {currentPage === 0 ? "INICIAR" : <ChevronRight className="w-8 h-8" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EDITOR INTERFACE --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-7xl flex items-center justify-between h-14 px-6 mx-auto">
          <Link to="/" className="flex items-center gap-2 no-underline text-foreground">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-black uppercase tracking-tighter italic text-lg">GigFlow Pro</span>
          </Link>
          <Button variant="neon" size="sm">Upgrade Pro</Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 text-left font-sans">
            <div><h1 className="text-4xl font-black uppercase tracking-tighter">Rock Night</h1><p className="text-muted-foreground text-sm">Painel de Controle</p></div>
            <div className="flex gap-3">
              <Button variant="neon" onClick={() => setIsModalOpen(true)}> <Plus className="w-4 h-4 mr-2" /> Adicionar </Button>
              <Button variant="outline" onClick={() => setShowMode(true)} className="gap-2"> <FileText className="w-4 h-4" /> Show Mode </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Repertório ↓</h3>
              <div className="space-y-2">
                {musicas.map((m) => (
                  <div key={m.id} onClick={() => setSelectedId(m.id)} className={`group p-4 rounded-xl cursor-pointer border flex items-center gap-3 transition-all ${selectedId === m.id ? 'bg-secondary border-primary/50' : 'bg-glass/10 border-border/40 hover:border-primary/20'}`}>
                    <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary" />
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold block truncate ${selectedId === m.id ? 'text-primary' : ''}`}>{m.titulo}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-sans">{m.artista} • {m.tom}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={(e) => handleExcluirMusica(m.id, e)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {selectedMusica ? (
                <div className="bg-glass/30 rounded-2xl border border-border/40 overflow-hidden shadow-2xl">
                  <div className="flex bg-black/40 border-b border-border/20 p-1">
                    <button onClick={() => setActiveTab('mapa')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl ${activeTab === 'mapa' ? 'bg-background text-primary' : 'text-muted-foreground'}`}>01. Mapa</button>
                    <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl ${activeTab === 'grid' ? 'bg-background text-primary' : 'text-muted-foreground'}`}>02. Grid</button>
                  </div>
                  <div className="p-6 bg-background/20 min-h-[500px]">
                    {activeTab === 'mapa' ? (
                      <textarea value={selectedMusica.cifra} onChange={(e) => updateMusica(selectedMusica.id, { cifra: e.target.value })} className="w-full h-[400px] bg-transparent border-none text-foreground font-mono text-base focus:ring-0 resize-none p-4" />
                    ) : (
                      <div className="p-4 bg-slate-900/20 rounded-xl overflow-auto">
                        <div className="max-w-2xl mx-auto p-12 bg-white rounded shadow-xl text-black" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                          <div className="flex justify-between items-end border-b-2 border-slate-200 mb-8 pb-2 text-left">
                            <div><h2 className="text-4xl font-bold">{selectedMusica.titulo}</h2><p className="text-lg opacity-70">{selectedMusica.artista}</p></div>
                            <div className="text-right"><span className="text-[10px] font-bold uppercase font-sans">Tom</span><span className="text-3xl font-bold">{selectedMusica.tom}</span></div>
                          </div>
                          {parseTextoParaGridData(selectedMusica.cifra).map((sec, idx) => (
                            <div key={idx} className="mb-8 text-left">
                              {sec.name && <div className="inline-block border border-slate-500 text-[10px] px-2 py-0.5 mb-2 rounded font-bold text-slate-500 bg-slate-50 uppercase font-sans">{sec.name}</div>}
                              {sec.rows.map((row, ridx) => (
                                <div key={ridx} className="flex mb-1">{row.map((chord, cidx) => (
                                  <div key={cidx} className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-2"><span className="font-bold text-2xl text-slate-800">{chord}</span></div>
                                ))}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-border/20 rounded-2xl text-muted-foreground uppercase text-[10px] font-sans">Selecione uma música</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-glass border border-white/10 p-8 rounded-3xl w-full max-w-md text-left">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-primary">Nova Música</h2>
              <div className="space-y-4 font-sans">
                <input type="text" value={novaMusica.titulo} onChange={(e) => setNovaMusica({...novaMusica, titulo: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white" placeholder="Título" />
                <input type="text" value={novaMusica.artista} onChange={(e) => setNovaMusica({...novaMusica, artista: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white" placeholder="Artista" />
                <select value={novaMusica.tom} onChange={(e) => setNovaMusica({...novaMusica, tom: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white">
                  {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-8 font-sans">
                <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button variant="neon" className="flex-1" onClick={handleAdicionarMusica}>Adicionar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}