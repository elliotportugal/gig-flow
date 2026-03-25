import { Music, ArrowLeft, GripVertical, Plus, FileDown, Share2, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Reorder } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  duration: string;
  energy: "low" | "medium" | "high";
}

const initialSongs: Song[] = [
  { id: "1", title: "Garota de Ipanema", artist: "Tom Jobim", key: "F", bpm: 130, duration: "4:20", energy: "medium" },
  { id: "2", title: "Evidências", artist: "Chitãozinho & Xororó", key: "G", bpm: 76, duration: "5:10", energy: "high" },
  { id: "3", title: "País Tropical", artist: "Jorge Ben Jor", key: "A", bpm: 120, duration: "3:45", energy: "high" },
  { id: "4", title: "Fly Me to the Moon", artist: "Frank Sinatra", key: "Am", bpm: 120, duration: "3:30", energy: "medium" },
  { id: "5", title: "Autumn Leaves", artist: "Jazz Standard", key: "Gm", bpm: 140, duration: "5:00", energy: "low" },
  { id: "6", title: "Andar com Fé", artist: "Gilberto Gil", key: "D", bpm: 110, duration: "4:15", energy: "medium" },
];

const energyColors = {
  low: "bg-neon-cyan/20 text-neon-cyan",
  medium: "bg-neon-blue/20 text-neon-blue",
  high: "bg-neon-purple/20 text-neon-purple",
};

const energyLabels = { low: "Suave", medium: "Média", high: "Alta" };

function SongItem({ song, index }: { song: Song; index: number }) {
  return (
    <Reorder.Item
      value={song}
      className="bg-glass rounded-lg p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
    >
      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-6 text-center font-mono">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <span className="chord-text text-xs bg-secondary px-2 py-1 rounded font-bold">{song.key}</span>
        <span className="text-xs text-muted-foreground">{song.bpm} bpm</span>
        <span className="text-xs text-muted-foreground">{song.duration}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${energyColors[song.energy]}`}>
          {energyLabels[song.energy]}
        </span>
      </div>
      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </Reorder.Item>
  );
}

export default function SetlistEditor() {
  const [songs, setSongs] = useState(initialSongs);

  const totalDuration = songs.reduce((acc, s) => {
    const [m, sec] = s.duration.split(":").map(Number);
    return acc + m * 60 + sec;
  }, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-4xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-sm leading-tight">Rock Night – Bar do Zé</h1>
              <p className="text-xs text-muted-foreground">{songs.length} músicas · {hours > 0 ? `${hours}h` : ""}{mins}min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="neon" size="sm">
              <FileDown className="w-3.5 h-3.5" /> PDF
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4">
        <div className="container max-w-4xl">
          {/* Actions bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="neon-outline" size="sm">
              <Plus className="w-3.5 h-3.5" /> Adicionar Música
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowUpDown className="w-3.5 h-3.5" /> IA Ordenar
            </Button>
          </div>

          {/* Song list */}
          <Reorder.Group axis="y" values={songs} onReorder={setSongs} className="space-y-2">
            {songs.map((song, i) => (
              <SongItem key={song.id} song={song} index={i} />
            ))}
          </Reorder.Group>

          {/* Chord preview of selected */}
          <motion.div
            className="mt-8 bg-glass rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Preview – Garota de Ipanema
              </h3>
              <span className="chord-text text-xs bg-primary/10 text-primary px-2 py-1 rounded">Tom: F</span>
            </div>
            <pre className="chord-text text-sm leading-loose text-foreground/80 whitespace-pre-wrap">
{`[Intro]  Fmaj7  G7

       Fmaj7                G7
Olha que coisa mais linda, mais cheia de graça
        Gm7                  Gb7
É ela menina que vem e que passa
        Fmaj7              Gb7
Num doce balanço a caminho do mar

       Fmaj7                 G7
Moça do corpo dourado do sol de Ipanema
       Gm7               Gb7
O seu balançado é mais que um poema
               Fmaj7
É a coisa mais linda que eu já vi passar`}</pre>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
