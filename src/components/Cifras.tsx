import React, { useState, useCallback } from "react";

// ───────────────────────────────────────
// 1. PARSER REAL BOOK / AUTO CLEAN
// ───────────────────────────────────────

// AutoClean: tira linhas vazias excessivas, normaliza quebras e acordes
const autoClean = (raw: string): string => {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // 3+ quebras → 2
    .trim();
};

// parseCS: divide em linhas com acordes e letras
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
      // Linha de acordes
      result.push({ row: trimmed, hasChords: true });
    } else {
      // Linha de letra
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
// 2. TRANSPOSE 1 TOM
// ───────────────────────────────────────

const allKeys = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
];

const transposeChord = (chord: string, delta: number): string => {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;

  const [full, root, suffix] = match;
  const baseRoot = full.replace(/#|b|$\w+$/, ""); // extrai base
  const isSharp = full.includes("#");
  const isFlat = full.includes("b");

  // tenta achar o índice no array de tons
  let idx = allKeys.findIndex((k) => k === baseRoot + (isSharp ? "#" : isFlat ? "b" : ""));
  if (idx === -1) return chord;

  idx = (idx + delta + allKeys.length) % allKeys.length;
  return allKeys[idx] + suffix;
};

const transposeLine = (line: string, delta: number): string => {
  // separa acorde e texto
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
// 3. RENDER ROW (PATRICK HAND + 4 COLUNAS)
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
// 4. COMPONENTE PRINCIPAL
// ───────────────────────────────────────

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

  // inputs de tom + transpose
  const changeTranspose = (delta: number) => {
    setTranspose((prev) => prev + delta);
  };

  // texto limpo + parsed
  const cleaned = isClean ? autoClean(rawLyrics) : rawLyrics;
  const parsedRows = parseCS(cleaned);

  const handleDownloadPDF = () => {
    const el = document.getElementById("realbook-pdf-target");
    if (!el) return;

    // Você vai instalar no projeto: html2pdf.js
    // No HTML build:
    // - salvar o conteúdo em um div com id = "realbook-pdf-target"
    // - depois:
    //   import html2pdf from 'html2pdf.js';
    //   html2pdf().from(el).save('realbook.pdf');
    alert("PDF: exporte esse div com html2pdf (Stripe paywall here)");
  };

  return (
    <div className="app-container">
      {/* ───────────── HEADER FIXO (Título/Artista/Tom) */}
      <header className="header">
        <div className="header-inputs">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="input-title"
          />
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artista"
            className="input-artist"
          />
          <select
            value={tom}
            onChange={(e) => setTom(e.target.value)}
            className="input-key"
          >
            {allKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="header-actions">
          <button
            onClick={() => changeTranspose(-1)}
            className="btn-transpose"
          >
            −1
          </button>
          <button
            onClick={() => changeTranspose(1)}
            className="btn-transpose"
          >
            +1
          </button>
          <button onClick={handleDownloadPDF} className="btn-pdf">
            PDF
          </button>
        </div>
      </header>

      <div className="layout-grid">
        {/* ───────────── SIDEBAR REPETÓRIO */}
        <aside className="sidebar">
          <h4>Repertório</h4>
          <ul>
            <li>Yesterday – The Beatles</li>
            <li>Corcovado – Tom Jobim</li>
            <li>Moondance – Van Morrison</li>
          </ul>
        </aside>

        {/* ───────────── MAPA (INDENTES / SEÇÃO) */}
        <section className="map">
          <h4>Mapa</h4>
          <ul>
            <li>Intro</li>
            <li>Primeira parte</li>
            <li>Refrão</li>
            <li>Bridge</li>
            <li>Final</li>
          </ul>
        </section>

        {/* ───────────── GRID REAL BOOK (PATRICK HAND 4 COLUNAS) */}
        <section className="realbook">
          <div className="realbook-header">
            <h2>{title}</h2>
            <p>{artist} • Tom: {allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length]}</p>
          </div>

          {/* Toggler Cifra Bruta */}
          <div className="toggle-wrap">
            <label>
              <input
                type="checkbox"
                checked={isClean}
                onChange={(e) => setIsClean(e.target.checked)}
              />
              Cifra Bruta
            </label>
          </div>

          <div id="realbook-pdf-target" className="realbook-body">
            <textarea
              value={rawLyrics}
              onChange={handleChangeRaw}
              placeholder="Cole a cifra aqui..."
              className="textarea-raw"
            />
            <div className="realbook-grid">
              {parsedRows.map((row, i) => renderRow(row, i, transpose))}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        body,
        html {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #2a2a2a 100%);
          color: #e0e0e0;
          font-family: "Patrick Hand", cursive, sans-serif;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* HEADER FIXO */
        .header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #111;
          border-bottom: 1px solid #333;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .header-inputs {
          display: flex;
          gap: 0.5rem;
          flex: 1 1 300px;
          flex-wrap: wrap;
        }

        .header-inputs input,
        .header-inputs select {
          background: #2a2a2a;
          border: 1px solid #444;
          color: #e0e0e0;
          padding: 0.4rem 0.7rem;
          border-radius: 4px;
          font-size: 0.95rem;
          outline: none;
        }

        .input-title {
          flex: 1 1 200px;
        }

        .input-artist {
          flex: 1 1 150px;
        }

        .input-key {
          flex: 0 1 100px;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-transpose,
        .btn-pdf {
          padding: 0.4rem 0.8rem;
          border: 1px solid #5a4a00;
          background: #a57c00;
          color: #111;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .btn-pdf {
          background: #90caf9;
          border-color: #64b5f6;
          color: #000;
        }

        /* LAYOUT 3 COLUNAS (GRID) */
        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 4fr;
          grid-gap: 1rem;
          padding: 1rem;
          flex: 1;
        }

        .sidebar {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #333;
        }

        .sidebar h4 {
          margin-top: 0;
          color: #b388ff;
          font-size: 1.1rem;
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar li {
          padding: 0.3rem 0;
          font-size: 0.9rem;
          cursor: pointer;
          opacity: 0.9;
        }

        .sidebar li:hover {
          opacity: 1;
          color: #b388ff;
        }

        .map {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #333;
        }

        .map h4 {
          margin-top: 0;
          color: #80deea;
          font-size: 1.1rem;
        }

        .map ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .map li {
          padding: 0.4rem 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .realbook {
          background: #141414;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #444;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .realbook-header {
          margin-bottom: 1rem;
        }

        .realbook-header h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.3rem;
          color: #ffd54f;
        }

        .realbook-header p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .toggle-wrap {
          margin-bottom: 1rem;
        }

        .toggle-wrap label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        /* TEXTAREA BRUTA */
        .textarea-raw {
          width: 100%;
          height: 120px;
          background: #222;
          border: 1px solid #444;
          color: #e0e0e0;
          padding: 0.7rem;
          border-radius: 4px;
          resize: vertical;
          margin-bottom: 1rem;
          font-family: monospace;
          font-size: 0.9rem;
        }

        /* GRID REAL BOOK (4 COLUNAS VIRTUAIS) */
        .realbook-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-gap: 0.5rem 0.75rem;
          column-gap: 1rem;
        }

        .realbook-row {
          padding: 0.3rem 0;
          line-height: 1.4;
        }

        .realbook-row.lyric {
          grid-column: span 4;
          font-size: 0.9rem;
        }

        .realbook-row.chord {
          grid-column: span 4;
          min-height: 1em;
        }

        .chord-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 0.8rem;
          align-items: flex-end;
        }

        .chord {
          font-size: 1.05rem;
          padding: 0.1rem 0.4rem;
          background: #a57c00;
          border-radius: 4px;
          color: #111;
          letter-spacing: 0.02em;
        }

        /* ───────────── MOBILE RESPONSIVO */
        @media (max-width: 1024px) {
          .layout-grid {
            grid-template-columns: 1fr 3fr;
            grid-template-areas:
              "sidebar sidebar"
              "map map";
          }

          .sidebar {
            grid-area: sidebar;
          }

          .map {
            grid-area: map;
          }
        }

        @media (max-width: 768px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }

          .sidebar,
          .map {
            margin-bottom: 0.75rem;
          }

          .realbook-header h2 {
            font-size: 1.1rem;
          }

          .realbook-grid {
            grid-template-columns: 1fr 1fr; /* 2 colunas em mobile */
          }
        }

        @media (max-width: 480px) {
          .realbook-grid {
            grid-template-columns: 1fr; /* 1 coluna em ultra mobile */import React, { useState, useCallback } from "react";

// ───────────────────────────────────────
// 1. PARSER REAL BOOK / AUTO CLEAN
// ───────────────────────────────────────

const autoClean = (raw: string): string => {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // 3+ quebras → 2
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
      // Linha de acordes
      result.push({ row: trimmed, hasChords: true });
    } else {
      // Linha de letra
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
// 2. TRANSPOSE 1 TOM
// ───────────────────────────────────────

const allKeys = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
];

const transposeChord = (chord: string, delta: number): string => {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;

  const [full, root, suffix] = match;
  const baseRoot = full.replace(/#|b|$\w+$/, ""); // extrai base
  const isSharp = full.includes("#");
  const isFlat = full.includes("b");

  let idx = allKeys.findIndex((k) => k === baseRoot + (isSharp ? "#" : isFlat ? "b" : ""));
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
// 3. RENDER ROW (PATRICK HAND + 4 COLUNAS)
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
// 4. COMPONENTE PRINCIPAL
// ───────────────────────────────────────

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
    <div className="app-container">
      <header className="header">
        <div className="header-inputs">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="input-title"
          />
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artista"
            className="input-artist"
          />
          <select
            value={tom}
            onChange={(e) => setTom(e.target.value)}
            className="input-key"
          >
            {allKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="header-actions">
          <button
            onClick={() => changeTranspose(-1)}
            className="btn-transpose"
          >
            −1
          </button>
          <button
            onClick={() => changeTranspose(1)}
            className="btn-transpose"
          >
            +1
          </button>
          <button onClick={handleDownloadPDF} className="btn-pdf">
            PDF
          </button>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          <h4>Repertório</h4>
          <ul>
            <li>Yesterday – The Beatles</li>
            <li>Corcovado – Tom Jobim</li>
            <li>Moondance – Van Morrison</li>
          </ul>
        </aside>

        <section className="map">
          <h4>Mapa</h4>
          <ul>
            <li>Intro</li>
            <li>Primeira parte</li>
            <li>Refrão</li>
            <li>Bridge</li>
            <li>Final</li>
          </ul>
        </section>

        <section className="realbook">
          <div className="realbook-header">
            <h2>{title}</h2>
            <p>{artist} • Tom: {allKeys[(allKeys.indexOf(tom) + transpose + allKeys.length) % allKeys.length]}</p>
          </div>

          <div className="toggle-wrap">
            <label>
              <input
                type="checkbox"
                checked={isClean}
                onChange={(e) => setIsClean(e.target.checked)}
              />
              Cifra Bruta
            </label>
          </div>

          <div id="realbook-pdf-target" className="realbook-body">
            <textarea
              value={rawLyrics}
              onChange={handleChangeRaw}
              placeholder="Cole a cifra aqui..."
              className="textarea-raw"
            />
            <div className="realbook-grid">
              {parsedRows.map((row, i) => renderRow(row, i, transpose))}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        body,
        html {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #2a2a2a 100%);
          color: #e0e0e0;
          font-family: "Patrick Hand", cursive, sans-serif;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* HEADER FIXO */
        .header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #111;
          border-bottom: 1px solid #333;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .header-inputs {
          display: flex;
          gap: 0.5rem;
          flex: 1 1 300px;
          flex-wrap: wrap;
        }

        .header-inputs input,
        .header-inputs select {
          background: #2a2a2a;
          border: 1px solid #444;
          color: #e0e0e0;
          padding: 0.4rem 0.7rem;
          border-radius: 4px;
          font-size: 0.95rem;
          outline: none;
        }

        .input-title {
          flex: 1 1 200px;
        }

        .input-artist {
          flex: 1 1 150px;
        }

        .input-key {
          flex: 0 1 100px;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-transpose,
        .btn-pdf {
          padding: 0.4rem 0.8rem;
          border: 1px solid #5a4a00;
          background: #a57c00;
          color: #111;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .btn-pdf {
          background: #90caf9;
          border-color: #64b5f6;
          color: #000;
        }

        /* LAYOUT 3 COLUNAS (GRID) */
        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 4fr;
          grid-gap: 1rem;
          padding: 1rem;
          flex: 1;
        }

        .sidebar {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #333;
        }

        .sidebar h4 {
          margin-top: 0;
          color: #b388ff;
          font-size: 1.1rem;
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar li {
          padding: 0.3rem 0;
          font-size: 0.9rem;
          cursor: pointer;
          opacity: 0.9;
        }

        .sidebar li:hover {
          opacity: 1;
          color: #b388ff;
        }

        .map {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #333;
        }

        .map h4 {
          margin-top: 0;
          color: #80deea;
          font-size: 1.1rem;
        }

        .map ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .map li {
          padding: 0.4rem 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .realbook {
          background: #141414;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #444;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .realbook-header {
          margin-bottom: 1rem;
        }

        .realbook-header h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.3rem;
          color: #ffd54f;
        }

        .realbook-header p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .toggle-wrap {
          margin-bottom: 1rem;
        }

        .toggle-wrap label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        /* TEXTAREA BRUTA */
        .textarea-raw {
          width: 100%;
          height: 120px;
          background: #222;
          border: 1px solid #444;
          color: #e0e0e0;
          padding: 0.7rem;
          border-radius: 4px;
          resize: vertical;
          margin-bottom: 1rem;
          font-family: monospace;
          font-size: 0.9rem;
        }

        /* GRID REAL BOOK (4 COLUNAS VIRTUAIS) */
        .realbook-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-gap: 0.5rem 0.75rem;
          column-gap: 1rem;
        }

        .realbook-row {
          padding: 0.3rem 0;
          line-height: 1.4;
        }

        .realbook-row.lyric {
          grid-column: span 4;
          font-size: 0.9rem;
        }

        .realbook-row.chord {
          grid-column: span 4;
          min-height: 1em;
        }

        .chord-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 0.8rem;
          align-items: flex-end;
        }

        .chord {
          font-size: 1.05rem;
          padding: 0.1rem 0.4rem;
          background: #a57c00;
          border-radius: 4px;
          color: #111;
          letter-spacing: 0.02em;
        }

        /* ───────────── MOBILE RESPONSIVO */
        @media (max-width: 1024px) {
          .layout-grid {
            grid-template-columns: 1fr 3fr;
            grid-template-areas:
              "sidebar sidebar"
              "map map";
          }

          .sidebar {
            grid-area: sidebar;
          }

          .map {
            grid-area: map;
          }
        }

        @media (max-width: 768px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }

          .sidebar,
          .map {
            margin-bottom: 0.75rem;
          }

          .realbook-header h2 {
            font-size: 1.1rem;
          }

          .realbook-grid {
            grid-template-columns: 1fr 1fr; /* 2 colunas em mobile */
          }
        }

        @media (max-width: 480px) {
          .realbook-grid {
            grid-template-columns: 1fr; /* 1 coluna em ultra mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default Cifras;