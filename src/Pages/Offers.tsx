import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Crown, Scale } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { useTheme } from '../Hooks/ThemeContext';
import { CompanyAvatar } from '../Components/CompanyAvatar';
import { cn } from '../Utils/classNames';

const CRITERIA = [
  { id: 'salary', label: 'Maaş', short: 'Maaş', emoji: '💰' },
  { id: 'growth', label: 'Gelişim', short: 'Gelişim', emoji: '📈' },
  { id: 'culture', label: 'Ekip & Kültür', short: 'Kültür', emoji: '🤝' },
  { id: 'balance', label: 'İş-Yaşam Dengesi', short: 'Denge', emoji: '⚖️' },
  { id: 'location', label: 'Lokasyon / Uzaktan', short: 'Lokasyon', emoji: '📍' },
  { id: 'benefits', label: 'Yan Haklar', short: 'Yan Haklar', emoji: '🎁' },
] as const;
type CriterionId = typeof CRITERIA[number]['id'];

// Validated categorical order (see STATUS_COLORS); identity follows selection order.
const SERIES = ['#4f86c0', '#b8502c', '#3a9a6e', '#7a4a8a'];

interface OfferState {
  selected: string[];
  weights: Record<CriterionId, number>;
  scores: Record<string, Partial<Record<CriterionId, number>>>;
}

const DEFAULT_WEIGHTS: Record<CriterionId, number> = { salary: 5, growth: 4, culture: 4, balance: 3, location: 2, benefits: 2 };

export const Offers: React.FC = () => {
  const { applications } = useApplications();
  const { theme } = useTheme();
  const candidates = applications.filter(a => a.status !== 'Reddedildi');
  const [state, setState] = useLocalStorage<OfferState>('careerflow_offers', () => ({
    selected: candidates
      .filter(a => a.status === 'Kabul Edildi' || a.status === 'Mülakat Yapıldı' || a.interviewStage === 'Teklif Aşaması 📜')
      .slice(0, 3).map(a => a.id),
    weights: DEFAULT_WEIGHTS,
    scores: {},
  }));

  const selectedApps = state.selected.map(id => applications.find(a => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a);
  const scoreOf = (appId: string, c: CriterionId) => state.scores[appId]?.[c] ?? 3;

  const toggleApp = (id: string) =>
    setState(s => ({
      ...s,
      selected: s.selected.includes(id) ? s.selected.filter(x => x !== id) : [...s.selected, id].slice(-4),
    }));
  const setScore = (appId: string, c: CriterionId, v: number) =>
    setState(s => ({ ...s, scores: { ...s.scores, [appId]: { ...s.scores[appId], [c]: v } } }));
  const setWeight = (c: CriterionId, v: number) => setState(s => ({ ...s, weights: { ...s.weights, [c]: v } }));

  const totalWeight = CRITERIA.reduce((sum, c) => sum + state.weights[c.id], 0) || 1;
  const results = selectedApps
    .map(app => ({
      app,
      total: Math.round((CRITERIA.reduce((sum, c) => sum + state.weights[c.id] * scoreOf(app.id, c.id), 0) / (totalWeight * 5)) * 100),
    }))
    .sort((a, b) => b.total - a.total);
  const winner = results.length > 1 && results[0].total > results[1].total ? results[0] : null;

  const radarData = CRITERIA.map(c => ({
    criterion: `${c.emoji} ${c.short}`,
    ...Object.fromEntries(selectedApps.map(app => [app.companyName, scoreOf(app.id, c.id)])),
  }));
  const ink = theme === 'dark' ? '#d2bfa6' : '#6b4c3a';

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Teklif Karşılaştırıcı ⚖️</h1>
        <p className="text-ink-soft mt-2">Seni neyin mutlu edeceğine sen karar ver: kriterlere ağırlık ver, teklifleri puanla, kazananı gör.</p>
      </div>

      <div className="glass-panel p-5">
        <p className="text-sm font-bold text-ink-soft mb-3">Karşılaştırılacak şirketler <span className="text-ink-muted font-semibold">(en fazla 4)</span></p>
        <div className="flex flex-wrap gap-2">
          {candidates.map(app => {
            const index = state.selected.indexOf(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggleApp(app.id)}
                aria-pressed={index >= 0}
                className={cn('flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-sm font-bold transition-all',
                  index >= 0 ? 'bg-glass/80 border-transparent shadow-md' : 'bg-glass/30 border-glass/60 text-ink-muted hover:bg-glass/60')}
                style={index >= 0 ? { boxShadow: `0 0 0 2px ${SERIES[index]}` } : undefined}
              >
                <CompanyAvatar name={app.companyName} className="h-7 w-7 text-[10px] rounded-full" />
                <span className={index >= 0 ? 'text-ink' : ''}>{app.companyName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedApps.length < 2 ? (
        <div className="glass-panel p-12 text-center">
          <Scale className="w-12 h-12 mx-auto text-ink-muted mb-4" />
          <p className="text-lg font-bold text-ink">Karşılaştırmak için en az 2 şirket seç. 🤔</p>
        </div>
      ) : (
        <>
          {winner && (
            <div className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-5 border-sun/40 relative overflow-hidden animate-fade-in">
              <span className="absolute inset-0 bg-gradient-to-r from-sun/15 via-transparent to-moss/10 pointer-events-none" />
              <div className="relative">
                <CompanyAvatar name={winner.app.companyName} className="h-16 w-16 text-xl" />
                <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 text-sun fill-sun animate-float" />
              </div>
              <div className="relative text-center sm:text-left flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-clay">Senin önceliklerine göre en iyi seçenek</p>
                <h2 className="text-3xl font-black font-serif text-ink">{winner.app.companyName}</h2>
                <p className="text-sm font-semibold text-ink-soft">{winner.app.position} · {results[1].app.companyName}'dan {winner.total - results[1].total} puan önde</p>
              </div>
              <span className="relative text-5xl font-black text-moss">%{winner.total}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3 glass-panel p-6 overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 font-bold text-ink-soft">Kriter</th>
                    <th className="pb-4 font-bold text-ink-soft w-36">Önem</th>
                    {selectedApps.map((app, i) => (
                      <th key={app.id} className="pb-4 font-bold text-ink text-center">
                        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES[i] }} />{app.companyName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass/50">
                  {CRITERIA.map(c => (
                    <tr key={c.id}>
                      <td className="py-3 font-bold text-ink whitespace-nowrap">{c.emoji} {c.label}</td>
                      <td className="py-3 pr-4">
                        <input type="range" min={0} max={5} value={state.weights[c.id]} onChange={(e) => setWeight(c.id, Number(e.target.value))}
                          aria-label={`${c.label} önemi`} className="w-full accent-[var(--color-clay)]" />
                      </td>
                      {selectedApps.map(app => (
                        <td key={app.id} className="py-3">
                          <div className="flex justify-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(v => (
                              <button key={v} onClick={() => setScore(app.id, c.id, v)} aria-label={`${app.companyName} ${c.label}: ${v}`}
                                className={cn('w-5 h-5 rounded-full transition-all hover:scale-125', v <= scoreOf(app.id, c.id) ? 'bg-moss' : 'bg-sand/60')} />
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-5 font-black text-ink" colSpan={2}>Ağırlıklı toplam</td>
                    {selectedApps.map(app => {
                      const r = results.find(x => x.app.id === app.id)!;
                      return (
                        <td key={app.id} className="pt-5 text-center">
                          <span className={cn('text-2xl font-black', winner?.app.id === app.id ? 'text-moss' : 'text-ink')}>%{r.total}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="xl:col-span-2 glass-panel p-6">
              <h3 className="text-lg font-bold font-serif text-ink mb-2">Profil Karşılaştırması</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="62%">
                    <PolarGrid stroke={theme === 'dark' ? '#3a2e25' : '#e6dcc8'} />
                    <PolarAngleAxis dataKey="criterion" tick={{ fill: ink, fontSize: 11, fontWeight: 700 }} />
                    {selectedApps.map((app, i) => (
                      <Radar key={app.id} dataKey={app.companyName} stroke={SERIES[i]} fill={SERIES[i]} fillOpacity={0.12} strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: theme === 'dark' ? '#2a211b' : '#fdfbf7', fontWeight: 700 }} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, color: ink }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs font-semibold text-ink-muted">💡 Maaş her şey değildir; ağırlıkları kendi değerlerine göre ayarla.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
