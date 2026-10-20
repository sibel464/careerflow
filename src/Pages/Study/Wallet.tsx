import React, { useMemo, useState } from 'react';
import { addMonths, differenceInCalendarDays, endOfMonth, format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { CATEGORIES, DEFAULT_WALLET, Tx, TxType, WALLET_KEYS, WalletSettings, categoryOf, money, seedTx } from '../../Utils/wallet';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';

/** A donut of this month's spending by category. */
const Donut: React.FC<{ parts: { id: string; value: number; color: string; label: string }[] }> = ({ parts }) => {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40 -rotate-90" role="img" aria-label="Kategori dağılımı">
      <circle cx="70" cy="70" r={r} fill="none" strokeWidth="20" className="stroke-sand/40" />
      {total > 0 && parts.map(p => {
        const len = (p.value / total) * c;
        const seg = <circle key={p.id} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="20" strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-offset}><title>{`${p.label}: ${money(p.value)}`}</title></circle>;
        offset += len;
        return seg;
      })}
    </svg>
  );
};

export const Wallet: React.FC = () => {
  const [txs, setTxs] = useLocalStorage<Tx[]>(WALLET_KEYS.tx, seedTx);
  const [settings, setSettings] = useLocalStorage<WalletSettings>(WALLET_KEYS.settings, DEFAULT_WALLET);
  const { preferences } = usePreferences();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [form, setForm] = useState<{ type: TxType; amount: string; category: string; note: string; date: string }>(
    { type: 'out', amount: '', category: 'food', note: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [editingBudget, setEditingBudget] = useState(false);

  const monthTx = useMemo(() => txs.filter(t => isSameMonth(parseISO(t.date), month)).sort((a, b) => b.date.localeCompare(a.date)), [txs, month]);
  const spent = monthTx.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const income = monthTx.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const left = settings.budget - spent;
  const isCurrent = isSameMonth(month, new Date());
  const daysLeft = isCurrent ? differenceInCalendarDays(endOfMonth(month), new Date()) + 1 : 0;
  const perDay = daysLeft ? Math.max(left, 0) / daysLeft : 0;
  const usedRatio = Math.min(spent / Math.max(settings.budget, 1), 1);

  const byCategory = CATEGORIES.filter(c => c.type === 'out')
    .map(c => ({ id: c.id, label: c.label, emoji: c.emoji, color: c.color, value: monthTx.filter(t => t.type === 'out' && t.category === c.id).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const days = Object.entries(monthTx.reduce<Record<string, Tx[]>>((acc, t) => { (acc[t.date] ??= []).push(t); return acc; }, {}));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount.replace(',', '.'));
    if (!amount || amount <= 0) return;
    setTxs(prev => [{ id: uuidv4(), type: form.type, amount, category: form.category, note: form.note.trim(), date: form.date }, ...prev]);
    setForm(f => ({ ...f, amount: '', note: '' }));
    const cat = categoryOf(form.category);
    toast.success(form.type === 'out' ? `${cat.emoji} ${money(amount)} harcama eklendi` : `${cat.emoji} ${money(amount)} gelir eklendi 💸`);
  };

  const deposit = (n: number) => {
    const saved = settings.saved + n;
    setSettings(s => ({ ...s, saved: s.saved + n }));
    if (settings.saved < settings.goalTarget && saved >= settings.goalTarget) {
      if (preferences.celebrate) fireConfetti(140);
      toast.success(`🐷 "${settings.goalTitle}" hedefine ulaştın!`);
    }
  };

  const coins = Math.round(Math.min(settings.saved / Math.max(settings.goalTarget, 1), 1) * 36);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Cüzdanım 👛</h1>
          <p className="text-ink-soft mt-2">Bütçeni koru, harcamanı gör, kumbaranı doldur.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="btn-ghost p-2.5" aria-label="Önceki ay"><ChevronLeft className="w-5 h-5" /></button>
          <span className="px-4 py-2 font-bold text-ink capitalize min-w-[8rem] text-center">{format(month, 'MMMM yyyy', { locale: tr })}</span>
          <button onClick={() => setMonth(m => addMonths(m, 1))} disabled={isCurrent} className="btn-ghost p-2.5 disabled:opacity-30" aria-label="Sonraki ay"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leather wallet with the card */}
        <div className="xl:col-span-2 leather rounded-[28px] p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute inset-3 rounded-[20px] border-2 border-dashed border-[#e8cfa8]/45 pointer-events-none" />
          <div className="relative grid sm:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center">
            <div className="text-[#f6e7d0]">
              <p className="text-[11px] font-black tracking-[0.25em] opacity-70">{isCurrent ? 'BUGÜN HARCAYABİLECEĞİN' : 'AY SONU'}</p>
              <p className="text-5xl font-black tabular-nums mt-1 drop-shadow">{isCurrent ? money(Math.floor(perDay)) : money(left)}</p>
              {isCurrent && <p className="text-sm font-semibold opacity-80 mt-1">{daysLeft} gün kaldı · kalan bütçe {money(left)}</p>}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-bold opacity-80 mb-1.5">
                  <span>Harcanan {money(spent)}</span>
                  {editingBudget ? (
                    <form onSubmit={(e) => { e.preventDefault(); setEditingBudget(false); }} className="flex items-center gap-1">
                      <input autoFocus inputMode="numeric" value={settings.budget} onChange={(e) => setSettings(s => ({ ...s, budget: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                        className="w-20 px-2 py-0.5 rounded bg-black/25 text-right outline-none" aria-label="Aylık bütçe" />
                      <button aria-label="Kaydet"><Check className="w-3.5 h-3.5" /></button>
                    </form>
                  ) : (
                    <button onClick={() => setEditingBudget(true)} className="flex items-center gap-1 hover:underline">Bütçe {money(settings.budget)} <Pencil className="w-3 h-3" /></button>
                  )}
                </div>
                {/* Leather strap progress */}
                <div className="h-4 rounded-full bg-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usedRatio * 100}%`, background: usedRatio > 0.9 ? 'linear-gradient(90deg,#e07a5a,#c0392b)' : 'linear-gradient(90deg,#e8cfa8,#c9a074)' }} />
                </div>
                {left < 0 && <p className="text-xs font-black text-[#ffb4a2] mt-2">Bütçeyi {money(-left)} aştın. Bir sonraki hafta biraz kısalım mı? 🌱</p>}
              </div>
              <div className="flex gap-4 mt-5 text-sm font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-black/20">⬇️ Gelir {money(income)}</span>
                <span className="px-3 py-1.5 rounded-lg bg-black/20">⬆️ Gider {money(spent)}</span>
              </div>
            </div>
            {/* Bank card tucked in a pocket */}
            <div className="relative w-64 h-44 mx-auto">
              <div className="bank-card absolute inset-x-0 top-0 h-40 rounded-2xl p-4 text-white -rotate-6">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-black tracking-wider font-serif italic">Sibilia</span>
                  <span className="text-xl" aria-hidden>📶</span>
                </div>
                <span className="block mt-3 w-10 h-7 rounded-md bg-gradient-to-br from-[#f3d98a] to-[#b8923a] shadow-inner" aria-hidden />
                <p className="font-mono text-sm tracking-[0.2em] mt-3 opacity-90">•••• •••• •••• 2026</p>
                <p className="text-[10px] font-bold uppercase opacity-80 mt-1">{preferences.userName || 'Öğrenci'}</p>
              </div>
              <div className="absolute inset-x-[-10px] bottom-0 h-20 rounded-b-2xl rounded-t-md leather-pocket" />
            </div>
          </div>
        </div>

        {/* Savings jar */}
        <div className="glass-panel p-6 flex flex-col">
          <p className="text-xs font-black uppercase tracking-widest text-ink-muted">Kumbara</p>
          <input value={settings.goalTitle} onChange={(e) => setSettings(s => ({ ...s, goalTitle: e.target.value }))} aria-label="Birikim hedefi"
            className="bg-transparent font-hand text-3xl text-ink outline-none mt-1" />
          <div className="flex items-end gap-5 mt-2">
            <svg viewBox="0 0 100 120" className="w-24 h-28 shrink-0" aria-hidden>
              <defs><clipPath id="coin-jar"><path d="M18 30 Q18 22 26 22 L74 22 Q82 22 82 30 L84 104 Q84 114 74 114 L26 114 Q16 114 16 104 Z" /></clipPath></defs>
              <path d="M18 30 Q18 22 26 22 L74 22 Q82 22 82 30 L84 104 Q84 114 74 114 L26 114 Q16 114 16 104 Z" fill="rgba(255,255,255,0.4)" />
              <g clipPath="url(#coin-jar)">
                {Array.from({ length: coins }, (_, i) => {
                  const row = Math.floor(i / 4);
                  return <ellipse key={i} cx={28 + (i % 4) * 15 + (row % 2) * 6} cy={108 - row * 9} rx="8" ry="3.6" fill={i % 3 ? '#e2b33e' : '#d4a12c'} stroke="#a77a17" strokeWidth="0.8" />;
                })}
              </g>
              <path d="M18 30 Q18 22 26 22 L74 22 Q82 22 82 30 L84 104 Q84 114 74 114 L26 114 Q16 114 16 104 Z" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" />
              <rect x="22" y="10" width="56" height="13" rx="3" fill="#9aa0a8" />
              <rect x="38" y="14" width="24" height="3" rx="1.5" fill="#3b4148" />
            </svg>
            <div className="min-w-0">
              <p className="text-2xl font-black text-ink tabular-nums">{money(settings.saved)}</p>
              <p className="text-xs font-bold text-ink-muted flex items-center gap-1">hedef ₺
                <input inputMode="numeric" value={settings.goalTarget} onChange={(e) => setSettings(s => ({ ...s, goalTarget: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                  className="w-16 bg-transparent outline-none text-ink font-black" aria-label="Hedef tutar" />
              </p>
              <p className="text-xs font-bold text-moss mt-1">%{Math.round(Math.min(settings.saved / Math.max(settings.goalTarget, 1), 1) * 100)} doldu</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-auto pt-4">
            {[50, 100, 250].map(n => (
              <button key={n} onClick={() => deposit(n)} className="py-2 rounded-xl font-black text-sm text-[#5a4200] bg-gradient-to-b from-[#f2d36b] to-[#d9a62c] shadow-[0_3px_0_#a77a17] active:translate-y-0.5 active:shadow-[0_1px_0_#a77a17]">+{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        {/* Quick add */}
        <form onSubmit={add} className="glass-panel p-5 space-y-4">
          <div className="flex p-1 rounded-xl bg-glass/50 border border-glass/60">
            {([['out', 'Harcama'], ['in', 'Gelir']] as const).map(([k, label]) => (
              <button type="button" key={k} onClick={() => setForm(f => ({ ...f, type: k, category: k === 'out' ? 'food' : 'allowance' }))}
                className={cn('flex-1 py-2 rounded-lg text-sm font-black', form.type === k ? (k === 'out' ? 'bg-clay text-white shadow' : 'bg-moss text-white shadow') : 'text-ink-soft')}>{label}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-glass/60 border border-glass/70">
            <span className="text-2xl font-black text-ink-muted">₺</span>
            <input inputMode="decimal" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value.replace(/[^\d.,]/g, '') }))} placeholder="0"
              className="flex-1 min-w-0 bg-transparent outline-none text-3xl font-black text-ink tabular-nums" aria-label="Tutar" />
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.filter(c => c.type === form.type).map(c => (
              <button type="button" key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))}
                className={cn('py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all', form.category === c.id ? 'text-white shadow-md -translate-y-0.5' : 'bg-glass/50 text-ink-soft hover:bg-glass/80')}
                style={form.category === c.id ? { background: c.color } : undefined}>
                <span className="text-lg">{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Not (isteğe bağlı)" className="flex-1 min-w-0 px-3 py-2.5 glass-input rounded-xl text-sm text-ink" />
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="px-2 py-2.5 glass-input rounded-xl text-xs text-ink" aria-label="Tarih" />
          </div>
          <button disabled={!Number(form.amount.replace(',', '.'))} className="btn-primary w-full py-3 disabled:opacity-50"><Plus className="w-4 h-4 mr-1.5" /> Kaydet</button>
        </form>

        {/* Category breakdown */}
        <div className="glass-panel p-5">
          <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">Nereye gitti?</p>
          {byCategory.length === 0 ? <p className="text-sm text-ink-muted py-10 text-center">Bu ay harcama yok 🌿</p> : (
            <div className="flex flex-col sm:flex-row lg:flex-col 2xl:flex-row items-center gap-5">
              <div className="relative">
                <Donut parts={byCategory} />
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  <b className="text-lg font-black text-ink">{money(spent)}</b>
                  <span className="text-[10px] font-bold text-ink-muted">bu ay</span>
                </span>
              </div>
              <ul className="flex-1 w-full space-y-1.5">
                {byCategory.map(c => (
                  <li key={c.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="flex-1 font-semibold text-ink-soft">{c.emoji} {c.label}</span>
                    <span className="font-black text-ink tabular-nums">{money(c.value)}</span>
                    <span className="w-9 text-right text-[11px] font-bold text-ink-muted">%{Math.round((c.value / spent) * 100)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Receipts, one per day */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-1">
          {days.length === 0 && <p className="glass-panel p-8 text-center text-sm text-ink-muted">Bu ay için fiş yok.</p>}
          {days.map(([date, items], i) => {
            const out = items.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
            return (
              <div key={date} className="receipt bg-white text-[#2c2a30] font-mono text-xs px-5 pt-4 pb-7" style={{ transform: `rotate(${[-0.8, 0.6, -0.4][i % 3]}deg)` }}>
                <p className="text-center font-black tracking-widest">{format(parseISO(date), 'd MMMM EEEE', { locale: tr }).toLocaleUpperCase('tr-TR')}</p>
                <p className="my-2 border-t border-dashed border-black/30" />
                {items.map(t => {
                  const c = categoryOf(t.category);
                  return (
                    <p key={t.id} className="group flex items-center gap-2 py-0.5">
                      <span>{c.emoji}</span>
                      <span className="flex-1 truncate">{t.note || c.label}</span>
                      <span className={cn('font-bold tabular-nums', t.type === 'in' && 'text-[#2f7a52]')}>{t.type === 'in' ? '+' : '-'}{money(t.amount)}</span>
                      <button onClick={() => setTxs(prev => prev.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-[#b8322a]" aria-label="Sil"><Trash2 className="w-3 h-3" /></button>
                    </p>
                  );
                })}
                <p className="my-2 border-t border-dashed border-black/30" />
                <p className="flex justify-between font-black"><span>TOPLAM GİDER</span><span>{money(out)}</span></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
