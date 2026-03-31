import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SetlistEditor from "./pages/SetlistEditor";
import LoginPage from "./pages/LoginPage"; // Certifique-se de criar este arquivo
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica se já existe uma sessão ativa ao abrir o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças na autenticação (Login, Logout, Token renovado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enquanto verifica a sessão, podemos exibir um estado vazio ou loader
  if (loading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Rota Pública: Qualquer um vê */}
            <Route path="/" element={<LandingPage />} />

            {/* Rota de Login: Se já estiver logado, vai direto para o Dashboard */}
            <Route 
              path="/login" 
              element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
            />

            {/* Rota Privada: Só acessa se tiver session, caso contrário vai para o Login */}
            <Route 
              path="/dashboard" 
              element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
            />

            {/* Rota Privada: Editor dinâmico por ID */}
            <Route 
              path="/editor/:id" 
              element={session ? <SetlistEditor /> : <Navigate to="/login" replace />} 
            />

            {/* Fallback para páginas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;