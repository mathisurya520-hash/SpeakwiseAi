import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sword, Send, Award, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const DebateArena = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);
  const [topic, setTopic] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiReplying, setAiReplying] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  const topics = [
    "Nuclear energy is the only viable path to carbon neutrality.",
    "Social media platforms should be legally held accountable for user-generated misinformation.",
    "A universal basic income would ultimately reduce workforce productivity.",
    "The colonization of Mars is an unnecessary diversion of earthly resources."
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, aiReplying]);

  const startDebate = async (selectedTopic) => {
    setTopic(selectedTopic);
    setHistory([]);
    setReport(null);
    setError('');
    setSessionActive(true);
    setAiReplying(true);

    try {
      const res = await fetch(`${API_URL}/modules/debate/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: selectedTopic, history: [] })
      });

      const data = await res.json();
      if (res.ok) {
        setHistory([{
          sender: 'ai',
          content: data.reply.content,
          timestamp: new Date()
        }]);
      } else {
        setError(data.message || 'Error launching debate.');
      }
    } catch (err) {
      setError('MERN Server communication failed.');
    } finally {
      setAiReplying(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || aiReplying) return;

    const userArg = {
      sender: 'user',
      content: userInput,
      timestamp: new Date()
    };

    const updatedHistory = [...history, userArg];
    setHistory(updatedHistory);
    setUserInput('');
    setAiReplying(true);

    try {
      const payload = updatedHistory.map(h => ({
        sender: h.sender,
        content: h.content
      }));

      const res = await fetch(`${API_URL}/modules/debate/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, history: payload })
      });

      const data = await res.json();
      if (res.ok) {
        setHistory(prev => [...prev, {
          sender: 'ai',
          content: data.reply.content,
          timestamp: new Date()
        }]);

        if (data.report) {
          setReport(data.report);
          setSessionActive(false);
          if (data.user) {
            updateLocalUser(data.user);
          }
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      } else {
        setError(data.message || 'AI processing failure.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setAiReplying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display flex items-center justify-center gap-2">
          Module 7: AI Debate Arena
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          Test Critical Thinking and Logic Fallacy Audits
        </p>
      </div>

      {!sessionActive && !report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-sm font-bold text-white font-display text-center uppercase tracking-wider">
            Select a Debate Proposition
          </h3>
          <div className="space-y-3">
            {topics.map((t, i) => (
              <button
                key={i}
                onClick={() => startDebate(t)}
                className="w-full text-left bg-black/40 border border-white/5 hover:border-neonCyan/40 p-4 rounded-xl text-xs text-gray-300 transition-colors font-mono leading-relaxed block"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Proposition Spec Panel */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-white/10 h-fit space-y-4">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
              <Sword size={16} />
              Debate Parameters
            </h3>
            
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] uppercase font-mono text-gray-400 block">Proposition</span>
              <p className="text-xs text-white leading-relaxed font-mono font-medium">
                "{topic}"
              </p>
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
              Defend your argument using logical evidence. Rebuttals end in {5 - history.filter(h => h.sender === 'user').length} turns.
            </div>
          </div>

          {/* Argument Chat Area */}
          <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 flex flex-col h-[500px] overflow-hidden">
            <div className="p-4 bg-black/30 border-b border-white/5">
              <span className="text-[10px] uppercase font-mono text-gray-400">Arena Status</span>
              <h4 className="text-xs font-bold text-neonCyan font-mono mt-0.5">Opponent Active</h4>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[80%] ${h.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display border border-white/10 uppercase shrink-0 ${
                    h.sender === 'user' ? 'bg-neonCyan text-white' : 'bg-black/40 text-neonPurple'
                  }`}>
                    {h.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-mono ${
                    h.sender === 'user'
                      ? 'bg-gradient-to-tr from-cyan-950 to-blue-950 text-white rounded-tr-none border border-neonCyan/20'
                      : 'bg-black/30 text-gray-300 rounded-tl-none border border-white/5'
                  }`}>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1 font-display uppercase tracking-wider">
                      {h.sender === 'user' ? 'You' : 'AI Opponent'}
                    </span>
                    "{h.content}"
                  </div>
                </div>
              ))}
              {aiReplying && (
                <div className="flex gap-3 max-w-[80%] items-center text-xs font-mono text-gray-500">
                  <RefreshCw size={14} className="animate-spin text-neonPurple" />
                  <span>AI is constructing counterargument...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-black/30 border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={aiReplying ? "Wait for opponent response..." : "Present your logical rebuttal argument..."}
                disabled={aiReplying}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={aiReplying || !userInput.trim()}
                className="bg-gradient-to-r from-neonCyan to-neonPurple text-white px-5 py-3 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer disabled:opacity-50 border-none shrink-0"
              >
                Rebut
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Debate Evaluation Report */}
      {report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-neonCyan">
              <Award size={22} />
              <h3 className="text-xl font-display font-bold uppercase tracking-wider">Debate Arena Report</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Critical Thinking Score</span>
              <span className="text-2xl font-bold text-neonCyan">{report.overallScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonPurple font-bold">Logic Analytics Breakdown</h4>
              <div className="space-y-3">
                {report.metrics && Object.entries(report.metrics).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-300 font-mono">{key.replace(/([A-Z])/g, ' $1')}</span>
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
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonCyan font-bold">Opponent Auditing</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-mono bg-black/25 p-4 rounded-xl border border-white/5">
                "{report.feedback}"
              </p>
              <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Leaderboard progression points awarded:</span>
                <span className="font-bold">+{report.leaderboardPoints || 100} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setReport(null)}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase transition-all cursor-pointer text-xs"
          >
            Launch new debate arena
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DebateArena;
