import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="h-24 glass-panel border-b-0 border-x-0 rounded-none sm:rounded-b-3xl sm:mx-6 flex items-center justify-between px-6 sm:px-10 transition-all duration-300 sticky top-0 z-30 mt-0 sm:mt-2">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 mr-2 text-[#6b4c3a] hover:text-[#2c5e4a] rounded-xl hover:bg-white/50 transition-all focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#a38b76] group-hover:text-[#2c5e4a] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Ne arıyoruz? 🌿"
            disabled
            className="pl-12 pr-4 py-3 w-80 glass-input rounded-2xl text-sm focus:outline-none text-[#4a3f35] opacity-70 cursor-not-allowed transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-5">
        <button className="p-3 text-[#6b4c3a] hover:text-[#2c5e4a] rounded-xl hover:bg-white/50 transition-all border border-transparent relative group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#c05c3e] border-2 border-white rounded-full"></span>
        </button>

        <div className="h-11 w-11 rounded-2xl bg-white/60 flex items-center justify-center text-xl shadow-sm border border-white/80 hover:scale-105 transition-transform cursor-pointer ml-2 backdrop-blur-md">
          🦊
        </div>
      </div>
    </header>
  );
};
