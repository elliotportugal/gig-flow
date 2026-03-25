import { Music, Zap, Users, FileText, Clock, Smartphone, ChevronRight, Star, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(210_100%_56%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(210_100%_56%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-[100px]" />

      <div className="container relative z-10 text-center max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass text-sm text-muted-foreground mb-8">
            <Zap className="w-3.5 h-3.5 text-neon-blue" />
            Monte seu repertório em 5 minutos
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
        >
          Seu setlist.
          <br />
          <span className="text-gradient-neon">Sua vibe.</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
        >
          Cifras estilo Real Book, transpose inteligente, export PDF e modo palco.
          Tudo que sua banda precisa pra arrasar no gig.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <Link to="/dashboard">
            <Button variant="neon" size="lg" className="text-base px-8 h-12">
              Teste Grátis <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="neon-outline" size="lg" className="text-base px-8 h-12">
            <Play className="w-4 h-4" /> Ver Demo
          </Button>
        </motion.div>

        {/* Chord preview card */}
        <motion.div
          className="mt-16 mx-auto max-w-lg bg-glass rounded-xl p-6 text-left"
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-neon-cyan/60" />
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-2 text-xs text-muted-foreground">garota_de_ipanema.chord</span>
          </div>
          <pre className="chord-text text-sm leading-relaxed">
            <span className="text-neon-blue">Fmaj7</span>{"        "}<span className="text-neon-cyan">G7</span>{"\n"}
            {"Olha que coisa mais linda"}{"\n"}
            <span className="text-neon-blue">Gm7</span>{"         "}<span className="text-neon-purple">Gb7</span>{"\n"}
            {"Mais cheia de graça"}{"\n"}
            <span className="text-neon-blue">Fmaj7</span>{"        "}<span className="text-neon-cyan">Gb7</span>{"\n"}
            {"É ela menina que vem e que passa"}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: Music, title: "Cifras Real Book", desc: "Cole qualquer cifra e veja formatada como lead sheet profissional." },
  { icon: Zap, title: "Transpose Inteligente", desc: "Mude o tom em um clique. Cada instrumento na tonalidade certa." },
  { icon: Users, title: "Colab em Tempo Real", desc: "Toda a banda edita junto. Sincronizado via Supabase Realtime." },
  { icon: FileText, title: "Export PDF", desc: "Gere PDFs prontos pro gig. Compartilhe via WhatsApp em 1 toque." },
  { icon: Clock, title: "IA Sugere Ordem", desc: "Algoritmo otimiza energia e duração do show automaticamente." },
  { icon: Smartphone, title: "Modo Palco", desc: "Fullscreen no celular/iPad com auto-scroll e pedal simulado." },
];

function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="container max-w-6xl">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo pro seu <span className="text-gradient-neon">show perfeito</span></h2>
          <p className="text-muted-foreground text-lg">Economize 2h/semana de ensaio. Zero erro no palco.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-glass rounded-xl p-6 hover:border-primary/30 transition-colors group"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Lucas Fender", role: "Guitarrista – Velhos Tempos", text: "Parei de imprimir 20 folhas por show. Agora é só abrir o iPad e tocar.", stars: 5 },
  { name: "Marina Blues", role: "Vocalista – Trem do Samba", text: "O transpose salvou nosso gig quando o sax pediu pra mudar tom em cima da hora.", stars: 5 },
  { name: "DJ Rodrigo Bass", role: "Baixista Freelancer", text: "Modo palco com auto-scroll é game changer. Mãos livres pra tocar.", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="container max-w-5xl relative z-10">
        <motion.h2 className="text-3xl md:text-5xl font-bold text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          Músicos que <span className="text-gradient-purple">já curtem</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-glass rounded-xl p-6"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-neon-blue text-neon-blue" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "R$0",
    period: "/sempre",
    desc: "Pra testar e jams casuais",
    features: ["10 músicas", "1 setlist", "Cifras Real Book", "Modo palco básico"],
    cta: "Começar Grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$19",
    period: "/mês",
    desc: "Pra bandas que fazem shows",
    features: ["Músicas ilimitadas", "Setlists ilimitados", "Export PDF", "Colab em tempo real", "IA sugere ordem", "Modo palco avançado", "Compartilhar WhatsApp"],
    cta: "Assinar Pro",
    highlight: true,
  },
];

function PricingSection() {
  return (
    <section className="py-24 px-4" id="pricing">
      <div className="container max-w-4xl">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planos <span className="text-gradient-neon">simples</span></h2>
          <p className="text-muted-foreground text-lg">Sem pegadinha. Cancele quando quiser.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-xl p-8 ${plan.highlight ? "bg-glass glow-blue border-primary/30" : "bg-glass"}`}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              {plan.highlight && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  Popular
                </span>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlight ? "neon" : "neon-outline"} className="w-full">
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="container max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">SetlistPro</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 SetlistPro. Feito com 🎸 para músicos.</p>
      </div>
    </footer>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">SetlistPro</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preços</a>
          <Link to="/dashboard">
            <Button variant="neon" size="sm">Entrar</Button>
          </Link>
        </div>
        <Link to="/dashboard" className="md:hidden">
          <Button variant="neon" size="sm">Entrar</Button>
        </Link>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
