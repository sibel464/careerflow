import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, subMonths, parseISO, isSameMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PieChart as PieChartIcon, BarChart3, CalendarRange, Filter, Globe, MessageCircle, Users, Trophy, Star } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { useTheme } from '../Hooks/ThemeContext';
import { STATUS_OPTIONS, STATUS_COLORS } from '../Utils/constants';
import { responseRate } from '../Utils/insights';

const countBy = <T,>(items: T[], key: (item: T) => string) =>
  Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const k = key(item);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

const Panel: React.FC<{ title: string; icon: React.ElementType; iconClass: string; className?: string; children: React.ReactNode }> = ({ title, icon: Icon, iconClass, className = '', children }) => (
  <div className={`glass-panel p-6 ${className}`}>
    <div className="flex items-center mb-6">
      <div className={`p-2 bg-glass/60 rounded-xl mr-3 border border-glass/80 shadow-sm ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold font-serif text-ink">{title}</h2>
    </div>
    {children}
  </div>
);

export const Analytics: React.FC = () => {
  const { applications } = useApplications();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  // Recharts renders SVG attributes, which can't read CSS variables — pick per theme.
  const ink = dark ? '#d2bfa6' : '#6b4c3a';
  const grid = dark ? '#3a2e25' : '#e6dcc8';
  const moss = dark ? '#52a382' : '#2c5e4a';
  const clay = dark ? '#e07a5a' : '#c05c3e';
  const tooltip = {
    contentStyle: { borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', backgroundColor: dark ? '#2a211b' : '#fdfbf7', color: dark ? '#f1e7d6' : '#4a3f35', fontWeight: 700 },
    itemStyle: { color: dark ? '#f1e7d6' : '#4a3f35' },
    cursor: { fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(107,76,58,0.06)' },
  };
  const axis = { axisLine: false, tickLine: false, tick: { fill: ink, fontSize: 12, fontWeight: 600 } };

  if (applications.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="w-20 h-20 bg-glass/60 border border-glass/80 text-ink-soft mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
          <PieChartIcon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold font-serif text-ink mb-2">Henüz Analiz Yok 📊</h3>
        <p className="text-ink-soft max-w-md mx-auto">İstatistikleri görebilmek için önce birkaç başvuru eklemelisin.</p>
      </div>
    );
  }

  const total = applications.length;
  const statusData = STATUS_OPTIONS
    .map(status => ({ name: status, value: applications.filter(app => app.status === status).length }))
    .filter(item => item.value > 0);

  // Funnel: how far each application made it.
  const reachedInterview = applications.filter(app =>
    ['Mülakat Bekleniyor', 'Mülakat Yapıldı', 'Kabul Edildi'].includes(app.status) ||
    (app.interviewStage && app.interviewStage !== 'Henüz Yok')
  ).length;
  const interviewed = applications.filter(app => app.status === 'Mülakat Yapıldı' || app.status === 'Kabul Edildi').length;
  const offers = applications.filter(app => app.status === 'Kabul Edildi' || app.interviewStage === 'Teklif Aşaması 📜').length;
  const funnel = [
    { name: 'Başvuru', value: total },
    { name: 'Geri dönüş', value: applications.filter(app => app.status !== 'Başvuruldu').length },
    { name: 'Mülakat', value: reachedInterview },
    { name: 'Görüşüldü', value: interviewed },
    { name: 'Teklif', value: offers },
  ];

  const rated = applications.filter(app => app.companyRating);
  const avgRating = rated.length ? (rated.reduce((sum, app) => sum + (app.companyRating || 0), 0) / rated.length).toFixed(1) : '—';

  const kpis = [
    { label: 'Geri dönüş oranı', value: `%${responseRate(applications)}`, icon: MessageCircle, tone: 'text-moss' },
    { label: 'Mülakata kalma', value: `%${Math.round((reachedInterview / total) * 100)}`, icon: Users, tone: 'text-clay' },
    { label: 'Teklif oranı', value: `%${Math.round((offers / total) * 100)}`, icon: Trophy, tone: 'text-sun' },
    { label: 'Ortalama şirket puanı', value: avgRating, icon: Star, tone: 'text-sun' },
  ];

  const cityData = countBy(applications, app => app.city || 'Belirtilmemiş').slice(0, 6);
  const platformData = countBy(applications, app => app.platform?.trim() || 'Belirtilmemiş').slice(0, 6);

  // Last six months in chronological order, including empty months.
  const timelineData = Array.from({ length: 6 }, (_, i) => {
    const month = startOfMonth(subMonths(new Date(), 5 - i));
    return {
      name: format(month, 'MMM', { locale: tr }),
      value: applications.filter(app => isSameMonth(parseISO(app.applicationDate), month)).length,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Analizler 📈</h1>
        <p className="text-ink-soft mt-2">Başvuru sürecinin istatistiksel görünümü.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-panel p-5">
            <kpi.icon className={`w-5 h-5 mb-3 ${kpi.tone}`} />
            <p className="text-3xl font-black text-ink tracking-tight">{kpi.value}</p>
            <p className="text-xs font-bold text-ink-soft mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Panel title="Durum Dağılımı" icon={PieChartIcon} iconClass="text-moss">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius="58%" outerRadius="90%" paddingAngle={3} stroke="none">
                    {statusData.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <RechartsTooltip {...tooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full sm:w-1/2 space-y-2.5">
              {statusData.map(entry => (
                <li key={entry.name} className="flex items-center gap-3 text-sm">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                  <span className="flex-1 font-semibold text-ink-soft">{entry.name}</span>
                  <span className="font-black text-ink">{entry.value}</span>
                  <span className="w-10 text-right text-xs font-bold text-ink-muted">%{Math.round((entry.value / total) * 100)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Başvuru Hunisi" icon={Filter} iconClass="text-clay">
          <div className="space-y-3">
            {funnel.map(step => {
              const pct = Math.round((step.value / total) * 100);
              return (
                <div key={step.name} title={`${step.name}: ${step.value} (%${pct})`}>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span className="text-ink-soft">{step.name}</span>
                    <span className="text-ink">{step.value} <span className="text-ink-muted text-xs">· %{pct}</span></span>
                  </div>
                  <div className="h-3 rounded bg-sand/40 overflow-hidden">
                    <div className="h-full rounded bg-moss transition-all duration-700" style={{ width: `${Math.max(pct, step.value ? 3 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Son 6 Ayda Başvurular" icon={CalendarRange} iconClass="text-moss" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <RechartsTooltip {...tooltip} formatter={(v) => [v, 'Başvuru']} />
                <Bar dataKey="value" fill={moss} radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="En Çok Başvurulan Şehirler" icon={BarChart3} iconClass="text-clay">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={grid} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={90} {...axis} />
                <RechartsTooltip {...tooltip} formatter={(v) => [v, 'Başvuru']} />
                <Bar dataKey="value" fill={clay} radius={[0, 4, 4, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Platformlar" icon={Globe} iconClass="text-moss">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={grid} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={90} {...axis} />
                <RechartsTooltip {...tooltip} formatter={(v) => [v, 'Başvuru']} />
                <Bar dataKey="value" fill={moss} radius={[0, 4, 4, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
};
