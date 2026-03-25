import { Music, Plus, Calendar, BarChart3, Clock, ChevronRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const mockSetlists = [
  { id: 1, name: "Rock Night – Bar do Zé", songs: 12, duration: "1h30", date: "22 Mar 2026", energy: "Alta" },
  { id: 2, name: "Jazz Brunch – Café Bossa", songs: 8, duration: "1h00", date: "15 Mar 2026", energy: "Média" },
  { id: 3, name: "Casamento Silva", songs: 18, duration: "2h30", date: "08 Mar 2026", energy: "Variada" },
];

const stats = [
  { label: "Shows este mês", value: "6", icon: Calendar },
  { label: "Músicas no acervo", value: "47", icon: Music },
  { label: "Horas economizadas", value: "12h", icon: Clock },
  { label: "Músicas populares", value: "Top 5", icon: BarChart3 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar-like top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-6xl flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-bold">SetlistPro</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Free · 7/10 músicas</span>
            <Button variant="neon" size="sm">Upgrade Pro</Button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-12 px-4">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Meus Repertórios</h1>
              <p className="text-muted-foreground text-sm mt-1">Organize seus shows como um profissional</p>
            </div>
            <Link to="/editor">
              <Button variant="neon">
                <Plus className="w-4 h-4" /> Novo Repertório
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="bg-glass rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Setlists */}
          <div className="space-y-3">
            {mockSetlists.map((sl, i) => (
              <motion.div
                key={sl.id}
                className="bg-glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{sl.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{sl.songs} músicas</span>
                    <span>·</span>
                    <span>{sl.duration}</span>
                    <span>·</span>
                    <span>Energia: {sl.energy}</span>
                    <span>·</span>
                    <span>{sl.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/editor">
                    <Button variant="neon-outline" size="sm">
                      Editar <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
