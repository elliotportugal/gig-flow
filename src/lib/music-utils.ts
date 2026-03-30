// src/lib/music-utils.ts

export interface GridSection {
  name: string;
  rows: string[][];
}

/**
 * Transforma o texto da cifra em uma estrutura de Grid
 * Ex: ":INTRO\nC G Am F" vira [{ name: 'INTRO', rows: [['C', 'G', 'Am', 'F']] }]
 */
export const parseTextoParaGridData = (texto: string = ""): GridSection[] => {
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l !== "");
  const gridData: GridSection[] = [];
  let secaoAtual: GridSection | null = null;

  linhas.forEach(linha => {
    // Detecta seção (ex: :INTRO)
    if (linha.startsWith(':')) {
      secaoAtual = { name: linha.replace(':', '').trim(), rows: [] };
      gridData.push(secaoAtual);
    } 
    // Se não for seção, trata como linha de acordes
    else if (secaoAtual) {
      const acordes = linha.split(/[\s|]+/)
        .filter(a => a.trim() !== "")
        .map(a => a.replace(/_/g, ' ')); // Remove o underline visualmente
      
      if (acordes.length > 0) {
        secaoAtual.rows.push(acordes);
      }
    }
  });

  return gridData.length > 0 ? gridData : [{ name: 'MAPA', rows: [] }];
};