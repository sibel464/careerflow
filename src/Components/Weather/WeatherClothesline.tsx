import React, { useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Droplets, Wind } from 'lucide-react';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { useNow } from '../../Hooks/useNow';
import { WEATHER_KEYS, Weather } from '../../Utils/weather';
import { CuteWeatherIcon } from './CuteWeatherIcon';
import { cn } from '../../Utils/classNames';

const TAGS = ['#fff6d6', '#ffe4ec', '#e4f2ff', '#e8f6e1', '#f3e8ff', '#ffeede', '#e0f7f4', '#fff0f0'];

/** A wooden clothespin. */
const Peg: React.FC = () => (
  <svg viewBox="0 0 14 30" className="w-3.5 h-7 drop-shadow-sm" aria-hidden>
    <rect x="1" y="0" width="5.5" height="30" rx="2" fill="#d9a86a" stroke="#a87a44" strokeWidth="0.8" />
    <rect x="7.5" y="0" width="5.5" height="30" rx="2" fill="#e6b97c" stroke="#a87a44" strokeWidth="0.8" />
    <rect x="0.5" y="12" width="13" height="4" rx="1" fill="#9aa1a9" />
  </svg>
);

/** The forecast pegged to a clothesline: every 3 hours, or the next five days. */
export const WeatherClothesline: React.FC = () => {
  const [cache] = useLocalStorage<Weather | null>(WEATHER_KEYS.cache, null);
  const [view, setView] = useState<'hours' | 'days'>('hours');
  const now = useNow(60_000);
  const hourly = cache?.hourly ?? [];
  const days = cache?.days ?? [];
  if (!hourly.length && !days.length) return null;

  const items = view === 'hours'
    ? hourly.map((h, i) => {
      const d = parseISO(h.time);
      const hour = d.getHours();
      return {
        key: h.time,
        top: i === 0 && Math.abs(d.getTime() - now) < 90 * 60 * 1000 ? 'Şimdi' : format(d, 'HH:mm'),
        sub: isToday(d) ? '' : isTomorrow(d) ? 'yarın' : format(d, 'EEE', { locale: tr }),
        sky: h.sky, night: hour >= 20 || hour < 6, label: h.label,
        main: `${h.temp}°`, foot: <><span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" />%{h.humidity}</span><span className="flex items-center gap-0.5"><Wind className="w-3 h-3" />{h.wind}</span></>,
      };
    })
    : days.map(d => {
      const date = parseISO(d.date);
      return {
        key: d.date,
        top: isTomorrow(date) ? 'Yarın' : format(date, 'EEEE', { locale: tr }),
        sub: format(date, 'd MMM', { locale: tr }),
        sky: d.sky, night: false, label: d.label,
        main: `${d.max}°`, foot: <span className="opacity-70">en düşük {d.min}°</span>,
      };
    });

  const n = items.length;
  const sagAt = (i: number) => { const t = (i + 0.5) / n; return 4 * t * (1 - t) * 26; };

  return (
    <div className="glass-panel p-5 sm:p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-ink">{view === 'hours' ? 'Saat saat' : '5 günlük'} hava 🧺</h3>
          <p className="text-xs font-semibold text-ink-muted">{cache?.city}{cache?.district ? ` · ${cache.district}` : ''} · Meteoroloji (MGM) verisi</p>
        </div>
        <div className="flex p-1 rounded-xl bg-glass/50 border border-glass/70">
          {([['hours', 'Saat saat'], ['days', '5 gün']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 rounded-lg text-xs font-black transition-all', view === v ? 'bg-moss text-white shadow' : 'text-ink-soft')}>{label}</button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 overflow-x-auto custom-scrollbar pb-2">
        <div className="relative" style={{ minWidth: n * 104 }}>
          {/* The rope, sagging between two posts */}
          <svg className="absolute inset-x-0 top-2 w-full h-10 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
            <path d="M0 2 Q50 54 100 2" fill="none" stroke="#a88a66" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
          <div key={view} className="relative grid pt-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {items.map((it, i) => (
              <div key={it.key} className="flex flex-col items-center animate-fade-in" style={{ marginTop: sagAt(i), animationDelay: `${i * 60}ms` }}>
                <Peg />
                <div className="wx-tag -mt-3 w-[92px] rounded-xl px-2 pt-3 pb-2 text-center shadow-[0_6px_12px_-6px_rgba(60,40,20,0.35)] border border-black/5"
                  style={{ background: TAGS[i % TAGS.length], animationDelay: `${-i * 0.4}s`, rotate: `${(i % 3) - 1}deg` }} title={it.label}>
                  <p className={cn('font-hand text-xl leading-none text-[#4a3326]', it.top === 'Şimdi' && 'text-[#c0392b]')}>{it.top}</p>
                  <p className="text-[10px] font-bold text-[#4a3326]/60 h-3 leading-3 capitalize">{it.sub}</p>
                  <CuteWeatherIcon sky={it.sky} night={it.night} className="w-14 h-14 mx-auto my-0.5" />
                  <p className="font-black text-2xl leading-none text-[#3b2a26]">{it.main}</p>
                  <p className="text-[10px] font-semibold text-[#4a3326]/70 leading-tight mt-0.5 line-clamp-2 min-h-[2.5em]">{it.label}</p>
                  <div className="flex justify-center gap-1.5 mt-1 text-[10px] font-bold text-[#4a3326]/65">{it.foot}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
