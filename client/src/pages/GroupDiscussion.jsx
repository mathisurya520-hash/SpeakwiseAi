import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, MessageSquare, Send, Award, Users, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const GroupDiscussion = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);
  const [topic, setTopic] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  const topics = [
    "Will artificial intelligence completely replace creative professional writing?",
    "Should cryptocurrency and digital finance be heavily regulated by global entities?",
    "Is space exploration funding justified when earth is facing climate emergencies?",
    "Does remote work stifle long-term corporate collaboration and individual growth?"
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, botTyping]);

  const startDiscussion = async (selectedTopic) => {
    setTopic(selectedTopic);
    setMessages([]);
    setReport(null);
    setError('');
    setSessionActive(true);
    setBotTyping(true);

    try {
      const res = await fetch(`${API_URL}/modules/gd/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: selectedTopic, messages: [] })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([{
          sender: data.reply.sender,
          avatar: data.reply.avatar,
          content: data.reply.content,
          timestamp: new Date()
        }]);
      } else {
        setError(data.message || 'Error launching trainer.');
      }
    } catch (err) {
      setError('Connection to the MERN backend failed.');
    } finally {
      setBotTyping(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || botTyping) return;

    const userMsg = {
      sender: 'user',
      avatar: 'avatar1',
      content: userInput,
      timestamp: new Date()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setUserInput('');
    setBotTyping(true);

    try {
      // Map history payload
      const payload = updatedHistory.map(m => ({
        sender: m.sender,
        content: m.content
      }));

      const res = await fetch(`${API_URL}/modules/gd/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, messages: payload })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          sender: data.reply.sender,
          avatar: data.reply.avatar,
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
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 }
          });
        }
      } else {
        setError(data.message || 'AI processing failure.');
      }
    } catch (err) {
      setError('MERN server timeout.');
    } finally {
      setBotTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display flex items-center justify-center gap-2">
          Module 2: AI Group Discussion Trainer
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          Multi-Turn Conversation Simulation with Bot Characters
        </p>
      </div>

      {!sessionActive && !report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-base font-bold text-white font-display text-center uppercase tracking-wider">
            Select a Discussion Topic
          </h3>
          <div className="space-y-3">
            {topics.map((t, i) => (
              <button
                key={i}
                onClick={() => startDiscussion(t)}
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
          {/* Virtual board room participants */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-white/10 h-fit space-y-4">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
              <Users size={16} />
              Board Room Participants
            </h3>
            
            <div className="space-y-3">
              {[
                { name: "Siddharth (Visionary)", avatar: "avatar2", bg: "bg-cyan-950/20 text-cyan-400 border-cyan-500/20" },
                { name: "Ananya (Data Critic)", avatar: "avatar3", bg: "bg-purple-950/20 text-purple-400 border-purple-500/20" },
                { name: "Rohan (Mediator)", avatar: "avatar4", bg: "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" },
                { name: "Elena (Challenger)", avatar: "avatar5", bg: "bg-amber-950/20 text-amber-400 border-amber-500/20" }
              ].map(p => (
                <div key={p.name} className={`flex items-center gap-3 p-3 border rounded-xl ${p.bg}`}>
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center font-display font-semibold text-xs border border-white/10 uppercase">
                    {p.avatar.replace('avatar', '#')}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{p.name}</span>
                    <span className="text-[9px] uppercase font-mono text-gray-400">AI Simulated</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
              The conversation concludes automatically after {6 - messages.filter(m => m.sender === 'user').length} more user arguments.
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 flex flex-col h-[500px] overflow-hidden">
            <div className="p-4 bg-black/30 border-b border-white/5">
              <span className="text-[10px] uppercase font-mono text-gray-400">Current Topic</span>
              <h4 className="text-xs font-bold text-white truncate font-mono mt-0.5">{topic}</h4>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[80%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display border border-white/10 uppercase shrink-0 ${
                    m.sender === 'user' ? 'bg-neonCyan text-white' : 'bg-black/40 text-neonPurple'
                  }`}>
                    {m.sender === 'user' ? 'U' : m.sender.substring(0, 1)}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-mono ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-cyan-950 to-blue-950 text-white rounded-tr-none border border-neonCyan/20'
                      : 'bg-black/30 text-gray-300 rounded-tl-none border border-white/5'
                  }`}>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1 font-display uppercase tracking-wider">
                      {m.sender === 'user' ? 'You (Speaker)' : m.sender}
                    </span>
                    "{m.content}"
                  </div>
                </div>
              ))}
              {botTyping && (
                <div className="flex gap-3 max-w-[80%] items-center text-xs font-mono text-gray-500">
                  <RefreshCw size={14} className="animate-spin text-neonPurple" />
                  <span>Virtual participant is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-black/30 border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={botTyping ? "Wait for reply..." : "Type your debate or argument argument..."}
                disabled={botTyping}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={botTyping || !userInput.trim()}
                className="bg-gradient-to-r from-neonCyan to-neonPurple text-white px-5 py-3 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer disabled:opacity-50 border-none shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GD Session Report */}
      {report && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-neonCyan">
              <Award size={22} />
              <h3 className="text-xl font-display font-bold uppercase tracking-wider">Group Discussion Evaluation</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Overall Score</span>
              <span className="text-2xl font-bold text-neonCyan">{report.overallScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonPurple font-bold">Performance Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(report.metrics).map(([key, val]) => (
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
              <h4 className="text-xs uppercase font-mono tracking-widest text-neonCyan font-bold">AI Feedback Directives</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-mono bg-black/25 p-4 rounded-xl border border-white/5">
                "{report.feedback}"
              </p>
              <ul className="space-y-2">
                {report.suggestions.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-400 font-mono">
                    <span className="text-neonCyan">&bull;</span>
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
            Launch new board room
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

export default GroupDiscussion;
