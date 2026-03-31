import React, { useEffect, useState } from "react";
import { 
  Music, Plus, Calendar, Clock, 
  ChevronRight, MoreVertical, LayoutDashboard, Star, ShieldCheck, Loader2, Trash2 
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

export default function Dashboard() {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMusicas, setTotalMusicas] = useState<number>(0);
  const [lastActivity, setLastActivity] = useState<string>("---");
  const navigate = useNavigate();

  // --- BUSCAR DADOS DINÂMICOS DO USUÁRIO ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Pegamos o usuário atual logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Buscar apenas os setlists do usuário logado
      const { data: setlistsData, error: setlistsError } = await supabase
        .from('setlists')
        .select('*')
        .eq('user_id', user.id) // FILTRO DE SEGURANÇA
        .order('created_at', { ascending: false });

      if (setlistsError) throw setlistsError;
      
      if (setlistsData) {
        setSetlists(setlistsData);
        if (setlistsData.length > 0) setLastActivity(setlistsData[0].name);
      }

      // 2. Buscar total de músicas (apenas as que pertencem aos setlists do usuário)
      // Aqui usamos um join implícito ou apenas contamos todas as musicas vinculadas aos setlists do user
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

  // --- CRIAR NOVO REPERTÓRIO COM USER_ID ---
  const handleNovoRepertorio = async () => {
    const name = window.prompt("Nome do novo repertório:");
    if (!name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { data, error } = await supabase
        .from('setlists')
        .insert([{ 
          name, 
          user_id: user.id, // VINCULANDO AO USUÁRIO LOGADO
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

  const stats = [
    { label: "Total de Mapas", value: totalMusicas.toString(), sub: "Cifras salvas", icon: Music, color: "text-primary" },
    { label: "Última Atividade", value: lastActivity, sub: "Show recente", icon: Clock, color: "text-blue-400" },
    { label: "Integridade Cloud", value: "100%", sub: "Sincronizado", icon: ShieldCheck, color: "text-emerald-400" },
    { label: "Plano GigFlow", value: "Admin", sub: "Acesso Total", icon: Star, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-6xl flex items-center justify-between h-14 px-6 mx-auto">
          <Link to="/" className="flex items-center gap-2 no-underline text-foreground">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight text-lg italic">GigFlow Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-3 h-3" /> Admin
            </div>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold uppercase tracking-widest">Sair</Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary/70">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Console de Gestão</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Meus repertórios</h1>
              <p className="text-muted-foreground text-sm mt-1 font-medium">Seu acervo musical sincronizado na nuvem.</p>
            </div>
            <Button onClick={handleNovoRepertorio} variant="neon" className="px-6 font-bold uppercase tracking-widest text-[10px] h-11">
              <Plus className="w-4 h-4 mr-2" /> Novo Repertório
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {stats.map((s, i) => (
              <motion.div key={s.label} className="bg-glass/10 border border-border/30 rounded-2xl p-5 hover:border-primary/40 transition-all text-left"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3 mb-3 text-left">
                  <div className={`p-2 rounded-lg bg-secondary/50 ${s.color}`}><s.icon className="w-4 h-4" /></div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
                </div>
                <p className="text-xl font-bold tracking-tight truncate">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 px-2 text-left">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Shows Disponíveis</h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            
            {!loading && setlists.length === 0 && (
              <div className="py-16 text-center border border-dashed border-border/40 rounded-3xl">
                <p className="text-muted-foreground text-xs font-medium">Nenhum repertório encontrado.</p>
              </div>
            )}

            {setlists.map((sl, i) => (
              <motion.div key={sl.id} className="bg-glass/5 border border-border/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-secondary/20 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/editor/${sl.id}`)}>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-lg font-medium group-hover:text-primary transition-colors truncate tracking-tight">{sl.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-[10px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {sl.date}</div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 text-primary/80 italic font-semibold">Vibe: {sl.energy}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-primary">Abrir <ChevronRight className="w-3 h-3 ml-1" /></Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => handleExcluirRepertorio(sl.id, sl.name, e)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}