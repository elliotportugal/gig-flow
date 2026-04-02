import { 
  Zap, Users, FileText, Clock, Smartphone, 
  ChevronRight, Star, Check, Play, LogIn, Code, Download 
} from "lucide-react"; // <-- Adicionado Download aqui
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

// --- LOGO EXCLUSIVO (v4.0 - G + Clave de Sol) ---
function GigFlowLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-lp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> 
          <stop offset="100%" stopColor="#22D3EE" /> 
        </linearGradient>
      </defs>
      <path 
        d="M75 35C70 25 58 18 45 20C30 22 20 35 20 50C20 65 30 78 45 80C58 82 70 75 75 65M75 45V65M55 50H75M45 25C45 25 55 10 55 25C55 40 35 45 35 60C35 75 45 85 55 75" 
        stroke="url(#logo-grad-lp)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="55" cy="75" r="4" fill="#22D3EE" />
    </svg>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/30 h-16">
      <div className="container max-w-6xl flex items-center justify-between h-full px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group no-underline">
          <GigFlowLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl text-foreground tracking-tight">GigFlow Pro</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-blue-400 no-underline transition-colors">Recursos</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-blue-400 no-underline transition-colors">Preços</a>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-none gap-2 px-5 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20">
              Acessar <LogIn className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16 text-center">
      {/* Background & Orbs (Mantidos) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="container relative z-10 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 text-sm text-blue-400 mb-8 border border-blue-500/20 font-bold uppercase tracking-widest text-[10px]">
            <GigFlowLogo className="w-3.5 h-3.5" />
            Sincronização Cloud para Músicos
          </span>
        </motion.div>

        <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 text-foreground" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          Seu setlist.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400">Sua vibe.</span>
        </motion.h1>

        <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          Repertório digital com mapas inteligentes, transpose em um clique e modo palco de alto contraste.
          O acervo que sua gig precisa para fluir sem pastas de papel.
        </motion.p>

        <motion.div className="flex justify-center" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-none shadow-xl shadow-blue-500/20 text-base px-12 h-14 font-bold uppercase tracking-widest text-[11px]">
              Começar Agora <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          {/* Botão "Ver Demo" removido para focar na conversão principal */}
        </motion.div>

        {/* --- PREVIEW ATUALIZADA (IGUAL AO SISTEMA) --- */}
        <motion.div className="mt-20 mx-auto max-w-4xl flex flex-col md:flex-row gap-6 text-left" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          
          {/* Lado A: Sintaxe do Editor */}
          <div className="flex-1 bg-slate-950/90 rounded-[2rem] p-8 border border-blue-500/20 shadow-2xl">
            <div className="flex items-center gap-2 mb-6 opacity-40 text-blue-400">
              <Code className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Editor de Mapa</span>
            </div>
            <pre className="font-mono text-sm leading-relaxed text-blue-100/80">
              <span className="text-blue-500 font-bold">:VERSO</span>{"\n"}
              {"Fmaj7 | G7 | Gm7 | Gb7"}{"\n\n"}
              <span className="text-blue-500 font-bold">:CHORUS</span>{"\n"}
              {"Bbmaj7 | Am7 | Gm7 | C7"}
            </pre>
          </div>

          {/* Lado B: Grid Real do Sistema (Fonte Patrick Hand) */}
          <div className="flex-1 bg-white rounded-[2rem] p-8 border border-blue-500/10 shadow-2xl overflow-hidden min-h-[300px]" style={{ fontFamily: "'Patrick Hand', cursive" }}>
             <div className="flex justify-between items-end border-b-2 border-slate-200 mb-6 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">Garota de Ipanema</h2>
                  <p className="text-xs opacity-60 text-slate-600 font-sans font-bold uppercase tracking-widest">Tom: F</p>
                </div>
             </div>
             
             <div className="mb-6">
                <div className="inline-block border border-slate-300 text-[9px] px-2 py-0.5 mb-2 rounded font-bold text-slate-500 bg-slate-50 uppercase font-sans tracking-widest">Verso</div>
                <div className="grid grid-cols-4 border-l-2 border-slate-300">
                  {['Fmaj7', 'G7', 'Gm7', 'Gb7'].map(c => (
                    <div key={c} className="h-12 flex items-center justify-center border-b border-r border-slate-100 font-bold text-slate-800 text-xl">{c}</div>
                  ))}
                </div>
             </div>

             <div>
                <div className="inline-block border border-blue-300 text-[9px] px-2 py-0.5 mb-2 rounded font-bold text-blue-500 bg-blue-50 uppercase font-sans tracking-widest">Chorus</div>
                <div className="grid grid-cols-4 border-l-2 border-blue-500">
                  {['Bbmaj7', 'Am7', 'Gm7', 'C7'].map(c => (
                    <div key={c} className="h-12 flex items-center justify-center border-b border-r border-blue-50 shadow-[inset_0_-1px_0_rgba(37,99,235,0.1)] font-bold text-blue-600 text-xl">{c}</div>
                  ))}
                </div>
             </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: FileText, title: "Mapas Inteligentes", desc: "Escreva seu mapa em texto e veja o sistema gerar um grid profissional instantaneamente." },
  { icon: Zap, title: "Transpose em 1 Toque", desc: "Mude o tom de todo o repertório sem precisar reescrever nada. Sincronia total." },
  { icon: Users, title: "Banda Sincronizada", desc: "Toda a banda acessa o mesmo setlist na nuvem. Alterou no Dashboard, mudou no palco." },
  { icon: Smartphone, title: "Modo Palco Pro", desc: "Interface de alto contraste otimizada para iPad e tablets. Leitura perfeita no escuro." },
  { icon: Download, title: "Export PDF Cloud", desc: "Gere PDFs limpos e organizados para compartilhar com freelancers via WhatsApp." },
  { icon: Clock, title: "Foco na Performance", desc: "Menos tempo virando página, mais tempo focado no groove e na interação com o público." },
];

function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-slate-900/50" id="features">
      <div className="container max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo para o seu <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">show perfeito</span></h2>
          <p className="text-muted-foreground text-lg font-medium">Desenvolvido por músicos, para quem faz gig de verdade.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} className="bg-slate-900/40 border border-blue-500/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all text-left group" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                <f.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Free Reps",
      price: "R$0",
      period: "/sempre",
      desc: "Perfeito para músicos freelancers e trabalhos casuais.",
      features: ["10 músicas no acervo", "1 setlist ativo", "Mapas Digitais", "Modo palco básico"],
      cta: "Começar Grátis",
      highlight: false,
    },
    {
      name: "Pro Gigs",
      price: "R$19",
      period: "/mês",
      desc: "Para projetos profissionais, guiados pelo mesmo mapa.",
      features: ["Músicas ilimitadas", "Setlists ilimitados", "Export PDF Cloud", "Transpose inteligente", "Acesso Offline", "Suporte prioritário"],
      cta: "Assinar Pro",
      highlight: true,
    },
  ];

  return (
    <section className="py-24 px-4" id="pricing">
      <div className="container max-w-4xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Plano <span className="text-blue-400">simples</span></h2>
          <p className="text-muted-foreground text-lg font-medium italic">Sem pegadinha, cancele quando quiser.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((p, i) => (
            <motion.div key={p.name} className={`rounded-[2.5rem] p-10 text-left border ${p.highlight ? "bg-slate-900 border-blue-500/40 shadow-2xl" : "bg-slate-950 border-white/5"}`}>
              {p.highlight && <span className="inline-block px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold mb-6 tracking-widest uppercase">Popular</span>}
              <h3 className="text-2xl font-bold">{p.name}</h3>
              <div className="mt-2 mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <ul className="space-y-4 mb-10">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-blue-500" />{f}</li>
                ))}
              </ul>
              <Link to="/login">
                <Button className={`w-full h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest ${p.highlight ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white" : "bg-white/5 text-white hover:bg-white/10"}`}>
                  {p.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4 bg-black/20">
      <div className="container max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mx-auto">
        <div className="flex items-center gap-3">
          <GigFlowLogo className="w-7 h-7" />
          <span className="font-bold text-xl tracking-tight">GigFlow Pro</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold text-center">
          © 2026 GigFlow Pro • Feito para músicos do Brasil
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}