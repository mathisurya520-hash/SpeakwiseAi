import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, User, Flame, Award, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || 'avatar1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    const updateData = { username, avatar };
    if (password) updateData.password = password;

    const res = await updateProfile(updateData);
    setSaving(false);

    if (res.success) {
      setMessage('Profile updated successfully.');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      setPassword('');
    } else {
      setError(res.message || 'Error updating profile.');
    }
  };

  const nextLvlXp = (user?.level || 1) * 100;
  const xpPercent = Math.min(100, Math.round(((user?.experiencePoints || 0) / nextLvlXp) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative border border-white/10 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-neonCyan to-neonPurple"></div>
            
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-neonCyan to-neonPurple p-1 shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-4">
              <div className="w-full h-full bg-darkBg rounded-full flex items-center justify-center text-3xl font-display font-bold uppercase text-white">
                {user?.username?.substring(0, 2) || 'SW'}
              </div>
            </div>

            <h3 className="text-xl font-bold tracking-wider text-white">{user?.username}</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">{user?.email}</p>

            <div className="flex justify-center gap-4 mt-6">
              <div className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Level</span>
                <span className="text-lg font-bold text-neonPurple">{user?.level}</span>
              </div>
              <div className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Streak</span>
                <span className="text-lg font-bold text-orange-400 flex items-center gap-1">
                  <Flame size={16} fill="currentColor" />
                  {user?.streak || 0}
                </span>
              </div>
              <div className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Career Score</span>
                <span className="text-lg font-bold text-neonCyan">{user?.careerScore || 50}</span>
              </div>
            </div>

            <div className="mt-6 text-left">
              <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                <span>XP: {user?.experiencePoints} / {nextLvlXp}</span>
                <span>{xpPercent}%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-neonCyan to-neonPurple h-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative border border-white/10 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-neonPurple/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2 mb-4 text-neonCyan">
              <Cpu size={18} />
              <h4 className="text-sm font-bold uppercase tracking-wider font-display">AI Communication DNA</h4>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Archetype</span>
                <span className="text-base font-bold text-white bg-neonPurple/20 px-3 py-1 rounded-md border border-neonPurple/30 inline-block mt-1">
                  {user?.communicationDNA?.archetype || 'Unexplored'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Description</span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {user?.communicationDNA?.description}
                </p>
              </div>

              {user?.communicationDNA?.strengths?.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Key Strengths</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.communicationDNA?.strengths?.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative">
            <h4 className="text-lg font-bold tracking-wider text-white mb-6 uppercase font-display flex items-center gap-2">
              <User size={18} className="text-neonCyan" />
              Agent Configuration
            </h4>

            {message && (
              <div className="mb-4 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-2">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-neonCyan transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-3">Custom Holographic Avatar</label>
                <div className="flex gap-3">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-mono uppercase transition-all ${
                        avatar === av
                          ? 'border-neonCyan bg-neonCyan/20 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'border-white/10 bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {av.replace('avatar', '#')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-neonCyan to-neonPurple text-white px-6 py-3 rounded-xl font-bold tracking-wider font-display uppercase hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50 border-none"
              >
                {saving ? 'Saving Specs...' : 'Update Agent Specs'}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-bold tracking-wider text-white mb-6 uppercase font-display flex items-center gap-2">
              <Award size={18} className="text-neonCyan" />
              Communication Diagnostics Matrix
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(user?.skills || {}).map(([skill, val]) => (
                <div key={skill} className="bg-black/35 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="capitalize text-gray-300 font-mono">{skill.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-bold text-neonCyan">{val}%</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-neonCyan to-neonPurple h-full transition-all duration-500"
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
