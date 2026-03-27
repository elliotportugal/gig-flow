import React, { useState, useEffect, useCallback } from 'react';

const GigRealBook: React.FC = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'cs' | 'grid'>('cs');
  const [currentSong, setCurrentSong] = useState({
    title: '', artist: '', key: '', raw: '', clean: ''
  });

  // Carrega do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gigflow_roadmap_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSongs(parsed);
      if (parsed.length > 0) {
        setCurrentId(parsed[0].id);
        setCurrentSong(parsed[0]);
      }
    }
  }, []);

  // Salva no localStorage
  const saveSongs = useCallback((updatedSongs: any[]) => {
    setSongs(updatedSongs);
    localStorage.setItem('gigflow_roadmap_v1', JSON.stringify(updatedSongs));
  }, []);

  // Lógica ORIGINAL do HTML (100% preservada)
  const norm = (raw: string): string | null => {
    let c = String(raw).trim();
    if (!c || c === '%') return c || null;
    c = c.replace(/\([^)]*\)/g, '');
    c = c.replace(/[Mm]aj7/gi, 'Δ7').replace(/7M$/, 'Δ7').replace(/M7$/, 'Δ7');
    c = c.replace(/[Mm]7b5/gi, 'ø7');
    c = c.replace(/([A-G][b#]?)mi\b/g, '$1m');
    c = c.replace(/([A-G][b#]?)-(?=[^0-9\/]|$)/g, '$1m');
    c = c.replace(/^([a-g])([b#]?)(.*)$/, (_, r, a, rest) => r.toUpperCase() + a + (rest || 'm'));
    c = c.replace(/[♭]/g, 'b').replace(/[♯]/g, '#');
    return c.trim() || null;
  };

  const isCT = (w: string) => {
    const c = w.replace(/[(),]/g, '').trim();
    const CTR = /^[A-Ga-g][b#]?(?:m(?:aj)?|maj|sus|dim|aug|add)?[0-9]?(?:maj|sus|dim|aug|add)?[0-9]?(?:[b#][0-9])?(?:\/[A-G][b#]?)?$/;
    return c.length > 0 && c.length <= 10 && CTR.test(c);
  };

  const isCL = (line: string) => {
    const t = line.trim();
    if (!t) return false;
    if (/\[[A-G][^\]]{0,9}\]/.test(t)) return true;
    const toks = t.split(/\s+/).filter(Boolean);
    if (!toks.length || !toks.some(x => /^[A-Ga-g]/.test(x))) return false;
    return toks.every(isCT);
  };

  const SERE = /^(intro|verso|vers[ao]|refrão|refrao|chorus|ponte|bridge|solo|outro|coda|pre.?refr|pre.?chorus|segunda|primeira|terceira|parte|variacao|variação|corpo|estrutura|passagem|final|tag|breakdown|instrumental)[\s:]*$/i;

  // AUTO CLEAN (igual HTML)
  const autoClean = () => {
    const raw = currentSong.raw;
    const lines = raw.split('\n');
    const out: string[] = [];
    let titleSet = false;

    for (const rawLine of lines) {
      const t = rawLine.trim();
      if (!t) continue;
      if (/^\{.+\}$/.test(t)) continue;

      if (!titleSet && !t.startsWith('[') && !isCL(t) && !SERE.test(t.replace(/:$/, ''))) {
        if (t.includes(' - ')) {
          const p = t.split(' - ');
          setCurrentSong(prev => ({
            ...prev,
            artist: p[0].trim(),
            title: p.slice(1).join(' - ').trim()
          }));
        } else {
          setCurrentSong(prev => ({ ...prev, title: t }));
        }
        titleSet = true;
        continue;
      }

      const bm = t.match(/^\[([^\]]+)\]$/);
      if (bm) {
        const inn = bm[1].trim();
        if (/^[A-G][b#]?/.test(inn) && inn.length <= 10 && !inn.includes(' ')) { }
        else { out.push(': ' + inn); continue; }
      }

      if (SERE.test(t.replace(/:$/, ''))) { out.push(': ' + t.replace(/:$/, '').trim()); continue; }

      if (t.includes('[')) {
        const chords: string[] = [];
        const re = /\[([^\]]+)\]/g;
        let m;
        while ((m = re.exec(t)) !== null) {
          const n = norm(m[1].trim());
          if (n) chords.push(n);
        }
        if (chords.length) out.push(chords.join(' '));
        continue;
      }

      if (isCL(t)) {
        const chords = t.split(/\s+/).filter(Boolean)
          .map(tok => norm(tok.replace(/[(),]/g, '')))
          .filter(Boolean as any);
        if (chords.length) out.push(chords.join(' '));
      }
    }

    setCurrentSong(prev => ({ ...prev, clean: out.join('\n') }));
  };

  // Parse CS → Model (igual HTML)
  const parseCS = (text: string) => {
    const lines = text.split('\n');
    const secs: any[] = [];
    let curN = null;
    let curT: string[] = [];

    const flush = () => {
      if (curN !== null || curT.length > 0) {
        secs.push({ name: curN, tokens: [...curT], rep: 0 });
      }
    };

    for (const raw of lines) {
      const t = raw.trim();
      if (!t) continue;
      if (t[0] === ':' || t[0] === '=') {
        flush();
        curN = t.slice(1).trim();
        curT = [];
        continue;
      }
      const rm = t.match(/^\((.+?)\)\s*x(\d+)$/i);
      if (rm) {
        flush();
        secs.push({
          name: curN,
          tokens: parseTL(rm[1]),
          rep: parseInt(rm[2])
        });
        curN = null;
        curT = [];
        continue;
      }
      parseTL(t).forEach((tok: string) => curT.push(tok));
    }
    flush();

    return secs.map((sec: any) => {
      const rows: any[] = [];
      for (let i = 0; i < sec.tokens.length; i += 4) {
        const row = sec.tokens.slice(i, i + 4);
        while (row.length < 4) row.push(null);
        rows.push(row);
      }
      return { name: sec.name, rows, rep: sec.rep || 0 };
    });
  };

  const parseTL = (line: string): string[] => {
    const toks: string[] = [];
    line.split(/\s+/).filter(Boolean).forEach(p => {
      if (p === '%') { toks.push('%'); return; }
      if (p.includes('_')) {
        const h = p.split('_');
        toks.push(norm(h[0]) || h[0]);
        toks.push(norm(h[1]) || h[1]);
        return;
      }
      const n = norm(p);
      if (n) toks.push(n);
    });
    return toks;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-4 font-lato">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md h-14 flex items-center px-6 border-b border-slate-700 rounded-xl mb-6">
        <div className="text-2xl font-serif text-amber-400 font-bold">Gig Flow Real Book</div>
        <button 
          onClick={() => window.print()} 
          className="ml-auto bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg text-sm"
        >
          📄 IMPRIMIR PDF
        </button>
      </header>

      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col">
          <div className="p-4 text-xs font-bold uppercase text-slate-400 border-b border-slate-700">Repertório</div>
          <div className="flex-1 overflow-auto p-2">
            {songs.map((song: any) => (
              <div key={song.id} className={`p-3 rounded-lg text-sm cursor-pointer mb-1 border flex justify-between items-center ${
                currentId === song.id 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                  : 'hover:bg-slate-700 border-slate-700'
              }`} onClick={() => {
                setCurrentId(song.id);
                setCurrentSong(song);
              }}>
                <span>{song.title || 'Nova Música'}</span>
                <button className="text-red-400 hover:text-red-300 text-xs px-2" onClick={(e) => {
                  e.stopPropagation();
                  setSongs(songs.filter(s => s.id !== song.id));
                }}>✕</button>
              </div>
            ))}
          </div>
          <button 
            className="mx-3 mb-3 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-lg text-sm"
            onClick={() => {
              const newSong = { id: Date.now(), title: '', artist: '', key: '', raw: '', clean: '' };
              const updated = [...songs, newSong];
              saveSongs(updated);
              setCurrentId(newSong.id);
              setCurrentSong(newSong);
            }}
          >
            + Nova Música
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 grid grid-cols-[1fr_1.3fr] gap-6 h-full">
          {/* Step 1 - Cifra Bruta */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900/50 border-b border-slate-700 text-xs font-bold uppercase text-amber-400">
              01: CIFRA BRUTA
            </div>
            <div className="p-4 border-b border-slate-700 grid grid-cols-3 gap-3">
              <input 
                className="bg-slate-900 border-slate-600 text-white p-2 rounded text-sm placeholder-slate-400"
                placeholder="Título"
                value={currentSong.title}
                onChange={(e) => setCurrentSong({...currentSong, title: e.target.value})}
              />
              <input 
                className="bg-slate-900 border-slate-600 text-white p-2 rounded text-sm placeholder-slate-400"
                placeholder="Artista"
                value={currentSong.artist}
                onChange={(e) => setCurrentSong({...currentSong, artist: e.target.value})}
              />
              <input 
                className="bg-slate-900 border-slate-600 text-white p-2 rounded text-sm placeholder-slate-400"
                placeholder="Tom"
                value={currentSong.key}
                onChange={(e) => setCurrentSong({...currentSong, key: e.target.value})}
              />
            </div>
            <textarea 
              className="flex-1 bg-slate-900/80 text-slate-200 p-4 font-mono text-sm resize-none border-0"
              placeholder="Cole a cifra aqui..."
              value={currentSong.raw}
              onChange={(e) => {
                setCurrentSong({...currentSong, raw: e.target.value});
                autoClean();
              }}
            />
          </div>

          {/* Steps 2+3 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="flex bg-slate-900/50 border-b border-slate-700">
              <button 
                className={`flex-1 p-3 text-xs font-bold uppercase border-b-2 ${
                  activeTab === 'cs' 
                    ? 'border-amber-400 text-amber-300 bg-slate-900/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('cs')}
              >
                02. MAPA DE TEXTO
              </button>
              <button 
                className={`flex-1 p-3 text-xs font-bold uppercase border-b-2 ${
                  activeTab === 'grid' 
                    ? 'border-amber-400 text-amber-300 bg-slate-900/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('grid')}
              >
                03. GRADE REAL BOOK
              </button>
            </div>

            {/* Text Edit */}
            {activeTab === 'cs' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 text-xs font-bold uppercase text-amber-400 flex justify-between items-center">
                  <span>EDITAR ROTEIRO</span>
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-1 text-xs font-bold rounded"
                    onClick={() => setActiveTab('grid')}
                  >
                    ▶ VER GRADE
                  </button>
                </div>
                <textarea 
                  className="flex-1 bg-slate-900/80 text-slate-200 p-4 font-mono text-sm resize-none border-0"
                  value={currentSong.clean}
                  onChange={(e) => setCurrentSong({...currentSong, clean: e.target.value})}
                />
              </div>
            )}

            {/* Grid Preview */}
            {activeTab === 'grid' && (
              <div className="flex-1 overflow-auto p-8 bg-slate-900/20">
                <div className="max-w-2xl mx-auto">
                  <div className="rb mx-auto max-w-4xl p-12 bg-white rounded-2xl shadow-2xl text-black font-patrick">
                    {/* Render grid aqui usando parseCS + renderRow do HTML */}
                    {!currentSong.clean.trim() ? (
                      <div className="opacity-30 font-patrick text-2xl text-center py-24 text-black">
                        Cole uma cifra para gerar a grade
                      </div>
                    ) : (
                      parseCS(currentSong.clean).map((sec, secIdx) => (
                        <div key={secIdx} className="mb-6">
                          {sec.name && (
                            <div className="inline-block border border-slate-500 text-xs px-3 py-1 mb-2 rounded font-patrick text-slate-600">
                              {sec.name}
                            </div>
                          )}
                          {sec.rows.map((row: any[], rowIdx: number) => (
                            <div key={rowIdx} className="flex mb-1">
                              {row.map((chord, colIdx) => (
                                <div key={colIdx} className="flex-1 min-h-[70px] border-l-2 border-slate-400 flex items-center justify-center p-3 relative">
                                  {chord === '%' ? 'slash' : chord || ''}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigRealBook;
