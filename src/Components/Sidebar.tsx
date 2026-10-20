import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Coffee, Music } from 'lucide-react';
import { FocusTimer } from './FocusTimer';
import { useApplications } from '../Hooks/ApplicationContext';
import { useStudy } from '../Hooks/useStudy';
import { useGarden } from '../Hooks/useGarden';
import { useSpace, Space } from '../Hooks/useSpace';
import { NAVIGATION, SETTINGS_ENTRY, SPACE_META, NavEntry } from '../Utils/navigation';
import { upcomingInterviews, isActive as isActiveApp, appliedThisWeek } from '../Utils/insights';
import { LEVELS } from '../Utils/achievements';
import { minutesOn, formatMinutes } from '../Utils/study';
import { usePreferences } from '../Hooks/PreferencesContext';
import { cn } from '../Utils/classNames';

const NavItem: React.FC<{ entry: NavEntry; badge?: number | string }> = ({ entry, badge }) => (
  <NavLink
    to={entry.path}
    end={entry.path === '/' || entry.path === '/study'}
    className={({ isActive }) => cn(
      'flex items-center px-4 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 group border',
      isActive
        ? 'text-moss bg-glass/70 shadow-sm border-glass/80'
        : 'text-ink-soft hover:bg-glass/40 hover:text-ink border-transparent'
    )}
  >
    {({ isActive }) => (
      <>
        <entry.icon className={cn('w-[18px] h-[18px] mr-3 shrink-0 transition-all', isActive ? 'text-moss scale-110' : 'text-ink-muted group-hover:text-moss')} />
        <span className="flex-1">{entry.label}</span>
        <span className={cn('text-base transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{entry.emoji}</span>
        {badge !== undefined && badge !== 0 && (
          <span className={cn('ml-2 text-[10px] font-black px-2 py-0.5 rounded-full', isActive ? 'bg-moss text-white' : 'bg-glass/70 text-ink-soft')}>
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

/** A small "how am I doing in this space" card at the bottom of the menu. */
const SpaceSummary: React.FC<{ space: Space }> = ({ space }) => {
  const { applications } = useApplications();
  const { preferences } = usePreferences();
  const { log, settings } = useStudy();
  const { level, levelProgress } = useGarden();

  if (space === 'study') {
    const today = minutesOn(log, new Date());
    return (
      <div className="px-3 py-2.5 rounded-xl bg-glass/40 border border-glass/60">
        <div className="flex justify-between text-[11px] font-bold mb-1.5">
          <span className="text-ink-soft">Bugün {formatMinutes(today)}</span>
          <span className="text-ink-muted">hedef {formatMinutes(settings.dailyGoal)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-sand/50 overflow-hidden">
          <div className="h-full bg-moss rounded-full transition-all duration-700" style={{ width: `${Math.min(today / settings.dailyGoal, 1) * 100}%` }} />
        </div>
      </div>
    );
  }

  const week = appliedThisWeek(applications).length;
  return (
    <div className="px-3 py-2.5 rounded-xl bg-glass/40 border border-glass/60 space-y-2">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-ink-soft">Bu hafta {week}/{preferences.weeklyGoal} başvuru</span>
        <span className="text-ink-muted">{LEVELS[level].emoji} Sv. {level + 1}</span>
      </div>
      <div className="h-1.5 rounded-full bg-sand/50 overflow-hidden">
        <div className="h-full bg-moss rounded-full transition-all duration-700" style={{ width: `${Math.min(week / preferences.weeklyGoal, 1) * 100}%` }} />
      </div>
      <div className="h-1 rounded-full bg-sand/30 overflow-hidden" title="Seviye ilerlemesi">
        <div className="h-full bg-sun rounded-full" style={{ width: `${levelProgress * 100}%` }} />
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const [showRadio, setShowRadio] = useState(false);
  const space = useSpace();
  const navigate = useNavigate();
  const { applications } = useApplications();
  const study = useStudy();
  const meta = SPACE_META[space];
  const { preferences } = usePreferences();

  const todayKey = new Date().toISOString().slice(0, 10);
  const badges: Record<string, number | string | undefined> = {
    '/applications': applications.filter(isActiveApp).length,
    '/calendar': upcomingInterviews(applications).length,
    '/study/tasks': study.tasks.filter(t => !t.done && t.due && t.due <= todayKey).length,
    '/study/motivation': `${study.coins.balance}🪙`,
  };

  return (
    <aside className="w-72 glass-panel flex flex-col h-[calc(100vh-2rem)] relative z-20">
      {/* Brand */}
      <div className="h-20 shrink-0 flex items-center px-7 border-b border-glass/40">
        <div key={space} className="h-12 w-12 bg-glass/60 rounded-xl flex items-center justify-center mr-3 shadow-sm border border-glass/80 animate-pop">
          {space === 'study' ? <span className="text-2xl" aria-hidden>🌙</span> : <Coffee className="w-6 h-6 text-moss" />}
        </div>
        <div className="leading-none">
          {space === 'study'
            ? <span className="font-hand text-[34px] font-bold text-ink leading-none">{meta.brand}<span className="text-clay">♡</span></span>
            : <span className="text-2xl font-black font-serif text-ink tracking-tight">{meta.brand}<span className="text-moss">.</span></span>}
          <p className="text-[10px] font-bold text-ink-muted mt-1.5">{meta.tagline}</p>
        </div>
      </div>

      {/* Space switcher: only when the career module is on */}
      {preferences.careerModule && <div className="px-4 pt-4">
        <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-glass/40 border border-glass/60" role="tablist" aria-label="Alan seç">
          <span
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-moss shadow-md transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ transform: space === 'study' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          {(['career', 'study'] as const).map(key => (
            <button
              key={key}
              role="tab"
              aria-selected={space === key}
              onClick={() => space !== key && navigate(SPACE_META[key].home)}
              className={cn('relative z-10 py-2 text-sm font-black rounded-xl transition-colors', space === key ? 'text-white' : 'text-ink-soft hover:text-ink')}
            >
              {SPACE_META[key].emoji} {SPACE_META[key].name}
            </button>
          ))}
        </div>
      </div>}

      {/* Menu */}
      <nav key={space} className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar animate-fade-in">
        {NAVIGATION[space].map(entry => (
          <React.Fragment key={entry.path}>
            {entry.section && <p className="px-4 pt-3 pb-1 first:pt-0 text-[10px] font-black uppercase tracking-[0.2em] text-ink-muted/80">{entry.section}</p>}
            <NavItem entry={entry} badge={badges[entry.path]} />
          </React.Fragment>
        ))}
        <div className="pt-3 mt-3 border-t border-glass/50">
          <NavItem entry={SETTINGS_ENTRY[space]} />
        </div>
      </nav>

      {/* Footer: space-specific companion widgets */}
      <div className="p-4 border-t border-glass/40 flex flex-col gap-3">
        <SpaceSummary space={space} />
        {space === 'study' && <FocusTimer />}
        {showRadio && (
          <iframe
            title="Lo-fi radyo"
            className="rounded-xl animate-fade-in"
            src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsnsnj?utm_source=generator&theme=0"
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
        <button
          onClick={() => setShowRadio(r => !r)}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-ink-soft hover:bg-glass/50 transition-colors group"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold">
            <span className="w-7 h-7 rounded-full bg-moss text-white flex items-center justify-center group-hover:scale-110 transition-transform"><Music className="w-3.5 h-3.5" /></span>
            Lo-fi Radyo
          </span>
          <span className="text-[11px] font-bold text-ink-muted">{showRadio ? 'Kapat' : 'Aç'}</span>
        </button>
      </div>
    </aside>
  );
};
