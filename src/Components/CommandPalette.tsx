import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Moon, Sun, CornerDownLeft, Timer, ArrowLeftRight, CheckCircle2, Sparkles, LucideIcon } from 'lucide-react';
import { useFocus } from '../Hooks/FocusContext';
import { useApplications } from '../Hooks/ApplicationContext';
import { useEditor } from '../Hooks/EditorContext';
import { useTheme } from '../Hooks/ThemeContext';
import { useSpace } from '../Hooks/useSpace';
import { useStudy } from '../Hooks/useStudy';
import { CompanyAvatar } from './CompanyAvatar';
import { StatusBadge } from './StatusBadge';
import { Application } from '../Interfaces';
import { NAVIGATION, SETTINGS_ENTRY, SPACE_META } from '../Utils/navigation';
import { usePreferences } from '../Hooks/PreferencesContext';
import { cn } from '../Utils/classNames';

interface CommandItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  emoji?: string;
  app?: Application;
  run: () => void;
}

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR');

/** Mounted only while open, so its state starts fresh each time. */
export const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const space = useSpace();
  const other = space === 'career' ? 'study' : 'career';
  const { applications } = useApplications();
  const { subjects, tasks } = useStudy();
  const { openEditor } = useEditor();
  const { theme, toggleTheme } = useTheme();
  const focus = useFocus();
  const { preferences } = usePreferences();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<CommandItem[]>(() => {
    const q = normalize(query.trim());
    const match = (...fields: (string | undefined)[]) => !q || fields.some(f => f && normalize(f).includes(q));
    const go = (path: string) => () => navigate(path);
    const here = SPACE_META[space].name;

    const pages = (s: typeof space, group: string): CommandItem[] =>
      [...NAVIGATION[s], SETTINGS_ENTRY[s]].map(e => ({
        id: `page-${e.path}`, group, label: e.label, hint: e.description, emoji: e.emoji, icon: e.icon, run: go(e.path),
      }));

    const actions: CommandItem[] = [
      ...(space === 'career'
        ? [{ id: 'new-app', group: 'Eylemler', label: 'Yeni başvuru ekle', hint: 'N', icon: Plus, run: () => openEditor(null) }]
        : [
            { id: 'focus', group: 'Eylemler', label: focus.running ? 'Odak seansını duraklat' : `Odak seansı başlat (${focus.plan.focus} dk)`, hint: 'F', icon: Timer, run: focus.toggle },
            { id: 'new-task', group: 'Eylemler', label: 'Yeni görev ekle', hint: 'Görevler sayfasına git', icon: Plus, run: go('/study/tasks') },
            { id: 'recap', group: 'Eylemler', label: '✨ Haftamı göster', hint: 'Haftanın özeti', icon: Sparkles, run: go('/study?haftam=1') },
          ]),
      ...(preferences.careerModule ? [{ id: 'switch', group: 'Eylemler', label: `${SPACE_META[other].emoji} ${SPACE_META[other].name} alanına geç`, hint: 'G S', icon: ArrowLeftRight, run: go(SPACE_META[other].home) }] : []),
      { id: 'theme', group: 'Eylemler', label: theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç', hint: 'D', icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
    ];

    const records: CommandItem[] = space === 'career'
      ? applications
          .filter(app => match(app.companyName, app.position, app.city, app.companyIndustry))
          .slice(0, 8)
          .map(app => ({ id: app.id, group: 'Başvurular', label: app.companyName, hint: app.position, app, run: () => openEditor(app) }))
      : [
          ...subjects.filter(s => match(s.name)).map(s => ({
            id: s.id, group: 'Dersler', label: s.name, emoji: s.emoji, hint: `${s.topics.filter(t => t.done).length}/${s.topics.length} konu`, run: go('/study/subjects'),
          })),
          ...tasks.filter(t => !t.done && match(t.title)).slice(0, 6).map(t => ({
            id: t.id, group: 'Görevler', label: t.title, icon: CheckCircle2, hint: subjects.find(s => s.id === t.subjectId)?.name, run: go('/study/tasks'),
          })),
        ];

    const all = [
      ...(q ? records : []),
      ...pages(space, `${here} alanı`),
      ...actions,
      ...(q ? [] : records),
      ...(preferences.careerModule ? pages(other, `${SPACE_META[other].name} alanı`) : []),
    ];
    return all.filter(item => item.app || item.group === 'Dersler' || item.group === 'Görevler' || match(item.label, item.hint));
  }, [query, space, other, applications, subjects, tasks, theme, navigate, openEditor, toggleTheme, focus, preferences.careerModule]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const runItem = (item?: CommandItem) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(items[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh] animate-fade-in">
      <div className="fixed inset-0 bg-ink/25 backdrop-blur-md" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Komut paleti" className="glass-panel bg-glass/80 dark:bg-cream/95 w-full max-w-xl z-10 overflow-hidden animate-pop shadow-[0_30px_80px_rgba(74,63,53,0.25)]">
        <div className="flex items-center px-5 border-b border-glass/60">
          <Search className="w-5 h-5 text-ink-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder={space === 'career' ? 'Firma, pozisyon, sayfa ya da komut ara… 🌿' : 'Ders, görev, sayfa ya da komut ara… 📚'}
            className="flex-1 bg-transparent px-4 py-5 text-base font-semibold text-ink placeholder:text-ink-muted outline-none"
          />
          <kbd className="text-[10px] font-black text-ink-muted bg-glass/60 border border-glass/80 rounded-md px-1.5 py-0.5">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="text-center text-sm font-bold text-ink-muted py-10">Hiçbir şey bulunamadı. 🍂</p>
          ) : items.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.group !== items[index - 1]?.group && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-muted">{item.group}</p>
              )}
              <button
                data-index={index}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => runItem(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                  index === activeIndex ? 'bg-moss/10 text-moss' : 'text-ink'
                )}
              >
                {item.app ? (
                  <CompanyAvatar name={item.app.companyName} className="h-9 w-9 text-xs rounded-lg" />
                ) : (
                  <span className="h-9 w-9 rounded-lg bg-glass/60 border border-glass/80 flex items-center justify-center shrink-0 text-base">
                    {item.emoji ?? (item.icon && <item.icon className="w-4 h-4" />)}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-sm truncate">{item.label}</span>
                  {item.hint && <span className="block text-xs font-semibold text-ink-muted truncate">{item.hint}</span>}
                </span>
                {item.app && <StatusBadge status={item.app.status} className="hidden sm:inline-flex" />}
                {index === activeIndex && <CornerDownLeft className="w-4 h-4 shrink-0 opacity-60" />}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
