import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mic, Users, MessageCircle, Presentation, Mail, Sword, BookOpen, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Dashboard = () => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [stats, setStats] = useState({ reportsCount: 0, achievementsCount: 0, recentReports: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_URL}/modules/growth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [scoreOffset, setScoreOffset] = useState(402);

  useEffect(() => {
    const score = user?.careerScore || 50;
    const targetOffset = 402 - (402 * score) / 100;
    const timer = setTimeout(() => {
      setScoreOffset(targetOffset);
    }, 200);
    return () => clearTimeout(timer);
  }, [user]);

  const radarData = user?.skills 
    ? Object.entries(user.skills).map(([key, val]) => ({
        subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: val,
      }))
    : [
        { subject: 'Pacing', value: 60 },
        { subject: 'Clarity', value: 70 },
        { subject: 'Filler Words', value: 80 },
        { subject: 'Structure', value: 65 },
        { subject: 'Modulation', value: 50 },
        { subject: 'Vocabulary', value: 75 }
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const modules = [
    {
      id: 'analyzer',
      title: 'Speech Analyzer',
      desc: 'Record audio or video and get immediate structural flow metrics, pronunciation audits, and delivery feedback.',
      icon: <Mic size={24} className="text-neonCyan" />,
      path: '/modules/analyzer',
      badge: 'Real-time'
    },
    {
      id: 'gd',
      title: 'Group Discussion',
      desc: 'Simulate critical group tasks with 4 AI participants who hold distinct personalities and dynamic opinions.',
      icon: <Users size={24} className="text-neonPurple" />,
      path: '/modules/gd',
      badge: 'Simulated'
    },
    {
      id: 'public-speaking',
      title: 'Public Speaking',
      desc: 'Deliver a verbal draft and receive structure metrics, modulation assessments, and long-term learning tracks.',
      icon: <MessageCircle size={24} className="text-neonCyan" />,
      path: '/modules/public-speaking',
      badge: 'Adaptive'
    },
    {
      id: 'presentation',
      title: 'Presentation Evaluator',
      desc: 'Upload slide contents or outline layouts for detailed hierarchy reviews, expected questions, and scripts.',
      icon: <Presentation size={24} className="text-neonPurple" />,
      path: '/modules/presentation',
      badge: 'Docs Audit'
    },
    {
      id: 'email',
      title: 'Email Assistant',
      desc: 'Format draft emails to exact business standards. Fix vocabulary metrics and toggle formal/informal tones.',
      icon: <Mail size={24} className="text-neonCyan" />,
      path: '/modules/email',
      badge: 'Synthesized'
    },
    {
      id: 'interview',
      title: 'Mock Interview',
      desc: 'Test job readiness in a realistic interview environment with dynamic sector-specific questions.',
      icon: <BookOpen size={24} className="text-neonPurple" />,
      path: '/modules/interview',
      badge: 'Career'
    },
    {
      id: 'debate',
      title: 'Debate Arena',
      desc: 'Engage in a competitive logical debate. Defend opinions against an aggressive AI counter-arguer.',
      icon: <Sword size={24} className="text-neonCyan" />,
      path: '/modules/debate',
      badge: 'Gamified'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-24 space-y-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 glass-panel p-8 rounded-3xl relative border border-white/10 flex flex-col justify-between overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.05)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neonCyan/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 text-neonCyan mb-3">
              <Sparkles size={18} />
              <span className="text-xs uppercase font-mono tracking-widest font-semibold">AI Assistant active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white">
              Greetings, <span className="bg-gradient-to-r from-neonCyan to-neonPurple bg-clip-text text-transparent">{user?.username}</span>
            </h1>
            <p className="text-sm text-gray-300 mt-3 max-w-lg leading-relaxed">
              Your speech matrices are updating live. Continue practicing today to extend your active streak and level up your placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 border-t border-white/5 pt-6">
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400">Streak Status</span>
              <div className="text-lg font-bold text-orange-400 mt-0.5 flex items-center gap-1">
                <Flame size={16} fill="currentColor" />
                {user?.streak || 0} Days
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400">Xp earned</span>
              <div className="text-lg font-bold text-neonPurple mt-0.5">{user?.experiencePoints || 0} XP</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400">Reports filed</span>
              <div className="text-lg font-bold text-white mt-0.5">{stats.reportsCount} Reports</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400">Achievements</span>
              <div className="text-lg font-bold text-neonCyan mt-0.5">{stats.achievementsCount} Unlocked</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.05)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-neonPurple/10 rounded-full blur-2xl"></div>
          
          <h3 className="text-xs uppercase tracking-widest font-mono text-gray-400 mb-4">Placement Readiness Score</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-gray-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-neonCyan"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={scoreOffset}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.5))',
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-display font-bold text-white">{user?.careerScore || 50}</span>
              <span className="text-[9px] uppercase font-mono text-gray-400 mt-0.5">Career IQ</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-neonPurple font-mono font-semibold">
            <TrendingUp size={14} />
            Level {user?.level || 1} {user?.communicationDNA?.archetype}
          </div>
        </motion.div>
      </div>

      {/* Interactive Communication DNA Matrix */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.02)] min-h-[350px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonPurple/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display mb-1 flex items-center gap-1.5">
              <Sparkles size={16} className="text-neonCyan animate-pulse" />
              Communication DNA Spectrum
            </h3>
            <p className="text-[10px] text-gray-400 font-mono uppercase mb-4">
              Visual map of your verbal strengths across key skills
            </p>
          </div>
          
          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" tick={{ fill: '#4b5563' }} />
                <Radar name={user?.username} dataKey="value" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.02)]">
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-neonCyan/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display mb-1">
              Archetype Profile
            </h3>
            <p className="text-[10px] text-gray-400 font-mono uppercase mb-4">
              AI Synthesis from MERN exercises
            </p>
            
            <div className="bg-neonPurple/15 border border-neonPurple/30 p-4 rounded-2xl mb-4 text-center">
              <span className="text-xs uppercase font-mono tracking-widest text-neonPurple font-bold block mb-1">Archetype</span>
              <span className="text-lg font-bold text-white font-display uppercase tracking-wide">
                {user?.communicationDNA?.archetype || 'Analyzing...'}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">
              {user?.communicationDNA?.description || 'Your verbal qualities are being compiled from active speech sessions. Complete modules to discover your communication archetype.'}
            </p>
          </div>

          {user?.communicationDNA?.strengths?.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase font-mono text-gray-400 block mb-2">Key Strengths</span>
              <div className="flex flex-wrap gap-1.5">
                {user?.communicationDNA?.strengths.map((s, i) => (
                  <span key={i} className="text-[9px] font-semibold bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-wider text-white uppercase font-display">
            MERN Training Modules
          </h2>
          <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400 font-mono">
            7 Simulator interfaces online
          </span>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {modules.map((m) => (
            <motion.div
              key={m.id}
              onClick={() => navigate(m.path)}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.025, 
                y: -4,
                boxShadow: '0 10px 30px rgba(6, 182, 212, 0.15)',
                borderColor: 'rgba(6, 182, 212, 0.4)'
              }}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] font-sans"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-neonCyan/40 transition-all">
                    {m.icon}
                  </div>
                  <span className="text-[9px] bg-neonCyan/15 text-neonCyan border border-neonCyan/30 px-2 py-0.5 rounded-full font-mono font-semibold uppercase">
                    {m.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-neonCyan transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end text-xs font-semibold text-neonCyan group-hover:translate-x-1.5 transition-transform font-mono">
                Launch Portal &rarr;
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
