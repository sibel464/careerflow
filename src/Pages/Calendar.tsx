import React, { useState } from 'react';
import {
  addDays, addMonths, endOfMonth, format, isSameDay, isSameMonth, isToday, parseISO,
  startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarPlus, Download, Clock, Send, Mic } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { useEditor } from '../Hooks/EditorContext';
import { CompanyAvatar } from '../Components/CompanyAvatar';
import { Countdown } from '../Components/Countdown';
import { Application } from '../Interfaces';
import { upcomingInterviews } from '../Utils/insights';
import { downloadInterviewIcs, googleCalendarUrl } from '../Utils/ics';
import { cn } from '../Utils/classNames';

interface CalendarEvent {
  kind: 'interview' | 'applied';
  app: Application;
  date: Date;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const Calendar: React.FC = () => {
  const { applications } = useApplications();
  const { openEditor } = useEditor();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());

  const events: CalendarEvent[] = applications.flatMap(app => [
    { kind: 'applied' as const, app, date: parseISO(app.applicationDate) },
    ...(app.interviewDate ? [{ kind: 'interview' as const, app, date: parseISO(app.interviewDate) }] : []),
  ]);
  const eventsOn = (day: Date) =>
    events.filter(e => isSameDay(e.date, day)).sort((a, b) => (a.kind === 'interview' ? -1 : 1) - (b.kind === 'interview' ? -1 : 1));

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const weeksNeeded = Math.ceil((endOfMonth(month).getTime() - gridStart.getTime()) / (7 * 86400000));
  const days = Array.from({ length: Math.max(weeksNeeded, 5) * 7 }, (_, i) => addDays(gridStart, i));
  const upcoming = upcomingInterviews(applications);
  const next = upcoming[0];
  const selectedEvents = eventsOn(selected);

  const goToday = () => {
    setMonth(startOfMonth(new Date()));
    setSelected(new Date());
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Takvim 📅</h1>
          <p className="text-ink-soft mt-2">Mülakatların ve başvuruların tek bakışta. Hiçbir randevuyu kaçırma!</p>
        </div>
        <button onClick={() => openEditor(null)} className="btn-primary px-5 py-3 text-sm w-fit">
          <CalendarPlus className="w-4 h-4 mr-2" /> Başvuru / Mülakat Ekle
        </button>
      </div>

      {next && (
        <div className="glass-panel p-6 relative overflow-hidden border-moss/30">
          <span className="absolute left-1/2 -bottom-10 text-[120px] opacity-10 rotate-12 select-none pointer-events-none">⏰</span>
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <CompanyAvatar name={next.companyName} className="h-14 w-14 text-lg" />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-clay">Sıradaki mülakat</p>
                <h2 className="text-2xl font-bold font-serif text-ink truncate">{next.companyName}</h2>
                <p className="text-sm font-semibold text-ink-soft">
                  {format(parseISO(next.interviewDate!), "d MMMM EEEE, HH:mm", { locale: tr })}
                  {next.interviewStage && next.interviewStage !== 'Henüz Yok' && ` · ${next.interviewStage}`}
                </p>
              </div>
            </div>
            <div className="w-full lg:w-80"><Countdown target={next.interviewDate!} /></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Month grid */}
        <div className="xl:col-span-2 glass-panel p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold font-serif text-ink capitalize">{format(month, 'MMMM yyyy', { locale: tr })}</h2>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="btn-ghost px-3 py-2 text-xs">Bugün</button>
              <button onClick={() => setMonth(m => subMonths(m, 1))} aria-label="Önceki ay" className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setMonth(m => addMonths(m, 1))} aria-label="Sonraki ay" className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {WEEKDAYS.map(d => <div key={d} className="text-center text-[11px] font-black uppercase text-ink-muted">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(day => {
              const dayEvents = eventsOn(day);
              const inMonth = isSameMonth(day, month);
              const isSelected = isSameDay(day, selected);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={cn(
                    'min-h-16 sm:min-h-24 rounded-xl p-1.5 sm:p-2 text-left flex flex-col gap-1 border transition-all',
                    inMonth ? 'bg-glass/40 border-glass/60 hover:bg-glass/70' : 'bg-transparent border-transparent opacity-40',
                    isSelected && 'ring-2 ring-moss bg-glass/70'
                  )}
                >
                  <span className={cn(
                    'text-xs font-black w-6 h-6 flex items-center justify-center rounded-full',
                    isToday(day) ? 'bg-clay text-white' : 'text-ink-soft'
                  )}>
                    {day.getDate()}
                  </span>
                  <div className="hidden sm:flex flex-col gap-1 min-w-0">
                    {dayEvents.slice(0, 2).map(e => (
                      <span
                        key={`${e.kind}-${e.app.id}`}
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate',
                          e.kind === 'interview' ? 'bg-clay/15 text-clay' : 'bg-moss/10 text-moss'
                        )}
                      >
                        {e.kind === 'interview' && <span className="block text-[9px] opacity-80">🎤 {format(e.date, 'HH:mm')}</span>}
                        {e.kind === 'applied' && '📮 '}{e.app.companyName}
                      </span>
                    ))}
                    {dayEvents.length > 2 && <span className="text-[10px] font-bold text-ink-muted">+{dayEvents.length - 2} daha</span>}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex sm:hidden gap-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <span key={`${e.kind}-${e.app.id}`} className={cn('w-1.5 h-1.5 rounded-full', e.kind === 'interview' ? 'bg-clay' : 'bg-moss')} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs font-bold text-ink-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-clay" /> Mülakat</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-moss" /> Başvuru</span>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold font-serif text-ink mb-4 capitalize">
              {format(selected, 'd MMMM EEEE', { locale: tr })}
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-sm font-medium text-ink-muted text-center py-6 bg-glass/30 rounded-xl border border-glass/40">Bu gün sakin görünüyor. ☕</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(e => (
                  <button key={`${e.kind}-${e.app.id}`} onClick={() => openEditor(e.app)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-glass/60 border border-glass/80 hover:bg-glass/80 text-left transition-colors">
                    <span className={cn('p-2 rounded-lg', e.kind === 'interview' ? 'bg-clay/15 text-clay' : 'bg-moss/15 text-moss')}>
                      {e.kind === 'interview' ? <Mic className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-sm text-ink truncate">{e.app.companyName}</span>
                      <span className="block text-xs font-semibold text-ink-muted truncate">
                        {e.kind === 'interview' ? `Mülakat · ${format(e.date, 'HH:mm')}` : `Başvuru · ${e.app.position}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold font-serif text-ink mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-clay" />Yaklaşan Mülakatlar</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm font-medium text-ink-muted">
                Planlanmış mülakat yok. Bir başvuruyu açıp "Mülakat & Notlar" sekmesinden tarih ekleyebilirsin. 🗓️
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(app => (
                  <div key={app.id} className="p-3 rounded-xl bg-glass/60 border border-glass/80">
                    <button onClick={() => openEditor(app)} className="flex items-center gap-3 w-full text-left">
                      <CompanyAvatar name={app.companyName} className="h-9 w-9 text-xs rounded-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-sm text-ink truncate">{app.companyName}</span>
                        <span className="block text-xs font-semibold text-ink-muted">{format(parseISO(app.interviewDate!), 'd MMM, HH:mm', { locale: tr })}</span>
                      </span>
                    </button>
                    <div className="flex gap-2 mt-3">
                      <a href={googleCalendarUrl(app)} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 px-2 py-1.5 text-[11px]">
                        <CalendarPlus className="w-3.5 h-3.5 mr-1" /> Google
                      </a>
                      <button onClick={() => downloadInterviewIcs(app)} className="btn-ghost flex-1 px-2 py-1.5 text-[11px]">
                        <Download className="w-3.5 h-3.5 mr-1" /> .ics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
