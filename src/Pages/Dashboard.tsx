import React from 'react';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, Leaf, Coffee, Calendar, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../Hooks/ApplicationContext';
import { StatCard } from '../Components/StatCard';
import { ApplicationCard } from '../Components/ApplicationCard';
import { ApplicationTable } from '../Components/ApplicationTable';

export const Dashboard: React.FC = () => {
  const { applications, getStats } = useApplications();
  const navigate = useNavigate();
  const stats = getStats();

  const recentApplications = applications.slice(0, 5);

  const upcomingInterviews = applications.filter(app => 
    app.status === 'Mülakat Bekleniyor' || app.interviewStage !== 'Henüz Yok'
  ).slice(0, 4);

  const pendingTodos = applications.flatMap(app => 
    (app.todos || []).filter(todo => !todo.completed).map(todo => ({
      ...todo,
      companyName: app.companyName,
      appId: app.id
    }))
  ).slice(0, 4);

  const quotes = [
    "Her harika başarı, küçük bir adımla başlar. 🌿",
    "Gelecek, ona bugünden hazırlananlara aittir. ☕",
    "Fırsatlar kapıyı çalmaz, sen o kapıyı inşa edersin. 🚪✨",
    "Başarı, her gün tekrarlanan küçük çabaların toplamıdır. 🌱"
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Section */}
        <div className="lg:col-span-2 flex flex-col md:flex-row md:justify-between md:items-center gap-6 glass-panel p-8 bg-white/30 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-20 pointer-events-none">
            <Leaf className="w-64 h-64 text-[#2c5e4a]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-[#4a3f35] text-xs font-bold tracking-wider mb-4 border border-white/80 shadow-sm">
              <Coffee className="w-3.5 h-3.5" />
              <span>Günün Sözü: {randomQuote}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 text-[#4a3f35] drop-shadow-sm font-serif">
              Hoş Geldin! 🌻
            </h1>
            <p className="text-[#6b4c3a] text-lg max-w-xl font-medium">
              Kariyer yolculuğunu doğanın huzuruyla yönet. Başvurularını takip et, mülakatlarını planla ve hayalindeki işe ulaş! 🎯
            </p>
          </div>
          <button 
            onClick={() => navigate('/applications')}
            className="relative z-10 inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-[#2c5e4a]/90 backdrop-blur-md rounded-xl hover:bg-[#2c5e4a] hover:scale-105 transition-all shadow-lg border border-[#3d7a62]/50 active:scale-95 whitespace-nowrap"
          >
            Yeni Başvuru 📝
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Goal Tracker */}
        <div className="glass-panel p-6 bg-white/40 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-[#4a3f35] mb-2 font-serif flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-[#c05c3e]" />
              Haftalık Hedef 🎯
            </h3>
            <p className="text-[#6b4c3a] text-sm font-medium mb-4">Bu hafta 5 başvuru hedefine ulaşmak için son durumun:</p>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-[#2c5e4a] drop-shadow-sm">{Math.min(recentApplications.length, 5)}<span className="text-lg text-[#a38b76]">/5</span></span>
              <span className="text-xs font-bold text-[#c05c3e] bg-white/60 px-2 py-1 rounded-md shadow-sm border border-white/80">
                {recentApplications.length >= 5 ? 'Hedef Tamamlandı! 🎉' : 'Devam Et! 💪'}
              </span>
            </div>
            
            <div className="w-full bg-white/50 rounded-full h-3.5 mb-2 shadow-inner border border-white/60 overflow-hidden">
              <div 
                className="bg-[#2c5e4a] h-3.5 rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${Math.min((recentApplications.length / 5) * 100, 100)}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Toplam Başvuru 📂" value={stats.total} icon={Briefcase} colorClass="text-[#c05c3e]" />
        <StatCard title="Bekleyen ⏳" value={stats.pending} icon={Clock} colorClass="text-[#6b4c3a]" />
        <StatCard title="Kabul Edilenler 🎉" value={stats.accepted} icon={CheckCircle2} colorClass="text-[#2c5e4a]" />
        <StatCard title="Reddedilenler 🍂" value={stats.rejected} icon={XCircle} colorClass="text-[#8c3a3a]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sol Taraf: Son Başvurular */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#4a3f35] tracking-tight font-serif">Son Başvurular 📌</h2>
              <p className="text-[#6b4c3a] text-sm mt-1">En son eklediğiniz 5 başvuru kaydı.</p>
            </div>
            <button 
              onClick={() => navigate('/applications')}
              className="text-sm font-bold text-[#c05c3e] hover:text-[#a0482d] group flex items-center bg-white/50 px-3 py-1.5 rounded-xl border border-white/80 shadow-sm backdrop-blur-sm"
            >
              Tümünü Gör 👀
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {recentApplications.length > 0 ? (
            <>
              <ApplicationTable 
                applications={recentApplications} 
                onEdit={() => navigate('/applications')}
                onDelete={() => navigate('/applications')}
              />
              <div className="md:hidden space-y-4">
                {recentApplications.map(app => (
                  <ApplicationCard 
                    key={app.id} 
                    application={app} 
                    onEdit={() => navigate('/applications')}
                    onDelete={() => navigate('/applications')}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 text-center bg-white/30">
              <div className="w-20 h-20 bg-white/60 border border-white/80 text-[#6b4c3a] mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#4a3f35] mb-2 font-serif">Henüz hiç başvuru yok 🌱</h3>
              <p className="text-[#6b4c3a] mb-6 max-w-md mx-auto">Tohumları ekmeye başla! İlk başvurunu ekle ve süreci takip et.</p>
              <button 
                onClick={() => navigate('/applications')}
                className="inline-flex items-center px-6 py-3 bg-[#2c5e4a] text-white rounded-xl font-bold hover:bg-[#3d7a62] hover:scale-105 transition-all shadow-lg"
              >
                İlk Başvuruyu Ekle ✨
              </button>
            </div>
          )}
        </div>

        {/* Sağ Taraf: Widgetlar */}
        <div className="space-y-6">
          {/* Yaklaşan Etkinlikler / Mülakatlar */}
          <div className="glass-panel p-6 bg-white/40">
            <h3 className="text-lg font-bold text-[#4a3f35] mb-4 flex items-center font-serif">
              <Calendar className="w-5 h-5 mr-2 text-[#c05c3e]" />
              Süreçteki Mülakatlar
            </h3>
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map(app => (
                  <div key={app.id} className="p-3 bg-white/60 border border-white/80 rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate('/applications')}>
                    <p className="font-bold text-[#4a3f35] text-sm">{app.companyName}</p>
                    <p className="text-xs font-bold text-[#6b4c3a] mt-0.5">{app.interviewStage !== 'Henüz Yok' ? app.interviewStage : 'Mülakat Bekleniyor'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a38b76] font-medium p-4 text-center bg-white/30 rounded-xl border border-white/40">Şu an ufukta bekleyen bir mülakat görünmüyor. ☕</p>
            )}
          </div>

          {/* Bekleyen Görevler */}
          <div className="glass-panel p-6 bg-white/40">
            <h3 className="text-lg font-bold text-[#4a3f35] mb-4 flex items-center font-serif">
              <CheckSquare className="w-5 h-5 mr-2 text-[#2c5e4a]" />
              Bekleyen Görevler
            </h3>
            {pendingTodos.length > 0 ? (
              <div className="space-y-3">
                {pendingTodos.map(todo => (
                  <div key={todo.id} className="flex items-start p-3 bg-white/60 border border-white/80 rounded-xl shadow-sm">
                    <div className="w-4 h-4 rounded-md border-2 border-[#a38b76] mt-0.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-[#4a3f35] text-sm leading-tight">{todo.text}</p>
                      <p className="text-[10px] font-bold text-[#c05c3e] mt-1 uppercase tracking-wider">{todo.companyName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a38b76] font-medium p-4 text-center bg-white/30 rounded-xl border border-white/40">Tüm görevlerini tamamlamışsın, harikasın! ✨</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
