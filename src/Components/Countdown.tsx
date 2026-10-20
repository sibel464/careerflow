import React from 'react';
import { useNow } from '../Hooks/useNow';
import { cn } from '../Utils/classNames';

/** Live days/hours/minutes/seconds boxes until `target`. */
export const Countdown: React.FC<{ target: string; compact?: boolean }> = ({ target, compact }) => {
  const now = useNow(1000);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const parts = [
    { label: 'gün', value: Math.floor(diff / 86400000) },
    { label: 'saat', value: Math.floor(diff / 3600000) % 24 },
    { label: 'dk', value: Math.floor(diff / 60000) % 60 },
    { label: 'sn', value: Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div className="flex gap-2">
      {parts.map(p => (
        <div
          key={p.label}
          className={cn(
            'flex-1 text-center rounded-xl bg-glass/60 border border-glass/80 shadow-sm',
            compact ? 'px-1.5 py-1.5' : 'px-2 py-2.5'
          )}
        >
          <p className={cn('font-black text-ink tabular-nums leading-none', compact ? 'text-lg' : 'text-2xl')}>
            {String(p.value).padStart(2, '0')}
          </p>
          <p className="text-[10px] font-bold text-ink-muted uppercase mt-1">{p.label}</p>
        </div>
      ))}
    </div>
  );
};
