import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Shield, Award, LogOut, Sparkles, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[92%] max-w-5xl">
      <div className="glass-panel px-6 py-3 rounded-full flex justify-between items-center border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonCyan to-neonPurple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-wider font-display bg-gradient-to-r from-white via-cyan-200 to-neonCyan bg-clip-text text-transparent group-hover:text-glow-cyan transition-all">
            SPEAKWISE AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider font-display uppercase transition-colors ${
              isActive('/dashboard') ? 'text-neonCyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <Link
            to="/growth"
            className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider font-display uppercase transition-colors ${
              isActive('/growth') ? 'text-neonCyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award size={14} />
            Growth Curve
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider font-display uppercase transition-colors ${
                isActive('/admin') ? 'text-neonCyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield size={14} />
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors ${
              isActive('/profile') ? 'border-neonCyan/40 text-neonCyan' : 'text-gray-300'
            }`}
          >
            <User size={14} />
            <span className="text-xs font-medium font-mono hidden sm:inline">{user.username}</span>
            <span className="text-xs bg-neonPurple/40 text-neonPurple px-2 py-0.5 rounded-full border border-neonPurple/50 text-[10px]">
              Lvl {user.level}
            </span>
          </Link>

          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-display cursor-pointer bg-transparent border-none"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
