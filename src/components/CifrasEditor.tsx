// src/components/CifrasEditor.tsx
import React from "react";

// ───────────────────────────────────────
// 1. TIPOS DE DADOS DO REPERTÓRIO
// (ajuste conforme sua estrutura no editor)
// ───────────────────────────────────────

type MapaSecao = {
  id: string;
  nome: string;
  inicio: number;
  fim: number;
};

type CifrasEditorProps = {
  title: string;
  artist: string;
  tom: string;
  cifra: string;
  mapa: MapaSecao[];
  transpose: number;
  onTitleChange: (v: string) => void;
  onArtistChange: (v: string) => void;
  onTomChange: (v: string) => void;
  onCifraChange: (v: string) => void;
  onMapaChange: (novoMapa: MapaSecao[]) => void;
  onTranspose: (delta: number) => void;
  onGeneratePdf: () => void;
};

// ───────────────────────────────────────
// 2. PARSER REAL BOOK / AUTO CLEAN
// ───────────────────────────────────────

const autoClean = (raw: string): string => {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const parseCS = (cleaned: string): { row: string; hasChords: boolean }[] => {
  const lines = cleaned.split("\n");
  const result: { row: string; hasChords: boolean }[] = [];

  let currentVerse = "";
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentVerse) {
        result.push({ row: currentVerse, hasChords: false });
        currentVerse = "";
      }
      result.push({ row: "", hasChords: false });
    } else if (/^[A-G][#b]?(m|maj|7|9|add|sus|dim|aug)?\s/.test(trimmed)) {
      result.push({ row: trimmed, hasChords: true });
    } else {
      if (currentVerse) currentVerse += "\n";
      currentVerse += trimmed;
    }
  });

  if (currentVerse) {
    result.push({ row: currentVerse, hasChords: false });
  }
  return result;
};

// ───────────────────────────────────────
// 3. TRANSPOSE
// ───────────────────────────────────────

const allKeys = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
];

const transposeChord = (chord: string, delta: number): string => {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;

  const [full, root, suffix] = match;
  const baseRoot = full.replace(/#|b|\w*$/, "");
  const isSharp = full.includes("#");
  const isFlat = full.includes("b");

  let idx = allKeys.findIndex(
    (k) => k === baseRoot + (isSharp ? "#" : isFlat ? "b" : "")
  );
  if (idx === -1) return chord;

  idx = (idx + delta + allKeys.length) % allKeys.length;
  return allKeys[idx] + suffix;
};

const transposeLine = (line: string, delta: number): string => {
  const tokens: string[] = [];
  let acc = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === " " && acc) {
      tokens.push(acc);
      acc = "";
    } else {
      acc += c;
    }
  }
  if (acc) tokens.push(acc);

  return tokens
    .map((token) => {
      const chordMatch = token.match(/^([A-G][#b]?\w*)/);
      if (!chordMatch) return token;
      return transposeChord(token, delta);
    })
    .join(" ");
};

// ───────────────────────────────────────
// 4. RENDER ROW (REAL BOOK)
// ───────────────────────────────────────

type Row = { row: string; hasChords: boolean };

const renderRow = (row: Row, id: number, transpose: number) => {
  const { row: content, hasChords } = row;

  if (!hasChords || !content) {
    return (
      <div key={id} className="realbook-row lyric">
        {content || "\u00A0"}
      </div>
    );
  }

  const transposed = transposeLine(content, transpose);

  return (
    <div key={id} className="realbook-row chord">
      <div className="chord-cell">
        {transposed.split(" ").map((chord, j) => (
          <span key={j} className="chord">
            {chord}
          </span>
        ))}
      </div>
    </div>
  );
};

// ───────────────────────────────────────
// 5. COMPONENTE PRINCIPAL (EDITOR + REAL BOOK PREVIEW)
// ───────────────────────────────────────

export default function CifrasEditor({
  title,
  artist,
  tom,
  cifra,
  mapa,
  transpose,
  onTitleChange,
  onArtistChange,
  onTomChange,
  onCifraChange,
  onMapaChange,
  onTranspose,
  onGeneratePdf,
}: CifrasEditorProps) {
  const handleChangeRaw = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCifraChange(ev.target.value);
  };

  const changeTranspose = (delta: number) => {
    onTranspose(delta);
  };

  const cleaned = autoClean(cifra);
  const parsedRows = parseCS(cleaned);

  const currentTom =
    allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length];

  // ───────────────────────────────────────
  // Layout: Editor + Preview (REAL BOOK)
  // (ajuste cores e grid conforme seu tema PRO)
  // ───────────────────────────────────────

  return (
    <div className="flex flex-1 space-x-4 h-full">
      {/* Coluna esquerda: EDITOR (CIFRA E MAPA) */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* HEADER DA MÚSICA */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nome</label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Nome da música"
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-amber-50 focus:outline-none focus:ring focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Artista</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => onArtistChange(e.target.value)}
                placeholder="Artista"
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-amber-50 focus:outline-none focus:ring focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tom</label>
              <select
                value={tom}
                onChange={(e) => onTomChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-amber-50"
              >
                {allKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ABAS: Cifra completa | Mapa de acordes */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1 flex flex-col">
          <div className="border-b border-gray-600 mb-4">
            <span className="text-amber-400 text-sm font-medium">✍️ Cifra completa</span>
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={cifra}
              onChange={handleChangeRaw}
              placeholder="Cole a cifra aqui (acordes acima, letra abaixo)..."
              className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-3 text-sm text-amber-50 font-mono resize-none focus:outline-none focus:ring focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Coluna direita: PREVIEW (REAL BOOK) */}
      <div className="w-1/2 bg-gray-900 border-l border-gray-700 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-gray-400 font-medium">🎼 Real Book (Preview)</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>
              Tom atual: <span className="text-amber-400">{currentTom}</span>
            </span>
            <button
              onClick={() => changeTranspose(-1)}
              className="text-amber-400 px-1"
            >
              −1
            </button>
            <button
              onClick={() => changeTranspose(1)}
              className="text-amber-400 px-1"
            >
              +1
            </button>
          </div>
        </div>
        <div
          id="realbook-pdf-target"
          className="bg-gray-800 border border-gray-600 rounded-lg p-3 flex-1 space-y-2 text-sm leading-6 text-amber-50 font-patrick"
        >
          {parsedRows.map((row, i) => renderRow(row, i, transpose))}
        </div>
        <button
          onClick={onGeneratePdf}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-500 mt-4"
        >
          Exportar como PDF
        </button>
      </div>
    </div>
  );
}