import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO, subDays, isAfter, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { useStudy } from '../Hooks/useStudy';
import { usePersonal } from '../Hooks/usePersonal';
import { usePreferences } from '../Hooks/PreferencesContext';
import { readStored } from '../Hooks/useLocalStorage';
import { Avatar } from './Avatar';
import { minutesOn, formatMinutes } from '../Utils/study';
import { forestProgress, FOREST_WATER_KEY } from '../Utils/forest';
import { MOOD_KEY, MoodEntry, moodFor } from '../Utils/mood';
import { habitDone } from '../Utils/personal';
import { fireConfetti } from '../Utils/confetti';
import { cn } from '../Utils/classNames';

const SLIDE_MS = 6000;

/** Counts up from 0 when it first appears. */
const CountUp: React.FC<{ to: number; ms?: number }> = ({ to, ms = 1200 }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{value}</>;
};

interface Slide { bg: string; render: () => React.ReactNode }

/** "Your week" in Spotify Wrapped-style story slides. */
export const WeekRecap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { log, tasks, subjects } = useStudy();
  const { habits } = usePersonal();
  const { preferences } = usePreferences();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const data = useMemo(() => {
    const since = startOfDay(subDays(new Date(), 6));
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const perDay = days.map(d => ({ d, m: minutesOn(log, d) }));
    const week = log.filter(l => isAfter(parseISO(l.date), since));
    const total = week.reduce((s, l) => s + l.minutes, 0);
    const best = perDay.reduce((a, b) => (b.m > a.m ? b : a), perDay[0]);
    const bySubject = subjects.map(s => ({ s, m: week.filter(l => l.subjectId === s.id).reduce((a, l) => a + l.minutes, 0) })).sort((a, b) => b.m - a.m);
    const top = bySubject[0]?.m ? bySubject[0] : null;
    const tasksDone = tasks.filter(t => t.completedAt && isAfter(parseISO(t.completedAt), since)).length;
    const water = readStored<string[]>(FOREST_WATER_KEY, []);
    const allTrees = forestProgress(log, water).trees;
    const treesWeek = allTrees.filter(t => isAfter(parseISO(t.date), since) || format(parseISO(t.date), 'yyyy-MM-dd') === format(since, 'yyyy-MM-dd')).length;
    const moods = readStored<MoodEntry[]>(MOOD_KEY, []).filter(m => isAfter(parseISO(m.date), subDays(since, 1)));
    const moodAvg = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0;
    const journal = Object.keys(readStored<Record<string, unknown>>('careerflow_journal', {})).filter(k => isAfter(parseISO(k), subDays(since, 1))).length;
    const habitChecks = habits.length ? days.reduce((s, d) => s + habits.filter(h => habitDone(h, format(d, 'yyyy-MM-dd'))).length, 0) : 0;
    const habitRate = habits.length ? Math.round((habitChecks / (habits.length * 7)) * 100) : 0;
    return { days, perDay, total, best, top, tasksDone, treesWeek, totalTrees: allTrees.length, moodAvg, moods: moods.length, journal, habitRate, since };
  }, [log, tasks, subjects, habits]);

  const name = preferences.userName || 'sen';
  const maxDay = Math.max(...data.perDay.map(p => p.m), 1);
  const verdict = data.total >= 600 ? 'Efsane bir haftaydı. Kendinle gurur duy! 🏆'
    : data.total >= 240 ? 'İstikrarlı ve güçlü bir hafta. Böyle devam! 💪'
      : data.total > 0 ? 'Her dakika sayılır. Gelecek hafta biraz daha! 🌱'
        : 'Yeni bir hafta, yeni bir başlangıç. İlk pomodoronu bekliyoruz! 🍅';

  const slides: Slide[] = [
    {
      bg: 'linear-gradient(160deg, #4c58a8, #7a4a8a 55%, #c2577a)',
      render: () => (
        <div className="flex flex-col items-center text-center">
          <Avatar config={preferences.look} rounded="rounded-[2rem]" className="w-40 h-40 shadow-2xl recap-in" />
          <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] opacity-80 recap-in [animation-delay:0.2s]">{format(data.since, 'd MMM', { locale: tr })} – {format(new Date(), 'd MMM', { locale: tr })}</p>
          <h2 className="mt-3 text-5xl font-black font-serif leading-tight recap-in [animation-delay:0.4s]">Haftan hazır,<br />{name}! ✨</h2>
        </div>
      ),
    },
    {
      bg: 'linear-gradient(160deg, #1f6f8b, #4c58a8)',
      render: () => (
        <div className="w-full text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Bu hafta odaklandığın süre</p>
          <p className="mt-4 text-8xl font-black tabular-nums leading-none"><CountUp to={Math.floor(data.total / 60)} /><span className="text-4xl"> sa</span> <CountUp to={data.total % 60} /><span className="text-4xl"> dk</span></p>
          <div className="mt-10 flex items-end justify-center gap-3 h-40">
            {data.perDay.map((p, i) => (
              <div key={i} className="h-full flex flex-col items-center gap-2 w-9">
                <div className="flex-1 w-full flex items-end">
                  <div className="w-full rounded-t-lg bg-white/85 recap-bar" style={{ height: `${Math.max((p.m / maxDay) * 100, 3)}%`, animationDelay: `${0.3 + i * 0.08}s` }} />
                </div>
                <span className="text-[11px] font-bold opacity-80">{format(p.d, 'EEEEEE', { locale: tr })}</span>
              </div>
            ))}
          </div>
          {data.best.m > 0 && <p className="mt-6 text-lg font-bold recap-in [animation-delay:0.9s]">En verimli günün: <b className="capitalize">{format(data.best.d, 'EEEE', { locale: tr })}</b> · {formatMinutes(data.best.m)}</p>}
        </div>
      ),
    },
    {
      bg: data.top ? `linear-gradient(160deg, ${data.top.s.color}, color-mix(in srgb, ${data.top.s.color} 55%, black))` : 'linear-gradient(160deg, #6b4c3a, #2b1d14)',
      render: () => data.top ? (
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Haftanın yıldızı</p>
          <p className="mt-6 text-[8rem] leading-none recap-pop">{data.top.s.emoji}</p>
          <h2 className="mt-4 text-5xl font-black font-serif">{data.top.s.name}</h2>
          <p className="mt-3 text-xl font-bold opacity-90">{formatMinutes(data.top.m)} · odağının %{Math.round((data.top.m / Math.max(data.total, 1)) * 100)}'i</p>
        </div>
      ) : (
        <div className="text-center"><p className="text-7xl">📚</p><h2 className="mt-6 text-4xl font-black font-serif">Bu hafta bir derse odaklanmadın</h2><p className="mt-3 opacity-80">Pomodoro'da ders seçerek başlayabilirsin.</p></div>
      ),
    },
    {
      bg: 'linear-gradient(160deg, #3a9a6e, #1f5c47)',
      render: () => (
        <div className="text-center w-full">
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Tamamlananlar</p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-3xl bg-white/15 backdrop-blur p-6 recap-in"><p className="text-6xl font-black"><CountUp to={data.tasksDone} /></p><p className="mt-1 font-bold opacity-90">görev ✅</p></div>
            <div className="rounded-3xl bg-white/15 backdrop-blur p-6 recap-in [animation-delay:0.15s]"><p className="text-6xl font-black">%<CountUp to={data.habitRate} /></p><p className="mt-1 font-bold opacity-90">alışkanlık 💧</p></div>
            <div className="rounded-3xl bg-white/15 backdrop-blur p-6 recap-in [animation-delay:0.3s]"><p className="text-6xl font-black"><CountUp to={data.treesWeek} /></p><p className="mt-1 font-bold opacity-90">yeni ağaç 🌳</p></div>
            <div className="rounded-3xl bg-white/15 backdrop-blur p-6 recap-in [animation-delay:0.45s]"><p className="text-6xl font-black"><CountUp to={data.journal} /></p><p className="mt-1 font-bold opacity-90">günlük sayfası 📔</p></div>
          </div>
          <p className="mt-6 font-bold opacity-90 recap-in [animation-delay:0.7s]">Ormanında toplam {data.totalTrees} ağaç var {'🌲'.repeat(Math.min(data.totalTrees, 6))}</p>
        </div>
      ),
    },
    {
      bg: 'linear-gradient(160deg, #d99a12, #c4553a)',
      render: () => (
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Bu haftaki ruh halin</p>
          {data.moods ? (
            <>
              <p className="mt-6 text-[9rem] leading-none recap-pop">{moodFor(Math.round(data.moodAvg)).emoji}</p>
              <h2 className="mt-4 text-4xl font-black font-serif">Çoğunlukla “{moodFor(Math.round(data.moodAvg)).label}”</h2>
              <p className="mt-3 text-lg font-bold opacity-90">{data.moods} gün kendini dinledin 💛</p>
            </>
          ) : (
            <>
              <p className="mt-6 text-[8rem] leading-none">💭</p>
              <h2 className="mt-4 text-4xl font-black font-serif">Bu hafta ruh hali kaydı yok</h2>
              <p className="mt-3 opacity-90">Ana sayfadaki “Bugün nasılsın?” ile başlayabilirsin.</p>
            </>
          )}
        </div>
      ),
    },
    {
      bg: 'linear-gradient(160deg, #b0457a, #4c58a8)',
      render: () => (
        <div className="text-center max-w-md">
          <p className="text-7xl recap-pop">🌟</p>
          <h2 className="mt-6 text-4xl font-black font-serif leading-tight">{verdict}</h2>
          <p className="mt-5 text-lg font-semibold opacity-90">“{readStored<{ why?: string }>('careerflow_study_settings', {}).why || 'Küçük adımlar, büyük yolculuklar.'}”</p>
          <button onClick={onClose} className="mt-10 px-8 py-3.5 rounded-2xl bg-white text-[#4c58a8] font-black shadow-xl hover:scale-105 transition-transform">Yeni haftaya başla →</button>
        </div>
      ),
    },
  ];

  const last = slides.length - 1;

  useEffect(() => {
    if (paused || index === last) return;
    const id = window.setTimeout(() => setIndex(i => Math.min(i + 1, last)), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, last]);

  useEffect(() => {
    if (index === last && preferences.celebrate) fireConfetti(160);
  }, [index, last, preferences.celebrate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, last));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, last]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Haftanın özeti">
      <div
        className="relative w-full h-full sm:w-[440px] sm:h-[min(860px,94vh)] sm:rounded-[2rem] overflow-hidden text-white shadow-2xl transition-[background] duration-700"
        style={{ background: slides[index].bg }}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.5),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.25),transparent_40%)]" />
        {/* Progress */}
        <div className="absolute top-4 inset-x-4 flex gap-1.5 z-20">
          {slides.map((_, i) => (
            <span key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <span className={cn('block h-full bg-white rounded-full', i < index && 'w-full', i > index && 'w-0', i === index && (index === last ? 'w-full' : 'recap-progress'))}
                style={i === index && index !== last ? { animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined} />
            </span>
          ))}
        </div>
        <div className="absolute top-8 inset-x-4 flex items-center justify-between z-20">
          <span className="text-xs font-black tracking-widest opacity-90">SİBİLİA · HAFTAM</span>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/15" aria-label="Kapat"><X className="w-5 h-5" /></button>
        </div>
        {/* Tap zones */}
        <button className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Önceki" onClick={() => setIndex(i => Math.max(i - 1, 0))} />
        <button className="absolute right-0 top-0 bottom-0 w-1/3 z-10" aria-label="Sonraki" onClick={() => setIndex(i => Math.min(i + 1, last))} />
        <div key={index} className="relative h-full flex items-center justify-center px-8 pt-16 pb-10 recap-slide">
          {slides[index].render()}
        </div>
      </div>
    </div>
  );
};
