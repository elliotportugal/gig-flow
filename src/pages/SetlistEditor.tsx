import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Music, Plus, ChevronLeft, Trash2, FileText, 
  X, ChevronRight, GripVertical, Download, Moon, Sun, Save, Loader2, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { parseTextoParaGridData } from "@/lib/music-utils";

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  cifra: string;
  setlist_id: string;
}

export default function SetlistEditor() {
  const { id } = useParams<{ id: string }>(); 
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mapa' | 'grid'>('mapa');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [currentPage, setCurrentPage] = useState(0); 
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", tom: "C" });

  const selectedMusica = musicas.find(m => m.id === selectedId);

  // --- BUSCAR MÚSICAS (SUPABASE) ---
  const fetchMusicas = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('musicas')
        .select('*')
        .eq('setlist_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMusicas(data || []);
      if (data && data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (error: any) {
      toast.error("Erro de sincronização: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicas();
  }, [id]);

  // --- ADICIONAR MÚSICA ---
  const handleAdicionarMusica = async () => {
    if (!novaMusica.titulo || !id) {
      toast.error("O título é obrigatório.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('musicas')
        .insert([{ ...novaMusica, setlist_id: id, cifra: ":INTRO\n\n:VERSO" }])
        .select().single();

      if (error) throw error;
      setMusicas([...musicas, data]);
      setSelectedId(data.id);
      setIsModalOpen(false);
      setNovaMusica({ titulo: "", artista: "", tom: "C" });
      toast.success(`${data.titulo} salva na nuvem!`);
    } catch (error: any) {
      toast.error("Erro ao salvar música.");
    }
  };

  // --- AUTO-SAVE (DATABASE) ---
  const updateMusicaLocal = (musicaId: string, patch: Partial<Musica>) => {
    setMusicas(prev => prev.map(m => m.id === musicaId ? { ...m, ...patch } : m));
  };

  const persistirNoBanco = async (musicaId: string, patch: Partial<Musica>) => {
    const { error } = await supabase.from('musicas').update(patch).eq('id', musicaId);
    if (error) toast.error("Falha no auto-save cloud.");
  };

  // --- EXCLUIR ---
  const handleExcluirMusica = async (musicaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast("Remover do repertório?", {
      description: "A música será apagada do banco de dados.",
      action: {
        label: "Excluir",
        onClick: async () => {
          const { error } = await supabase.from('musicas').delete().eq('id', musicaId);
          if (!error) {
            const novaLista = musicas.filter(m => m.id !== musicaId);
            setMusicas(novaLista);
            if (selectedId === musicaId) setSelectedId(novaLista[0]?.id || null);
            toast.success("Música removida.");
          }
        },
      },
    });
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    // @ts-ignore
    const html2pdf = (await import("html2pdf.js")).default;
    const promise = html2pdf().set({
      margin: 0,
      filename: `GigFlow_Repertorio.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, width: 794 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
    toast.promise(promise, { loading: 'Gerando PDF...', success: 'Download iniciado!', error: 'Erro no PDF' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      
      {/* --- SHOW MODE (NEON) --- */}
      <AnimatePresence>
        {showMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className={`fixed inset-0 z-[200] flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className={`flex justify-between items-center p-4 border-b backdrop-blur-md ${isDarkMode ? 'bg-black/40 border-slate-800' : 'bg-white/70 border-slate-200'}`}>
              <span className="font-black text-slate-400 tracking-tighter uppercase italic">GigFlow Pro Show</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)} className={isDarkMode ? 'bg-slate-800 text-yellow-400 border-slate-700' : ''}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2"><Download className="w-4 h-4" /> Exportar PDF</Button>
                <Button variant="ghost" onClick={() => { setShowMode(false); setCurrentPage(0); }}><X className="w-6 h-6" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center">
              <div id="pdf-content" className="w-full max-w-3xl">
                {currentPage === 0 ? (
                  <div className={`p-12 min-h-[1050px] w-[794px] shadow-2xl rounded-sm mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <h1 className="text-6xl font-bold uppercase tracking-tighter border-b-4 border-double pb-4 mb-8">Setlist Oficial</h1>
                    <div className="space-y-4 text-left">
                      {musicas.map((m, idx) => (
                        <div key={m.id} className="flex items-end gap-4 text-2xl border-b border-current/10 pb-1">
                          <span className="text-slate-400 text-lg w-8 font-sans">{idx + 1}.</span>
                          <span className="flex-1 font-bold">{m.titulo}</span>
                          <span className="opacity-50 text-lg font-sans">{m.tom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-12 min-h-[1050px] w-[794px] shadow-2xl rounded-sm mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <div className="flex justify-between items-end border-b-2 border-primary/20 mb-8 pb-2">
                      <div className="text-left"><h2 className="text-5xl font-bold">{musicas[currentPage-1].titulo}</h2><p className="text-xl opacity-60 italic">{musicas[currentPage-1].artista}</p></div>
                      <div className="text-right"><span className="text-4xl font-bold">{musicas[currentPage-1].tom}</span></div>
                    </div>
                    {parseTextoParaGridData(musicas[currentPage-1].cifra).map((sec, idx) => (
                      <div key={idx} className="mb-8 text-left">
                        {sec.name && <div className={`inline-block border text-[10px] px-3 py-1 mb-2 rounded-xl font-bold uppercase font-sans ${isDarkMode ? 'bg-slate-800 text-primary border-primary/30' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>{sec.name}</div>}
                        {sec.rows.map((row, ridx) => (
                          <div key={ridx} className="flex mb-1">
                            {row.map((chord, cidx) => (
                              <div key={cidx} className={`flex-1 min-h-[80px] border-l-2 flex items-center justify-center p-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                                <span className={`font-bold text-3xl ${isDarkMode ? 'text-primary' : 'text-slate-800'}`}>{chord}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 border-t flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-border'}`}>
              <Button variant="ghost" onClick={() => setCurrentPage(p => Math.max(0, p-1))}><ChevronLeft className="w-8 h-8" /></Button>
              <span className={`font-bold font-sans ${isDarkMode ? 'text-white' : ''}`}>{currentPage === 0 ? "CAPA" : `${currentPage}/${musicas.length}`}</span>
              <Button variant="neon" onClick={() => setCurrentPage(p => Math.min(musicas.length, p+1))}>{currentPage === 0 ? "INICIAR" : <ChevronRight className="w-8 h-8" />}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EDITOR UI --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-7xl flex items-center justify-between h-14 px-6 mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2 text-foreground no-underline hover:text-primary transition-colors">
            <LayoutDashboard className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Painel de Controle</span>
          </Link>
          <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={() => setShowMode(true)} className="gap-2"> <FileText className="w-4 h-4" /> Show Mode </Button>
             <Button variant="neon" size="sm">Premium Cloud</Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 text-left">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Editor de Repertório</h1>
              <p className="text-muted-foreground text-sm">ID Cloud: {id?.slice(0,8)}</p>
            </div>
            <Button variant="neon" onClick={() => setIsModalOpen(true)}> <Plus className="w-4 h-4 mr-2" /> Adicionar Música </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            <div className="lg:col-span-4 space-y-2">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Setlist Sincronizado ↓</h3>
              {musicas.map((m) => (
                <div key={m.id} onClick={() => setSelectedId(m.id)} className={`group p-4 rounded-xl cursor-pointer border flex items-center gap-3 transition-all ${selectedId === m.id ? 'bg-secondary border-primary/50' : 'bg-glass/10 border-border/40 hover:border-primary/20'}`}>
                  <GripVertical className="w-4 h-4 opacity-20 group-hover:text-primary" />
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold block truncate uppercase text-sm ${selectedId === m.id ? 'text-primary' : ''}`}>{m.titulo}</span>
                    <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{m.tom} • {m.artista}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={(e) => handleExcluirMusica(m.id, e)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8">
              {selectedMusica ? (
                <div className="bg-glass/30 rounded-2xl border border-border/40 overflow-hidden shadow-2xl">
                  <div className="flex bg-black/40 border-b border-border/20 p-1">
                    <button onClick={() => setActiveTab('mapa')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl ${activeTab === 'mapa' ? 'bg-background text-primary' : 'text-muted-foreground'}`}>01. Mapa (Texto)</button>
                    <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl ${activeTab === 'grid' ? 'bg-background text-primary' : 'text-muted-foreground'}`}>02. Grid (Visual)</button>
                  </div>
                  <div className="p-6">
                    {activeTab === 'mapa' ? (
                      <textarea 
                        value={selectedMusica.cifra} 
                        onChange={(e) => updateMusicaLocal(selectedMusica.id, { cifra: e.target.value })}
                        onBlur={(e) => persistirNoBanco(selectedMusica.id, { cifra: e.target.value })}
                        className="w-full h-[450px] bg-transparent border-none text-foreground font-mono text-base focus:ring-0 resize-none p-4"
                        placeholder="Insira seu mapa de acordes aqui..."
                      />
                    ) : (
                      <div className="p-8 bg-white rounded-lg text-black min-h-[450px] shadow-inner" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                        <div className="flex justify-between items-end border-b-2 border-slate-200 mb-8 pb-2 text-left">
                          <div><h2 className="text-4xl font-bold">{selectedMusica.titulo}</h2><p className="text-lg opacity-60 italic">{selectedMusica.artista}</p></div>
                          <div className="text-3xl font-bold">{selectedMusica.tom}</div>
                        </div>
                        {parseTextoParaGridData(selectedMusica.cifra).map((sec, idx) => (
                          <div key={idx} className="mb-8 text-left">
                            {sec.name && <div className="inline-block border border-slate-500 text-[10px] px-2 py-0.5 mb-2 rounded font-bold text-slate-500 bg-slate-50 uppercase font-sans">{sec.name}</div>}
                            {sec.rows.map((row, ridx) => (
                              <div key={ridx} className="flex mb-1">
                                {row.map((chord, cidx) => (
                                  <div key={cidx} className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-2">
                                    <span className="font-bold text-2xl text-slate-800">{chord}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-black/20 border-t border-border/10 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => persistirNoBanco(selectedMusica.id, { cifra: selectedMusica.cifra })} className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                      <Save className="w-3 h-3" /> Sincronizar Agora
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-border/20 rounded-2xl text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Selecione uma música da nuvem</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL ADICIONAR */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-glass border border-white/10 p-8 rounded-3xl w-full max-w-md text-left">
              <h2 className="text-2xl font-black mb-6 uppercase text-primary tracking-tighter">Nova Música Cloud</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Título" value={novaMusica.titulo} onChange={e => setNovaMusica({...novaMusica, titulo: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white focus:border-primary" />
                <input type="text" placeholder="Artista" value={novaMusica.artista} onChange={e => setNovaMusica({...novaMusica, artista: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white focus:border-primary" />
                <select value={novaMusica.tom} onChange={e => setNovaMusica({...novaMusica, tom: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl p-3 outline-none text-white focus:border-primary">
                   {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button variant="neon" className="flex-1" onClick={handleAdicionarMusica}>Salvar na Nuvem</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}