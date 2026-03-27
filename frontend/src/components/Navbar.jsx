import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 w-64 transition-all focus:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-3 group relative cursor-pointer py-1">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/20">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
          </div>

          <div className="absolute top-full right-0 mt-2 w-48 glass-panel py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors">
              <Settings size={16} /> Dashboard Settings
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/5 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
