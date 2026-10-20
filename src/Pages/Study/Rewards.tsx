import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Trash2, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useStudy } from '../../Hooks/useStudy';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { fireConfetti } from '../../Utils/confetti';
import { Reward } from '../../Utils/study';
import { cn } from '../../Utils/classNames';

const REWARD_EMOJIS = ['🎬', '☕', '🍰', '🎮', '🍕', '🎁', '🛍️', '🌳', '🎧', '📖', '😴', '🏖️'];
const ROWS = 'ABCDEFGH';

export const Rewards: React.FC = () => {
  const { rewards, setRewards, redemptions, setRedemptions, coins } = useStudy();
  const { preferences } = usePreferences();
  const [form, setForm] = useState({ title: '', emoji: REWARD_EMOJIS[0], cost: 20 });
  const [selected, setSelected] = useState<string | null>(null);
  const [dropping, setDropping] = useState<Reward | null>(null);
  const [tray, setTray] = useState<Reward | null>(null);
  const [adding, setAdding] = useState(false);

  const sorted = [...rewards].sort((a, b) => a.cost - b.cost);
  const next = sorted.find(r => r.cost > coins.balance);
  const sel = sorted.find(r => r.id === selected);
  const code = (i: number) => `${ROWS[Math.floor(i / 3)] ?? 'Z'}${(i % 3) + 1}`;

  const buy = () => {
    if (!sel) return;
    if (coins.balance < sel.cost) {
      toast.info(`🪙 ${sel.cost - coins.balance} jeton daha lazım. Bir pomodoro daha? 🍅`);
      return;
    }
    setRedemptions(prev => [{ id: uuidv4(), rewardId: sel.id, title: sel.title, emoji: sel.emoji, cost: sel.cost, date: new Date().toISOString() }, ...prev]);
    setDropping(sel);
    setSelected(null);
    window.setTimeout(() => {
      setDropping(null);
      setTray(sel);
      if (preferences.celebrate) fireConfetti(100);
      toast.success(`${sel.emoji} Afiyet olsun! "${sel.title}" senin. Hak ettin! 💛`);
    }, 900);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setRewards(prev => [...prev, { id: uuidv4(), title: form.title.trim(), emoji: form.emoji, cost: Math.max(1, form.cost) }]);
    setForm(f => ({ ...f, title: '' }));
    setAdding(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Ödül Makinesi 🪙</h1>
        <p className="text-ink-soft mt-2">Çalış, jeton kazan, makineden kendine bir ödül çek. Dinlenmek de planın bir parçası!</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        {/* Vending machine */}
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="rounded-t-[42px] rounded-b-2xl p-4 sm:p-5 shadow-[0_30px_50px_-25px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-8px_0_rgba(0,0,0,0.15)]"
            style={{ background: 'linear-gradient(160deg, var(--color-moss-light), var(--color-moss) 55%, color-mix(in srgb, var(--color-moss) 70%, black))' }}>
            <div className="text-center text-white font-black tracking-[0.35em] text-sm sm:text-base pb-3 drop-shadow">★ ÖDÜL MAKİNESİ ★</div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Glass window */}
              <div className="flex-1 rounded-2xl p-3 bg-[linear-gradient(160deg,rgba(255,255,255,0.75),rgba(225,235,245,0.55))] shadow-[inset_0_4px_20px_rgba(0,0,0,0.25)] relative overflow-hidden">
                <span className="absolute -left-10 top-0 w-24 h-[140%] rotate-12 bg-white/30 pointer-events-none" aria-hidden />
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                  {sorted.map((r, i) => {
                    const affordable = coins.balance >= r.cost;
                    const isSel = selected === r.id;
                    return (
                      <div key={r.id} className="group relative">
                        <button onClick={() => setSelected(isSel ? null : r.id)} title={r.title}
                          className={cn('w-full flex flex-col items-center pt-2 rounded-xl transition-colors', isSel ? 'bg-sun/30 ring-2 ring-sun' : 'hover:bg-white/40')}>
                          <span className={cn('text-4xl sm:text-5xl transition-transform drop-shadow-md', dropping?.id === r.id && 'opacity-0', !affordable && 'grayscale opacity-45', isSel && 'scale-110 -rotate-6')}>{r.emoji}</span>
                          {/* Spiral coil */}
                          <span className="w-full h-3 mt-1 bg-[repeating-linear-gradient(90deg,#9aa0a8_0_2px,transparent_2px_7px)] rounded-full opacity-80" aria-hidden />
                          <span className="w-full h-1.5 bg-[#c7ccd4] rounded-sm shadow-inner" aria-hidden />
                          <span className="my-1.5 px-1.5 py-0.5 rounded bg-[#2b2f36] text-[10px] font-mono font-bold text-[#7dffa0] flex items-center gap-1 whitespace-nowrap">
                            {!affordable && <Lock className="w-2.5 h-2.5 text-[#ff9a8a]" />}{code(i)} · {r.cost}🪙
                          </span>
                        </button>
                        <button onClick={() => setRewards(prev => prev.filter(x => x.id !== r.id))} className="absolute top-1 right-1 p-1 rounded-md bg-white/80 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Ödülü sil">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => setAdding(true)} className="flex flex-col items-center justify-center min-h-[110px] rounded-xl border-2 border-dashed border-[#9aa0a8] text-[#5b616b] text-xs font-bold hover:bg-white/40">
                    <Plus className="w-6 h-6" /> Ürün ekle
                  </button>
                </div>
                {dropping && <span className="vend-drop absolute left-1/2 top-1/3 text-5xl" aria-hidden>{dropping.emoji}</span>}
              </div>

              {/* Control panel */}
              <div className="sm:w-44 flex sm:flex-col gap-3">
                <div className="flex-1 sm:flex-none rounded-xl bg-[#1d2127] p-3 shadow-inner">
                  <p className="text-[9px] font-bold tracking-widest text-[#7dffa0]/60">BAKİYE</p>
                  <p className="font-mono text-3xl font-black text-[#7dffa0] tabular-nums [text-shadow:0_0_8px_rgba(125,255,160,0.6)]">{String(coins.balance).padStart(4, '0')}</p>
                  <p className="font-mono text-[11px] text-[#7dffa0]/80 truncate mt-1">{sel ? `${code(sorted.indexOf(sel))} ${sel.title}` : 'ÜRÜN SEÇ ▸'}</p>
                </div>
                <div className="flex-1 sm:flex-none flex flex-col gap-2">
                  <button onClick={buy} disabled={!sel}
                    className={cn('w-full py-3 rounded-xl font-black text-sm shadow-[0_5px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.3)] transition-all',
                      sel && coins.balance >= sel.cost ? 'bg-sun text-[#4a3500]' : 'bg-white/30 text-white/80')}>
                    {sel ? (coins.balance >= sel.cost ? `SATIN AL · ${sel.cost}🪙` : `${sel.cost - coins.balance}🪙 EKSİK`) : 'SATIN AL'}
                  </button>
                  {/* Coin slot */}
                  <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-black/20">
                    <span className="w-1.5 h-8 rounded-full bg-[#1d2127] shadow-inner" />
                    <span className="text-[10px] font-black text-white/70 tracking-widest">JETON</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Pickup tray */}
            <button onClick={() => setTray(null)} disabled={!tray} className="mt-4 w-full sm:w-[calc(100%-11rem-1rem)] h-20 rounded-xl bg-[#1d2127] shadow-[inset_0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center gap-3 text-white/50 text-xs font-black tracking-widest">
              {tray ? <><span className="text-5xl animate-[pop_0.4s_ease-out]">{tray.emoji}</span><span className="text-white/80">AL · {tray.title}</span></> : 'ÜRÜN ÇIKIŞI'}
            </button>
          </div>
          <div className="mx-6 h-3 rounded-b-xl bg-black/30" aria-hidden />
        </div>

        {/* Side: piggy bank + receipt */}
        <div className="space-y-6">
          <div className="glass-panel p-6 text-center relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-br from-sun/20 via-transparent to-moss/10 pointer-events-none" />
            <div className="relative text-7xl animate-float">🐷</div>
            <p className="relative text-4xl font-black font-serif text-ink mt-2">{coins.balance} 🪙</p>
            <p className="relative text-xs font-bold text-ink-muted mt-1">kazanılan {coins.earned} · harcanan {coins.spent}</p>
            {next && (
              <div className="relative mt-4 text-left">
                <p className="text-xs font-bold text-ink-soft mb-1.5">Sıradaki: {next.emoji} {next.title} · {next.cost - coins.balance} kaldı</p>
                <div className="h-2.5 rounded-full bg-sand/50 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#e8b923] to-[#f7d774]" style={{ width: `${(coins.balance / next.cost) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Receipt */}
          <div className="receipt mx-auto max-w-xs bg-white text-[#2c2a30] font-mono text-xs px-5 pt-5 pb-8 shadow-lg rotate-[1.5deg]">
            <p className="text-center font-black tracking-widest">SİBİLİA JETON FİŞİ</p>
            <p className="text-center opacity-60">{format(new Date(), 'd.MM.yyyy HH:mm')}</p>
            <p className="my-2 border-t border-dashed border-black/30" />
            {[['🍅 5 dk odak', '+1'], ['✅ görev', '+2'], ['📖 konu', '+3']].map(([t, v]) => (
              <p key={t} className="flex justify-between"><span>{t}</span><span className="font-bold">{v}</span></p>
            ))}
            <p className="my-2 border-t border-dashed border-black/30" />
            <p className="font-bold mb-1">SON ALIMLAR</p>
            {redemptions.length === 0 ? <p className="opacity-50">henüz yok</p> : redemptions.slice(0, 6).map(r => (
              <p key={r.id} className="flex justify-between gap-2"><span className="truncate">{r.emoji} {r.title}</span><span className="shrink-0">-{r.cost} · {format(parseISO(r.date), 'd MMM', { locale: tr })}</span></p>
            ))}
            <p className="my-2 border-t border-dashed border-black/30" />
            <p className="flex justify-between font-black text-sm"><span>BAKİYE</span><span>{coins.balance} 🪙</span></p>
            <p className="text-center mt-3 opacity-60">teşekkürler, hak ettin ♥</p>
          </div>
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setAdding(false)} />
          <form onSubmit={add} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 flex flex-col gap-3 animate-pop">
            <p className="font-serif font-bold text-xl text-ink">Makineye ürün ekle</p>
            <div className="grid grid-cols-6 gap-1">
              {REWARD_EMOJIS.map(em => (
                <button type="button" key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))} className={cn('aspect-square rounded-lg text-2xl', form.emoji === em ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{em}</button>
              ))}
            </div>
            <input autoFocus value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Örn: Sinemaya git" className="px-3 py-2.5 glass-input rounded-xl text-sm text-ink" />
            <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
              Fiyat
              <input type="number" min={1} value={form.cost} onChange={(e) => setForm(f => ({ ...f, cost: Number(e.target.value) }))} className="w-24 px-3 py-2 glass-input rounded-xl text-ink" /> 🪙
            </label>
            <button type="submit" disabled={!form.title.trim()} className="btn-primary py-2.5 text-sm disabled:opacity-50"><Plus className="w-4 h-4 mr-1" /> Makineye koy</button>
          </form>
        </div>
      )}
    </div>
  );
};
