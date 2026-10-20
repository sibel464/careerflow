import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useFocus, formatClock } from '../Hooks/FocusContext';
import { cn } from '../Utils/classNames';

/** Compact pomodoro widget for the sidebar. */
export const FocusTimer: React.FC = () => {
  const { mode, remaining, total, running, sessions, toggle, reset, switchMode } = useFocus();
  const progress = 1 - remaining / total;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn(
      'p-3 bg-glass/50 backdrop-blur-md rounded-xl border shadow-sm transition-colors',
      running ? 'border-moss/40' : 'border-glass/80'
    )}>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" className="stroke-sand/60" />
            <circle
              cx="24" cy="24" r={radius} fill="none" strokeWidth="4" strokeLinecap="round"
              className={cn('transition-[stroke-dashoffset] duration-300', mode === 'focus' ? 'stroke-clay' : 'stroke-moss')}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <span className={cn('absolute inset-0 flex items-center justify-center text-lg', running && 'animate-pulse')}>
            {mode === 'focus' ? '🍅' : mode === 'long' ? '🌴' : '☕'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black text-ink tabular-nums leading-none">{formatClock(remaining)}</p>
          <div className="flex gap-1 mt-1.5">
            {(['focus', 'break'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  'text-[10px] font-black px-1.5 py-0.5 rounded-md transition-colors',
                  (mode === m || (m === 'break' && mode === 'long')) ? 'bg-ink/10 text-ink' : 'text-ink-muted hover:text-ink'
                )}
              >
                {m === 'focus' ? 'Odak' : 'Mola'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={toggle}
            aria-label={running ? 'Duraklat' : 'Başlat'}
            className="w-8 h-8 rounded-lg bg-moss text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={reset}
            aria-label="Sıfırla"
            className="w-8 h-6 rounded-lg text-ink-muted hover:text-ink hover:bg-glass/60 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {sessions > 0 && (
        <p className="text-[10px] font-bold text-ink-muted mt-2">
          Toplam {sessions} odak seansı {'🍅'.repeat(Math.min(sessions, 5))}
        </p>
      )}
    </div>
  );
};
