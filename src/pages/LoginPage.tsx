import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Music, Chrome } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) console.error("Erro ao logar:", error.message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-glass/10 border border-border/40 p-10 rounded-[2.5rem] text-center shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Music className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
          GigFlow Pro
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Sua performance, sincronizada.
        </p>

        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full h-14 rounded-2xl gap-3 font-bold text-xs uppercase tracking-widest border-border/60 hover:bg-white hover:text-black transition-all"
        >
          <Chrome className="w-5 h-5" />
          Entrar com o Google
        </Button>

        <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
          Acesso Administrador Liberado
        </p>
      </motion.div>
    </div>
  );
}