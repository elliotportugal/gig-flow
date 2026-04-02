// src/lib/music-utils.ts

export interface GridSection {
  name: string;
  rows: string[][];
}

export function parseTextoParaGridData(texto: string): GridSection[] {
  const linhas = texto.split('\n');
  const sections: GridSection[] = [];
  let currentSection: GridSection | null = null;

  linhas.forEach(linha => {
    let raw = linha.trim();
    if (!raw) return;

    // 1. IDENTIFICAR SEÇÃO (:VERSO)
    if (raw.startsWith(':')) {
      currentSection = { name: raw.replace(':', '').trim(), rows: [] };
      sections.push(currentSection);
      return;
    }

    if (!currentSection) {
      currentSection = { name: '', rows: [] };
      sections.push(currentSection);
    }

    // 2. TRATAR REPETIÇÃO (Dm)x8 -> SEM DESENROLAR
    const repeatRegex = /\((.*?)\)x(\d+)/g;
    raw = raw.replace(repeatRegex, (_, content, count) => {
      // Divide por espaços ou barras para analisar o conteúdo interno
      const parts = content.trim().split(/[| ]+/).filter(p => p.trim() !== '');
      
      if (parts.length === 1) {
        // Caso (Dm)x8 -> Retorna o marcador único que o ChordCell entende
        return `||:${parts[0]}:||x${count}`;
      }
      
      // Caso (Dm G)x2 -> Marca as extremidades
      parts[0] = `||:${parts[0]}`;
      parts[parts.length - 1] = `${parts[parts.length - 1]}:||x${count}`;
      // Retornamos com barras para garantir que o split posterior funcione
      return parts.join(' | ');
    });

    // 3. SEPARAR COMPASSOS (Lógica Inteligente)
    // Se a linha contém '|', separamos por ela. Se não contém, separamos por ESPAÇOS.
    let compassos: string[];
    if (raw.includes('|')) {
      compassos = raw.split('|').map(c => c.trim()).filter(c => c !== '');
    } else {
      compassos = raw.split(/\s+/).map(c => c.trim()).filter(c => c !== '');
    }
    
    // 4. AGRUPAR EM LINHAS DE 4 (Formatação de Grade)
    if (compassos.length > 0) {
      // Usamos um loop para garantir que blocos de 4 compassos virem linhas
      for (let i = 0; i < compassos.length; i += 4) {
        currentSection.rows.push(compassos.slice(i, i + 4));
      }
    }
  });

  return sections;
}