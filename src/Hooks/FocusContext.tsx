import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { FOCUS_KEY, readFocusSessions } from '../Utils/achievements';
import { useLocalStorage } from './useLocalStorage';
import { STUDY_KEYS, StudyLog, seedLog } from '../Utils/study';

export type FocusMode = 'focus' | 'break' | 'long';

export interface FocusPlan { focus: number; break: number; long: number; longEvery: number }

export const FOCUS_PRESETS: { id: string; label: string; emoji: string; plan: FocusPlan }[] = [
  { id: 'classic', label: 'Klasik', emoji: '🍅', plan: { focus: 25, break: 5, long: 15, longEvery: 4 } },
  { id: 'deep', label: 'Derin', emoji: '🌊', plan: { focus: 50, break: 10, long: 20, longEvery: 3 } },
  { id: 'flow', label: 'Akış', emoji: '🔥', plan: { focus: 90, break: 20, long: 30, longEvery: 2 } },
  { id: 'sprint', label: 'Sprint', emoji: '⚡', plan: { focus: 15, break: 3, long: 10, longEvery: 4 } },
];

/** Kept for widgets that only need the classic durations in seconds. */
export const FOCUS_DURATIONS: Record<'focus' | 'break', number> = { focus: 25 * 60, break: 5 * 60 };

interface FocusContextType {
  mode: FocusMode;
  remaining: number;
  total: number;
  running: boolean;
  sessions: number;
  /** Focus blocks finished since the last long break. */
  cycle: number;
  plan: FocusPlan;
  subjectId: string | null;
  task: string;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: FocusMode | 'break') => void;
  setPlan: (plan: FocusPlan) => void;
  setSubjectId: (id: string | null) => void;
  setTask: (task: string) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

/** A soft three-note chime, generated so no audio file is needed. */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.3);
    });
    window.setTimeout(() => ctx.close(), 2000);
  } catch {
    // Audio is a nicety; ignore browsers that block it.
  }
}

export const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const notify = (body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('CareerFlow 🌿', { body });
  }
};

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plan, setPlanState] = useLocalStorage<FocusPlan>('careerflow_focus_plan', FOCUS_PRESETS[0].plan);
  const [, setLog] = useLocalStorage<StudyLog[]>(STUDY_KEYS.log, seedLog);
  const [mode, setMode] = useState<FocusMode>('focus');
  const [remaining, setRemaining] = useState(plan.focus * 60);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [sessions, setSessions] = useState(readFocusSessions);
  const [cycle, setCycle] = useState(0);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const baseTitle = useRef(document.title);

  const running = endsAt !== null;
  const durationOf = useCallback((m: FocusMode) => (m === 'focus' ? plan.focus : m === 'break' ? plan.break : plan.long) * 60, [plan]);
  const total = durationOf(mode);

  const goTo = useCallback((next: FocusMode) => {
    setEndsAt(null);
    setMode(next);
    setRemaining(durationOf(next));
  }, [durationOf]);

  const finish = useCallback((skipped = false) => {
    // A skipped focus block only counts the minutes actually spent.
    const minutes = skipped ? Math.floor((durationOf('focus') - remaining) / 60) : plan.focus;
    if (mode === 'focus' && skipped && minutes < 1) {
      goTo('break');
      return;
    }
    if (!skipped) playChime();
    if (mode === 'focus') {
      setSessions(prev => {
        const next = prev + 1;
        try { localStorage.setItem(FOCUS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
      setLog(prev => [...prev, { id: uuidv4(), date: new Date().toISOString(), minutes, subjectId: subjectId ?? undefined, note: task || undefined }]);
      const nextCycle = cycle + 1;
      const isLong = nextCycle >= plan.longEvery;
      setCycle(isLong ? 0 : nextCycle);
      const coins = Math.floor(minutes / 5);
      toast.success(`Harika odaklandın! +${coins} 🪙 · ${isLong ? `${plan.long} dk uzun mola hak ettin 🌴` : `${plan.break} dk mola ☕`}`);
      notify(isLong ? 'Uzun mola zamanı! 🌴' : 'Odak seansı bitti — mola zamanı! ☕');
      goTo(isLong ? 'long' : 'break');
    } else {
      if (!skipped) {
        toast.info('Mola bitti, yeni bir odak seansına hazır mısın? 🍅');
        notify('Mola bitti, hadi devam! 🍅');
      }
      goTo('focus');
    }
  }, [mode, plan, subjectId, task, cycle, remaining, durationOf, setLog, goTo]);

  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) finish(false);
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt, finish]);

  // Show the countdown in the browser tab while a session runs.
  useEffect(() => {
    if (running) document.title = `${mode === 'focus' ? '🍅' : '☕'} ${formatClock(remaining)} · CareerFlow`;
    else document.title = baseTitle.current;
  }, [running, remaining, mode]);

  const toggle = () => {
    if (running) {
      setEndsAt(null);
      return;
    }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
    setEndsAt(Date.now() + remaining * 1000);
  };

  const reset = () => {
    setEndsAt(null);
    setRemaining(durationOf(mode));
  };

  const setPlan = (next: FocusPlan) => {
    setPlanState(next);
    if (!running) setRemaining((mode === 'focus' ? next.focus : mode === 'break' ? next.break : next.long) * 60);
  };

  return (
    <FocusContext.Provider value={{
      mode, remaining, total, running, sessions, cycle, plan, subjectId, task,
      toggle, reset, skip: () => finish(true), switchMode: goTo, setPlan, setSubjectId, setTask,
    }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
