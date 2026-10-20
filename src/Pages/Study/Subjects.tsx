import React, { useState } from 'react';
import { differenceInCalendarDays, format, parseISO, isBefore, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Trash2, ChevronDown, CalendarPlus, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useStudy } from '../../Hooks/useStudy';
import { useFocus } from '../../Hooks/FocusContext';
import { SUBJECT_COLORS, SUBJECT_EMOJIS, Subject, formatMinutes } from '../../Utils/study';
import { ConfirmModal } from '../../Components/ConfirmModal';
import { cn } from '../../Utils/classNames';

const SubjectCard: React.FC<{
  subject: Subject;
  minutes: number;
  weekMinutes: number;
  onChange: (s: Subject) => void;
  onDelete: () => void;
  onStudy: () => void;
}> = ({ subject, minutes, weekMinutes, onChange, onDelete, onStudy }) => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const done = subject.topics.filter(t => t.done).length;
  const progress = subject.topics.length ? done / subject.topics.length : 0;

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onChange({ ...subject, topics: [...subject.topics, { id: uuidv4(), title: topic.trim(), done: false }] });
    setTopic('');
  };

  return (
    <div className="relative">
      {/* Index tabs: one per topic, colored when done */}
      <div className="absolute -right-2.5 top-6 flex flex-col gap-1 z-0" aria-hidden>
        {subject.topics.slice(0, 8).map(t => (
          <span key={t.id} className="w-4 h-5 rounded-r-md shadow-sm transition-colors" style={{ background: t.done ? subject.color : '#efe6d6' }} />
        ))}
      </div>

      {/* Cover */}
      <div className="relative z-10 rounded-r-2xl rounded-l-md overflow-hidden shadow-[0_18px_30px_-16px_rgba(0,0,0,0.5)] notebook-cover"
        style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${subject.color} 88%, white), ${subject.color} 45%, color-mix(in srgb, ${subject.color} 70%, black))` }}>
        <span className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1.5px)] bg-[length:5px_5px]" aria-hidden />
        <div className="relative p-5 pl-8 min-h-[190px] flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="text-5xl drop-shadow-md">{subject.emoji}</span>
            <button onClick={onStudy} className="w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ color: subject.color }} aria-label={`${subject.name} çalış`} title="Bu derse pomodoro başlat">
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
          {/* Paper name label */}
          <div className="mt-auto paper rounded-md px-4 py-2.5 shadow-md rotate-[-1.2deg] w-[85%]">
            <h3 className="font-hand text-3xl leading-7 truncate">{subject.name}</h3>
            <p className="text-[11px] font-bold opacity-60 mt-1">Bu hafta {formatMinutes(weekMinutes)} · toplam {formatMinutes(minutes)}</p>
            <div className="mt-1.5 h-1.5 rounded-full bg-black/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress * 100}%`, background: subject.color }} />
            </div>
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="relative w-full flex items-center justify-between px-8 py-2.5 bg-black/20 text-white text-sm font-black hover:bg-black/30 transition-colors">
          Konular · {done}/{subject.topics.length}
          <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {/* Page that slides out of the notebook */}
      {open && (
        <div className="relative z-0 -mt-3 mx-2 pt-6 pb-4 px-5 paper rounded-b-xl shadow-lg paper-lines animate-[slideDown_0.35s_ease-out]">
          {subject.topics.map(t => (
            <div key={t.id} className="h-9 flex items-center gap-2.5 group">
              <button onClick={() => onChange({ ...subject, topics: subject.topics.map(x => (x.id === t.id ? { ...x, done: !x.done } : x)) })}
                className="w-6 h-6 shrink-0 hover:scale-110 transition-transform" aria-label={t.done ? 'Geri al' : 'Tamamla'}>
                <svg viewBox="0 0 28 28" className="w-full h-full overflow-visible">
                  <path d="M4 5.5 C 10 4.2, 18 4.8, 23.5 5 C 24.2 11, 23.6 18, 23.8 23.4 C 17 24, 10 23.4, 4.6 23.8 C 4 17, 4.6 11, 4 5.5 Z" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.6" />
                  {t.done && <path d="M7 14.5 L12 20 L26 2" fill="none" stroke={subject.color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="pen-tick" />}
                </svg>
              </button>
              <span className={cn('relative flex-1 truncate font-hand text-[22px]', t.done && 'opacity-50')}>
                {t.title}{t.done && <span className="pen-strike" aria-hidden />}
              </span>
              <button onClick={() => onChange({ ...subject, topics: subject.topics.filter(x => x.id !== t.id) })} className="p-1 opacity-0 group-hover:opacity-60 hover:text-clay" aria-label="Konuyu sil">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <form onSubmit={addTopic} className="h-9 flex items-center gap-2">
            <Plus className="w-4 h-4 opacity-50 shrink-0" />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Yeni konu yaz…" className="flex-1 bg-transparent outline-none font-hand text-[22px] placeholder:opacity-40 placeholder:text-[var(--paper-ink)]" />
          </form>
          <button onClick={onDelete} className="mt-2 text-xs font-bold opacity-50 hover:opacity-100 hover:text-clay flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Dersi sil</button>
        </div>
      )}
    </div>
  );
};

export const Subjects: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, setSubjects, exams, setExams, log, subjectById } = useStudy();
  const focus = useFocus();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(SUBJECT_EMOJIS[0]);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [exam, setExam] = useState({ subjectId: subjects[0]?.id ?? '', title: '', date: '' });

  const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
  const [weekAgo] = useState(() => Date.now() - 7 * 86400000);
  const minutesFor = (id: string, sinceWeek = false) =>
    log.filter(l => l.subjectId === id && (!sinceWeek || parseISO(l.date).getTime() >= weekAgo)).reduce((s, l) => s + l.minutes, 0);

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubjects(prev => [...prev, { id: uuidv4(), name: name.trim(), emoji, color, topics: [] }]);
    setName('');
    toast.success(`${emoji} ${name.trim()} eklendi!`);
  };

  const addExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam.title.trim() || !exam.date || !exam.subjectId) {
      toast.info('Ders, sınav adı ve tarih gerekli. 📅');
      return;
    }
    setExams(prev => [...prev, { id: uuidv4(), subjectId: exam.subjectId, title: exam.title.trim(), date: new Date(exam.date).toISOString() }]);
    setExam(x => ({ ...x, title: '', date: '' }));
    toast.success('Sınav eklendi. Şimdiden başarılar! 🍀');
  };

  const studySubject = (id: string) => {
    focus.setSubjectId(id);
    navigate('/study/focus');
  };

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Ders Defterlerim 📚</h1>
        <p className="text-ink-soft mt-2">Derslerini düzenle, konuları işaretle (+3 🪙), sınavlarını takip et.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-9 gap-y-8 items-start pr-3">
        {subjects.map(s => (
          <SubjectCard
            key={s.id}
            subject={s}
            minutes={minutesFor(s.id)}
            weekMinutes={minutesFor(s.id, true)}
            onChange={(next) => setSubjects(prev => prev.map(x => (x.id === next.id ? next : x)))}
            onDelete={() => setDeleting(s)}
            onStudy={() => studySubject(s.id)}
          />
        ))}

        <form onSubmit={addSubject} className="rounded-r-2xl rounded-l-md p-5 border-dashed border-2 border-sand bg-glass/30 space-y-4">
          <p className="font-bold text-ink">Yeni ders ekle ➕</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ders adı (örn: Python)" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" />
          <div className="grid grid-cols-7 gap-1.5">
            {SUBJECT_EMOJIS.map(em => (
              <button type="button" key={em} onClick={() => setEmoji(em)} className={cn('aspect-square rounded-lg text-xl', emoji === em ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{em}</button>
            ))}
          </div>
          <button type="submit" disabled={!name.trim()} className="btn-primary w-full py-3 disabled:opacity-50">
            <span className="w-3 h-3 rounded-full mr-2 border border-white/60" style={{ backgroundColor: color }} /> Ekle
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-ink">Sınav Takvimi 🗓️</h2>
        <div className="flex gap-5 overflow-x-auto pb-4 pt-2 px-1">
          {sortedExams.map((e, i) => {
            const s = subjectById(e.subjectId);
            const days = differenceInCalendarDays(parseISO(e.date), new Date());
            const past = isBefore(parseISO(e.date), startOfDay(new Date()));
            return (
              <div key={e.id} className={cn('group relative shrink-0 self-start w-44 mb-8', past && 'opacity-50 grayscale-[0.4]')} style={{ transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)` }}>
                {/* Tear-off desk calendar page */}
                <div className="rounded-xl overflow-hidden shadow-[0_14px_22px_-12px_rgba(0,0,0,0.45)] bg-white text-[#2c2a30]">
                  <div className="relative h-9 flex items-center justify-center text-white text-xs font-black uppercase tracking-[0.2em]" style={{ background: s?.color ?? '#c05c3e' }}>
                    {format(parseISO(e.date), 'MMMM', { locale: tr })}
                    <span className="absolute -top-1.5 left-8 w-2.5 h-5 rounded-full bg-[#8d8f96] shadow-inner" />
                    <span className="absolute -top-1.5 right-8 w-2.5 h-5 rounded-full bg-[#8d8f96] shadow-inner" />
                  </div>
                  <div className="text-center pt-2 pb-3 px-3 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,0.015)_2px_3px)]">
                    <p className="text-6xl font-black leading-none tabular-nums" style={{ color: s?.color }}>{format(parseISO(e.date), 'd')}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mt-1">{format(parseISO(e.date), 'EEEE · HH:mm', { locale: tr })}</p>
                    <p className="font-hand text-2xl leading-6 mt-2 line-clamp-2">{s?.emoji} {e.title}</p>
                  </div>
                  <div className="h-2 bg-[radial-gradient(circle_at_4px_0,transparent_3px,white_3.5px)] bg-[length:8px_8px] -mb-1" />
                </div>
                {/* Handwritten countdown sticky */}
                <span className={cn('absolute -bottom-7 -right-2 px-2.5 py-1 font-hand text-xl shadow-md rotate-[6deg]', past ? 'bg-[#e6e2da]' : days <= 3 ? 'bg-[#ffd3df]' : 'bg-[#fff1a8]')} style={{ color: '#3b2f2a' }}>
                  {past ? 'geçti' : days === 0 ? 'bugün!' : `${days} gün`}
                </span>
                <button onClick={() => setExams(prev => prev.filter(x => x.id !== e.id))} className="absolute top-10 right-1 p-1.5 rounded-lg bg-white/80 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Sınavı sil">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* New exam: a blank page to fill */}
          <form onSubmit={addExam} className="shrink-0 w-64 rounded-xl paper p-4 space-y-2.5 shadow-[0_14px_22px_-12px_rgba(0,0,0,0.35)] border-2 border-dashed border-[var(--paper-edge)]">
            <p className="font-hand text-2xl flex items-center gap-2"><CalendarPlus className="w-5 h-5 opacity-60" /> Yeni sınav</p>
            <select value={exam.subjectId} onChange={(e) => setExam(x => ({ ...x, subjectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/70 border border-black/10 font-bold text-sm" aria-label="Ders">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
            <input value={exam.title} onChange={(e) => setExam(x => ({ ...x, title: e.target.value }))} placeholder="Final, Quiz 2…" className="w-full px-3 py-2 rounded-lg bg-white/70 border border-black/10 text-sm" />
            <input type="datetime-local" value={exam.date} onChange={(e) => setExam(x => ({ ...x, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/70 border border-black/10 text-sm" aria-label="Tarih ve saat" />
            <button type="submit" className="btn-primary w-full py-2.5 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Takvime as</button>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          setSubjects(prev => prev.filter(s => s.id !== deleting.id));
          setExams(prev => prev.filter(e => e.subjectId !== deleting.id));
        }}
        title="Dersi Sil"
        message={`"${deleting?.name}" dersi ve ona bağlı sınavlar silinecek. Çalışma geçmişin korunur.`}
        confirmText="Evet, Sil"
      />
    </div>
  );
};
