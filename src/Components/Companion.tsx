import React, { useCallback, useEffect, useRef, useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { CharacterArt } from './Character/CharacterArt';

type CharacterPose = 'idle' | 'walk' | 'wave' | 'jump';
import { usePreferences } from '../Hooks/PreferencesContext';
import { useApplications } from '../Hooks/ApplicationContext';
import { useStudy } from '../Hooks/useStudy';
import { useSpace } from '../Hooks/useSpace';
import { appliedThisWeek, needsFollowUp, upcomingInterviews } from '../Utils/insights';
import { minutesOn, formatMinutes } from '../Utils/study';

const CHEERS = [
  'Sen harikasın! 🌟', 'Bugün de bir adım attın, gurur duy! 💛', 'Hey! Ben de buradayım 👋', 'Derin bir nefes al… 🌬️',
  'Su içmeyi unutma 💧', 'Omuzlarını gevşet, dik otur 🧘', 'Küçük bir mola iyi gelebilir ☕', 'Sana inanıyorum! 💪',
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** Your character, strolling along the bottom of the screen with friendly reminders. */
export const Companion: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const space = useSpace();
  const { applications } = useApplications();
  const { log, settings, exams, tasks, coins, subjectById } = useStudy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(40);
  const [duration, setDuration] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [pose, setPose] = useState<CharacterPose>('idle');
  const [bubble, setBubble] = useState<string | null>(null);
  const busy = useRef(false);
  const xRef = useRef(40);

  const contextual = useCallback((): string[] => {
    const hour = new Date().getHours();
    const list: string[] = [];
    if (hour >= 23 || hour < 5) list.push('Geç oldu… Uyku da başarının parçası 🌙');
    if (space === 'career') {
      const next = upcomingInterviews(applications)[0];
      if (next) {
        const d = differenceInCalendarDays(parseISO(next.interviewDate!), new Date());
        list.push(d === 0 ? `${next.companyName} mülakatı bugün! Başarılar 🍀` : `${next.companyName} mülakatına ${d} gün kaldı 🎤`);
      }
      const follow = needsFollowUp(applications)[0];
      if (follow) list.push(`${follow.companyName}'a bir takip maili atalım mı? ✉️`);
      const left = preferences.weeklyGoal - appliedThisWeek(applications).length;
      list.push(left > 0 ? `Bu hafta ${left} başvuru daha, hadi! 🌱` : 'Haftalık hedef tamam! Sen bir yıldızsın ⭐');
    } else {
      const today = minutesOn(log, new Date());
      list.push(today >= settings.dailyGoal ? 'Bugünkü çalışma hedefin tamam! 🎉' : `Bugün ${formatMinutes(today)} çalıştın, bir pomodoro daha? 🍅`);
      const exam = [...exams].filter(e => differenceInCalendarDays(parseISO(e.date), new Date()) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
      if (exam) list.push(`${subjectById(exam.subjectId)?.emoji ?? '📝'} ${exam.title}: ${differenceInCalendarDays(parseISO(exam.date), new Date())} gün kaldı`);
      const todayKey = new Date().toISOString().slice(0, 10);
      const open = tasks.filter(t => !t.done && t.due && t.due <= todayKey).length;
      if (open) list.push(`Bugün ${open} görevin var, birlikte bitirelim ✅`);
      if (coins.balance >= 20) list.push(`${coins.balance} jetonun birikmiş, kendini ödüllendir 🪙`);
    }
    return list;
  }, [space, applications, preferences.weeklyGoal, log, settings.dailyGoal, exams, tasks, coins.balance, subjectById]);

  const say = useCallback((text: string, ms = 4500) => {
    setBubble(text);
    window.setTimeout(() => setBubble(b => (b === text ? null : b)), ms);
  }, []);

  // The stroll: walk somewhere, pause, sometimes wave and say something.
  useEffect(() => {
    if (!preferences.companion) return;
    let timer: number;
    const step = () => {
      const width = containerRef.current?.clientWidth ?? 600;
      if (busy.current) { timer = window.setTimeout(step, 1500); return; }
      const roll = Math.random();
      if (roll < 0.55 && !reducedMotion()) {
        const target = 16 + Math.random() * Math.max(width - 110, 40);
        const secs = Math.max(Math.abs(target - xRef.current) / 55, 0.8);
        setFacing(target >= xRef.current ? 1 : -1);
        xRef.current = target;
        setDuration(secs);
        setX(target);
        setPose('walk');
        window.setTimeout(() => setPose('idle'), secs * 1000);
        timer = window.setTimeout(step, secs * 1000 + 1500 + Math.random() * 3000);
        return;
      }
      if (roll < 0.8) {
        setPose('wave');
        say(pick([...contextual(), ...CHEERS.slice(0, 3)]));
        window.setTimeout(() => setPose('idle'), 1800);
      }
      timer = window.setTimeout(step, 4000 + Math.random() * 5000);
    };
    timer = window.setTimeout(step, 2500);
    return () => window.clearTimeout(timer);
  }, [preferences.companion, contextual, say]);

  if (!preferences.companion) return null;

  const poke = () => {
    busy.current = true;
    setPose('jump');
    say(pick([...CHEERS, ...contextual()]));
    window.setTimeout(() => { setPose('idle'); busy.current = false; }, 700);
  };

  const hide = () => {
    updatePreferences({ companion: false });
    toast.info('Yürüyüş yolu gizlendi. Ayarlar → Profil\'den geri açabilirsin 👋');
  };

  const flowers = ['🌼', '🌷', '🌸', '🍄', '🌱', '🌼', '🌿'];

  return (
    <section aria-label="Avatarının yürüyüş yolu" className="relative h-60 rounded-3xl overflow-hidden border border-glass/70 shadow-[0_12px_40px_rgba(0,0,0,0.08)] select-none">
      {/* Sky, hills and the little path */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#bfe3ff] via-[#e3f2ff] to-[#f6fbff] dark:from-[#1b2645] dark:via-[#25325a] dark:to-[#2e3b66]" />
      <div className="absolute -bottom-10 -left-10 w-[60%] h-32 rounded-[50%] bg-[#a8d58f] dark:bg-[#2f4a3a]" />
      <div className="absolute -bottom-12 right-[-8%] w-[70%] h-36 rounded-[50%] bg-[#93c879] dark:bg-[#29412f]" />
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-b from-[#86bf6a] to-[#6faa55] dark:from-[#24392b] dark:to-[#1d3024]" />
      <div className="absolute bottom-3 inset-x-6 h-3 rounded-full bg-[#e8d3a6]/80 dark:bg-[#4a3f35]/70" />
      {flowers.map((f, i) => (
        <span key={i} className="absolute bottom-2 text-lg pointer-events-none" style={{ left: `${6 + i * 14}%`, transform: `rotate(${(i % 3) * 6 - 6}deg)` }} aria-hidden="true">{f}</span>
      ))}
      <span className="absolute top-4 left-[12%] text-3xl opacity-90 garden-cloud-strip" aria-hidden="true">☁️</span>
      <span className="absolute top-8 right-[18%] text-2xl opacity-80 garden-cloud-strip [animation-delay:-14s]" aria-hidden="true">☁️</span>
      <p className="absolute top-3 left-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#4a6a8a]/70 dark:text-white/50">{preferences.userName ? `${preferences.userName} yürüyüşte` : 'Yürüyüş yolu'}</p>
      <button
        onClick={hide}
        aria-label="Yürüyüş yolunu gizle"
        title="Gizle"
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70 dark:bg-black/30 text-[#4a6a8a] dark:text-white/70 hover:text-clay flex items-center justify-center backdrop-blur"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div ref={containerRef} className="absolute inset-x-4 bottom-2 h-0">
        <div className="absolute bottom-0" style={{ left: x, transition: `left ${duration}s linear` }}>
          {bubble && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-64 px-3.5 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-cream border border-black/5 shadow-lg text-xs font-bold text-ink animate-pop">
              {bubble}
            </div>
          )}
          <button onClick={poke} aria-label={`${preferences.userName || 'Avatarın'} — dokun`} className="block cursor-pointer">
            <span className="block transition-transform duration-200" style={{ transform: `scaleX(${facing})` }}>
              <CharacterArt config={preferences.character} pose={pose} joy={pose === 'jump'} className="w-[92px] h-[138px] drop-shadow-[0_6px_8px_rgba(0,0,0,0.2)]" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
