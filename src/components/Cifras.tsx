import React, { useState } from "react";

// ───────────────────────────────────────
// 1. PARSER REAL BOOK / AUTO CLEAN
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
// 2. TRANSPOSE
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
// 3. RENDER ROW
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
// 4. COMPONENTE PRINCIPAL (LAYOUT MUITO SIMPLES)
// ───────────────────────────────────────

const Cifras = () => {
  const [title, setTitle] = useState("Nova música");
  const [artist, setArtist] = useState("Anônimo");
  const [tom, setTom] = useState("C");
  const [rawLyrics, setRawLyrics] = useState("");
  const [isClean, setIsClean] = useState(true);
  const [transpose, setTranspose] = useState(0);

  const handleChangeRaw = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawLyrics(ev.target.value);
  };

  const changeTranspose = (delta: number) => {
    setTranspose((prev) => prev + delta);
  };

  const handleDownloadPDF = () => {
    const el = document.getElementById("realbook-pdf-target");
    if (!el) return;
    alert("PDF: exporte esse div com html2pdf (Stripe)");
  };

  const cleaned = isClean ? autoClean(rawLyrics) : rawLyrics;
  const parsedRows = parseCS(cleaned);

  const currentTom =
    allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* ───────────── HEADER: TÍTULO E TOM + AÇÕES ───────────── */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">{title}</h1>
            <p className="text-sm text-gray-300">
              {artist} • <span className="text-amber-400">Tom:</span> {currentTom}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              <span className="text-amber-400">Base:</span> {tom}
            </span>
            <button
              onClick={() => changeTranspose(-1)}
              className="bg-amber-700 text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-amber-600 transition"
            >
              −1
            </button>
            <button
              onClick={() => changeTranspose(1)}
              className="bg-amber-700 text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-amber-600 transition"
            >
              +1
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium hover:bg-blue-500 transition"
            >
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ───────────── EDITOR DE CIFRA BRUTA ───────────── */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-gray-300 font-medium">
              ✍️ Escreva ou cole a cifra
            </h2>
            <label className="inline-flex items-center text-xs text-gray-400">
              <input
                type="checkbox"
                checked={isClean}
                onChange={(e) => setIsClean(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="ml-1">Auto clean</span>
            </label>
          </div>
          <textarea
            value={rawLyrics}
            onChange={handleChangeRaw}
            placeholder="Cole aqui a cifra (acordes acima, letra abaixo)..."
            className="w-full bg-gray-900 border border-gray-600 rounded p-4 text-sm text-amber-50 font-mono resize-y focus:outline-none focus:ring focus:ring-amber-500 focus:ring-opacity-30"
          />
        </div>

        {/* ───────────── REAL BOOK GRID ───────────── */}
        <div
          id="realbook-pdf-target"
          className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4"
        >
          <h3 className="text-sm text-gray-400 font-medium">
            🎼 Real Book (leia abaixo)
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm leading-6 text-amber-100 font-patrick">
            {parsedRows.map((row, i) => renderRow(row, i, transpose))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cifras;