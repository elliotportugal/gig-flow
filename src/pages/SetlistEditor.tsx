// src/pages/SetlistEditor.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import CifrasEditor from "@/components/CifrasEditor";

// ───────────────────────────────────────
// 1. TIPOS DE DADOS (AJUSTE CONFORME SUA API)
// ───────────────────────────────────────

type Musica = {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  cifra: string;
  mapa: { id: string; nome: string; inicio: number; fim: number }[];
  transpose: number;
};

type SetlistResponse = {
  id: string;
  nome: string;
  musicas: Musica[];
};

// ───────────────────────────────────────
// 2. MOCK DE DADOS (USE SUA API REAL AQUI)
// ───────────────────────────────────────

const mockSetlist = {
  id: "1",
  nome: "Meu setlist",
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
// 3. SERVIÇOS DE API (AJUSTE CONFORME SUA ESTRUTURA)
// ───────────────────────────────────────

// Exemplo:
// const fetchSetlist = (id: string) => api.get(`/setlists/${id}`);
// const updateSetlist = (data: SetlistResponse) => api.put(`/setlists/${id}`, data);

// ───────────────────────────────────────
// 4. COMPONENTE PRINCIPAL (ALREADY ADAPTED)
// ───────────────────────────────────────

export default function SetlistEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editandoMusicaId, setEditandoMusicaId] = React.useState<string | null>(
    null
  );

  // Simulando o carregamento de um setlist (useQuery com sua API real)
  // const {
  //   data: setlist,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["setlist", id],
  //   queryFn: () => fetchSetlist(id!),
  // });

  // Por enquanto, usando o mock
  const setlist: SetlistResponse = mockSetlist;

  if (!setlist) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-4">
          <p>Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Função para salvar a edição de uma música
  const handleSaveMusica = (musicaAtualizada: Musica) => {
    const novaMusicaIndex = setlist.musicas.findIndex(
      (m) => m.id === musicaAtualizada.id
    );
    const novoSetlistMusicas = [...setlist.musicas];
    novoSetlistMusicas[novaMusicaIndex] = {
      ...musicaAtualizada,
      // timestamp, etc.
    };

    // Chame sua API:
    // updateSetlist({
    //   ...setlist,
    //   musicas: novoSetlistMusicas,
    // });

    // Por enquanto:
    alert("Música salva!");
    setEditandoMusicaId(null);
  };

  // Função para adicionar uma nova música ao setlist
  const handleNovaMusica = () => {
    const novaMusica: Musica = {
      id: `new-${Date.now()}`,
      titulo: "Nova música",
      artista: "",
      tom: "C",
      cifra: "",
      mapa: [],
      transpose: 0,
    };
    setEditandoMusicaId(novaMusica.id);
  };

  // Função para deletar uma música
  const handleDeletarMusica = (musicaId: string) => {
    if (confirm("Tem certeza que quer deletar?")) {
      // const novasMusicas = setlist.musicas.filter((m) => m.id !== musicaId);
      // updateSetlist({
      //   ...setlist,
      //   musicas: novasMusicas,
      // });
    }
  };

  // ───────────────────────────────────────
  // 5. RENDERIZAÇÃO
  // ───────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-amber-300">
            Editor de Setlist - {setlist.nome}
          </h1>
          <button
            onClick={handleNovaMusica}
            className="bg-amber-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-amber-500"
          >
            Adicionar Nova Música
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          {setlist.musicas.map((musica) => (
            <div key={musica.id} className="border-b border-gray-600 pb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm text-amber-400 font-medium">
                  {musica.titulo} - {musica.artista}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditandoMusicaId(musica.id)}
                    className="text-amber-400 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletarMusica(musica.id)}
                    className="text-red-400 text-xs"
                  >
                    Deletar
                  </button>
                </div>
              </div>

              {/* ─────────────────────────────────────── */}
              {/* 6. AQUI É O PONTO ONDE O CIFRAS EDITOR ENTRA */}
              {/* ─────────────────────────────────────── */}
              {editandoMusicaId === musica.id && (
                <CifrasEditor
                  title={musica.titulo}
                  artist={musica.artista}
                  tom={musica.tom}
                  cifra={musica.cifra}
                  mapa={musica.mapa}
                  transpose={musica.transpose}
                  onTitleChange={(v) =>
                    handleSaveMusica({ ...musica, titulo: v })
                  }
                  onArtistChange={(v) =>
                    handleSaveMusica({ ...musica, artista: v })
                  }
                  onTomChange={(v) =>
                    handleSaveMusica({ ...musica, tom: v })
                  }
                  onCifraChange={(v) =>
                    handleSaveMusica({ ...musica, cifra: v })
                  }
                  onMapaChange={(novoMapa) =>
                    handleSaveMusica({ ...musica, mapa: novoMapa })
                  }
                  onTranspose={(delta) =>
                    handleSaveMusica({
                      ...musica,
                      transpose: musica.transpose + delta,
                    })
                  }
                  onGeneratePdf={() => {
                    alert("Exportar PDF (Stripe aqui)");
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Use o editor acima para criar e editar o repertório do seu setlist.
        </div>
      </div>
    </DashboardLayout>
  );
}