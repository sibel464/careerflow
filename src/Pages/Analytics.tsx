import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useApplications } from '../Hooks/ApplicationContext';
import { ApplicationStatus } from '../Interfaces';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { applications } = useApplications();

  // 1. Status Distribution Data
  const statusData = applications.reduce((acc, app) => {
    const existing = acc.find(item => item.name === app.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: app.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS: Record<ApplicationStatus | string, string> = {
    'Başvuruldu': '#c05c3e', // Terracotta
    'Mülakat Bekleniyor': '#d8a48b', // Soft orange/brown
    'Mülakat Yapıldı': '#6b4c3a', // Brown
    'Kabul Edildi': '#2c5e4a', // Green
    'Reddedildi': '#8c3a3a', // Dark Red
  };

  // 2. City Distribution Data
  const cityData = applications.reduce((acc, app) => {
    const city = app.city || 'Belirtilmemiş';
    const existing = acc.find(item => item.name === city);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: city, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 cities

  // 3. Timeline Data (Applications per month)
  const timelineDataMap = applications.reduce((acc, app) => {
    const monthYear = format(parseISO(app.applicationDate), 'MMM yyyy', { locale: tr });
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData = Object.keys(timelineDataMap).map(key => ({
    name: key,
    value: timelineDataMap[key]
  })).reverse();

  if (applications.length === 0) {
    return (
      <div className="glass-panel p-12 text-center bg-white/30 animate-fade-in">
        <div className="w-20 h-20 bg-white/60 border border-white/80 text-[#6b4c3a] mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
          <PieChartIcon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold font-serif text-[#4a3f35] mb-2">Henüz Analiz Yok 📊</h3>
        <p className="text-[#6b4c3a] max-w-md mx-auto">İstatistikleri görebilmek için önce birkaç başvuru eklemelisin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-serif text-[#4a3f35] dark:text-[#e6dcc8] tracking-tight">Analizler 📈</h1>
        <p className="text-[#6b4c3a] dark:text-[#b8a38a] mt-2">Başvuru sürecinin istatistiksel görünümü.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="glass-panel p-6 bg-white/40">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-white/60 rounded-xl text-[#2c5e4a] mr-3 border border-white/80 shadow-sm">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#4a3f35]">Durum Dağılımı</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b4c3a'} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fdfbf7', color: '#4a3f35' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Distribution */}
        <div className="glass-panel p-6 bg-white/40">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-white/60 rounded-xl text-[#c05c3e] mr-3 border border-white/80 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#4a3f35]">En Çok Başvurulan Şehirler</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6dcc8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b4c3a', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b4c3a', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#f5f0e6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fdfbf7', color: '#4a3f35' }}
                />
                <Bar dataKey="value" fill="#c05c3e" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Timeline */}
        <div className="glass-panel p-6 lg:col-span-2 bg-white/40">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-white/60 rounded-xl text-[#2c5e4a] mr-3 border border-white/80 shadow-sm">
              <LineChartIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#4a3f35]">Aylık Başvuru Eğilimi</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6dcc8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b4c3a', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b4c3a', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fdfbf7', color: '#4a3f35' }}
                />
                <Line type="monotone" dataKey="value" stroke="#2c5e4a" strokeWidth={4} dot={{ r: 6, fill: '#2c5e4a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
