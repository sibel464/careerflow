import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BarChart2, Settings, Coffee, BookOpen, Music } from 'lucide-react';
import { cn } from '../Utils/classNames';

const dailyQuotes = [
  { text: "Büyümeye devam et!", emoji: "🌻" },
  { text: "Bugün harika bir gün olacak.", emoji: "✨" },
  { text: "Küçük adımlar, büyük sonuçlar.", emoji: "🌱" },
  { text: "Derin bir nefes al ve başla.", emoji: "☕" },
  { text: "Kendine inan, sen yaparsın!", emoji: "🌟" },
  { text: "Kariyerin bir maratondur.", emoji: "🏃‍♀️" }
];

export const Sidebar: React.FC = () => {
  const [quote, setQuote] = useState(dailyQuotes[0]);
  const [showRadio, setShowRadio] = useState(false);

  useEffect(() => {
    // Pick a random quote on mount
    setQuote(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);
  }, []);

  const navItems = [
    { name: 'Pano ☕', path: '/', icon: LayoutDashboard },
    { name: 'Başvurular 🌿', path: '/applications', icon: Briefcase },
    { name: 'Analizler 📊', path: '/analytics', icon: BarChart2 },
    { name: 'Hazırlık 📚', path: '/preparation', icon: BookOpen },
    { name: 'Ayarlar ⚙️', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 glass-panel flex flex-col h-[calc(100vh-2rem)] relative z-20">
      <div className="h-24 flex items-center px-8 border-b border-white/40 relative overflow-hidden">
        <div className="h-12 w-12 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center mr-3 shadow-sm border border-white/80">
          <Coffee className="w-6 h-6 text-[#2c5e4a]" />
        </div>
        <span className="text-2xl font-black font-serif text-[#4a3f35] tracking-tight">
          CareerFlow <span className="text-[#2c5e4a]">.</span>
        </span>
      </div>
      
      <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'text-[#2c5e4a] bg-white/60 shadow-sm border border-white/80 backdrop-blur-md'
                  : 'text-[#6b4c3a] hover:bg-white/40 hover:text-[#4a3f35] border border-transparent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300 relative z-10',
                    isActive 
                      ? 'text-[#2c5e4a] scale-110' 
                      : 'group-hover:text-[#2c5e4a] group-hover:scale-110 text-[#a38b76]'
                  )}
                />
                <span className="relative z-10 tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-5 border-t border-white/40 flex flex-col space-y-4 bg-white/10">
        
        {/* Bohem Radyo (Lofi Girl Spotify Embed) */}
        <div className="relative">
          {showRadio ? (
            <div className="animate-fade-in mb-2 transition-all">
              <iframe 
                style={{ borderRadius: '12px' }} 
                src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsnsnj?utm_source=generator&theme=0" 
                width="100%" 
                height="80" 
                frameBorder="0" 
                allowFullScreen={false} 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              ></iframe>
            </div>
          ) : null}
          <button 
            onClick={() => setShowRadio(!showRadio)}
            className="w-full flex items-center justify-between p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/80 shadow-sm group hover:bg-white/70 transition-all"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2c5e4a] text-white flex items-center justify-center text-sm mr-3 shadow-md group-hover:scale-110 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-[#4a3f35]">Bohem Radyo</p>
            </div>
            <span className="text-xs text-[#6b4c3a] font-medium px-2 py-1 bg-white/60 rounded-md">
              {showRadio ? 'Kapat 🌿' : 'Dinle ☕'}
            </span>
          </button>
        </div>

        {/* Günün Mottosu */}
        <div className="flex items-center p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/80 shadow-inner group cursor-default">
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-lg mr-3 shadow-sm">
            {quote.emoji}
          </div>
          <div>
            <p className="text-xs font-bold text-[#4a3f35]">Günün Mottosu</p>
            <p className="text-[10px] text-[#6b4c3a] mt-0.5 font-medium leading-tight pr-1">{quote.text}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
