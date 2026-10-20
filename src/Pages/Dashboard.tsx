import React, { useState } from 'react';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, Leaf, Coffee, Calendar, CheckSquare, Mail, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../Hooks/ApplicationContext';
import { usePreferences } from '../Hooks/PreferencesContext';
import { useEditor } from '../Hooks/EditorContext';
import { StatCard } from '../Components/StatCard';
import { ApplicationCard } from '../Components/ApplicationCard';
import { ApplicationTable } from '../Components/ApplicationTable';
import { CompanyAvatar } from '../Components/CompanyAvatar';
import { appliedThisWeek, needsFollowUp, pendingTodos, responseRate, greeting, daysSince, upcomingInterviews, currentStreak } from '../Utils/insights';
import { Countdown } from '../Components/Countdown';
import { Companion } from '../Components/Companion';
import { useGarden } from '../Hooks/useGarden';
import { LEVELS } from '../Utils/achievements';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const QUOTES = [
  'Her harika başarı, küçük bir adımla başlar. 🌿',
  'Gelecek, ona bugünden hazırlananlara aittir. ☕',
  'Fırsatlar kapıyı çalmaz, sen o kapıyı inşa edersin. 🚪✨',
  'Başarı, her gün tekrarlanan küçük çabaların toplamıdır. 🌱',
  'Bir "hayır", doğru "evet"e bir adım daha yakın demek. 🍂',
];

const GoalRing: React.FC<{ value: number; goal: number }> = ({ value, goal }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(goal, 1), 1);
  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="12" className="stroke-sand/50" />
        <circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="12" strokeLinecap="round"
          className="stroke-moss transition-[stroke-dashoffset] duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-ink leading-none">{value}</span>
        <span className="text-xs font-bold text-ink-muted">/ {goal}</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { applications, getStats, toggleTodo } = useApplications();
  const { preferences } = usePreferences();
  const { openEditor } = useEditor();
  const navigate = useNavigate();
  const stats = getStats();

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const hello = greeting();

  const recentApplications = [...applications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const thisWeek = appliedThisWeek(applications).length;
  const goal = preferences.weeklyGoal;
  const interviews = applications
    .filter(app => app.status === 'Mülakat Bekleniyor' || (app.status === 'Mülakat Yapıldı' && app.interviewStage !== 'Henüz Yok'))
    .slice(0, 4);
  const todos = pendingTodos(applications).slice(0, 5);
  const followUps = needsFollowUp(applications).slice(0, 3);
  const nextInterview = upcomingInterviews(applications)[0];
  const { level, xp } = useGarden();
  const streak = currentStreak(applications);

  return (
    <div className="space-y-8 relative z-10 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero */}
        <div className="lg:col-span-2 flex flex-col md:flex-row md:justify-between md:items-center gap-6 glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-15 pointer-events-none">
            <Leaf className="w-64 h-64 text-moss" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-2 bg-glass/60 backdrop-blur-md px-3 py-1 rounded-full text-ink text-xs font-bold tracking-wide border border-glass/80 shadow-sm">
                <Coffee className="w-3.5 h-3.5 shrink-0" />
                <span>{quote}</span>
              </div>
              <button
                onClick={() => navigate('/growth/garden')}
                className="inline-flex items-center gap-2 bg-moss/10 hover:bg-moss/20 px-3 py-1 rounded-full text-moss text-xs font-black border border-moss/20 transition-colors"
              >
                {LEVELS[level].emoji} {LEVELS[level].name} · {xp} XP{streak > 0 && ` · 🔥 ${streak} gün`}
              </button>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 text-ink font-serif">
              {hello.text}{preferences.userName ? `, ${preferences.userName}` : ''}! {hello.emoji}
            </h1>
            <p className="text-ink-soft text-lg max-w-xl font-medium">
              {stats.total === 0
                ? 'Kariyer yolculuğunu doğanın huzuruyla yönet. İlk başvurunu ekleyerek başla! 🎯'
                : `Şu ana kadar ${stats.total} başvuru yaptın ve ${responseRate(applications)}% oranında geri dönüş aldın. Böyle devam! 🎯`}
            </p>
          </div>
          <button
            onClick={() => openEditor(null)}
            className="btn-primary relative z-10 px-6 py-3.5 text-sm hover:scale-105 whitespace-nowrap"
          >
            Yeni Başvuru 📝
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Weekly goal */}
        <div className="glass-panel p-6 flex items-center gap-5 relative overflow-hidden">
          <GoalRing value={thisWeek} goal={goal} />
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-ink mb-1 font-serif">Haftalık Hedef 🎯</h3>
            <p className="text-ink-soft text-sm font-medium mb-3">
              Bu hafta {thisWeek} başvuru yaptın.
            </p>
            <span className="inline-block text-xs font-bold text-clay bg-glass/60 px-2 py-1 rounded-md shadow-sm border border-glass/80">
              {thisWeek >= goal ? 'Hedef tamamlandı! 🎉' : `${goal - thisWeek} başvuru kaldı 💪`}
            </span>
            <button onClick={() => navigate('/settings')} className="block mt-3 text-xs font-bold text-ink-muted hover:text-moss underline-offset-2 hover:underline">
              Hedefi değiştir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Toplam Başvuru 📂" value={stats.total} icon={Briefcase} colorClass="text-clay" />
        <StatCard title="Bekleyen ⏳" value={stats.pending} icon={Clock} colorClass="text-ink-soft" />
        <StatCard title="Kabul Edilenler 🎉" value={stats.accepted} icon={CheckCircle2} colorClass="text-moss" />
        <StatCard title="Reddedilenler 🍂" value={stats.rejected} icon={XCircle} colorClass="text-[#8c3a3a] dark:text-[#e08a7a]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ink tracking-tight font-serif">Son Başvurular 📌</h2>
              <p className="text-ink-soft text-sm mt-1">En son eklediğin 5 başvuru kaydı.</p>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="text-sm font-bold text-clay hover:text-clay-deep group flex items-center bg-glass/50 px-3 py-1.5 rounded-xl border border-glass/80 shadow-sm backdrop-blur-sm"
            >
              Tümünü Gör 👀
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {recentApplications.length > 0 ? (
            <>
              <ApplicationTable applications={recentApplications} />
              <div className="md:hidden space-y-4">
                {recentApplications.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 text-center">
              <div className="w-20 h-20 bg-glass/60 border border-glass/80 text-ink-soft mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2 font-serif">Henüz hiç başvuru yok 🌱</h3>
              <p className="text-ink-soft mb-6 max-w-md mx-auto">Tohumları ekmeye başla! İlk başvurunu ekle ve süreci takip et.</p>
              <button onClick={() => openEditor(null)} className="btn-primary px-6 py-3 hover:scale-105">
                İlk Başvuruyu Ekle ✨
              </button>
            </div>
          )}
        </div>

        {/* Widgets */}
        <div className="space-y-6">
          {nextInterview && (
            <div className="glass-panel p-6 relative overflow-hidden border-clay/30">
              <span className="absolute -right-4 -top-4 text-7xl opacity-10 rotate-12 select-none pointer-events-none">🎤</span>
              <p className="text-xs font-black uppercase tracking-widest text-clay mb-3">Sıradaki mülakat</p>
              <button onClick={() => openEditor(nextInterview)} className="flex items-center gap-3 mb-4 text-left w-full">
                <CompanyAvatar name={nextInterview.companyName} className="h-11 w-11 text-sm" />
                <span className="min-w-0">
                  <span className="block font-bold text-ink truncate">{nextInterview.companyName}</span>
                  <span className="block text-xs font-semibold text-ink-muted">
                    {format(parseISO(nextInterview.interviewDate!), 'd MMMM EEEE, HH:mm', { locale: tr })}
                  </span>
                </span>
              </button>
              <Countdown target={nextInterview.interviewDate!} compact />
              <button onClick={() => navigate('/calendar')} className="w-full mt-4 text-xs font-bold text-moss hover:underline flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Takvimi aç
              </button>
            </div>
          )}

          {followUps.length > 0 && (
            <div className="glass-panel p-6 border-clay/30">
              <h3 className="text-lg font-bold text-ink mb-1 flex items-center font-serif">
                <Mail className="w-5 h-5 mr-2 text-clay" />
                Takip Zamanı
              </h3>
              <p className="text-xs font-semibold text-ink-muted mb-4">Bir haftadır ses yok — kibar bir hatırlatma iyi gelebilir.</p>
              <div className="space-y-2">
                {followUps.map(app => (
                  <button key={app.id} onClick={() => openEditor(app)} className="w-full flex items-center gap-3 p-2.5 bg-glass/50 border border-glass/70 rounded-xl hover:bg-glass/70 transition-colors text-left">
                    <CompanyAvatar name={app.companyName} className="h-9 w-9 text-xs rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink text-sm truncate">{app.companyName}</span>
                      <span className="block text-xs font-semibold text-ink-muted">{daysSince(app.updatedAt)} gün önce güncellendi</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center font-serif">
              <Calendar className="w-5 h-5 mr-2 text-clay" />
              Süreçteki Mülakatlar
            </h3>
            {interviews.length > 0 ? (
              <div className="space-y-2">
                {interviews.map(app => (
                  <button key={app.id} onClick={() => openEditor(app)} className="w-full flex items-center gap-3 p-2.5 bg-glass/60 border border-glass/80 rounded-xl shadow-sm hover:scale-[1.02] transition-transform text-left">
                    <CompanyAvatar name={app.companyName} className="h-9 w-9 text-xs rounded-lg" />
                    <span className="min-w-0">
                      <span className="block font-bold text-ink text-sm truncate">{app.companyName}</span>
                      <span className="block text-xs font-bold text-ink-soft truncate">
                        {app.interviewStage && app.interviewStage !== 'Henüz Yok' ? app.interviewStage : 'Mülakat Bekleniyor ⏳'}
                      </span>
                    </span>
                  </button>
                ))}
                <button onClick={() => navigate('/interview')} className="w-full mt-2 text-xs font-bold text-moss hover:underline flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Mülakata hazırlan
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink-muted font-medium p-4 text-center bg-glass/30 rounded-xl border border-glass/40">Şu an ufukta bekleyen bir mülakat görünmüyor. ☕</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center font-serif">
              <CheckSquare className="w-5 h-5 mr-2 text-moss" />
              Bekleyen Görevler
            </h3>
            {todos.length > 0 ? (
              <div className="space-y-2">
                {todos.map(todo => (
                  <label key={todo.id} className="flex items-start p-3 bg-glass/60 border border-glass/80 rounded-xl shadow-sm cursor-pointer hover:bg-glass/80 transition-colors group">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTodo(todo.appId, todo.id)}
                      className="peer sr-only"
                    />
                    <span className="w-5 h-5 rounded-md border-2 border-ink-muted mt-0.5 mr-3 flex-shrink-0 group-hover:border-moss group-hover:bg-moss/10 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-moss" />
                    <span>
                      <span className="block font-bold text-ink text-sm leading-tight">{todo.text}</span>
                      <span className="block text-[10px] font-bold text-clay mt-1 uppercase tracking-wider">{todo.companyName}</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-glass/30 rounded-xl border border-glass/40">
                <p className="text-sm text-ink-muted font-medium">Tüm görevlerini tamamlamışsın, harikasın! ✨</p>
                {applications.length > 0 && (
                  <button onClick={() => openEditor(applications[0])} className="mt-2 inline-flex items-center text-xs font-bold text-moss hover:underline">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Yeni görev ekle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Companion />
    </div>
  );
};
