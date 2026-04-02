import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Plus, ChevronLeft, Trash2, FileText, 
  X, ChevronRight, GripVertical, Moon, Sun, Loader2, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  cifra: string;
  setlist_id: string;
  ordem: number;
}

const GigFlowLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" /> 
        <stop offset="100%" stopColor="#22D3EE" /> 
      </linearGradient>
    </defs>
    <path d="M75 35C70 25 58 18 45 20C30 22 20 35 20 50C20 65 30 78 45 80C58 82 70 75 75 65M75 45V65M55 50H75M45 25C45 25 55 10 55 25C55 40 35 45 35 60C35 75 45 85 55 75" stroke="url(#logo-grad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="55" cy="75" r="4" fill="#22D3EE" />
  </svg>
);

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTES_ALT = ['C', 'Db', 'D', 'D#', 'E', 'F', 'Gb', 'G', 'G#', 'A', 'A#', 'B'];

function transposeChordManual(chord: string, semitones: number): string {
  if (semitones === 0 || chord === '%' || chord === '|') return chord;
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;
  const root = match[1];
  const suffix = match[2];
  let index = NOTES.indexOf(root);
  if (index === -1) index = NOTES_ALT.indexOf(root);
  if (index === -1) return chord;
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  return NOTES[newIndex] + suffix;
}

// --- RITORNELO COM CORES UNIFORMES E DESIGN CLEAN ---
function BarLine({ type, darkMode }: { type: 'normal' | 'start-repeat' | 'end-repeat', darkMode: boolean }) {
  const barColor = darkMode ? 'bg-slate-800' : 'bg-slate-200'; // Mesma cor das barras normais
  const dotColor = darkMode ? 'bg-blue-500/60' : 'bg-slate-400';
  
  if (type === 'start-repeat') {
    return (
      <div className="flex items-center gap-[2px] h-14 mr-4">
        <div className={`w-[3px] h-full rounded-full ${barColor}`} />
        <div className={`w-[1px] h-full ${barColor}`} />
        <div className="flex flex-col gap-2 ml-1">
          <div className={`w-1 h-1 rounded-full ${dotColor}`} />
          <div className={`w-1 h-1 rounded-full ${dotColor}`} />
        </div>
      </div>
    );
  }

  if (type === 'end-repeat') {
    return (
      <div className="flex items-center gap-[2px] h-14 ml-4">
        <div className="flex flex-col gap-2 mr-1">
          <div className={`w-1 h-1 rounded-full ${dotColor}`} />
          <div className={`w-1 h-1 rounded-full ${dotColor}`} />
        </div>
        <div className={`w-[1px] h-full ${barColor}`} />
        <div className={`w-[3px] h-full rounded-full ${barColor}`} />
      </div>
    );
  }

  return <div className={`w-[1px] h-12 mx-4 ${barColor}`} />;
}

export default function SetlistEditor() {
  const { id } = useParams<{ id: string }>(); 
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mapa' | 'grid'>('mapa');
  const [showMode, setShowMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [currentPage, setCurrentPage] = useState(0); 
  const [transposeOffset, setTransposeOffset] = useState(0);

  const selectedMusica = useMemo(() => musicas.find(m => m.id === selectedId), [musicas, selectedId]);

  const fetchMusicas = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('musicas').select('*').eq('setlist_id', id).order('ordem', { ascending: true });
      if (error) throw error;
      setMusicas(data || []);
      if (data && data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (e) { toast.error("Erro ao carregar músicas."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMusicas(); }, [id]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(musicas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updated = items.map((it, idx) => ({ ...it, ordem: idx }));
    setMusicas(updated);
    for (const it of updated) {
      await supabase.from('musicas').update({ ordem: it.ordem }).eq('id', it.id);
    }
  };

  const persistirNoBanco = async (mId: string, patch: Partial<Musica>) => {
    await supabase.from('musicas').update(patch).eq('id', mId);
  };

  const renderVisualGrid = (cifra: string, darkMode: boolean, offset: number) => {
    const lines = cifra.split('\n');
    return lines.map((line, lIdx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      if (trimmedLine.includes(':')) {
        return (
          <div key={lIdx} className="mt-12 mb-6 text-left">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border ${darkMode ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-slate-300 text-slate-500 bg-slate-50 shadow-sm'}`}>
              {trimmedLine.replace(/:/g, '')}
            </span>
          </div>
        );
      }

      const blockMatch = trimmedLine.match(/^\((.*?)\)\s*x(\d+)$/);
      let chords = [];
      let repeatCount = null;
      let isRepeatBlock = false;

      if (blockMatch) {
        chords = blockMatch[1].trim().split(/\s+/);
        repeatCount = blockMatch[2];
        isRepeatBlock = true;
      } else {
        chords = trimmedLine.split(/\s+/);
      }

      return (
        <div key={lIdx} className="flex flex-row flex-wrap items-center mb-10 min-h-[80px]">
          <BarLine type={isRepeatBlock ? 'start-repeat' : 'normal'} darkMode={darkMode} />
          
          {chords.map((chord, cIdx) => (
            <React.Fragment key={cIdx}>
              <div className="px-6 py-2 flex items-center justify-center relative min-w-[110px]">
                {chord === '%' ? (
                  <span className={`text-4xl font-bold opacity-20 ${darkMode ? 'text-blue-400' : 'text-slate-400'}`}>%</span>
                ) : chord.includes('_') ? (
                  <div className="flex gap-6 items-center">
                    {chord.split('_').map((sub, sIdx) => (
                      <span key={sIdx} className="text-4xl font-bold tracking-tighter">{transposeChordManual(sub, offset)}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-4xl font-bold tracking-tighter">{transposeChordManual(chord, offset)}</span>
                )}

                {/* MULTIPLICADOR x2 NO COMPASSO FINAL DO BLOCO */}
                {isRepeatBlock && cIdx === chords.length - 1 && (
                  <span className="absolute -top-4 -right-1 text-xs font-medium text-blue-500/80 font-sans italic">
                    x{repeatCount}
                  </span>
                )}
              </div>
              <BarLine type={(isRepeatBlock && cIdx === chords.length - 1) ? 'end-repeat' : 'normal'} darkMode={darkMode} />
            </React.Fragment>
          ))}
        </div>
      );
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased text-left font-sans">
      <AnimatePresence>
        {showMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className={`fixed inset-0 z-[200] flex flex-col transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'bg-black/40 border-slate-800' : 'bg-white/70 border-slate-200'}`}>
              <div className="flex items-center gap-2"><GigFlowLogo className="w-5 h-5" /><span className="font-bold text-[10px] uppercase tracking-widest opacity-40">GigFlow Pro Show</span></div>
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-blue-500/40">
                 <Button variant="secondary" size="sm" onClick={() => setTransposeOffset(p => p - 1)} className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500 text-white font-bold border-none">-</Button>
                 <span className="text-[11px] font-bold w-16 text-center text-cyan-400 uppercase">Tom {transposeOffset}</span>
                 <Button variant="secondary" size="sm" onClick={() => setTransposeOffset(p => p + 1)} className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500 text-white font-bold border-none">+</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
                <Button variant="ghost" onClick={() => { setShowMode(false); setTransposeOffset(0); }} className="text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors p-2"><X className="w-6 h-6 stroke-[3px]"/></Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center">
              <div className="w-full max-w-5xl">
                {currentPage === 0 ? (
                  <div className={`p-16 min-h-[800px] w-full shadow-2xl rounded-sm ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <h1 className="text-7xl font-bold border-b-8 border-double pb-6 mb-12 text-center uppercase tracking-tighter">Setlist Oficial</h1>
                    <div className="space-y-6">
                      {musicas.map((m, idx) => (
                        <div key={m.id} className="flex items-end gap-4 text-3xl border-b border-current/10 pb-1">
                          <span className="opacity-30 w-12">{idx + 1}.</span>
                          <span className="flex-1 font-bold uppercase">{m.titulo}</span>
                          <span className="text-blue-500 font-bold">{transposeChordManual(m.tom, transposeOffset)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-16 min-h-[800px] w-full shadow-2xl rounded-sm ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-black'}`} style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    <div className="flex justify-between items-end border-b-4 border-blue-500/20 mb-12 pb-6">
                      <div><h2 className="text-7xl font-bold uppercase leading-none">{musicas[currentPage-1].titulo}</h2><p className="text-3xl opacity-40 mt-3 font-medium italic">{musicas[currentPage-1].artista}</p></div>
                      <div className="text-right text-blue-500 font-bold text-6xl">{transposeChordManual(musicas[currentPage-1].tom, transposeOffset)}</div>
                    </div>
                    {renderVisualGrid(musicas[currentPage-1].cifra, isDarkMode, transposeOffset)}
                  </div>
                )}
              </div>
            </div>
            <div className={`p-6 border-t flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <Button variant="ghost" onClick={() => setCurrentPage(p => Math.max(0, p-1))}><ChevronLeft className="w-10 h-10" /></Button>
              <Button onClick={() => setCurrentPage(p => Math.min(musicas.length, p+1))} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 h-14 font-bold shadow-xl shadow-blue-500/20">
                {currentPage === 0 ? "INICIAR GIG" : <ChevronRight className="w-10 h-10" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50 h-14">
        <div className="container max-w-7xl flex items-center justify-between h-full px-6 mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2 group no-underline text-foreground"><GigFlowLogo /><span className="font-bold text-sm tracking-tight">GigFlow Pro</span></Link>
          <Button variant="outline" size="sm" onClick={() => setShowMode(true)} className="text-[10px] font-bold uppercase border-blue-500/20 text-blue-500 shadow-sm"><FileText className="w-3.5 h-3.5 mr-2" /> Show Mode</Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 text-left">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div><h1 className="text-4xl font-bold tracking-tight">Gerenciar músicas</h1><p className="text-muted-foreground mt-1 italic">Organize sua ordem de show e edite os mapas.</p></div>
            <Button onClick={() => {}} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest h-12 px-8 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Adicionar Música</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-3">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="musicas">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {musicas.map((m, index) => (
                        <Draggable key={m.id} draggableId={m.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} onClick={() => setSelectedId(m.id)}
                              className={`group p-4 rounded-2xl cursor-pointer border flex items-center gap-4 transition-all ${selectedId === m.id ? 'bg-blue-500/5 border-blue-500/40 shadow-inner' : 'bg-slate-900/10 border-border/40 hover:border-border'}`}>
                              <div {...provided.dragHandleProps} className="opacity-20 group-hover:opacity-100"><GripVertical className="w-4 h-4" /></div>
                              <div className="flex-1 min-w-0">
                                <span className={`font-bold block truncate text-sm uppercase ${selectedId === m.id ? 'text-blue-500' : ''}`}>{m.titulo}</span>
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{m.tom} • {m.artista}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="lg:col-span-8">
              {selectedMusica ? (
                <div className="bg-slate-900/20 rounded-[2.5rem] border border-border/30 overflow-hidden shadow-2xl backdrop-blur-sm">
                  <div className="flex bg-black/20 p-2 gap-2">
                    <button onClick={() => setActiveTab('mapa')} className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-xl transition-all ${activeTab === 'mapa' ? 'bg-background text-blue-400' : 'opacity-40'}`}>01. Mapa (Texto)</button>
                    <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-xl transition-all ${activeTab === 'grid' ? 'bg-background text-blue-400' : 'opacity-40'}`}>02. Grid (Visual)</button>
                  </div>
                  <div className="p-8 min-h-[550px]">
                    {activeTab === 'mapa' ? (
                      <textarea value={selectedMusica.cifra} onChange={(e) => setMusicas(prev => prev.map(m => m.id === selectedId ? {...m, cifra: e.target.value} : m))}
                        onBlur={(e) => persistirNoBanco(selectedId!, { cifra: e.target.value })}
                        className="w-full h-[450px] bg-transparent border-none text-foreground font-mono text-lg focus:ring-0 resize-none p-4 leading-relaxed" />
                    ) : (
                      <div className="bg-white rounded-3xl p-12 text-black shadow-inner overflow-hidden" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                        <div className="flex justify-between items-end border-b-4 border-blue-500/20 mb-10 pb-4">
                          <div><h2 className="text-5xl font-bold uppercase leading-none">{selectedMusica.titulo}</h2><p className="text-xl opacity-40 mt-3 font-medium italic">{selectedMusica.artista}</p></div>
                          <div className="text-right text-blue-500 font-bold text-4xl">{selectedMusica.tom}</div>
                        </div>
                        {renderVisualGrid(selectedMusica.cifra, false, 0)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[550px] flex flex-col items-center justify-center border-2 border-dashed border-border/20 rounded-[2.5rem] opacity-20"><GigFlowLogo className="w-12 h-12 mb-4" /><span className="uppercase text-[10px] font-bold tracking-widest text-left">Selecione uma música</span></div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}