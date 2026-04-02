const SCALE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  
  // Regex para separar a nota fundamental (Ex: "Ab", "F#", "C") do restante ("m7", "dim", etc)
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;

  const [_, root, suffix] = match;
  
  // Normalização básica (Ex: transforma A# em Bb para busca no array)
  const normalizedRoot = root === 'A#' ? 'Bb' : root === 'D#' ? 'Eb' : root === 'G#' ? 'Ab' : root;
  
  const currentIndex = SCALE.indexOf(normalizedRoot);
  if (currentIndex === -1) return chord;

  let newIndex = (currentIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return SCALE[newIndex] + suffix;
}