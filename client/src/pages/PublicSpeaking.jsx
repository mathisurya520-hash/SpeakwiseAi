import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Award, AlertCircle, Calendar, CheckCircle, HelpCircle, Camera, CameraOff, 
  Mic, Play, Activity, Sparkles, Zap, ShieldAlert, BookOpen, Volume2, UserCheck, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const PublicSpeaking = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);

  // Speech Text & Mode State
  const [speechText, setSpeechText] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'draft'

  // Camera & Mic State
  const [cameraOn, setCameraOn] = useState(false);
  const [isLivePresenting, setIsLivePresenting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveMetrics, setLiveMetrics] = useState({
    wpm: 0,
    wordCount: 0,
    fillerCount: 0,
    confidence: 88
  });

  // Analysis & Backend State
  const [analyzing, setAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null); // contains analysis & report
  const [error, setError] = useState('');

  // Media & Speech Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOn(true);
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera/Microphone permission denied. Please enable device permissions in browser.");
      }
    }
  };

  // Setup Web Speech API for Live Public Speaking Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;

        const wordsArr = currentTranscript.trim().split(/\s+/).filter(Boolean);
        const wordCount = wordsArr.length;
        const fillerMatches = currentTranscript.match(/\b(um|uh|like|basically|you know|so|actually)\b/gi) || [];
        const fillerCount = fillerMatches.length;

        setLiveMetrics({
          wordCount,
          wpm: Math.round(wordCount * 1.4),
          fillerCount,
          confidence: Math.max(50, 96 - fillerCount * 3)
        });
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Start Live Speech Session
  const startLiveSpeech = () => {
    if (!cameraOn) {
      toggleCamera();
    }
    setIsLivePresenting(true);
    setTranscript('');
    transcriptRef.current = '';
    setError('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start notice:", e);
      }
    }
  };

  // Stop & Submit for AI Evaluation
  const handleEvaluate = async (textToSubmit) => {
    setIsLivePresenting(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }

    const payloadText = textToSubmit || transcriptRef.current || transcript || speechText;
    if (!payloadText || payloadText.trim().length === 0) {
      setError("Please deliver your speech live on camera or input a speech draft first.");
      return;
    }

    setAnalyzing(true);
    setError('');
    setReportData(null);

    try {
      const res = await fetch(`${API_URL}/modules/public-speaking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: payloadText })
      });

      const data = await res.json();
      if (res.ok) {
        setReportData({
          report: data.report,
          analysis: data.analysis || data.report
        });
        if (data.user) {
          updateLocalUser(data.user);
        }
        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.75 }
        });
      } else {
        setError(data.message || 'Speech evaluation failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const currentAnalysis = reportData?.analysis || reportData?.report;

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan text-xs font-mono tracking-widest uppercase">
          <Sparkles size={14} className="animate-spin" /> Live Camera & Voice Public Speaking Podium
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
          Module 3: Public Speaking Trainer
        </h1>
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest max-w-2xl mx-auto">
          Turn on your camera, step onto the virtual speech podium, speak live, and let AI detect and correct your delivery mistakes.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center border-b border-white/10 pb-4">
        <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-neonCyan to-neonPurple text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera size={15} /> Live Camera Podium Mode
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'draft'
                ? 'bg-gradient-to-r from-neonCyan to-neonPurple text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={15} /> Pre-Draft Script Mode
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Podium Camera or Draft Script Input */}
        <div className="lg:col-span-5 space-y-6">
          {activeTab === 'live' ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-xs uppercase font-mono tracking-widest text-neonCyan flex items-center gap-2">
                  <UserCheck size={16} /> Virtual Speech Stage
                </h3>
                <button
                  onClick={toggleCamera}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    cameraOn 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-white/5 text-gray-300 border-white/10'
                  }`}
                >
                  {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
                  {cameraOn ? 'Camera Active' : 'Switch Camera ON'}
                </button>
              </div>

              {/* Stage Viewport */}
              <div className="relative min-h-[300px] bg-gradient-to-b from-gray-950 via-slate-900 to-black rounded-xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-xl">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-[300px] object-cover ${cameraOn ? 'block' : 'hidden'}`} 
                />
                {!cameraOn && (
                  <div className="text-center p-6 text-gray-400 space-y-2">
                    <CameraOff size={36} className="mx-auto text-gray-600 animate-pulse" />
                    <p className="text-xs font-mono">Switch Camera ON to start practicing your speech posture & delivery.</p>
                  </div>
                )}
                {isLivePresenting && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white"></span> LIVE RECORDING
                  </div>
                )}
              </div>

              {/* Live Action Controls */}
              <div className="space-y-3">
                {!isLivePresenting ? (
                  <button
                    onClick={startLiveSpeech}
                    className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-3.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <Play size={16} /> Start Live Speech Session
                  </button>
                ) : (
                  <button
                    onClick={() => handleEvaluate(transcript)}
                    disabled={analyzing}
                    className="w-full bg-red-500 text-white py-3.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider hover:bg-red-600 transition-all flex items-center justify-center gap-2 cursor-pointer border-none animate-pulse"
                  >
                    <Activity size={16} /> {analyzing ? 'Evaluating Speech Delivery...' : 'Stop & Analyze Speech Delivery'}
                  </button>
                )}
              </div>

              {/* Real-time metrics bar */}
              {isLivePresenting && (
                <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-xl border border-neonCyan/30">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block uppercase">Words Spoken</span>
                    <span className="text-xs font-bold text-white font-mono">{liveMetrics.wordCount} words</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block uppercase">Speaking Pace</span>
                    <span className="text-xs font-bold text-neonCyan font-mono">{liveMetrics.wpm} WPM</span>
                  </div>
                </div>
              )}

              {/* Live Transcript Stream */}
              {transcript && (
                <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-xs font-mono space-y-1">
                  <span className="text-[9px] text-neonCyan font-bold uppercase tracking-widest block flex items-center gap-1">
                    <Mic size={12} className="animate-pulse" /> Live Speech Transcript:
                  </span>
                  <p className="text-gray-300 italic">"{transcript}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs uppercase font-mono tracking-widest text-gray-400 flex items-center gap-2">
                <BookOpen size={16} /> Pre-Draft Speech Script
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleEvaluate(speechText); }} className="space-y-4">
                <textarea
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder="Draft or paste your speech scripts here (minimum 30 words)..."
                  required
                  rows="11"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-neonCyan transition-colors font-mono leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={analyzing || !speechText.trim()}
                  className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50 border-none text-xs"
                >
                  {analyzing ? 'Evaluating Speech Structure...' : 'Analyze Script Delivery'}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Performance Analysis & Speech Mistake Correction Matrix */}
        <div className="lg:col-span-7">
          {currentAnalysis ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Score Badge Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-neonCyan">
                    <Award size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider font-display">
                      Public Speaking Delivery Report
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Overall Performance</span>
                    <span className="text-2xl font-bold text-neonCyan font-mono">{currentAnalysis.overallScore}/100</span>
                  </div>
                </div>

                {/* Speech Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentAnalysis.metrics && Object.entries(currentAnalysis.metrics).map(([key, val]) => (
                    <div key={key} className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[9px] uppercase font-mono text-gray-400 block">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block font-mono">
                        {key === 'speakingPace' ? `${val} WPM` : `${val}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRITICAL FEATURE: Detected Speech Mistakes & AI Corrections Matrix */}
              <div className="glass-panel p-6 rounded-2xl border border-neonCyan/30 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-display text-neonCyan flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-400" />
                    Detected Speech Mistakes & Rhetorical Corrections
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    Live Feedback Matrix
                  </span>
                </div>

                <div className="space-y-4">
                  {currentAnalysis.mistakesAndCorrections && currentAnalysis.mistakesAndCorrections.length > 0 ? (
                    currentAnalysis.mistakesAndCorrections.map((item, idx) => (
                      <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] uppercase font-bold border border-red-500/30">
                            Mistake #{idx + 1}: {item.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* What Speaker Said */}
                          <div className="bg-red-950/20 p-3 rounded-lg border border-red-500/20 space-y-1">
                            <span className="text-[9px] font-bold text-red-400 block uppercase">What You Spoke</span>
                            <p className="text-gray-300 italic">"{item.spoken}"</p>
                          </div>

                          {/* Corrected Sentence */}
                          <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 space-y-1">
                            <span className="text-[9px] font-bold text-emerald-400 block uppercase">Suggested Rhetorical Correction</span>
                            <p className="text-emerald-200 font-bold">"{item.correction}"</p>
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-400 flex items-start gap-1.5 pt-1 border-t border-white/5">
                          <Zap size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Coach Insight:</strong> {item.reason}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-black/30 p-4 rounded-xl text-center text-xs font-mono text-gray-400">
                      Clean rhetorical delivery! No major speech mistakes detected.
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              {(currentAnalysis.strengths || currentAnalysis.weaknesses) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAnalysis.strengths && (
                    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono uppercase block flex items-center gap-1.5">
                        <CheckCircle size={14} /> Key Speech Strengths
                      </span>
                      <ul className="space-y-1.5 font-mono text-xs text-gray-300">
                        {currentAnalysis.strengths.map((str, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span> {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentAnalysis.weaknesses && (
                    <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-2">
                      <span className="text-xs font-bold text-amber-400 font-mono uppercase block flex items-center gap-1.5">
                        <AlertCircle size={14} /> Areas to Refine
                      </span>
                      <ul className="space-y-1.5 font-mono text-xs text-gray-300">
                        {currentAnalysis.weaknesses.map((wk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span> {wk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Practice Growth Roadmap */}
              {currentAnalysis.improvementRoadmap && (
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-widest text-neonPurple font-bold flex items-center gap-2">
                    <Calendar size={16} /> 3-Week Speech Improvement Roadmap
                  </h4>
                  
                  <div className="border-l border-white/10 ml-3 pl-6 space-y-4 font-mono text-xs">
                    {currentAnalysis.improvementRoadmap.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-neonCyan ring-4 ring-cyan-950"></div>
                        <span className="text-[10px] font-bold text-neonCyan uppercase block">{item.phase || `Week ${idx+1}`}</span>
                        <p className="text-gray-300 mt-1 leading-relaxed">
                          {item.goal || item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <Award size={44} className="text-gray-700 animate-pulse mb-3" />
              <p className="text-xs font-mono">Start a live camera speech session or input a draft script to view real-time mistake corrections.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSpeaking;
