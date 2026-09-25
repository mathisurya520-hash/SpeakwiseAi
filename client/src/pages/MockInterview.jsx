import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Video, HelpCircle, AlertCircle, Award, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const MockInterview = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);
  const [jobTitle, setJobTitle] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (sessionActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [sessionActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.warn("Camera access blocked. Rendering simulated face scan.", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startInterview = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);
    setAnswers([]);
    setCurrentIdx(0);
    setCurrentAnswer('');

    try {
      const res = await fetch(`${API_URL}/modules/interview/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobTitle })
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setSessionActive(true);
      } else {
        setError(data.message || 'Error fetching questions.');
      }
    } catch (err) {
      setError('MERN Server communication timeout.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    setAnswers(prev => [...prev, currentAnswer]);
    setCurrentAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      submitAnswers([...answers, currentAnswer]);
    }
  };

  const submitAnswers = async (allAnswers) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/modules/interview/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle,
          questions,
          answers: allAnswers
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setSessionActive(false);
        if (data.user) {
          updateLocalUser(data.user);
        }
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError(data.message || 'Error evaluating interview.');
      }
    } catch (err) {
      setError('MERN Server connection timed out.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
          Module 6: Mock Interview Analyzer
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          Test Placement Readiness in a Futuristic Scanning Environment
        </p>
      </div>

      {!sessionActive && !report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md mx-auto space-y-6">
          <div className="text-center">
            <Video size={40} className="mx-auto text-neonCyan mb-2 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Configure Job Specs</h3>
          </div>

          <form onSubmit={startInterview} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer, Product Manager"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jobTitle.trim()}
              className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer disabled:opacity-50 border-none text-xs"
            >
              {loading ? 'Generating Board Questions...' : 'Initialize Interface'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Video Scanner Overlay box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel rounded-2xl border border-white/10 relative overflow-hidden aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              
              {/* Holographic scanner grid overlays */}
              <div className="absolute inset-0 border border-neonCyan/30 rounded-2xl pointer-events-none hologram-grid"></div>
              
              {/* Face scanning box indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-neonCyan/50 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-[8px] uppercase font-mono text-neonCyan bg-black/75 px-2 py-0.5 rounded border border-neonCyan/20">
                  Tracking Eye Contact & Face
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-black/30 rounded-xl border border-white/5 text-[10px] text-gray-400 font-mono leading-relaxed">
              Verify your camera settings and align your face in the tracking perimeter. Answer questions clearly.
            </div>
          </div>

          {/* Question Flow */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                <span className="text-neonCyan uppercase font-semibold">Live Mock Interview</span>
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex gap-3">
                <HelpCircle className="text-neonPurple shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-white leading-relaxed font-mono font-medium">
                  "{questions[currentIdx]}"
                </p>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Formulate your response..."
                rows="6"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-all font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={submitting || !currentAnswer.trim()}
              className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer disabled:opacity-50 border-none text-xs"
            >
              {submitting ? 'Auditing Interview Responses...' : currentIdx < questions.length - 1 ? 'Save & Next Question' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      )}

      {/* Mock Evaluation Report */}
      {report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-neonCyan">
              <Award size={22} />
              <h3 className="text-xl font-display font-bold uppercase tracking-wider">Interview Analytics</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Job Readiness Index</span>
              <span className="text-2xl font-bold text-neonCyan">{report.overallScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonPurple font-bold">Metrics breakdown</h4>
              <div className="space-y-3">
                {report.scores && Object.entries(report.scores).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-300 font-mono">{key}</span>
                      <span className="font-bold text-white">{val}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-neonCyan to-neonPurple h-full transition-all duration-500"
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonCyan font-bold">AI Diagnostics</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-mono bg-black/25 p-4 rounded-xl border border-white/5">
                "{report.feedback}"
              </p>
              <ul className="space-y-2">
                {report.suggestions?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-400 font-mono">
                    <ChevronRight size={14} className="text-neonCyan shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setReport(null)}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase transition-all cursor-pointer text-xs"
          >
            Launch new interview panel
          </button>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
