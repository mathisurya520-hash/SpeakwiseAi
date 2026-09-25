import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, Database, HelpCircle, Trash2, ShieldAlert } from 'lucide-react';

const AdminPanel = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      Promise.all([fetchStats(), fetchUsers()]).finally(() => setLoading(false));
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRole = async (id) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessage('User role updated successfully.');
        fetchUsers();
        fetchStats();
      } else {
        setError('Failed to update role.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Remove user account permanently?")) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessage('User removed successfully.');
        fetchUsers();
        fetchStats();
      } else {
        setError('Failed to remove user.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wider text-glow-cyan text-white uppercase font-display flex items-center justify-center gap-2">
          <Shield size={28} className="text-neonCyan animate-pulse" />
          Admin Control Center
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-widest">
          System Diagnostics and Platform Moderation
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-400">
          Fetching system parameters...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Status grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono text-gray-400">Total Registered Users</span>
              <span className="text-2xl font-bold text-white block mt-2">{stats?.totalUsers || 0} Accounts</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono text-gray-400">Overall Reports Processed</span>
              <span className="text-2xl font-bold text-neonPurple block mt-2">{stats?.totalReports || 0} Reports</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono text-gray-400">Platform Average Score</span>
              <span className="text-2xl font-bold text-neonCyan block mt-2">{stats?.averageScore || 0}% Accuracy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* System Status Tracker */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
                <Database size={16} />
                Environment Metrics
              </h3>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-gray-400">Database Status:</span>
                  <span className="text-emerald-400 font-bold">{stats?.systemStatus?.database}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-gray-400">Server Heartbeat:</span>
                  <span className="text-emerald-400 font-bold">{stats?.systemStatus?.apiServer}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-gray-400">Gemini SDK Module:</span>
                  <span className="text-neonCyan font-bold">{stats?.systemStatus?.geminiApi}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-gray-400">Live API Requests:</span>
                  <span className="text-white font-bold">{stats?.aiUsage?.liveCalls}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-gray-400">Simulated Requests:</span>
                  <span className="text-white font-bold">{stats?.aiUsage?.mockCalls}</span>
                </div>
              </div>
            </div>

            {/* Moderation user table list */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neonCyan flex items-center gap-2">
                  <Users size={16} />
                  User accounts index
                </h3>
                {message && <span className="text-[10px] text-emerald-400 font-mono">{message}</span>}
                {error && <span className="text-[10px] text-red-400 font-mono">{error}</span>}
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2.5">Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">IQ</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 text-gray-300">
                        <td className="py-3 font-semibold">{u.username}</td>
                        <td className="py-3 text-[11px] text-gray-400">{u.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            u.role === 'admin' ? 'bg-neonPurple/25 text-neonPurple border border-neonPurple/40' : 'bg-black/35 text-gray-500 border border-white/5'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-neonCyan font-bold">{u.careerScore}</td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => toggleRole(u._id)}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-gray-300 px-2 py-1 rounded cursor-pointer"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="bg-red-950/20 border border-red-500/20 hover:bg-red-500/10 text-[10px] text-red-400 px-2 py-1 rounded cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
