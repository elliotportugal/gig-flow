import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar, Clock, 
  ChevronRight, LayoutDashboard, Star, ShieldCheck, Loader2, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Setlist {
  id: string;
  name: string;
  date: string;
  energy: string;
  user_id: string;
}

// --- LOGO EXCLUSIVO (v4.0 - G + Clave de Sol) ---
function GigFlowLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-dash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Blue-600 */}
          <stop offset="100%" stopColor="#22D3EE" /> {/* Cyan-400 */}
        </linearGradient>
      </defs>
      <path 
        d="M75 35C70 25 58 18 45 20C30 22 20 35 20 50C20 65 30 78 45 80C58 82 70 75 75 65M75 45V65M55 50H75M45 25C45 25 55 10 55 25C55 40 35 45 35 60C35 75 45 85 55 75" 
        stroke="url(#logo-grad-dash)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="55" cy="75" r="4" fill="#22D3EE" />
    </svg>
  );
}

export default function Dashboard() {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMusicas, setTotalMusicas] = useState<number>(0);
  const [lastActivity, setLastActivity] = useState<string>("---");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: setlistsData, error: setlistsError } = await supabase
        .from('setlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (setlistsError) throw setlistsError;
      
      if (setlistsData) {
        setSetlists(setlistsData);
        if (setlistsData.length > 0) setLastActivity(setlistsData[0].name);
      }

      const { count, error: countError } = await supabase
        .from('musicas')
        .select('*, setlists!inner(user_id)', { count: 'exact', head: true })
        .eq('setlists.user_id', user.id);

      if (!countError && count !== null) setTotalMusicas(count);

    } catch (error: any) {
      console.error("Erro na sincronização:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNovoRepertorio = async () => {
    const name = window.prompt("Nome do novo repertório:");
    if (!name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sessão expirada.");
        return;
      }

      const { data, error } = await supabase
        .from('setlists')
        .insert([{ 
          name, 
          user_id: user.id, 
          date: new Date().toLocaleDateString('pt-BR'), 
          energy: 'Média' 
        }])
        .select().single();

      if (error) throw error;
      toast.success("Repertório criado!");
      navigate(`/editor/${data.id}`);
    } catch (error: any) {
      toast.error("Erro ao criar repertório.");
    }
  };

  const handleExcluirRepertorio = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(`Excluir "${name}"?`, {
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            await supabase.from('setlists').delete().eq('id', id);
            setSetlists(prev => prev.filter(s => s.id !== id));
            toast.success("Removido.");
            fetchDashboardData();
          } catch (e) { toast.error("Erro ao excluir."); }
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* NAVBAR PADRONIZADA (Azul -> Ciano) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-6xl flex items-center justify-between h-14 px-6 mx-auto">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <GigFlowLogo className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight text-lg text-foreground">GigFlow Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
              <ShieldCheck className="w-3 h-3" /> Conta Admin
            </div>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Sair</Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container max-w-6xl mx-auto text-left">
          
          {/* HEADER COM BOTÃO GRADIENTE */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-400/80">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Console de Gestão</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Meus repertórios</h1>
              <p className="text-muted-foreground text-sm mt-1 font-medium">Seu acervo musical sincronizado na nuvem.</p>
            </div>
            <Button 
              onClick={handleNovoRepertorio} 
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-none px-6 font-bold uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Repertório
            </Button>
          </div>

          {/* STATS CARDS (Ajustado para o novo branding) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { label: "Total de Mapas", val: totalMusicas, icon: Clock, color: "text-blue-400" },
              { label: "Última Atividade", val: lastActivity.length > 12 ? lastActivity.slice(0, 10) + "..." : lastActivity, icon: Star, color: "text-cyan-400" },
              { label: "Integridade Cloud", val: "100%", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "Plano GigFlow", val: "Admin", icon: Star, color: "text-amber-400" }
            ].map((s, i) => (
              <motion.div 
                key={s.label} 
                className="bg-slate-900/40 border border-blue-500/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all group"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-blue-500/5 ${s.color}`}><s.icon className="w-4 h-4" /></div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
                </div>
                <p className="text-xl font-bold tracking-tight truncate text-foreground">{s.val}</p>
              </motion.div>
            ))}
          </div>

          {/* LISTA DE REPERTÓRIOS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-2 mb-4">Shows Disponíveis</h3>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : setlists.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-blue-500/10 rounded-3xl bg-blue-500/[0.02]">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Nenhum repertório encontrado.</p>
              </div>
            ) : setlists.map((sl, i) => (
              <motion.div 
                key={sl.id} 
                className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-blue-500/[0.03] hover:border-blue-500/20 transition-all cursor-pointer group shadow-sm"
                onClick={() => navigate(`/editor/${sl.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors truncate tracking-tight text-foreground uppercase">{sl.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {sl.date}</div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400/80">Vibe: {sl.energy}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-cyan-400 transition-colors">
                    Abrir <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-9 h-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={(e) => handleExcluirRepertorio(sl.id, sl.name, e)}
                  >
                    <Trash2 className="w-4 h-4" />
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