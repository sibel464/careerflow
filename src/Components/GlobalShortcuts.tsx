import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Keyboard } from 'lucide-react';
import { useEditor } from '../Hooks/EditorContext';
import { useTheme } from '../Hooks/ThemeContext';
import { useFocus } from '../Hooks/FocusContext';
import { useSpace } from '../Hooks/useSpace';
import { NAVIGATION, SETTINGS_ENTRY, SPACE_META } from '../Utils/navigation';
import { usePreferences } from '../Hooks/PreferencesContext';

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
};

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="min-w-7 h-7 px-2 inline-flex items-center justify-center text-xs font-black text-ink bg-glass/70 border border-glass/90 border-b-[3px] rounded-lg">
    {children}
  </kbd>
);

const Row: React.FC<{ label: string; keys: string[] }> = ({ label, keys }) => (
  <div className="flex items-center justify-between gap-3">
    <span>{label}</span>
    <span className="flex gap-1">{keys.map(k => <Key key={k}>{k}</Key>)}</span>
  </div>
);

/** Single-key shortcuts (N, D, F, ?) and "G then X" navigation, generated from the menus. */
export const GlobalShortcuts: React.FC<{ onOpenPalette: () => void }> = ({ onOpenPalette }) => {
  const navigate = useNavigate();
  const space = useSpace();
  const { openEditor } = useEditor();
  const { toggleTheme } = useTheme();
  const { toggle: toggleFocus } = useFocus();
  const [helpOpen, setHelpOpen] = useState(false);
  const { preferences } = usePreferences();
  const career = preferences.careerModule;
  const pendingGo = useRef<number | null>(null);

  useEffect(() => {
    const other = space === 'career' ? 'study' : 'career';
    const goTo: Record<string, string> = {
      ...Object.fromEntries([...(career ? NAVIGATION.career : []), ...NAVIGATION.study].map(e => [e.key, e.path])),
      y: SETTINGS_ENTRY[space].path,
      ...(career ? { s: SPACE_META[other].home } : {}),
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.key === 'Escape') { setHelpOpen(false); return; }
      if (document.querySelector('[role="dialog"], [role="alertdialog"]') && e.key !== '?') return;
      const key = e.key.toLowerCase();

      if (pendingGo.current !== null) {
        window.clearTimeout(pendingGo.current);
        pendingGo.current = null;
        if (goTo[key]) {
          e.preventDefault();
          navigate(goTo[key]);
        }
        return;
      }

      if (e.key === '?') { e.preventDefault(); setHelpOpen(o => !o); }
      else if (key === 'n' && space === 'career') { e.preventDefault(); openEditor(null); }
      else if (key === 'n' && space === 'study') navigate('/study/tasks');
      else if (key === 'd') toggleTheme();
      else if (key === 'f') toggleFocus();
      else if (e.key === '/') { e.preventDefault(); onOpenPalette(); }
      else if (key === 'g') pendingGo.current = window.setTimeout(() => { pendingGo.current = null; }, 1200);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [space, career, navigate, openEditor, toggleTheme, toggleFocus, onOpenPalette]);

  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-ink/25 backdrop-blur-md" onClick={() => setHelpOpen(false)} />
      <div role="dialog" aria-modal="true" aria-label="Klavye kısayolları" className="glass-panel bg-glass/80 dark:bg-cream/95 w-full max-w-2xl z-10 p-6 sm:p-8 animate-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-ink flex items-center gap-2"><Keyboard className="w-5 h-5 text-moss" /> Klavye Kısayolları</h2>
          <button onClick={() => setHelpOpen(false)} aria-label="Kapat" className="p-1.5 rounded-xl text-ink-muted hover:text-clay bg-glass/50"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-semibold text-ink-soft">
          <Row label="Komut paleti" keys={['Ctrl', 'K']} />
          <Row label="Hızlı arama" keys={['/']} />
          <Row label={space === 'career' ? 'Yeni başvuru' : 'Yeni görev'} keys={['N']} />
          <Row label="Tema değiştir" keys={['D']} />
          <Row label="Pomodoro başlat/duraklat" keys={['F']} />
          {career && <Row label="Diğer alana geç" keys={['G', 'S']} />}
          <Row label="Ayarlar" keys={['G', 'Y']} />
          <Row label="Bu pencere" keys={['?']} />
        </div>
        <div className="grid sm:grid-cols-2 gap-8 mt-6">
          {(career ? (['study', 'career'] as const) : (['study'] as const)).map(s => (
            <div key={s}>
              <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">{SPACE_META[s].emoji} {SPACE_META[s].name} alanı</p>
              <div className="space-y-3 text-sm font-semibold text-ink-soft">
                {NAVIGATION[s].map(e => <Row key={e.path} label={`${e.emoji} ${e.label}`} keys={['G', e.key.toUpperCase()]} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
