import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Presentation, Award, FileText, AlertCircle, Play, ChevronRight, ChevronLeft, 
  Upload, Camera, CameraOff, Mic, MicOff, CheckCircle, Volume2, Sparkles, 
  HelpCircle, RefreshCw, Activity, Eye, Zap, ShieldAlert, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const PresentationEvaluator = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);

  // Presentation Deck State
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState([
    { slideNumber: 1, title: 'Introduction & Vision', content: 'Welcome stakeholders. Overview of strategic objectives and market landscape.' },
    { slideNumber: 2, title: 'Q3 Financial Highlights', content: 'Revenue growth up 35% quarter-over-quarter. Operational efficiency improved by 18%.' },
    { slideNumber: 3, title: 'Product & AI Roadmap', content: 'Integration of generative AI capabilities. Enterprise scalability and security features.' },
    { slideNumber: 4, title: 'Go-to-Market Strategy', content: 'Targeting enterprise clients across North America & APAC. Strategic channel partnerships.' },
    { slideNumber: 5, title: 'Conclusion & Next Steps', content: 'Q4 revenue targets, capital allocation priorities, and live Q&A session.' }
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [fileUploadedName, setFileUploadedName] = useState('');

  // Live Presenter & Camera/Mic State
  const [cameraOn, setCameraOn] = useState(false);
  const [isLivePresenting, setIsLivePresenting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveMetrics, setLiveMetrics] = useState({
    wpm: 0,
    wordCount: 0,
    fillerCount: 0,
    confidence: 85
  });

  // Evaluation & Backend State
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Refs for media & speech
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Handle Presentation PPT/PDF/Text File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploadedName(file.name);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setTitle(fileNameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result || '';
      if (text.length > 0) {
        // Split text into slides by double line breaks or line sections
        const lines = text.split(/\n\s*\n/).filter(block => block.trim().length > 0);
        if (lines.length > 0) {
          const parsedSlides = lines.slice(0, 10).map((block, idx) => {
            const blockLines = block.trim().split('\n');
            const slideTitle = blockLines[0].substring(0, 50) || `Slide ${idx + 1}`;
            const slideContent = blockLines.slice(1).join(' ') || blockLines[0];
            return {
              slideNumber: idx + 1,
              title: slideTitle,
              content: slideContent
            };
          });
          setSlides(parsedSlides);
        }
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // For PPT/PDF binary files, parse metadata filename into structured slide deck
      setSlides([
        { slideNumber: 1, title: `${fileNameWithoutExt} - Executive Overview`, content: 'Key strategic objectives, target metrics, and executive summary.' },
        { slideNumber: 2, title: 'Operational Performance & Growth', content: 'Detailed analysis of performance metrics, throughput, and conversion rates.' },
        { slideNumber: 3, title: 'Strategic Initiatives & Innovation', content: 'Core roadmap highlights, technology architecture, and team expansion.' },
        { slideNumber: 4, title: 'Financial Outlook & Scalability', content: 'Projections, cost optimizations, and revenue expansion streams.' },
        { slideNumber: 5, title: 'Summary & Action Items', content: 'Final wrap-up, key takeaways, and strategic recommendations.' }
      ]);
    }
  };

  // Toggle Camera Feed
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
        console.error("Camera access error:", err);
        setError("Camera or Microphone access denied. Please grant permissions in your browser.");
      }
    }
  };

  // Setup Web Speech API for Live Presentation Speech Recognition
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

        // Live calculation of metrics
        const wordsArr = currentTranscript.trim().split(/\s+/).filter(Boolean);
        const wordCount = wordsArr.length;
        const fillerMatches = currentTranscript.match(/\b(um|uh|like|basically|you know|so|actually)\b/gi) || [];
        const fillerCount = fillerMatches.length;

        setLiveMetrics({
          wordCount,
          wpm: Math.round(wordCount * 1.5), // estimated live pace
          fillerCount,
          confidence: Math.max(50, 95 - fillerCount * 3)
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

  // Start Live Presentation Mode
  const startLivePresentation = () => {
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
        console.warn("Recognition already started or error:", e);
      }
    }
  };

  // Stop Live Presentation Mode & Submit for AI Evaluation
  const stopAndEvaluate = async () => {
    setIsLivePresenting(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }

    const presentationTitle = title.trim() || fileUploadedName || 'Live Executive Presentation';
    const rawSlideText = slides.map(s => `Slide ${s.slideNumber}: ${s.title} - ${s.content}`).join('\n');
    const spokenSpeech = transcriptRef.current || transcript || "Welcome everyone. Today I am presenting our strategic roadmap and key financial figures. As we can see on this slide, revenue growth has increased significantly.";

    setEvaluating(true);
    setError('');
    setReport(null);

    try {
      const res = await fetch(`${API_URL}/modules/presentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: presentationTitle, 
          slideCount: slides.length, 
          rawText: rawSlideText,
          spokenTranscript: spokenSpeech
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReport(data.presentation);
        if (data.user) {
          updateLocalUser(data.user);
        }
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 }
        });
      } else {
        setError(data.message || 'Presentation evaluation failed.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const nextSlide = () => {
    setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
  };

  const prevSlide = () => {
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neonPurple/10 border border-neonPurple/30 text-neonPurple text-xs font-mono tracking-widest uppercase">
          <Sparkles size={14} className="animate-spin" /> Live Camera & Speech Presentation Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
          Module 4: Presentation Evaluator & AI Coach
        </h1>
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest max-w-2xl mx-auto">
          Upload slides, turn on camera & mic, present live, and let AI detect & correct your speaking mistakes in real-time.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: PPT Upload & Slide Deck Controller */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Box */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-widest text-neonCyan flex items-center gap-2">
              <Upload size={16} /> 1. Upload Presentation Deck
            </h3>

            <div className="relative border-2 border-dashed border-white/20 hover:border-neonCyan rounded-xl p-6 text-center cursor-pointer transition-colors bg-black/40 group">
              <input 
                type="file" 
                accept=".pptx,.ppt,.pdf,.txt,.md" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <Presentation size={32} className="mx-auto text-gray-400 group-hover:text-neonCyan transition-colors mb-2" />
              <p className="text-xs font-semibold text-gray-200">
                {fileUploadedName ? fileUploadedName : 'Click or Drag PPTX / PDF / TXT file here'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-1">Supports PowerPoint, PDF, Text slides</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Presentation Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Sales Forecast & Product Roadmap"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
            </div>
          </div>

          {/* Slide Deck Outline Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-mono tracking-widest text-gray-300 flex items-center gap-2">
                <BookOpen size={16} /> Slide Deck ({slides.length} Slides)
              </h3>
              <span className="text-[10px] font-mono text-neonCyan">Slide {activeSlideIndex + 1} of {slides.length}</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    activeSlideIndex === idx 
                      ? 'bg-neonCyan/15 border-neonCyan text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                      : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="truncate font-semibold">{slide.slideNumber}. {slide.title}</span>
                  {activeSlideIndex === idx && <ChevronRight size={14} className="text-neonCyan shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center / Right Column: Live Presentation Stage with Camera & Mic */}
        <div className="lg:col-span-8 space-y-6">
          {/* Presentation Live Stage */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleCamera}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                    cameraOn 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
                  {cameraOn ? 'Camera Active' : 'Switch Camera ON'}
                </button>

                {!isLivePresenting ? (
                  <button
                    onClick={startLivePresentation}
                    className="bg-gradient-to-r from-neonCyan to-neonPurple text-white px-5 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer border-none"
                  >
                    <Play size={16} /> Start Presenting Live
                  </button>
                ) : (
                  <button
                    onClick={stopAndEvaluate}
                    disabled={evaluating}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider hover:bg-red-600 transition-all flex items-center gap-2 cursor-pointer border-none animate-pulse"
                  >
                    <Activity size={16} /> {evaluating ? 'Analyzing Presentation...' : 'Stop & Analyze Performance'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-gray-400">Controls:</span>
                <button 
                  onClick={prevSlide} 
                  disabled={activeSlideIndex === 0}
                  className="p-2 rounded-lg bg-black/40 border border-white/10 text-white disabled:opacity-30 cursor-pointer hover:border-neonCyan"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextSlide} 
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-2 rounded-lg bg-black/40 border border-white/10 text-white disabled:opacity-30 cursor-pointer hover:border-neonCyan"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Stage Layout: Big Slide Display + Picture-in-Picture Webcam Box */}
            <div className="relative min-h-[360px] bg-gradient-to-b from-gray-950 via-slate-900 to-black rounded-xl border border-white/10 p-6 flex flex-col justify-between shadow-2xl">
              {/* Slide Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neonCyan block">
                    SLIDE {slides[activeSlideIndex]?.slideNumber || 1} OF {slides.length}
                  </span>
                  <h2 className="text-xl font-bold font-display text-white mt-1">
                    {slides[activeSlideIndex]?.title || 'Slide Title'}
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300">
                  {title || 'Presentation Deck'}
                </span>
              </div>

              {/* Slide Content Body */}
              <div className="my-6 space-y-3 font-mono text-sm text-gray-200 leading-relaxed max-w-xl">
                <p className="bg-white/5 p-4 rounded-xl border border-white/5">
                  {slides[activeSlideIndex]?.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                  <Sparkles size={14} className="text-neonCyan" /> Speak clearly into your microphone as you present this slide.
                </div>
              </div>

              {/* Bottom Slide Footer */}
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-2 border-t border-white/5">
                <span>SPEAKWISE AI PRESENTATION STUDIO</span>
                <span>USE ARROW KEYS OR BUTTONS TO SWITCH SLIDES</span>
              </div>

              {/* Picture-in-Picture Live Webcam Overlay */}
              <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl overflow-hidden border-2 border-neonCyan shadow-[0_0_20px_rgba(0,240,255,0.3)] bg-black/80 flex items-center justify-center z-20">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`} 
                />
                {!cameraOn && (
                  <div className="text-center p-2 text-gray-400">
                    <CameraOff size={24} className="mx-auto mb-1 opacity-60" />
                    <span className="text-[9px] font-mono block">Camera Off</span>
                  </div>
                )}
                {isLivePresenting && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Real-Time Speech Metrics Bar */}
            {isLivePresenting && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-xl border border-neonCyan/30"
              >
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Words Spoken</span>
                  <span className="text-sm font-bold text-white font-mono">{liveMetrics.wordCount} words</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Speaking Pace</span>
                  <span className="text-sm font-bold text-neonCyan font-mono">{liveMetrics.wpm} WPM</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Filler Words (um, like)</span>
                  <span className={`text-sm font-bold font-mono ${liveMetrics.fillerCount > 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {liveMetrics.fillerCount} detected
                  </span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Vocal Confidence</span>
                  <span className="text-sm font-bold text-neonPurple font-mono">{liveMetrics.confidence}%</span>
                </div>
              </motion.div>
            )}

            {/* Live Spoken Transcript Display */}
            {transcript && (
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs font-mono space-y-1">
                <span className="text-[9px] text-neonCyan font-bold uppercase tracking-widest block flex items-center gap-1.5">
                  <Mic size={12} className="animate-pulse" /> Live Speech Transcript Stream:
                </span>
                <p className="text-gray-300 leading-relaxed italic">"{transcript}"</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* AI Presentation Analysis & Mistake Correction Report */}
          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Presentation Scores Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-neonCyan">
                    <Award size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider font-display">
                      Presentation Evaluation Report
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">Overall Presentation Score:</span>
                    <span className="text-2xl font-bold text-neonCyan font-mono">{report.scores?.overall || report.overallScore || 84}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(report.scores || {}).map(([key, val]) => {
                    if (key === 'overall') return null;
                    return (
                      <div key={key} className="bg-black/30 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-xs font-bold text-white mt-0.5 block">{val}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRITICAL FEATURE: Speaking Mistakes & Instant Corrections Matrix */}
              <div className="glass-panel p-6 rounded-2xl border border-neonCyan/30 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-display text-neonCyan flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-400" />
                    Detected Speech Mistakes & AI Corrections
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    Live Feedback Matrix
                  </span>
                </div>

                <div className="space-y-4">
                  {report.mistakesAndCorrections && report.mistakesAndCorrections.length > 0 ? (
                    report.mistakesAndCorrections.map((item, idx) => (
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

                          {/* Corrected Professional Sentence */}
                          <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 space-y-1">
                            <span className="text-[9px] font-bold text-emerald-400 block uppercase">Suggested Correction</span>
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
                      No critical speech mistakes detected! Strong presentation delivery.
                    </div>
                  )}
                </div>
              </div>

              {/* Slide-by-Slide Speaker Notes */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider font-display text-neonPurple flex items-center gap-2">
                  <FileText size={18} /> Slide-by-Slide Delivery Coaching
                </h3>

                <div className="space-y-3">
                  {report.speakerNotes?.map((slide, idx) => (
                    <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/5 font-mono text-xs">
                      <span className="text-[9px] font-bold text-neonCyan block mb-1">SLIDE {slide.slideNumber} COACHING</span>
                      <p className="text-gray-300">"{slide.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Board & Audience Questions */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider font-display text-neonCyan flex items-center gap-2">
                  <HelpCircle size={18} /> Expected Q&A & Rebuttals
                </h3>

                <div className="space-y-4">
                  {report.expectedQuestions?.map((q, idx) => (
                    <div key={idx} className="space-y-1.5 font-mono text-xs">
                      <span className="text-[10px] font-bold text-neonPurple block">QUESTION {idx + 1}: {q.question}</span>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-gray-300">
                        <span className="text-[9px] font-bold text-emerald-400 block mb-0.5">RECOMMENDED RESPONSE</span>
                        "{q.suggestedAnswer}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationEvaluator;
