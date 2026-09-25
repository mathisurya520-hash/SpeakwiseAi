import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, TrendingUp, Calendar, Trophy, Sparkles, Flame, Eye } from 'lucide-react';

const GrowthDashboard = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [stats, setStats] = useState({ progressHistory: [], achievements: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      Promise.all([fetchStats(), fetchLeaderboard()]).finally(() => setLoading(false));
    }
  }, [token]);

  const fetchStats = async () => {
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

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/modules/community`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate mock heatmap data (28 grid squares)
  const heatmapSquares = Array.from({ length: 28 }, (_, i) => {
    const active = i % 5 === 0 || i % 7 === 0;
    return { day: i + 1, active };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display">
          Module 8: Growth Dashboard
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          Analyze Long-term Communication DNA and Success Timelines
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-400">
          Syncing progress analytics with database...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Progression Graph */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display mb-6 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-neonCyan" />
                Communication Growth Curve
              </h3>

              <div className="h-64 w-full text-xs font-mono">
                {stats.progressHistory && stats.progressHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.progressHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(11, 15, 25, 0.95)',
                          borderColor: 'rgba(6, 182, 212, 0.4)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Line type="monotone" dataKey="overall" stroke="#00f0ff" strokeWidth={2.5} name="Overall Score" />
                      <Line type="monotone" dataKey="confidence" stroke="#a855f7" strokeWidth={1.5} name="Confidence" />
                      <Line type="monotone" dataKey="vocabulary" stroke="#10b981" strokeWidth={1.5} name="Vocabulary" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    Insufficient data points. Complete speech exercises to construct progress timelines.
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display mb-2 flex items-center gap-1.5">
                <Calendar size={16} className="text-neonCyan" />
                Practice Heatmap
              </h3>
              <p className="text-[10px] text-gray-400 font-mono mb-4 uppercase">
                Visual representation of active learning days over the past 4 weeks
              </p>

              <div className="grid grid-cols-7 gap-2 max-w-sm">
                {heatmapSquares.map((sq) => (
                  <div
                    key={sq.day}
                    title={`Day ${sq.day}: ${sq.active ? 'Practice completed' : 'Inactive'}`}
                    className={`aspect-square rounded-md border flex items-center justify-center text-[8px] font-mono font-bold ${
                      sq.active
                        ? 'bg-neonCyan/20 border-neonCyan text-neonCyan shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                        : 'bg-black/40 border-white/5 text-gray-600'
                    }`}
                  >
                    {sq.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard and Badges */}
          <div className="lg:col-span-4 space-y-6">
            {/* Community Leaderboard */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
                <Trophy size={16} />
                Community Arena Rankings
              </h3>

              <div className="space-y-2.5">
                {leaderboard.map((u) => (
                  <div
                    key={u.rank}
                    className={`flex justify-between items-center p-2.5 border rounded-xl transition-all ${
                      u.isCurrentUser
                        ? 'bg-neonCyan/10 border-neonCyan shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold w-4 text-center ${
                        u.rank === 1 ? 'text-yellow-400' : u.rank === 2 ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        #{u.rank}
                      </span>
                      <span className="text-xs font-mono text-gray-300 font-medium">{u.username}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neonPurple font-bold block">Lvl {u.level}</span>
                      <span className="text-[9px] font-mono text-gray-400">IQ {u.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement inventory */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
                <Award size={16} />
                Unlocked Badges
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {stats.achievements && stats.achievements.length > 0 ? (
                  stats.achievements.map((ach) => (
                    <div
                      key={ach.badgeId}
                      className="bg-black/35 p-3 rounded-xl border border-neonCyan/20 text-center relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-neonCyan"></div>
                      <span className="text-xs font-bold text-white block truncate">{ach.title}</span>
                      <span className="text-[8px] text-gray-400 block mt-1 font-mono leading-relaxed truncate">
                        {ach.description}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500 text-xs font-mono py-6">
                    No badges earned. Score 80+ in training modules.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthDashboard;
