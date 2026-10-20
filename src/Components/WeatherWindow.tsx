import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { useNow } from '../Hooks/useNow';
import { WEATHER_KEYS, Weather, SKY_LABEL, adviceFor, dayPartOf, fetchWeather, DayPart } from '../Utils/weather';
import { cn } from '../Utils/classNames';

const SKIES: Record<DayPart, string> = {
  night: 'linear-gradient(180deg, #0f1733 0%, #1f2b55 55%, #3a3f6b 100%)',
  dawn: 'linear-gradient(180deg, #6d7fc4 0%, #f2a8a0 55%, #ffd7a3 100%)',
  day: 'linear-gradient(180deg, #5fa6e0 0%, #9cc9ee 60%, #d8ecf7 100%)',
  dusk: 'linear-gradient(180deg, #3d3a78 0%, #c76b8a 50%, #f5a65b 100%)',
};
const GREY: Record<DayPart, string> = {
  night: 'linear-gradient(180deg, #1a1d29, #2c3040)',
  dawn: 'linear-gradient(180deg, #8a8fa6, #c8b9b2)',
  day: 'linear-gradient(180deg, #8d99a8, #c7d0d9)',
  dusk: 'linear-gradient(180deg, #5b5670, #a88a8a)',
};

const STALE = 30 * 60 * 1000;

/** A window on the home page: real local weather, the actual time of day, curtains and a sill. */
export const WeatherWindow: React.FC = () => {
  const [city, setCity] = useLocalStorage<string>(WEATHER_KEYS.city, 'Samsun');
  const [cache, setCache] = useLocalStorage<Weather | null>(WEATHER_KEYS.cache, null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const now = new Date(useNow(60000));
  const part = dayPartOf(now);

  const weather = cache;
  // Fallback (non-MGM) readings are retried after a few minutes rather than kept for half an hour.
  const fresh = !!cache && now.getTime() - cache.fetchedAt < (cache.source === 'MGM' ? STALE : 3 * 60 * 1000)
    && cache.city.toLocaleLowerCase('tr-TR').startsWith(city.toLocaleLowerCase('tr-TR').slice(0, 3));
  const loading = !fresh && !error;

  useEffect(() => {
    if (fresh) return;
    let alive = true;
    fetchWeather(city)
      .then(w => { if (alive) { setCache(w); setError(null); } })
      .catch(() => { if (alive) setError('Hava durumu alınamadı'); });
    return () => { alive = false; };
  }, [city, fresh, setCache]);

  const sky = weather?.sky ?? 'clear';
  const overcast = ['cloudy', 'rain', 'drizzle', 'storm', 'snow', 'fog'].includes(sky);
  const clouds = sky === 'clear' ? 0 : sky === 'partly' ? 3 : 6;
  const h = now.getHours() + now.getMinutes() / 60;
  // Sun travels 6:00 → 20:00, moon 20:00 → 6:00.
  const sunX = Math.min(Math.max((h - 6) / 14, 0), 1);
  const moonX = ((h + 4) % 24) / 10;
  const isNight = part === 'night';
  const cloudColor = isNight ? '#4a5170' : sky === 'storm' || sky === 'rain' ? '#9aa3ad' : overcast ? '#e1e5ea' : part === 'dusk' ? '#f6d2c4' : '#ffffff';

  return (
    <div className="relative">
      {/* Curtains */}
      <div className="curtain curtain-left" aria-hidden />
      <div className="curtain curtain-right" aria-hidden />

      <div className="window-frame relative mx-6 sm:mx-12 rounded-t-xl p-2.5 sm:p-3">
        <div className="relative h-52 sm:h-60 rounded-md overflow-hidden" style={{ background: overcast ? GREY[part] : SKIES[part] }} role="img"
          aria-label={weather ? `${weather.city}: ${weather.temp}°, ${weather.label ?? SKY_LABEL[sky]}` : 'Pencere'}>
          {/* Stars */}
          {isNight && !overcast && Array.from({ length: 28 }, (_, i) => (
            <span key={i} className="absolute w-[2px] h-[2px] rounded-full bg-white animate-[twinkle_3s_ease-in-out_infinite]"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 55}%`, animationDelay: `${(i % 7) * 0.4}s` }} />
          ))}
          {/* Sun or moon */}
          {!isNight ? (
            <span className={cn('absolute w-14 h-14 rounded-full transition-all duration-1000', overcast && 'opacity-30 blur-[2px]')}
              style={{ left: `calc(${sunX * 86}% + 2%)`, top: `${12 + Math.abs(sunX - 0.5) * 70}%`, background: part === 'day' ? 'radial-gradient(circle, #fff7d1 30%, #ffd86b 70%)' : 'radial-gradient(circle, #fff1d6 30%, #ffb070 75%)', boxShadow: '0 0 40px 12px rgba(255, 210, 120, 0.55)' }} />
          ) : (
            <span className={cn('absolute w-11 h-11 rounded-full', overcast && 'opacity-30')}
              style={{ left: `${10 + Math.min(moonX, 1) * 76}%`, top: '14%', background: '#f4f1e6', boxShadow: 'inset -10px -4px 0 0 #d9d4c4, 0 0 26px 6px rgba(244, 241, 230, 0.35)' }} />
          )}
          {/* Clouds */}
          {Array.from({ length: clouds }, (_, i) => (
            <span key={i} className="win-cloud" style={{ top: `${6 + (i * 13) % 40}%`, animationDuration: `${70 + i * 17}s`, animationDelay: `${-i * 19}s`, opacity: isNight ? 0.75 : overcast ? 0.95 : 0.85, ['--cloud' as string]: cloudColor, transform: `scale(${0.8 + (i % 3) * 0.25})` }} />
          ))}
          {/* Hills, trees and little houses */}
          <svg viewBox="0 0 800 120" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full h-24 sm:h-28" aria-hidden>
            <path d="M0 70 Q120 30 240 60 T480 50 T800 55 V120 H0Z" fill={isNight ? '#27324a' : overcast ? '#7d8a7a' : '#8fb38a'} />
            <path d="M0 95 Q160 60 330 88 T640 80 T800 86 V120 H0Z" fill={isNight ? '#1b2436' : overcast ? '#5f6d5c' : '#6e9a6a'} />
            {[[120, 62], [520, 54], [690, 58]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x="0" y="0" width="34" height="24" fill={isNight ? '#3a3550' : '#efe2cf'} />
                <path d="M-4 0 L17 -16 L38 0 Z" fill={isNight ? '#4a2f3a' : '#c97b5a'} />
                <rect x="6" y="6" width="8" height="8" fill={isNight ? '#ffd27a' : '#9cc9ee'} />
                <rect x="20" y="6" width="8" height="8" fill={isNight && i !== 1 ? '#ffd27a' : '#9cc9ee'} opacity={isNight && i === 1 ? 0.4 : 1} />
              </g>
            ))}
            {[60, 260, 300, 430, 600, 760].map((x, i) => (
              <g key={x} transform={`translate(${x} ${78 + (i % 2) * 6})`}>
                <rect x="-2" y="0" width="4" height="12" fill="#5a3a26" />
                <circle cx="0" cy="-4" r="10" fill={isNight ? '#1f3a33' : overcast ? '#4f6a4f' : '#4f8a55'} />
              </g>
            ))}
          </svg>
          {/* Precipitation */}
          {(sky === 'rain' || sky === 'drizzle' || sky === 'storm') && Array.from({ length: sky === 'drizzle' ? 30 : 60 }, (_, i) => (
            <span key={i} className="win-rain" style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 10) * 0.09}s`, animationDuration: `${0.55 + (i % 4) * 0.1}s` }} />
          ))}
          {sky === 'snow' && Array.from({ length: 45 }, (_, i) => (
            <span key={i} className="win-snow" style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 9) * 0.6}s`, animationDuration: `${5 + (i % 5)}s`, width: 3 + (i % 3), height: 3 + (i % 3) }} />
          ))}
          {sky === 'fog' && <span className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-white/20" />}
          {sky === 'storm' && <span className="absolute inset-0 bg-white win-flash" />}
          {/* Raindrops on the glass */}
          {(sky === 'rain' || sky === 'storm') && Array.from({ length: 14 }, (_, i) => (
            <span key={`d${i}`} className="absolute rounded-full bg-white/30 border border-white/40" style={{ left: `${(i * 29) % 96}%`, top: `${(i * 41) % 90}%`, width: 4 + (i % 3) * 2, height: 6 + (i % 3) * 2 }} />
          ))}
          {/* Glass reflection + mullions */}
          <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.18)_42%,transparent_50%,transparent_62%,rgba(255,255,255,0.1)_66%,transparent_70%)] pointer-events-none" />
          <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2.5 sm:w-3 window-bar" />
          <span className="absolute inset-x-0 top-[44%] h-2.5 sm:h-3 window-bar" />

          {/* Sticky note on the glass */}
          <div className="absolute top-3 right-3 sm:right-[8%] w-44 sm:w-52 p-3 pt-4 bg-[#fff1a8] text-[#3b2f2a] shadow-[0_8px_14px_-6px_rgba(0,0,0,0.45)] rotate-[3deg]">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/50 rotate-[-4deg]" />
            {editing ? (
              <form onSubmit={(e) => { e.preventDefault(); setEditing(false); }}>
                <input autoFocus defaultValue={city} onBlur={(e) => { if (e.target.value.trim()) { setError(null); setCity(e.target.value.trim()); } setEditing(false); }}
                  className="w-full bg-white/60 rounded px-1.5 py-0.5 text-sm font-bold outline-none" aria-label="Şehir" />
              </form>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-black opacity-70 hover:opacity-100" title="Şehri değiştir">
                <MapPin className="w-3 h-3" /> {weather?.city ?? city}{weather?.district ? ` · ${weather.district}` : ''}
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              </button>
            )}
            {weather ? (
              <>
                <p className="font-hand text-4xl leading-none mt-1">{weather.temp}° <span className="text-xl">{(weather.label ?? SKY_LABEL[sky]).toLocaleLowerCase('tr-TR')}</span></p>
                <p className="text-[11px] font-bold opacity-70">↑{weather.max}° ↓{weather.min}° · {weather.humidity != null ? `nem %${weather.humidity}` : `yağış %${weather.rainChance}`}{weather.source === 'MGM' && <span className="ml-1 px-1 rounded bg-black/10" title="Meteoroloji Genel Müdürlüğü">MGM</span>}</p>
                <p className="font-hand text-lg leading-5 mt-1.5">{adviceFor(weather)}</p>
              </>
            ) : (
              <p className="font-hand text-lg leading-5 mt-1">{error ?? 'Hava bakılıyor…'}</p>
            )}
          </div>
        </div>
      </div>
      {/* Sill with a plant and a mug */}
      <div className="relative mx-2 sm:mx-6 h-5 rounded-md wood-plank shadow-[0_10px_16px_-8px_rgba(0,0,0,0.5)]">
        <span className="absolute -top-9 left-[12%] text-4xl" aria-hidden>🪴</span>
        <span className="absolute -top-7 left-[20%] text-2xl" aria-hidden>🕯️</span>
        <span className="absolute -top-7 right-[14%] text-2xl" aria-hidden>☕</span>
      </div>
    </div>
  );
};
