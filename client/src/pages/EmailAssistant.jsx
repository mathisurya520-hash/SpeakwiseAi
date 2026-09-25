import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';

const EmailAssistant = () => {
  const { token, updateLocalUser, API_URL } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [fromTone, setFromTone] = useState('Casual');
  const [toTone, setToTone] = useState('Professional');
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setConverting(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/modules/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalContent: content, fromTone, toTone })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.email);
        if (data.user) {
          updateLocalUser(data.user);
        }
      } else {
        setError(data.message || 'Email translation failed.');
      }
    } catch (err) {
      setError('MERN Server timeout.');
    } finally {
      setConverting(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.convertedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
          Module 5: Professional Email Assistant
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          Audit Grammar and Convert Business Communication Tones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input specifications */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-widest text-gray-400">Tone Settings</h3>
            
            <form onSubmit={handleConvert} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Source Tone</label>
                  <select
                    value={fromTone}
                    onChange={(e) => setFromTone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-all font-mono"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Informal">Informal</option>
                    <option value="Aggressive">Aggressive</option>
                    <option value="Wordy">Wordy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Target Tone</label>
                  <select
                    value={toTone}
                    onChange={(e) => setToTone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neonCyan transition-all font-mono"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Direct">Direct</option>
                    <option value="Conciliated">Conciliated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Email Draft</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or write your raw drafts here..."
                  required
                  rows="7"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-neonCyan transition-colors font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={converting || !content.trim()}
                className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-3.5 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer disabled:opacity-50 border-none text-xs"
              >
                {converting ? 'Recalibrating Tone...' : 'Convert Correspondence'}
              </button>
            </form>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output view */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6">
              {/* Output Content */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="text-xs uppercase font-mono text-neonCyan font-bold tracking-widest">Converted Draft ({toTone})</h4>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-mono uppercase bg-transparent border-none cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-xs font-mono text-gray-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {result.convertedContent}
                </div>
              </div>

              {/* Grammar Corrections */}
              {result.grammarErrors && result.grammarErrors.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-xs uppercase font-mono text-neonPurple font-bold tracking-widest">Grammatical Audits</h4>
                  <div className="space-y-3">
                    {result.grammarErrors.map((err, idx) => (
                      <div key={idx} className="bg-red-950/20 border border-red-500/20 p-3 rounded-xl text-xs font-mono">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-semibold">Flagged</span>
                          <span className="text-gray-400 line-through">"{err.error}"</span>
                        </div>
                        <div className="text-emerald-400 mt-1">
                          <span className="text-[10px] uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold mr-2">Correction</span>
                          "{err.correction}"
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Explanation: {err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[350px] glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <Mail size={40} className="text-gray-700 animate-pulse mb-3" />
              <p className="text-xs font-mono">Select target specifications and write your text to fetch tone conversions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAssistant;
