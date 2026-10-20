import React from 'react';
import { addDays, format, startOfWeek, subWeeks, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Flame, Sparkles, Trophy, Lock } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { useGarden } from '../Hooks/useGarden';
import { GardenScene } from '../Components/Garden/GardenScene';
import { LEVELS } from '../Utils/achievements';
import { activityByDay, currentStreak, dayKey } from '../Utils/insights';
import { cn } from '../Utils/classNames';

const WEEKS = 18;
const HEAT_STEPS = ['bg-sand/40', 'bg-moss/30', 'bg-moss/55', 'bg-moss/80', 'bg-moss'];

const ActivityHeatmap: React.FC = () => {
  const { applications } = useApplications();
  const activity = activityByDay(applications);
  const today = new Date();
  const start = startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 });
  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d))
  );
  const total = [...activity.values()].reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5">
          <div className="flex flex-col gap-1.5 pt-5 pr-1 text-[10px] font-bold text-ink-muted">
            {['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'].map((d, i) => <span key={i} className="h-4 leading-4">{d}</span>)}
          </div>
          {weeks.map((days, w) => (
            <div key={w} className="flex flex-col gap-1.5">
              <span className="h-4 text-[10px] font-bold text-ink-muted whitespace-nowrap">
                {days[0].getDate() <= 7 ? format(days[0], 'MMM', { locale: tr }) : ''}
              </span>
              {days.map(day => {
                const count = activity.get(dayKey(day)) || 0;
                const future = isAfter(day, today);
                return (
                  <span
                    key={day.toISOString()}
                    title={future ? '' : `${format(day, 'd MMMM yyyy', { locale: tr })}: ${count ? `${count} aktivite` : 'aktivite yok'}`}
                    className={cn(
                      'w-4 h-4 rounded-[4px] transition-transform hover:scale-125',
                      future ? 'opacity-0' : HEAT_STEPS[Math.min(count, 4)],
                      dayKey(day) === dayKey(today) && 'ring-2 ring-clay/60'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs font-bold text-ink-muted">
        <span>Son {WEEKS} haftada {total} aktivite</span>
        <span className="flex items-center gap-1.5">
          Az {HEAT_STEPS.map(c => <span key={c} className={cn('w-3 h-3 rounded-[3px]', c)} />)} Çok
        </span>
      </div>
    </div>
  );
};

export const Garden: React.FC = () => {
  const { applications } = useApplications();
  const { results, unlocked, xp, level, next, levelProgress } = useGarden();
  const streak = currentStreak(applications);
  const current = LEVELS[level];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Kariyer Bahçem 🌳</h1>
        <p className="text-ink-soft mt-2">Her başvuru bir tohum, her mülakat bir dal. Bahçeni büyüt, rozetleri topla!</p>
      </div>

      <GardenScene applications={applications} level={level} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="flex-1 w-full">
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted">Seviye {level + 1}</p>
            <h2 className="text-4xl font-black font-serif mt-1"><span className="text-shine">{current.name}</span> {current.emoji}</h2>
            <p className="text-ink-soft font-semibold mt-2">
              {next ? `${next.name} olmak için ${next.xp - xp} XP daha topla.` : 'Bahçenin en ulu ağacı oldun! 🎉'}
            </p>
            <div className="mt-5">
              <div className="flex justify-between text-sm font-bold mb-1.5">
                <span className="text-ink">{xp} XP</span>
                {next && <span className="text-ink-muted">{next.xp} XP</span>}
              </div>
              <div className="h-4 rounded-full bg-sand/50 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-moss to-[#6fb06a] transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${Math.max(levelProgress * 100, 3)}%` }}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%] animate-[shine_2.5s_linear_infinite]" />
                </div>
              </div>
            </div>
            <p className="text-xs font-semibold text-ink-muted mt-4">
              💡 Başvuru +10 · Mülakat +25 · Teklif +50 · Kabul +100 · Simülatör provası +10 · Görev ve hazır cevap +5 · Rozet +30
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-3 lg:grid-cols-1 gap-4">
          {[
            { icon: Flame, label: 'Günlük seri', value: `${streak} gün`, tone: 'text-clay', hint: streak ? 'Ateşi söndürme! 🔥' : 'Bugün bir adım at' },
            { icon: Sparkles, label: 'Toplam XP', value: xp, tone: 'text-sun', hint: `${current.emoji} ${current.name}` },
            { icon: Trophy, label: 'Rozetler', value: `${unlocked.length}/${results.length}`, tone: 'text-moss', hint: 'Hepsini topla!' },
          ].map(stat => (
            <div key={stat.label} className="glass-panel p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-3">
              <span className={cn('p-3 rounded-2xl bg-glass/60 border border-glass/80 w-fit', stat.tone)}>
                <stat.icon className={cn('w-6 h-6', stat.label === 'Günlük seri' && streak > 0 && 'animate-pulse')} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-black text-ink leading-tight">{stat.value}</p>
                <p className="text-xs font-bold text-ink-soft">{stat.label}</p>
                <p className="hidden sm:block text-[11px] font-semibold text-ink-muted">{stat.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level road */}
      <div className="glass-panel p-6 overflow-x-auto">
        <div className="flex items-center min-w-[640px]">
          {LEVELS.map((l, i) => (
            <React.Fragment key={l.name}>
              <div className="flex flex-col items-center gap-1.5 w-20 shrink-0">
                <span className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all',
                  i < level && 'bg-moss/15 border-moss/40',
                  i === level && 'bg-moss/20 border-moss scale-125 shadow-lg animate-float',
                  i > level && 'bg-glass/40 border-glass/60 grayscale opacity-50'
                )}>
                  {l.emoji}
                </span>
                <span className={cn('text-[11px] font-bold text-center leading-tight', i === level ? 'text-moss' : 'text-ink-muted')}>{l.name}</span>
              </div>
              {i < LEVELS.length - 1 && (
                <div className="flex-1 h-1.5 rounded-full bg-sand/50 overflow-hidden -mt-6">
                  <div className="h-full bg-moss transition-all duration-700" style={{ width: i < level ? '100%' : i === level ? `${levelProgress * 100}%` : '0%' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold font-serif text-ink mb-4">Aktivite Haritası 🗓️</h2>
        <ActivityHeatmap />
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif text-ink mb-4">Rozet Koleksiyonu 🏅</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {results.map(a => (
            <div
              key={a.id}
              className={cn(
                'glass-panel p-4 text-center relative overflow-hidden group',
                a.unlocked ? 'glass-panel-hover' : 'opacity-75'
              )}
            >
              {a.unlocked && <span className="absolute inset-0 bg-gradient-to-br from-sun/15 via-transparent to-moss/10 pointer-events-none" />}
              <div className={cn(
                'relative mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 border-2',
                a.unlocked ? 'bg-glass/70 border-sun/60 shadow-[0_0_24px_rgba(232,185,35,0.35)] group-hover:rotate-12 transition-transform' : 'bg-glass/30 border-dashed border-sand grayscale'
              )}>
                {a.emoji}
                {!a.unlocked && <Lock className="absolute -bottom-1 -right-1 w-5 h-5 p-1 rounded-full bg-sand text-ink-soft" />}
              </div>
              <p className="relative font-bold text-sm text-ink">{a.title}</p>
              <p className="relative text-[11px] font-semibold text-ink-muted mt-1 leading-snug min-h-[2.5em]">{a.description}</p>
              {!a.unlocked && a.goal > 1 && (
                <div className="relative mt-2">
                  <div className="h-1.5 rounded-full bg-sand/50 overflow-hidden">
                    <div className="h-full bg-clay rounded-full" style={{ width: `${(a.value / a.goal) * 100}%` }} />
                  </div>
                  <p className="text-[10px] font-black text-ink-muted mt-1">{a.value}/{a.goal}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
