import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Pause, Play, Sparkles } from 'lucide-react';
import { cn } from '../../Utils/classNames';

interface Props {
  hello: { text: string; emoji: string };
  name: string;
  today: number;
  goal: number;
  quote: string;
  streak: number;
  coins: number;
  money: string;
  openTasks: number;
  thirsty: number;
  focusRunning: boolean;
  focusClock: string;
  onFocus: () => void;
  onWeek: () => void;
  go: (path: string) => void;
}

const Prompt: React.FC<{ user: string }> = ({ user }) => (
  <><span className="text-[#7ee787]">{user}@sibilia</span><span className="text-[#8b949e]">:</span><span className="text-[#79c0ff]">~</span><span className="text-[#8b949e]">$ </span></>
);

/** One line of `durum` output; clickable when it leads somewhere. */
const Stat: React.FC<{ to?: string; go: (path: string) => void; children: React.ReactNode }> = ({ to, go, children }) => (
  to ? <button onClick={() => go(to)} className="text-left hover:bg-white/5 hover:underline decoration-dotted underline-offset-4 rounded px-0.5 -mx-0.5">{children}</button> : <span>{children}</span>
);

const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} sa${m % 60 ? ` ${m % 60} dk` : ''}` : `${m} dk`);

/** The home greeting, as a cozy retro computer on the desk with a terminal open. */
export const TerminalHero: React.FC<Props> = ({ hello, name, today, goal, quote, streak, coins, money, openTasks, thirsty, focusRunning, focusClock, onFocus, onWeek, go }) => {
  const pct = Math.min(today / Math.max(goal, 1), 1);
  const bar = '█'.repeat(Math.round(pct * 20)) + '░'.repeat(20 - Math.round(pct * 20));
  const user = (name || 'sen').toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
  const greetLine = `${hello.text}${name ? `, ${name}` : ''}! ${hello.emoji}`;

  return (
    <div className="relative flex flex-col items-center">
      {/* Monitor */}
      <div className="relative w-full rounded-[26px] p-3 sm:p-4 pb-9 sm:pb-10 bg-[linear-gradient(160deg,#f6ecd9,#e3d2b4)] shadow-[0_2px_0_rgba(255,255,255,0.7)_inset,0_-3px_0_rgba(120,90,50,0.15)_inset,0_22px_40px_-20px_rgba(60,40,20,0.55)] border border-[#cdb68f]">
        {/* Stickers on the bezel */}
        <span className="absolute -top-2 left-8 rotate-[-8deg] px-2 py-0.5 rounded-md bg-[#f6a8c4] text-[10px] font-black text-white shadow" aria-hidden>{'</>'}</span>
        <span className="absolute -top-3 right-24 text-xl rotate-12 drop-shadow" aria-hidden>💖</span>

        {/* Screen */}
        <div className="relative rounded-[16px] overflow-hidden bg-[#161b26] shadow-[inset_0_0_0_3px_#0e121a,inset_0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,rgba(126,231,135,0.08),transparent_70%)]" />
          <div className="absolute inset-0 pointer-events-none crt-lines" />
          {/* Window bar */}
          <div className="relative flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10px] font-mono text-[#8b949e]">{user}@sibilia — bugün.sh</span>
            <span className="ml-auto text-[10px] font-mono text-[#8b949e] capitalize">{format(new Date(), 'd MMMM EEEE', { locale: tr })}</span>
          </div>

          <div className="relative px-4 sm:px-5 py-4 font-mono text-[12.5px] sm:text-[13.5px] leading-[1.75] text-[#d6dde8]">
            <p><Prompt user={user} /><span className="text-[#f2cc60]">./selamla</span></p>
            <p className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight my-1">
              <span className="type-line" style={{ ['--n' as string]: greetLine.length }}>{greetLine}</span>
            </p>
            <p className="text-[#8b949e]"># {today >= goal ? 'Bugünkü hedefin tamam, harikasın! 🎉' : quote}</p>

            <p className="mt-2"><Prompt user={user} /><span className="text-[#f2cc60]">durum</span> <span className="text-[#8b949e]">--bugün</span></p>
            <p>
              <span className="text-[#ff9ecb]">odak  </span>
              <span className="text-[#7ee787]">{bar.slice(0, Math.round(pct * 20))}</span><span className="text-[#5c6675]">{bar.slice(Math.round(pct * 20))}</span>
              <span> {fmt(today)} / {fmt(goal)} </span><span className="text-[#8b949e]">(%{Math.round(pct * 100)})</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Stat go={go} to="/study/tasks"><span className="text-[#ff9ecb]">görev </span>{openTasks ? `${openTasks} açık iş bekliyor` : 'hepsi bitti ✓'}</Stat>
              <Stat go={go}><span className="text-[#ff9ecb]">seri  </span>{streak} gün {streak > 0 ? '🔥' : ''}</Stat>
              <Stat go={go} to="/study/motivation"><span className="text-[#ff9ecb]">jeton </span>{coins} 🪙</Stat>
              <Stat go={go} to="/study/wallet"><span className="text-[#ff9ecb]">bütçe </span>bugün <span className="font-sans">{money}</span> 👛</Stat>
              {thirsty > 0 && <Stat go={go} to="/study/plants"><span className="text-[#ff9ecb]">bitki </span><span className="text-[#f2cc60]">{thirsty} tanesi susadı 🪴</span></Stat>}
            </div>
            <p className="mt-2"><Prompt user={user} /><span className="cursor-blink">▌</span></p>
          </div>
        </div>

        {/* Chin: logo and power light */}
        <div className="absolute bottom-2.5 sm:bottom-3 inset-x-0 flex items-center justify-center gap-2">
          <span className="font-hand text-lg text-[#8a6b46] leading-none">Sibilia</span>
          <span className={cn('w-2 h-2 rounded-full', focusRunning ? 'bg-[#28c840] shadow-[0_0_8px_#28c840]' : 'bg-[#e0a23a] shadow-[0_0_6px_#e0a23a]')} title={focusRunning ? 'Odak açık' : 'Beklemede'} />
        </div>
      </div>
      {/* Stand */}
      <div className="w-24 h-4 bg-[linear-gradient(180deg,#e3d2b4,#cbb48d)] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" aria-hidden />
      <div className="w-44 h-2.5 rounded-full bg-[linear-gradient(180deg,#e9dbc0,#c7ae86)] shadow-[0_8px_12px_-6px_rgba(60,40,20,0.5)]" aria-hidden />

      {/* Keyboard keys */}
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <button onClick={onFocus} className="desk-key desk-key-main px-5 h-12 text-sm font-black gap-2">
          {focusRunning ? <><Pause className="w-4 h-4" /> {focusClock}</> : <><Play className="w-4 h-4" /> Odaklan</>}
        </button>
        <button onClick={onWeek} className="desk-key px-5 h-12 text-sm font-black gap-2"><Sparkles className="w-4 h-4 text-[#c2577a]" /> Haftam</button>
      </div>
    </div>
  );
};
