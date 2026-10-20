import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, VolumeX, Wind, SkipForward } from 'lucide-react';
import { useFocus, formatClock, FOCUS_PRESETS } from '../Hooks/FocusContext';
import { useStudy } from '../Hooks/useStudy';
import { formatMinutes } from '../Utils/study';
import { soundscape } from '../Utils/soundscape';
import { ambient } from '../Utils/ambient';
import { SoundLibrary } from '../Components/SoundLibrary';
import { cn } from '../Utils/classNames';
import { TimerFace } from '../Components/TimerFace';
import { DeskLamp, FlipClock, Mug, PottedPlant } from '../Components/Focus/DeskProps';
import { CoderGirl } from '../Components/Focus/CoderGirl';
import { TIMER_STYLES, TimerStyle } from '../Utils/timer';
import { useLocalStorage } from '../Hooks/useLocalStorage';


const QUOTES = [
  'Tek bir şeye odaklan. Gerisi bekleyebilir. 🌿',
  'Derin iş, derin sonuçlar doğurur. ☕',
  'Bu an, ihtiyacın olan tek an. 🍃',
  'Yavaş ilerlemek de ilerlemektir. 🐢',
  'Zihnin bir bahçe; neyi sularsan o büyür. 🌻',
];

// 4-4-6 calming breath: inhale, hold, exhale.
const BREATH = [
  { label: 'Nefes al', seconds: 4, scale: 1 },
  { label: 'Tut', seconds: 4, scale: 1 },
  { label: 'Yavaşça ver', seconds: 6, scale: 0.55 },
];


const Breathing: React.FC<{ large?: boolean }> = ({ large }) => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      setPhase(p => {
        const next = (p + 1) % BREATH.length;
        if (next === 0) setCycles(c => c + 1);
        return next;
      });
    }, BREATH[phase].seconds * 1000);
    return () => window.clearTimeout(id);
  }, [active, phase]);

  const current = BREATH[phase];
  const size = large ? 'w-64 h-64' : 'w-44 h-44';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className={cn('relative flex items-center justify-center', size)}>
        <div className="absolute inset-0 rounded-full bg-moss/10 border border-moss/20" />
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-moss/50 to-[#6fb06a]/40 shadow-[0_0_60px_rgba(63,138,107,0.45)]"
          style={{
            transform: `scale(${active ? current.scale : 0.55})`,
            transition: `transform ${active ? current.seconds : 0.6}s ease-in-out`,
          }}
        />
        <span className={cn('relative font-serif font-bold text-ink text-center', large ? 'text-2xl' : 'text-lg')}>
          {active ? current.label : 'Hazır mısın?'}
        </span>
      </div>
      <button onClick={() => { setActive(a => !a); setPhase(0); }} className={active ? 'btn-ghost px-5 py-2.5 text-sm' : 'btn-primary px-5 py-2.5 text-sm'}>
        <Wind className="w-4 h-4 mr-2" /> {active ? 'Durdur' : 'Nefes egzersizine başla'}
      </button>
      {cycles > 0 && <p className="text-xs font-bold text-ink-muted">{cycles} döngü tamamlandı 🌬️</p>}
    </div>
  );
};

export const FocusRoom: React.FC = () => {
  const { mode, remaining, total, running, cycle, plan, subjectId, task, toggle, reset, skip, setPlan, setSubjectId, setTask } = useFocus();
  const { subjects, log, subjectById } = useStudy();
  const subject = subjectById(subjectId);
  const todayLog = log.filter(l => isToday(parseISO(l.date))).sort((a, b) => b.date.localeCompare(a.date));
  const todayMinutes = todayLog.reduce((s, l) => s + l.minutes, 0);
  const presetId = FOCUS_PRESETS.find(p => p.plan.focus === plan.focus && p.plan.break === plan.break)?.id;
  const [zen, setZen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const zenRef = useRef<HTMLDivElement>(null);
  const progress = 1 - remaining / total;

  useEffect(() => {
    const id = window.setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 12000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onChange = () => setZen(document.fullscreenElement === zenRef.current && !!zenRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleZen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await zenRef.current?.requestFullscreen().catch(() => setZen(z => !z));
  };


  const [timerStyle, setTimerStyle] = useLocalStorage<TimerStyle>('careerflow_timer_style', 'hourglass');

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Pomodoro 🍅</h1>
        <p className="text-ink-soft mt-2">Dersini seç, sesini aç, zamanlayıcıyı başlat. Biten her seans otomatik kaydedilir ve jeton kazandırır.</p>
      </div>

      {/* 🪑 The study desk — this whole block goes fullscreen in zen mode */}
      <div
        ref={zenRef}
        className={cn(
          'relative overflow-hidden rounded-[28px] border border-glass/70 shadow-[0_20px_50px_-20px_rgba(60,40,20,0.45)]',
          zen && 'fixed inset-0 z-[80] rounded-none flex flex-col justify-center'
        )}
      >
        {/* Wall, with lamplight when the session runs */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#efe4d2,#e6d6bf)] dark:bg-[linear-gradient(180deg,#2b241f,#231d19)]" />
        <div className="absolute inset-0 wall-grain opacity-60" />
        <div className={cn('absolute inset-0 bg-[#1a1410] pointer-events-none transition-opacity duration-1000', running && mode === 'focus' ? 'opacity-[0.14]' : 'opacity-0')} />
        <div className={cn('absolute inset-0 pointer-events-none transition-opacity duration-1000', running && mode === 'focus' ? 'opacity-100' : 'opacity-0')}
          style={{ background: 'radial-gradient(ellipse 38% 30% at 34% 36%, rgba(255,214,120,0.6), transparent 70%)' }} />

        <button onClick={toggleZen} className="absolute top-4 right-4 desk-key w-11 h-11 z-10" aria-label={zen ? 'Zen modundan çık' : 'Zen modu'} title="Zen modu (tam ekran)">
          {zen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Timer style: little wooden tabs */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5">
          {TIMER_STYLES.map(t => (
            <button key={t.id} onClick={() => setTimerStyle(t.id)} title={t.label} aria-label={t.label} aria-pressed={timerStyle === t.id}
              className={cn('wood-plank w-11 h-11 rounded-lg text-lg shadow-[0_3px_0_rgba(0,0,0,0.25)] transition-all', timerStyle === t.id ? 'translate-y-0.5 shadow-[0_1px_0_rgba(0,0,0,0.25)] ring-2 ring-white/80' : 'opacity-75 hover:opacity-100')}>{t.emoji}</button>
          ))}
        </div>

        <div className="relative px-4 sm:px-10 pt-20 sm:pt-16">
          {/* Presets: sticky notes pinned to the wall */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {FOCUS_PRESETS.map((p, i) => (
              <button key={p.id} onClick={() => setPlan(p.plan)} disabled={running}
                className={cn('relative w-24 sm:w-28 px-2 pt-4 pb-2 text-left shadow-[0_6px_12px_-6px_rgba(0,0,0,0.35)] transition-all disabled:cursor-not-allowed',
                  presetId === p.id ? 'scale-105' : 'opacity-80 hover:opacity-100')}
                style={{ background: ['#ffe98a', '#ffc6d9', '#bfe6ff', '#c9f0b8'][i % 4], rotate: `${[-3, 2, -1.5, 3][i % 4]}deg` }}>
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff8a7a,#c0392b_60%,#7d1f16)] shadow" aria-hidden />
                <span className="block font-hand text-xl leading-none text-[#3b2f2a]">{p.emoji} {p.label}</span>
                <span className="block font-hand text-lg text-[#3b2f2a]/70">{p.plan.focus} dk / {p.plan.break} dk</span>
                {presetId === p.id && <span className="absolute -bottom-1 right-1.5 font-hand text-2xl text-[#c0392b]" aria-hidden>✓</span>}
              </button>
            ))}
          </div>

          {/* Subjects: washi-tape labels */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl mx-auto">
            {[{ id: null as string | null, name: 'Genel', emoji: '✏️', color: '#a38b76' }, ...subjects].map((s, i) => {
              const on = subjectId === s.id;
              return (
                <button key={s.id ?? 'general'} onClick={() => setSubjectId(s.id)}
                  className={cn('washi px-3 py-1 text-xs font-black transition-all', on ? 'text-white scale-105' : 'text-[#3b2f2a] opacity-75 hover:opacity-100')}
                  style={{ ['--tape' as string]: on ? s.color : `color-mix(in srgb, ${s.color} 35%, #fff8ee)`, rotate: `${(i % 3) - 1}deg` }}>
                  {s.emoji} {s.name}
                </button>
              );
            })}
          </div>

          {/* Desk scene */}
          <div className={cn('relative w-full max-w-4xl mx-auto mt-6', zen && 'max-w-5xl')}>
            <div className="relative flex items-end justify-center gap-2 sm:gap-6 px-2">
              <DeskLamp on={running && mode === 'focus'} className="hidden md:block w-28 h-40 shrink-0 -mb-1" />
              {/* 👩‍💻 She works along with you */}
              <CoderGirl state={mode !== 'focus' ? 'break' : running ? 'typing' : 'idle'} className={cn('shrink-0 -mb-0.5', zen ? 'w-96 h-80' : 'w-48 h-44 sm:w-72 sm:h-64')} />
              <div className={cn('relative shrink-0', timerStyle === 'hourglass' ? (zen ? 'w-40 h-64' : 'w-24 h-40 sm:w-28 sm:h-48') : (zen ? 'w-60 h-60' : 'w-32 h-32 sm:w-44 sm:h-44'), running && timerStyle === 'hourglass' && 'hg-sway')}>
                <TimerFace style={timerStyle} progress={progress} running={running} focus={mode === 'focus'} className="w-full h-full" />
              </div>
              <div className="flex items-end gap-1 shrink-0">
                <Mug steaming={running && mode === 'focus'} className="hidden sm:block w-16 h-[4.5rem]" />
                <PottedPlant className="hidden lg:block w-24 h-28" />
              </div>
            </div>
            {/* Desk top with today's tomatoes */}
            <div className="relative h-6 rounded-t-md wood-plank shadow-[0_-2px_0_rgba(255,255,255,0.25)_inset]">
              <div className="absolute -top-6 left-4 flex gap-0.5" title={`Bugün ${todayLog.length} seans`}>
                {todayLog.slice(0, 8).map(l => <span key={l.id} className="text-xl drop-shadow">🍅</span>)}
              </div>
            </div>
            <div className="h-4 rounded-b-md wood-case shadow-[0_14px_20px_-10px_rgba(0,0,0,0.55)]" />
          </div>

          {/* Flip clock and status */}
          <div className="relative mt-7 flex flex-col items-center">
            <FlipClock text={formatClock(remaining)} large={zen} />
            <span className="mt-2 font-hand text-2xl text-ink-soft">
              {mode === 'focus' ? (subject ? `${subject.emoji} ${subject.name}` : running ? 'Odaktasın…' : 'Odak zamanı') : mode === 'long' ? '🌴 Uzun mola' : '☕ Mola'}
            </span>
            <div className="flex gap-1.5 mt-1" aria-label={`${cycle}/${plan.longEvery} seans`}>
              {Array.from({ length: plan.longEvery }, (_, i) => (
                <span key={i} className={cn('text-lg transition-all', i < cycle ? 'opacity-100' : 'opacity-25 grayscale')}>🍅</span>
              ))}
            </div>
          </div>

          {/* Physical buttons */}
          <div className="relative flex items-center justify-center gap-3 mt-5">
            <button onClick={reset} className="desk-key w-12 h-12" aria-label="Sıfırla" title="Sıfırla"><RotateCcw className="w-5 h-5" /></button>
            <button onClick={toggle} className={cn('desk-key desk-key-main w-20 h-16', running && 'desk-key-on')} aria-label={running ? 'Duraklat' : 'Başlat'}>
              {running ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <button onClick={skip} className="desk-key w-12 h-12" aria-label="Sonraki aşamaya geç" title="Atla"><SkipForward className="w-5 h-5" /></button>
            <button onClick={() => { soundscape.stopAll(); ambient.stopAll(); }} className="desk-key w-12 h-12" aria-label="Tüm sesleri kapat" title="Tüm sesleri kapat"><VolumeX className="w-5 h-5" /></button>
          </div>

          {/* What you're working on — written on a notepad */}
          <div className="relative mx-auto mt-7 max-w-md">
            <div className="relative paper paper-lines rounded-sm px-5 pt-6 pb-3 rotate-[-0.8deg] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.4)]">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-5 washi" style={{ ['--tape' as string]: 'color-mix(in srgb, var(--color-moss) 35%, #fff8ee)' }} aria-hidden />
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Şu an ne üzerinde çalışıyorsun? ✏️"
                className="w-full bg-transparent outline-none font-hand text-2xl text-center placeholder:opacity-40"
              />
            </div>
          </div>

          <p key={quoteIndex} className="relative mt-6 font-serif italic text-lg text-ink-soft animate-fade-in max-w-md mx-auto text-center">{QUOTES[quoteIndex]}</p>
          <p className="relative mt-1 mb-8 text-xs font-bold text-ink-muted text-center">Bugün {formatMinutes(todayMinutes)} odaklandın · {todayLog.length} seans 🍅</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-serif text-ink">Ses Kütüphanesi 🎼</h2>
            <p className="text-xs font-semibold text-ink-muted mt-1">Gerçek keman, piyano ve çello kayıtları; gerçek yağmur, dalga ve kuş sesleri. Sayfa değiştirsen de çalmaya devam eder.</p>
          </div>
        </div>
        <SoundLibrary />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          {mode !== 'focus' && <p className="text-sm font-bold text-moss mb-3 self-start animate-fade-in">Moladasın; bir nefes egzersizi tam zamanı! 🌿</p>}
          <h2 className="text-lg font-bold font-serif text-ink mb-1 self-start">Nefes Molası 🌬️</h2>
          <p className="text-xs font-semibold text-ink-muted mb-6 self-start">Mülakattan önce gerginsen 4-4-6 nefesi dene.</p>
          <Breathing />
        </div>
      </div>

      {todayLog.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold font-serif text-ink mb-4">Bugünkü Seanslar</h2>
          <div className="flex flex-wrap gap-2">
            {todayLog.map(l => {
              const s = subjectById(l.subjectId);
              return (
                <span key={l.id} className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-glass/60 border border-glass/80 text-sm font-bold text-ink">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s?.color ?? '#a38b76' }} />
                  {format(parseISO(l.date), 'HH:mm')} · {s ? `${s.emoji} ${s.name}` : 'Genel'} · {l.minutes} dk
                  {l.note && <span className="text-ink-muted font-semibold">— {l.note}</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
