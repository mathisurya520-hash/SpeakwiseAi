import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIOrb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tip, setTip] = useState("Hello! I am your SpeakWise AI Mentor. Try our Mock Interview or Debate Arena to level up!");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const tips = [
    "Tip: Filler words like 'like' or 'basically' decrease audience confidence by 30%.",
    "Did you know? Consistent pitch modulation keeps audience engagement 2x higher.",
    "Ready for interviews? Try practicing the STAR method in Module 6.",
    "Debate Tip: Always identify and label logical fallacies to strengthen your rebuttals.",
    "GD Tip: Summarize diverse opinions to demonstrate leadership traits.",
    "Speaking speed tip: Aim for 130 to 150 words per minute for optimal clarity."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTip(randomTip);
      
      if (voiceEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(randomTip);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [voiceEnabled]);

  const speakCurrent = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(tip);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-80 glass-panel p-5 rounded-2xl border border-neonBlue/30 shadow-[0_0_25px_rgba(255,184,0,0.25)] mb-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-neonCyan">
                <Sparkles size={16} />
                <h4 className="text-sm font-semibold tracking-wider font-display uppercase">AI Mentor</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newVoiceState = !voiceEnabled;
                    setVoiceEnabled(newVoiceState);
                    if (newVoiceState) {
                      speakCurrent();
                    } else if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 font-mono">
              "{tip}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer overflow-visible bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 shadow-[0_0_30px_rgba(255,184,0,0.6)] focus:outline-none"
      >
        <div className="absolute inset-0 rounded-full bg-neonCyan opacity-30 blur-md group-hover:scale-110 transition-transform duration-300"></div>
        <div className="absolute -inset-1 rounded-full border border-neonCyan/30 animate-spin-slow"></div>
        
        <div className="w-14 h-14 rounded-full bg-darkBg flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-neonCyan to-neonPurple animate-pulse-slow blur-[3px]"></div>
          <MessageSquare className="text-white relative z-10" size={22} />
        </div>
      </button>
    </div>
  );
};

export default AIOrb;
