import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Chrome, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// --- LOGO EXCLUSIVO (v4.0 - G + Clave de Sol) ---
function GigFlowLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-login" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> 
          <stop offset="100%" stopColor="#22D3EE" /> 
        </linearGradient>
      </defs>
      <path 
        d="M75 35C70 25 58 18 45 20C30 22 20 35 20 50C20 65 30 78 45 80C58 82 70 75 75 65M75 45V65M55 50H75M45 25C45 25 55 10 55 25C55 40 35 45 35 60C35 75 45 85 55 75" 
        stroke="url(#logo-grad-login)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="55" cy="75" r="4" fill="#22D3EE" />
    </svg>
  );
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) toast.error(error.message);
  };

  const handleAuthManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` }
        });
        if (error) throw error;
        toast.success("Verifique seu e-mail para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo ao show!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 antialiased text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/40 border border-blue-500/10 p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-md"
      >
        {/* LOGO v4.0 PADRONIZADO */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-2 group no-underline">
            <div className="p-4 bg-blue-500/5 rounded-2xl group-hover:scale-110 transition-transform">
              <GigFlowLogo className="w-10 h-10" />
            </div>
            <span className="font-bold text-2xl text-foreground tracking-tight">GigFlow Pro</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          {isSignUp ? "Criar sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8 font-medium">
          {isSignUp ? "Sincronize seu repertório na nuvem hoje." : "Acesse seu acervo musical de qualquer lugar."}
        </p>

        {/* BOTÃO GOOGLE UNIFICADO */}
        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full h-12 rounded-xl gap-3 font-bold text-[10px] uppercase tracking-widest border-blue-500/20 hover:bg-white hover:text-black transition-all mb-6"
        >
          <Chrome className="w-4 h-4 text-blue-500" />
          Continuar com Google
        </Button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-slate-950 px-4 text-muted-foreground/60">ou e-mail</span></div>
        </div>

        {/* FORMULÁRIO MANUAL COM FOCO EM AZUL */}
        <form onSubmit={handleAuthManual} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-blue-500/40" />
              <input 
                type="email" 
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-blue-500/10 rounded-xl p-3 pl-10 outline-none text-white focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-500/40" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-blue-500/10 rounded-xl p-3 pl-10 outline-none text-white focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all mt-4 border-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {isSignUp ? "Finalizar Cadastro" : "Entrar no Acervo"} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-8 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Comece grátis"}
        </button>

        <p className="mt-8 text-[9px] text-muted-foreground uppercase tracking-[0.2em] opacity-20 font-bold">
          GigFlow Pro • 2026
        </p>
      </motion.div>
    </div>
  );
}