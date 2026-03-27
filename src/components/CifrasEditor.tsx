// src/components/CifrasEditor.tsx
import React from "react";
import { FileDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ───────────────────────────────────────
// TIPOS
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
// PARSER / TRANSPOSE
// ───────────────────────────────────────

const autoClean = (raw: string): string =>
  raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

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

  if (currentVerse) result.push({ row: currentVerse, hasChords: false });
  return result;
};

const allKeys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const transposeChord = (chord: string, delta: number): string => {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;
  const [, root, suffix] = match;
  const isSharp = root.includes("#");
  const isFlat = root.includes("b");
  const baseRoot = root.replace(/#|b/, "");
  let idx = allKeys.findIndex(
    (k) => k === baseRoot + (isSharp ? "#" : isFlat ? "b" : "")
  );
  if (idx === -1) return chord;
  idx = (idx + delta + allKeys.length) % allKeys.length;
  return allKeys[idx] + suffix;
};

const transposeLine = (line: string, delta: number): string => {
  return line
    .split(" ")
    .map((token) => {
      const chordMatch = token.match(/^([A-G][#b]?\w*)/);
      return chordMatch ? transposeChord(token, delta) : token;
    })
    .join(" ");
};

// ───────────────────────────────────────
// RENDER ROW (REAL BOOK)
// ───────────────────────────────────────

const renderRow = (
  row: { row: string; hasChords: boolean },
  id: number,
  transpose: number
) => {
  if (!row.hasChords || !row.row) {
    return (
      <div key={id} className="text-sm text-foreground/80 leading-7 font-mono">
        {row.row || "\u00A0"}
      </div>
    );
  }

  const transposed = transposeLine(row.row, transpose);

  return (
    <div key={id} className="flex flex-wrap gap-x-4 leading-7">
      {transposed.split(" ").map((chord, j) => (
        <span key={j} className="text-primary font-bold text-sm font-mono">
          {chord}
        </span>
      ))}
    </div>
  );
};

// ───────────────────────────────────────
// COMPONENTE PRINCIPAL
// ───────────────────────────────────────

const inputClass =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50";

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
  const cleaned = autoClean(cifra);
  const parsedRows = parseCS(cleaned);
  const currentTom =
    allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length];

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Coluna esquerda: editor ── */}
      <div className="flex-1 space-y-4">

        {/* Dados da música */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Dados da música
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Nome</label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Nome da música"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Artista</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => onArtistChange(e.target.value)}
                placeholder="Artista"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tom original</label>
              <select
                value={tom}
                onChange={(e) => onTomChange(e.target.value)}
                className={inputClass}
              >
                {allKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cifra */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Cifra completa
          </p>
          <textarea
            value={cifra}
            onChange={(e) => onCifraChange(e.target.value)}
            placeholder="Cole a cifra aqui (acordes acima, letra abaixo)..."
            className={`${inputClass} h-52 font-mono resize-none`}
          />
        </div>

      </div>

      {/* ── Coluna direita: preview ── */}
      <div className="lg:w-[46%] flex flex-col gap-4">

        {/* Real Book preview */}
        <div className="bg-background/50 border border-border/50 rounded-xl p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Preview Real Book
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tom:</span>
              <span className="text-xs font-bold text-primary">{currentTom}</span>
              <div className="flex gap-1 ml-1">
                <button
                  onClick={() => onTranspose(-1)}
                  className="w-6 h-6 rounded border border-border/60 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onTranspose(1)}
                  className="w-6 h-6 rounded border border-border/60 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div
            id="realbook-pdf-target"
            className="min-h-[200px] space-y-0.5 font-mono"
          >
            {parsedRows.length > 0 ? (
              parsedRows.map((row, i) => renderRow(row, i, transpose))
            ) : (
              <p className="text-muted-foreground/40 text-sm italic">
                O preview aparece aqui conforme você digita a cifra...
              </p>
            )}
          </div>
        </div>

        {/* Exportar PDF */}
        <Button variant="neon-outline" className="w-full" onClick={onGeneratePdf}>
          <FileDown className="w-4 h-4" /> Exportar como PDF
        </Button>

      </div>
    </div>
  );
}