import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Moon, Sun, Plus, Play, Pause } from 'lucide-react';
import { useSpace } from '../Hooks/useSpace';
import { useFocus, formatClock } from '../Hooks/FocusContext';
import { useTheme } from '../Hooks/ThemeContext';
import { usePreferences } from '../Hooks/PreferencesContext';
import { useEditor } from '../Hooks/EditorContext';
import { NotificationsMenu } from './NotificationsMenu';
import { Avatar } from './Avatar';

interface NavbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onSearchClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { preferences } = usePreferences();
  const { openEditor } = useEditor();
  const space = useSpace();
  const focus = useFocus();
  const navigate = useNavigate();

  return (
    <header className="h-20 sm:h-24 glass-panel border-b-0 border-x-0 rounded-none sm:rounded-b-3xl sm:mx-6 flex items-center justify-between gap-3 px-4 sm:px-10 sticky top-0 z-30 mt-0 sm:mt-2">
      <div className="flex items-center min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          aria-label="Menüyü aç"
          className="md:hidden p-2 -ml-1 mr-1 text-ink-soft hover:text-moss rounded-xl hover:bg-glass/50 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          onClick={onSearchClick}
          className="flex items-center gap-3 pl-4 pr-3 py-3 w-full max-w-80 glass-input rounded-2xl text-sm text-ink-muted font-semibold hover:bg-glass/70 transition-all group"
        >
          <Search className="w-5 h-5 group-hover:text-moss transition-colors shrink-0" />
          <span className="flex-1 text-left truncate">{space === 'study' ? 'Ders, görev, sayfa ara… 📚' : 'Ne arıyoruz? 🌿'}</span>
          <kbd className="hidden sm:inline-block text-[10px] font-black bg-glass/60 border border-glass/80 rounded-md px-1.5 py-0.5">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <div className="hidden lg:block">
          {space === 'study' ? (
            <button
              onClick={() => (focus.running || focus.remaining < focus.total ? focus.toggle() : navigate('/study/focus'))}
              className="btn-primary px-4 py-2.5 text-sm shadow-md tabular-nums"
            >
              {focus.running ? <><Pause className="w-4 h-4 mr-1.5" /> {formatClock(focus.remaining)}</> : <><Play className="w-4 h-4 mr-1.5" /> {focus.remaining < focus.total ? formatClock(focus.remaining) : 'Odaklan'}</>}
            </button>
          ) : (
            <button onClick={() => openEditor(null)} className="btn-primary px-4 py-2.5 text-sm shadow-md">
              <Plus className="w-4 h-4 mr-1.5" /> Yeni
            </button>
          )}
        </div>

        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
          title={theme === 'dark' ? 'Aydınlık tema' : 'Karanlık tema'}
          className="p-3 text-ink-soft hover:text-moss rounded-xl hover:bg-glass/50 transition-all group"
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />}
        </button>

        <NotificationsMenu />

        <Link
          to={space === 'study' ? '/study/settings' : '/settings'}
          title={preferences.userName || 'Profil'}
          className="h-11 w-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm border-2 border-glass/80 hover:scale-105 transition-transform ml-1 shrink-0"
        >
          <Avatar config={preferences.look} className="w-full h-full" />
        </Link>
      </div>
    </header>
  );
};
