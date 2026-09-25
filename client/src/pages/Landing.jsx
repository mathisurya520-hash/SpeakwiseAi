import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Sparkles, ArrowRight, CheckCircle, Play, AlertCircle, Award, TrendingUp, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

const Landing = () => {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('idle'); // idle -> listening -> analyzing -> result
  const [transcript, setTranscript] = useState('');
  const [recDuration, setRecDuration] = useState(0);
  const timerRef = useRef(null);

  // Check if user token exists and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Demo recording timer
  useEffect(() => {
    if (demoState === 'listening') {
      setRecDuration(0);
      timerRef.current = setInterval(() => {
        setRecDuration((prev) => {
          if (prev >= 10) {
            handleStopDemo();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [demoState]);

  const handleStartDemo = () => {
    setDemoState('listening');
    setTranscript("Analyzing your vocal pitch... Speak into your microphone now to calibrate Speakwise AI.");
    // Wait and update transcript for a real simulation experience
    setTimeout(() => {
      if (demoState === 'listening') {
        setTranscript("Analyzing speech... 'Hello and welcome. In this presentation, I want to basically cover our quarterly targets which are, like, very critical.'");
      }
    }, 4000);
  };

  const handleStopDemo = () => {
    setDemoState('analyzing');
    setTimeout(() => {
      setDemoState('result');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }, 2500);
  };

  const resetDemo = () => {
    setDemoState('idle');
    setTranscript('');
    setRecDuration(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      title: 'Speech Analyzer',
      desc: 'Record audio or video and get immediate structural flow metrics, pronunciation audits, and delivery feedback.',
      color: 'from-amber-500 to-yellow-500',
      glowColor: 'rgba(251, 191, 36, 0.4)'
    },
    {
      title: 'Group Discussion',
      desc: 'Simulate critical group tasks with 4 AI participants who hold distinct personalities and dynamic opinions.',
      color: 'from-red-500 to-rose-600',
      glowColor: 'rgba(239, 68, 68, 0.4)'
    },
    {
      title: 'Mock Interview',
      desc: 'Test job readiness in a realistic interview environment with dynamic sector-specific questions.',
      color: 'from-orange-500 to-red-600',
      glowColor: 'rgba(249, 115, 22, 0.4)'
    },
    {
      title: 'Debate Arena',
      desc: 'Engage in a competitive logical debate. Defend opinions against an aggressive AI counter-arguer.',
      color: 'from-yellow-500 to-red-500',
      glowColor: 'rgba(234, 179, 8, 0.4)'
    }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative pb-20 font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-neonCyan/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-80 right-1/4 w-[450px] h-[450px] bg-neonPurple/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Landing Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonCyan to-neonPurple flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.4)]">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-wider font-display bg-gradient-to-r from-white via-amber-200 to-neonCyan bg-clip-text text-transparent">
            SPEAKWISE AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs uppercase font-mono tracking-widest text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="glass-panel px-5 py-2 rounded-full border border-neonCyan/30 text-xs font-semibold uppercase tracking-widest text-neonCyan hover:bg-neonCyan/10 transition-all shadow-[0_0_15px_rgba(255,184,0,0.1)]">
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Description */}
        <motion.div 
          className="lg:col-span-6 space-y-6 text-left"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neonCyan/20 bg-neonCyan/5 text-xs text-neonCyan font-mono tracking-wider">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>Next-Generation Communication Mentor</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold tracking-tight font-display leading-[1.1] text-white">
            Master Your Speaking <br />
            <span className="bg-gradient-to-r from-neonCyan via-amber-300 to-neonPurple bg-clip-text text-transparent text-glow-cyan">
              With Confidence
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base text-gray-300 max-w-lg leading-relaxed font-sans">
            Level up your public speaking, group discussions, and mock interviews. Receive immediate structural flow metrics, filler word counts, and pronunciation audits powered by high-fidelity AI models.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-neonCyan to-neonPurple rounded-xl font-bold font-display uppercase tracking-wider text-xs hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] transition-all cursor-pointer glow-btn border-none flex items-center gap-2 group"
            >
              Get Started Free 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#sandbox" 
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold font-display uppercase tracking-wider text-xs transition-all flex items-center gap-2"
            >
              Try Sandbox
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md">
            <div>
              <div className="text-2xl font-bold text-neonCyan">7+</div>
              <div className="text-[10px] text-gray-400 uppercase font-mono tracking-widest mt-1">Simulator Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neonPurple">Real-Time</div>
              <div className="text-[10px] text-gray-400 uppercase font-mono tracking-widest mt-1">Vocal Feedback</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-[10px] text-gray-400 uppercase font-mono tracking-widest mt-1">Gamified Growth</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Hero Interactive Sandbox */}
        <motion.div 
          id="sandbox"
          className="lg:col-span-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(255,184,0,0.08)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-neonCyan">
                <div className="w-2.5 h-2.5 rounded-full bg-neonCyan animate-ping"></div>
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold">Interactive Sandbox</span>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400 font-mono">
                No Account Required
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-wider text-white uppercase font-display mb-3">
              Try Speakwise-AI Sandbox
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-mono">
              Experience our AI diagnostic capabilities. Tap start, speak or read the prompt, and review the instant delivery report.
            </p>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-6 min-h-[160px] flex flex-col justify-between relative mb-6">
              
              <AnimatePresence mode="wait">
                {demoState === 'idle' && (
                  <motion.div 
                    key="idle" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-neonCyan/10 border border-neonCyan/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.15)]">
                      <Mic size={24} className="text-neonCyan animate-pulse" />
                    </div>
                    <button 
                      onClick={handleStartDemo}
                      className="px-6 py-2.5 bg-neonCyan/15 text-neonCyan border border-neonCyan/40 hover:border-neonCyan hover:bg-neonCyan/25 rounded-full text-xs font-semibold uppercase tracking-wider font-mono transition-all cursor-pointer"
                    >
                      Start Free Simulation
                    </button>
                  </motion.div>
                )}

                {demoState === 'listening' && (
                  <motion.div 
                    key="listening"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex flex-col justify-between h-full"
                  >
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                      <span className="flex items-center gap-1.5 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        Recording Live
                      </span>
                      <span>0:0{recDuration} / 0:10</span>
                    </div>

                    <p className="text-xs text-gray-300 italic font-mono bg-black/20 p-3 rounded-lg border border-white/5 leading-relaxed">
                      {transcript}
                    </p>

                    {/* Speech Waves */}
                    <div className="flex justify-center items-end gap-1.5 h-10 py-1">
                      {[...Array(14)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-neonCyan rounded-full"
                          initial={{ height: 4 }}
                          animate={{ height: [4, Math.random() * 32 + 8, 4] }}
                          transition={{
                            duration: 0.8 + Math.random() * 0.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.05
                          }}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={handleStopDemo}
                      className="w-full py-3 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <Square size={12} />
                      Stop & Run Diagnostics
                    </button>
                  </motion.div>
                )}

                {demoState === 'analyzing' && (
                  <motion.div 
                    key="analyzing"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                  >
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-neonCyan animate-spin"></div>
                      <Sparkles size={20} className="text-neonCyan animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs uppercase font-mono tracking-widest text-neonCyan font-bold">Processing Stream</h4>
                      <p className="text-[10px] text-gray-500 font-mono">Gemini AI is generating verbal feedback...</p>
                    </div>
                  </motion.div>
                )}

                {demoState === 'result' && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5 text-neonCyan">
                        <Award size={16} />
                        <span className="text-xs uppercase font-mono tracking-wider font-bold">Sandbox Analysis</span>
                      </div>
                      <span className="text-lg font-bold text-neonCyan font-display">86/100</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-400 block uppercase">Pace Rating</span>
                        <span className="text-white font-bold block mt-0.5">138 WPM (Optimal)</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-400 block uppercase">Filler Words</span>
                        <span className="text-amber-400 font-bold block mt-0.5">2 Detected</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-400 block uppercase">Modulation</span>
                        <span className="text-white font-bold block mt-0.5">84% (High)</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-400 block uppercase">Confidence Index</span>
                        <span className="text-neonPurple font-bold block mt-0.5">88% (Strong)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed font-mono italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                      "Good pacing with clear tone modulation. Watch the filler word usage of 'basically' near the end of your intro. Strive for structured transitions."
                    </p>

                    <div className="flex gap-2">
                      <button 
                        onClick={resetDemo}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-colors cursor-pointer"
                      >
                        Reset Demo
                      </button>
                      <Link 
                        to="/signup"
                        className="flex-1 py-2.5 bg-gradient-to-r from-neonCyan to-neonPurple text-white rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-center flex items-center justify-center shadow-[0_0_15px_rgba(255,184,0,0.2)] hover:shadow-[0_0_20px_rgba(255,184,0,0.35)]"
                      >
                        Unlock Full Modules
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid Section */}
      <section className="max-w-6xl mx-auto px-6 mt-32 relative z-10">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neonPurple/20 bg-neonPurple/5 text-xs text-neonPurple font-mono tracking-wider uppercase">
            Powerful Integrations
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-wider uppercase font-display">
            MERN Training Classrooms
          </h2>
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest max-w-md mx-auto">
            Dynamic simulated modules to prepare you for job placements
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                y: -5,
                boxShadow: `0 10px 30px -10px ${feat.glowColor}`
              }}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:bg-neonCyan/5 transition-colors"></div>
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-lg mb-6`}>
                  <Sparkles size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-neonCyan transition-colors font-display">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-end text-xs font-semibold text-neonCyan group-hover:translate-x-1.5 transition-transform font-mono">
                Explore Portal &rarr;
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Footer banner */}
      <section className="max-w-4xl mx-auto px-6 mt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-12 rounded-3xl border border-neonCyan/20 text-center relative overflow-hidden shadow-[0_0_50px_rgba(255,184,0,0.1)]"
        >
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-neonCyan/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-neonPurple/10 rounded-full blur-[80px] pointer-events-none"></div>

          <h2 className="text-2xl md:text-4xl font-bold uppercase font-display tracking-wider mb-4">
            Ready to Speak Like a Pro?
          </h2>
          <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed mb-8">
            Create your account today, unlock all 7 simulator modules, save your historical diagnostic growth, and track your Placement Readiness IQ.
          </p>

          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neonCyan to-neonPurple rounded-xl font-bold font-display uppercase tracking-wider text-xs hover:shadow-[0_0_35px_rgba(255,184,0,0.45)] transition-all cursor-pointer glow-btn border-none"
          >
            Create Your AI Account
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
