import React from 'react';
import { subDays } from 'date-fns';
import { useStudy } from '../../Hooks/useStudy';
import { useCorner } from '../../Hooks/useCorner';
import { readStored } from '../../Hooks/useLocalStorage';
import { GOALS_KEY, Goal, goalProgress } from '../../Utils/goals';
import { formatMinutes, minutesOn, studyStreak } from '../../Utils/study';
import { ProgressMeta } from '../../Utils/chat';

/** Cards built from your own progress, ready to drop into a chat. */
export const ProgressPicker: React.FC<{ onPick: (meta: ProgressMeta, body: string) => void }> = ({ onPick }) => {
  const { log, tasks } = useStudy();
  const { books } = useCorner();
  const today = minutesOn(log, new Date());
  const week = Array.from({ length: 7 }, (_, i) => minutesOn(log, subDays(new Date(), i))).reduce((s, m) => s + m, 0);
  const streak = studyStreak(log);
  const doneToday = tasks.filter(t => t.done && t.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;

  const cards: { meta: ProgressMeta; body: string }[] = [
    { meta: { emoji: '🍅', title: 'Bugün odaklandım', value: formatMinutes(today) }, body: `🍅 Bugün ${formatMinutes(today)} odaklandım` },
    { meta: { emoji: '🔥', title: 'Çalışma serim', value: `${streak} gün` }, body: `🔥 ${streak} gündür aralıksız çalışıyorum` },
    { meta: { emoji: '📅', title: 'Bu hafta toplam', value: formatMinutes(week) }, body: `📅 Bu hafta ${formatMinutes(week)} çalıştım` },
    ...(doneToday ? [{ meta: { emoji: '✅', title: 'Bugün biten görev', value: `${doneToday} görev` }, body: `✅ Bugün ${doneToday} görev bitirdim` }] : []),
    ...readStored<Goal[]>(GOALS_KEY, []).slice(0, 4).map(g => {
      const p = goalProgress(g, log, books);
      const next = p.stops.find(s => !s.done);
      const value = g.kind === 'steps' ? `${p.value}/${p.total} durak` : `%${Math.round(p.fraction * 100)}`;
      return {
        meta: { emoji: g.emoji, title: g.title, value, detail: next ? `Sıradaki durak: ${next.title}` : 'Hedefe ulaştım! 🎉' },
        body: `${g.emoji} ${g.title}: ${value}`,
      };
    }),
  ];

  return (
    <div className="border-t border-glass/60 bg-glass/50 p-2">
      <p className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-ink-muted">İlerlemeni paylaş</p>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
        {cards.map(c => (
          <button key={c.body} type="button" onClick={() => onPick(c.meta, c.body)}
            className="paper shrink-0 w-44 text-left rounded-lg px-3 py-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <span className="text-2xl">{c.meta.emoji}</span>
            <p className="text-xs font-bold truncate mt-0.5">{c.meta.title}</p>
            <p className="font-hand text-2xl leading-none text-[#b8322a]">{c.meta.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
