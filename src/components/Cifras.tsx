import React, { useState, useCallback } from "react";

// 1. PARSER REAL BOOK / AUTO CLEAN
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

// 2. TRANSPOSE 1 TOM
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

// 3. RENDER ROW
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

// 4. COMPONENTE PRINCIPAL
const Cifras = () => {
  const [tom, setTom] = useState("C");
  const [title, setTitle] = useState("Nova Música");
  const [artist, setArtist] = useState("Anônimo");
  const [rawLyrics, setRawLyrics] = useState("");
  const [transpose, setTranspose] = useState(0);
  const [isClean, setIsClean] = useState(true);

  const handleChangeRaw = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawLyrics(ev.target.value);
  };

  const changeTranspose = (delta: number) => {
    setTranspose((prev) => prev + delta);
  };

  const cleaned = isClean ? autoClean(rawLyrics) : rawLyrics;
  const parsedRows = parseCS(cleaned);

  const handleDownloadPDF = () => {
    const el = document.getElementById("realbook-pdf-target");
    if (!el) return;
    alert("PDF: exporte esse div com html2pdf (Stripe paywall here)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-amber-100 font-patrick">
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1 flex flex-wrap gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-amber-50 focus:outline-none focus:ring focus:ring-amber-500"
            />
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artista"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-amber-50 focus:outline-none focus:ring focus:ring-amber-500"
            />
            <select
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-amber-50"
            >
              {allKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => changeTranspose(-1)}
              className="bg-amber-700 text-gray-900 px-2 py-1 rounded text-sm font-medium hover:bg-amber-600 transition"
            >
              −1
            </button>
            <button
              onClick={() => changeTranspose(1)}
              className="bg-amber-700 text-gray-900 px-2 py-1 rounded text-sm font-medium hover:bg-amber-600 transition"
            >
              +1
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-500 transition"
            >
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_4fr] gap-4 p-4">
        {/* SIDEBAR REPETÓRIO */}
        <aside className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-amber-400 text-sm font-semibold mb-2">Repertório</h4>
          <ul className="text-sm text-amber-100 space-y-1">
            <li className="cursor-pointer opacity-90 hover:opacity-100 text-amber-200">Yesterday – The Beatles</li>
            <li className="cursor-pointer opacity-90 hover:opacity-100 text-amber-200">Corcovado – Tom Jobim</li>
            <li className="cursor-pointer opacity-90 hover:opacity-100 text-amber-200">Moondance – Van Morrison</li>
          </ul>
        </aside>

        {/* MAPA */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-cyan-300 text-sm font-semibold mb-2">Mapa</h4>
          <ul className="text-sm text-amber-100 space-y-1">
            <li>Intro</li>
            <li>Primeira parte</li>
            <li>Refrão</li>
            <li>Bridge</li>
            <li>Final</li>
          </ul>
        </section>

        {/* GRID REAL BOOK */}
        <section className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="mb-3">
            <h2 className="text-amber-300 text-xl font-bold">{title}</h2>
            <p className="text-amber-200 text-sm">
              {artist} • Tom:{" "}
              {allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length]}
            </p>
          </div>

          <div className="mb-3">
            <label className="text-sm opacity-90 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isClean}
                onChange={(e) => setIsClean(e.target.checked)}
                className="rounded text-amber-500"
              />
              Cifra Bruta
            </label>
          </div>

          <div id="realbook-pdf-target" className="space-y-4">
            <textarea
              value={rawLyrics}
              onChange={handleChangeRaw}
              placeholder="Cole a cifra aqui..."
              className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-sm text-amber-50 font-mono resize-y"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {parsedRows.map((row, i) => renderRow(row, i, transpose))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Cifras;