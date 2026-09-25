import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signup(username, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-12">
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 cursor-pointer z-20">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonCyan to-neonPurple flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          <Sparkles size={20} className="text-white animate-pulse" />
        </div>
        <span className="text-lg font-bold tracking-wider font-display bg-gradient-to-r from-white via-cyan-200 to-neonCyan bg-clip-text text-transparent">
          SPEAKWISE AI
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neonCyan/15 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neonPurple/15 rounded-full blur-[80px]"></div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
            Request Clearance
          </h2>
          <p className="text-xs text-gray-400 mt-2 font-mono uppercase tracking-widest">
            Create an account to start your professional progression
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-xs">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-wider font-display text-gray-300 uppercase mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Agent Name"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider font-display text-gray-300 uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider font-display text-gray-300 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neonCyan to-neonPurple text-white py-4 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer glow-btn disabled:opacity-50 border-none"
          >
            {loading ? 'Registering Agent...' : 'Create Credentials'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-neonCyan hover:underline font-semibold">
            Authenticate
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
