// src/pages/SetlistEditor.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { Music, Plus, ChevronLeft, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import CifrasEditor from "@/components/CifrasEditor";

// ───────────────────────────────────────
// TIPOS
// ───────────────────────────────────────

type MapaSecao = {
  id: string;
  nome: string;
  inicio: number;
  fim: number;
};

type Musica = {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  cifra: string;
  mapa: MapaSecao[];
  transpose: number;
};

type SetlistData = {
  id: string;
  nome: string;
  musicas: Musica[];
};

const TOMS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// ───────────────────────────────────────
// MOCK (substitua por useQuery + API real)
// ───────────────────────────────────────

const mockSetlist: SetlistData = {
  id: "1",
  nome: "Rock Night – Bar do Zé",
  musicas: [
    {
      id: "1",
      titulo: "Yesterday",
      artista: "The Beatles",
      tom: "C",
      cifra: "C\nG\nAm\nF\nC G Am F",
      mapa: [
        { id: "1", nome: "Intro", inicio: 0, fim: 4 },
        { id: "2", nome: "Refrão", inicio: 5, fim: 8 },
      ],
      transpose: 0,
    },
  ],
};

// ───────────────────────────────────────
// MODAL — NOVA MÚSICA
// ───────────────────────────────────────

type ModalNovaProps = {
  onConfirm: (musica: Omit<Musica, "id" | "cifra" | "mapa" | "transpose">) => void;
  onClose: () => void;
};

function ModalNovaMusica({ onConfirm, onClose }: ModalNovaProps) {
  const [titulo, setTitulo] = React.useState("");
  const [artista, setArtista] = React.useState("");
  const [tom, setTom] = React.useState("C");

  const handleSubmit = () => {
    if (!titulo.trim()) return;
    onConfirm({ titulo: titulo.trim(), artista: artista.trim(), tom });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card do modal */}
      <motion.div
        className="relative bg-glass rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-base">Nova Música</h2>
          </div>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Nome da música <span className="text-primary">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="ex: Garota de Ipanema"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Artista
            </label>
            <input
              type="text"
              value={artista}
              onChange={(e) => setArtista(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="ex: Tom Jobim"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Tom original
            </label>
            <select
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {TOMS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-6">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="neon"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!titulo.trim()}
          >
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────────────────────
// COMPONENTE PRINCIPAL
// ───────────────────────────────────────

export default function SetlistEditor() {
  const { id } = useParams();

  const [musicas, setMusicas] = React.useState<Musica[]>(mockSetlist.musicas);
  const [editandoId, setEditandoId] = React.useState<string | null>(null);
  const [modalAberto, setModalAberto] = React.useState(false);

  // ── Handlers ──

  const handleAdicionarMusica = (
    dados: Omit<Musica, "id" | "cifra" | "mapa" | "transpose">
  ) => {
    const nova: Musica = {
      id: `new-${Date.now()}`,
      titulo: dados.titulo,
      artista: dados.artista,
      tom: dados.tom,
      cifra: "",
      mapa: [],
      transpose: 0,
    };
    setMusicas((prev) => [...prev, nova]);
    setEditandoId(nova.id);
    setModalAberto(false);
    // API: await api.post(`/setlists/${id}/musicas`, nova)
  };

  const handleDeletarMusica = (musicaId: string) => {
    if (!confirm("Tem certeza que quer deletar essa música?")) return;
    setMusicas((prev) => prev.filter((m) => m.id !== musicaId));
    if (editandoId === musicaId) setEditandoId(null);
    // API: await api.delete(`/setlists/${id}/musicas/${musicaId}`)
  };

  const updateMusica = (id: string, patch: Partial<Musica>) =>
    setMusicas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );

  // ── Render ──

  return (
    <>
      <div className="min-h-screen bg-background">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
          <div className="container max-w-6xl flex items-center justify-between h-14 px-4">
            <Link to="/" className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <span className="font-bold">SetlistPro</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Free · 7/10 músicas
              </span>
              <Button variant="neon" size="sm">Upgrade Pro</Button>
            </div>
          </div>
        </nav>

        <main className="pt-20 pb-12 px-4">
          <div className="container max-w-6xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2 mb-1">
                    <ChevronLeft className="w-4 h-4" /> Meus Repertórios
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">{mockSetlist.nome}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {musicas.length} música{musicas.length !== 1 ? "s" : ""} no setlist
                </p>
              </div>
              <Button variant="neon" onClick={() => setModalAberto(true)}>
                <Plus className="w-4 h-4" /> Adicionar Música
              </Button>
            </div>

            {/* Lista de músicas */}
            <div className="space-y-3">
              <AnimatePresence>
                {musicas.map((musica, i) => (
                  <motion.div
                    key={musica.id}
                    className="bg-glass rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Cabeçalho */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {musica.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                          {musica.artista && <span>{musica.artista}</span>}
                          {musica.artista && <span>·</span>}
                          <span>Tom: {musica.tom}</span>
                          {musica.transpose !== 0 && (
                            <>
                              <span>·</span>
                              <span>Transpose: {musica.transpose > 0 ? `+${musica.transpose}` : musica.transpose}</span>
                            </>
                          )}
                          {musica.mapa.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{musica.mapa.length} seção{musica.mapa.length !== 1 ? "ões" : ""}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="neon-outline"
                          size="sm"
                          onClick={() =>
                            setEditandoId(editandoId === musica.id ? null : musica.id)
                          }
                        >
                          <Pencil className="w-3 h-3" />
                          {editandoId === musica.id ? "Fechar" : "Editar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeletarMusica(musica.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Editor inline */}
                    <AnimatePresence>
                      {editandoId === musica.id && (
                        <motion.div
                          className="border-t border-border/50 p-5"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CifrasEditor
                            title={musica.titulo}
                            artist={musica.artista}
                            tom={musica.tom}
                            cifra={musica.cifra}
                            mapa={musica.mapa}
                            transpose={musica.transpose}
                            onTitleChange={(v) => updateMusica(musica.id, { titulo: v })}
                            onArtistChange={(v) => updateMusica(musica.id, { artista: v })}
                            onTomChange={(v) => updateMusica(musica.id, { tom: v })}
                            onCifraChange={(v) => updateMusica(musica.id, { cifra: v })}
                            onMapaChange={(mapa) => updateMusica(musica.id, { mapa })}
                            onTranspose={(delta) =>
                              updateMusica(musica.id, { transpose: musica.transpose + delta })
                            }
                            onGeneratePdf={() => alert("Exportar PDF (Stripe aqui)")}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Estado vazio */}
            {musicas.length === 0 && (
              <motion.div
                className="bg-glass rounded-xl p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Music className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Nenhuma música no setlist ainda.
                </p>
                <Button variant="neon" className="mt-4" onClick={() => setModalAberto(true)}>
                  <Plus className="w-4 h-4" /> Adicionar primeira música
                </Button>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalAberto && (
          <ModalNovaMusica
            onConfirm={handleAdicionarMusica}
            onClose={() => setModalAberto(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}