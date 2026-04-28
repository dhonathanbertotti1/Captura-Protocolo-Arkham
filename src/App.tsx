/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Zap, Users, ShieldCheck, ArrowRight, Sparkles, Fingerprint, Timer, ShieldAlert, Activity, Eye, Skull } from 'lucide-react';

// --- Sound System ---
class SonarSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 1.0; // Volume máximo no master
  }

  ping() {
    // Ping desativado conforme solicitado
  }

  tick() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    
    // Som de click mais agudo e digital
    osc.type = "sine";
    osc.frequency.setValueAtTime(4500, now); // Frequência bem alta (aguda)
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.02);
    
    tickGain.gain.setValueAtTime(0.05, now); 
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(tickGain).connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
}

const sonar = new SonarSystem();

// --- CONFIGURAÇÃO DE ÁUDIO ---
// 1. Suba seu arquivo MP3 no GitHub
// 2. Clique no arquivo -> clique em "Raw"
// 3. Cole o link abaixo:
const MUSIC_URL = "https://raw.githubusercontent.com/dhonathanbertotti1/imagens-hector/main/VOC%C3%8A%20ENCONTROU%20UMA%20PISTA%2C%20ENTRE%20EM%20CONTATO%20VIA%20WHATSAPP%20VIA%20NUMERO%2067992154634.mp3"; 
// -----------------------------

// --- Matrix Background Component ---
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const characters = "01$#@!%^&* ARKHAM PROTECT CORE".split("");
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f97316'; // Orange-500
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none opacity-[0.07] z-0"
    />
  );
};

export default function App() {
  const [queueCount, setQueueCount] = useState(14829);
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showEntryButton, setShowEntryButton] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simulation of decryption/loading
  useEffect(() => {
    if (!isAuthorized) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setShowEntryButton(true);
            return 100;
          }
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 100);
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  const handleAuthorizedEntry = () => {
    setIsAuthorized(true);
    // Initialize audio system
    sonar.init();
    sonar.resume();
    if (musicRef.current) {
      musicRef.current.play().catch(e => console.error("Erro ao iniciar áudio:", e));
    }
  };

  const WHATSAPP_GROUP_URL = import.meta.env.VITE_WHATSAPP_GROUP_URL || "https://ais-dev-t375qsjzvyft7d27lgy572-488833735931.us-east1.run.app/p/H0jwF5RVE7NWJv5gNbgF";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        // Pequeno delay para a pessoa ver que deu certo antes de liberar o botão do grupo
        setTimeout(() => {
          setQueueCount(prev => prev + 1);
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Terminal log simulation
  useEffect(() => {
    const logPool = [
      "DECRYPTING_LAYER_01...",
      "ARKHAM_CORE_DETECTED",
      "SIGNAL_STRENGTH_98%",
      "BYPASSING_FIREWALL...",
      "ENCRYPTED_PACKET_RECEIVED",
      "CONNECTION_ESTABLISHED",
      "PROTOCOL_V4_ONLINE"
    ];
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-3), logPool[Math.floor(Math.random() * logPool.length)]]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Initialize sound & music on first interaction
  useEffect(() => {
    musicRef.current = new Audio(MUSIC_URL);
    musicRef.current.loop = true;
    musicRef.current.volume = 0.4;

    const startAudio = () => {
      sonar.init();
      sonar.resume();
      musicRef.current?.play().catch(e => console.log("Audio play blocked:", e));
      
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('mousedown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
    document.addEventListener('mousedown', startAudio);
    
    return () => {
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('mousedown', startAudio);
      musicRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      sonar.tick(); 
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { seconds = 59; minutes--; }
        else if (hours > 0) { seconds = 59; minutes = 59; hours--; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-orange-500/30 overflow-x-hidden selection:text-white">
      <AnimatePresence>
        {!isAuthorized && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <MatrixBackground />
            </div>
            
            <div className="w-full max-w-md space-y-8 text-center relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex p-5 rounded-full bg-orange-500/5 border border-orange-500/20 mb-4"
              >
                <Skull className="w-14 h-14 text-orange-500 animate-pulse" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-[10px] font-mono tracking-[0.6em] text-orange-500 uppercase font-bold">Status: Bypass Necessário</h2>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tight">Protocolo Arkham</h1>
              </div>

              <div className="space-y-5">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5 p-[1px]">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-orange-300/40 tracking-[0.3em] font-bold">
                  <span>DECRYPTING_ARKHAM_CORE</span>
                  <span>{Math.floor(loadingProgress)}%</span>
                </div>
              </div>

              <div className="h-20 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {showEntryButton ? (
                    <motion.button
                      key="entry-btn"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAuthorizedEntry}
                      className="w-full py-5 bg-orange-500 text-black font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-[0_20px_50px_rgba(249,115,22,0.2)] text-[11px] group"
                    >
                      Acessar Terminal Arkham
                      <ArrowRight className="w-4 h-4 inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="loading-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-[9px] text-white/20 tracking-[0.5em] uppercase flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                      Sincronizando com Proxy de Camada 0...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="fixed bottom-12 left-0 right-0 text-[8px] text-white/10 font-mono tracking-[0.6em] uppercase text-center">
                Atenção: Acesso não autorizado resultará em wipe de hardware.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={!isAuthorized ? "opacity-0 invisible h-screen overflow-hidden" : "opacity-100 visible transition-all duration-1000 ease-out"}>
        <div className="noise" />
      
      {/* Background Atmosphere & Matrix */}
      <MatrixBackground />
      <div className="fixed inset-0 pointer-events-none overflow-hidden dot-grid">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-orange-500/[0.04] to-transparent" />
      </div>

      {/* Terminal Logs in the corner */}
      <div className="fixed top-4 left-4 lg:top-8 lg:left-8 z-50 pointer-events-none block">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <motion.div 
              key={log + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.3, x: 0 }}
              className="text-[9px] font-mono text-orange-500 tracking-widest uppercase"
            >
              {`> ${log}`}
            </motion.div>
          ))}
        </div>
      </div>

      <main 
        onClick={() => { sonar.init(); sonar.resume(); }}
        className="relative z-10 pt-24 pb-32 px-6 max-w-5xl mx-auto flex flex-col items-center cursor-default"
      >
        {/* Hero Section */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px] font-mono tracking-[0.2em] uppercase mb-10"
          >
            <ShieldAlert className="w-3 h-3 animate-pulse text-orange-500" />
            Protocolo Arkham
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              textShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "2px 0 10px rgba(249,115,22,0.4), -2px 0 10px rgba(0,255,255,0.2)",
                "0 0 0px rgba(0,0,0,0)"
              ]
            }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2, 
              ease: "easeOut",
              textShadow: { repeat: Infinity, duration: 2 }
            }}
            className="text-6xl md:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.05] text-white font-serif relative"
          >
            R$ 50.000 <br />
            <motion.span 
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="italic text-orange-500 neon-text drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              escondidos.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed group"
          >
            <span 
              className="glitch-text-wrapper inline-block" 
              data-text="Um labirinto digital de três camadas. Acesse o núcleo e resgate o que é seu por direito."
            >
              Um labirinto digital de três camadas. <br />
              Acesse o núcleo e resgate o que é seu por direito. 
            </span>
            <span className="block text-white font-medium mt-2 opacity-90 underline decoration-orange-500/30 underline-offset-8 decoration-2">A caça começa agora.</span>
          </motion.p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-32">
          <ChallengeCard 
            number="01" 
            title="A Fenda" 
            status="Status: Disponível" 
            description="O primeiro fragmento está escondido em plain text. Desafie sua percepção visual e lógica básica."
            isOpen={true}
            index={0}
          />
          <ChallengeCard 
            number="02" 
            title="Protocolo X" 
            status="Bloqueio de Camada" 
            description="Criptografia de ponta a ponta. Somente os que atravessarem a fenda terão as chaves de acesso."
            isOpen={false}
            index={1}
          />
          <ChallengeCard 
            number="03" 
            title="O Núcleo" 
            status="Terminal Final" 
            description="Encontre o que resta do Protocolo Arkham. O prêmio final está guardado por um enigma dinâmico."
            isOpen={false}
            index={2}
          />
        </div>

        {/* Capture Form Section */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           viewport={{ once: true }}
           className="w-full max-w-2xl relative"
        >
          <div className="absolute inset-0 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="glass-panel p-8 md:p-16 rounded-[2.5rem] relative overflow-hidden backdrop-blur-2xl group transition-all duration-700 hover:border-orange-500/20">
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Fingerprint className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-widest">{queueCount.toLocaleString()} Agentes Mobilizados</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-2">
                {isSubmitted ? "ACESSO LIBERADO" : "Entrar na Lista de Espera"}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm">
                {isSubmitted 
                  ? "Sua posição na fila foi garantida. Agora entre no grupo oficial." 
                  : "Receba o sinal via WhatsApp segundos antes da abertura oficial."}
              </p>
            </div>

            <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
              {!isSubmitted ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="ID DO AGENTE (NOME)" 
                      className="w-full bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-2xl focus:outline-none focus:border-orange-500/40 text-[16px] tracking-widest uppercase font-mono text-white placeholder:text-[10px] placeholder:tracking-widest transition-all focus:bg-white/[0.04]"
                    />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="CONTATO (WHATSAPP)" 
                      className="w-full bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-2xl focus:outline-none focus:border-orange-500/40 text-[16px] tracking-widest uppercase font-mono text-white placeholder:text-[10px] placeholder:tracking-widest transition-all focus:bg-white/[0.04]"
                    />
                  </div>
                  
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 md:py-6 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_20px_50px_rgba(249,115,22,0.2)] active:scale-[0.98] text-[10px] flex items-center justify-center gap-2 md:gap-3"
                  >
                    {isSubmitting ? "Sincronizando..." : "Ativar Protocolo de Aviso"} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <motion.a
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-6 md:py-8 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_20px_50px_rgba(34,197,94,0.2)] active:scale-[0.98] text-[12px] flex flex-col items-center justify-center gap-2"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" /> ENTRAR NO GRUPO VIP (WHATSAPP)
                  </span>
                  <span className="text-[8px] opacity-70 tracking-[0.4em]">Acesso Prioritário Liberado</span>
                </motion.a>
              )}

              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-mono opacity-60 pt-2">
                {isSubmitted ? "Não feche esta página até entrar no grupo." : "Sem spam. Só um aviso no WhatsApp quando abrir."}
              </p>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 px-6 py-6 md:px-8 md:py-10 flex flex-col md:flex-row justify-between items-center md:items-end border-t border-white/[0.03] bg-[#0a0a0a]/80 backdrop-blur-md z-40">
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-center md:text-left mb-4 md:mb-0"
        >
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Janela de Acesso</p>
          </div>
          <div className="text-3xl md:text-5xl font-mono tracking-tighter text-white font-black">
            {timeLeft.hours.toString().padStart(2, '0')}:
            <span className="text-orange-500">{timeLeft.minutes.toString().padStart(2, '0')}</span>:
            <span className="opacity-40">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-right hidden md:flex flex-col items-end font-mono"
        >
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-orange-200/50 mb-1 flex items-center gap-2">
            <Timer className="w-3 h-3 text-orange-500" /> Sincronização Ativa
          </div>
          <div className="text-white/20 text-[9px] leading-relaxed max-w-[200px]">
             ARKHAM_CORE_LIVE // AUDIO_TICK_ENABLED // ENCRYPTED_SIGNAL
          </div>
        </motion.div>
      </footer>
      </div>
    </div>
  );
}

function ChallengeCard({ number, title, status, description, isOpen, index }: { 
  number: string; 
  title: string; 
  status: string; 
  description: string; 
  isOpen: boolean;
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`premium-card p-10 rounded-[2rem] text-left relative group overflow-hidden ${
      !isOpen ? 'opacity-40 grayscale' : ''
    }`}>
      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      )}
      {!isOpen && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <Lock className="w-6 h-6 text-white/10" />
        </div>
      )}
      <div className="flex justify-between items-start mb-8">
        <span className={`text-4xl font-serif font-black transition-colors duration-500 ${isOpen ? 'text-orange-500/20 group-hover:text-orange-500/40' : 'text-slate-800'}`}>{number}</span>
        <div className={`px-3 py-1 text-[9px] rounded-full uppercase font-mono font-bold tracking-widest border transition-colors duration-500 ${
          isOpen ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 group-hover:border-orange-500/40' : 'bg-slate-900 border-white/5 text-slate-500'
        }`}>
          {status}
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-4 font-serif transition-colors duration-500 ${isOpen ? 'group-hover:text-orange-500' : ''}`}>{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed font-sans mb-8">{description}</p>
      
      {isOpen && (
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          className="h-[1px] bg-gradient-to-r from-orange-500/40 to-transparent"
        />
      )}
    </motion.div>
  );
}
