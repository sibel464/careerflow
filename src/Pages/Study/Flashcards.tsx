import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Play, X, Trash2, RotateCcw, Layers, ChevronLeft, Package, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { usePersonal } from '../../Hooks/usePersonal';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { Card, Deck, Grade, gradeCard, isDue, BOX_INTERVAL, packCards, packToDeck } from '../../Utils/personal';
import { FLASH_PACKS, FlashPack, PACK_CARD_TOTAL } from '../../Utils/flashPacks';
import { SUBJECT_COLORS } from '../../Utils/study';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';

const DECK_EMOJIS = ['💻', '🌿', '🟨', '⚛️', '🔷', '🗄️', '🎨', '🧠', '🌐', '⌨️', '🐍', '💬'];

const SESSION_SIZES = [10, 20, 30, 0] as const; // 0 = all
const localDay = () => format(new Date(), 'yyyy-MM-dd');

/** "ön - arka", "ön: arka", "ön = arka" or a tab; falls back to the first - : = when there are no spaces. */
const parseLine = (line: string): [string, string] | null => {
  const spaced = line.split(/\s+[-–—:=]\s+|\t/);
  const parts = spaced.length >= 2 ? spaced : line.split(/[-–—:=]/);
  if (parts.length < 2) return null;
  const [front, ...rest] = parts;
  const back = rest.join(' - ').trim();
  return front.trim() && back ? [front.trim(), back] : null;
};

/** Fisher–Yates, so each session feels fresh. */
const shuffled = <T,>(list: T[]) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** One study session: flip, answer honestly, cards move between Leitner boxes. */
const Session: React.FC<{ deck: Deck; cards: Card[]; moreLeft: number; onMore: () => void; onGrade: (card: Card, grade: Grade) => void; onExit: () => void }> = ({ deck, cards, moreLeft, onMore, onGrade, onExit }) => {
  const { preferences } = usePreferences();
  const [queue, setQueue] = useState(() => shuffled(cards));
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ good: 0, hard: 0, again: 0 });
  const total = cards.length;
  const card = queue[0];
  const finished = !card;

  useEffect(() => {
    if (finished && stats.good + stats.hard + stats.again > 0 && preferences.celebrate) fireConfetti(110);
  }, [finished, stats, preferences.celebrate]);

  const answer = (grade: Grade) => {
    if (!card) return;
    onGrade(card, grade);
    setStats(s => ({ ...s, [grade]: s[grade] + 1 }));
    setFlipped(false);
    // "Again" cards come back at the end of this session.
    setQueue(q => (grade === 'again' ? [...q.slice(1), card] : q.slice(1)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); }
      if (!flipped) return;
      if (e.key === '1') answer('again');
      if (e.key === '2') answer('hard');
      if (e.key === '3') answer('good');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const done = total - queue.filter(c => cards.some(x => x.id === c.id)).length;

  if (finished) {
    const reviewed = stats.good + stats.hard + stats.again;
    return (
      <div className="glass-panel p-10 text-center max-w-xl mx-auto animate-pop">
        <span className="text-7xl block mb-4">🎉</span>
        <h2 className="text-3xl font-black font-serif text-ink">Oturum tamam!</h2>
        <p className="text-ink-soft mt-2">{deck.emoji} {deck.name} · {reviewed} cevap</p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[['Bildim', stats.good, 'text-[#3a9a6e]'], ['Zorlandım', stats.hard, 'text-[#d99a12]'], ['Tekrar', stats.again, 'text-clay']].map(([l, v, c]) => (
            <div key={l as string} className="rounded-2xl bg-glass/60 border border-glass/80 p-4">
              <p className={cn('text-3xl font-black', c as string)}>{v}</p>
              <p className="text-xs font-bold text-ink-muted">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {moreLeft > 0 && <button onClick={onMore} className="btn-primary px-6 py-3">+{moreLeft} kart daha çalış 💪</button>}
          <button onClick={onExit} className={moreLeft > 0 ? 'btn-ghost px-6 py-3' : 'btn-primary px-6 py-3'}>Destelere dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="btn-ghost p-2.5" aria-label="Oturumdan çık"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold text-ink-muted mb-1.5"><span>{deck.emoji} {deck.name}</span><span>{Math.min(done, total)}/{total}</span></div>
          <div className="h-2 rounded-full bg-sand/50 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(Math.min(done, total) / total) * 100}%`, background: deck.color }} /></div>
        </div>
      </div>

      <button onClick={() => setFlipped(f => !f)} className="block w-full aspect-[16/10] [perspective:1600px]" aria-label={flipped ? 'Ön yüzü göster' : 'Cevabı göster'}>
        <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-white dark:bg-glass shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-black/5 flex flex-col items-center justify-center p-8">
            <span className="absolute top-4 left-5 text-[11px] font-black uppercase tracking-widest text-ink-muted">Soru · Kutu {card.box}</span>
            <span className="absolute top-0 inset-x-0 h-2 rounded-t-3xl" style={{ background: deck.color }} />
            <p className="text-3xl sm:text-4xl font-bold text-ink text-center leading-snug">{card.front}</p>
            <span className="absolute bottom-4 text-xs font-bold text-ink-muted">Çevirmek için tıkla ya da boşluk tuşu</span>
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-8 text-white"
            style={{ background: `linear-gradient(145deg, ${deck.color}, color-mix(in srgb, ${deck.color} 65%, black))` }}>
            <span className="absolute top-4 left-5 text-[11px] font-black uppercase tracking-widest opacity-70">Cevap</span>
            <p className="text-3xl sm:text-4xl font-bold text-center leading-snug">{card.back}</p>
            <p className="absolute bottom-4 text-xs font-bold opacity-70">{card.front}</p>
          </div>
        </div>
      </button>

      <div className={cn('grid grid-cols-3 gap-3 transition-opacity', flipped ? 'opacity-100' : 'opacity-30 pointer-events-none')}>
        {([['again', 'Bilemedim', '1', 'bg-clay', 'Az sonra tekrar'], ['hard', 'Zorlandım', '2', 'bg-[#d99a12]', `${BOX_INTERVAL[card.box]} gün sonra`], ['good', 'Bildim', '3', 'bg-[#3a9a6e]', `${BOX_INTERVAL[Math.min(card.box + 1, 5)]} gün sonra`]] as const).map(([g, label, key, bg, hint]) => (
          <button key={g} onClick={() => answer(g)} className={cn('rounded-2xl py-3.5 text-white font-black shadow-md hover:brightness-110 active:scale-95 transition-all', bg)}>
            {label}
            <span className="block text-[10px] font-bold opacity-80">{hint} · {key}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const Flashcards: React.FC = () => {
  const { decks, setDecks, cards, setCards } = usePersonal();
  const [openDeck, setOpenDeck] = useState<string | null>(null);
  const [studying, setStudying] = useState<{ deck: Deck; cards: Card[] } | null>(null);
  const [bulk, setBulk] = useState('');
  const [newDeck, setNewDeck] = useState<{ name: string; emoji: string; color: string } | null>(null);
  const [library, setLibrary] = useState(false);
  const [sessionSize, setSessionSize] = useLocalStorage<number>('careerflow_flash_session', 20);
  const [single, setSingle] = useState({ front: '', back: '' });
  const panelRef = useRef<HTMLDivElement>(null);
  const openManage = (id: string) => {
    setOpenDeck(id);
    window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  /** Cards of a ready-made pack that aren't in your deck yet. */
  const missingFor = (pack: FlashPack) => {
    const have = new Set(cards.filter(c => c.deckId === pack.id).map(c => c.front));
    return pack.cards.filter(([front]) => !have.has(front)).length;
  };
  const addPack = (pack: FlashPack) => {
    const have = new Set(cards.filter(c => c.deckId === pack.id).map(c => c.front));
    const fresh = packCards(pack, have);
    if (!decks.some(d => d.id === pack.id)) setDecks(prev => [...prev, packToDeck(pack)]);
    setCards(prev => [...prev, ...fresh]);
    toast.success(`${pack.emoji} ${pack.name}: ${fresh.length} kart eklendi`);
  };

  const deck = decks.find(d => d.id === openDeck) ?? null;
  const stats = useMemo(() => Object.fromEntries(decks.map(d => {
    const own = cards.filter(c => c.deckId === d.id);
    return [d.id, { total: own.length, due: own.filter(c => isDue(c)).length, mastered: own.filter(c => c.box >= 4).length }];
  })), [decks, cards]);
  const totalDue = cards.filter(c => isDue(c)).length;

  const grade = (card: Card, g: Grade) => setCards(prev => prev.map(c => (c.id === card.id ? gradeCard(c, g) : c)));

  /** Due cards first, then the least-known ones for extra practice — up to the session size. */
  const pickFor = (d: Deck, exclude: Set<string> = new Set(), all = false) => {
    const own = cards.filter(c => c.deckId === d.id && !exclude.has(c.id));
    const due = shuffled(own.filter(c => isDue(c)));
    const extra = [...own.filter(c => !isDue(c))].sort((a, b) => a.box - b.box || a.correct - b.correct);
    const pool = all ? shuffled(own) : [...due, ...extra];
    return sessionSize ? pool.slice(0, sessionSize) : pool;
  };
  const study = (d: Deck, all = false) => {
    const pool = pickFor(d, new Set(), all);
    if (!pool.length) { toast.info('Bu destede henüz kart yok. Önce kart ekle ✍️'); openManage(d.id); return; }
    setStudying({ deck: d, cards: pool });
  };

  const addBulk = () => {
    if (!deck) return;
    const today = localDay();
    const parsed = bulk.split('\n').map(parseLine).filter((x): x is [string, string] => !!x);
    if (!parsed.length) { toast.info('Her satıra "ön - arka" şeklinde yaz. ✍️'); return; }
    setCards(prev => [...prev, ...parsed.map(([front, back]) => ({ id: uuidv4(), deckId: deck.id, front, back, box: 1, due: today, reviews: 0, correct: 0 }))]);
    setBulk('');
    toast.success(`${parsed.length} kart eklendi 🃏`);
  };

  const addSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deck || !single.front.trim() || !single.back.trim()) return;
    setCards(prev => [...prev, { id: uuidv4(), deckId: deck.id, front: single.front.trim(), back: single.back.trim(), box: 1, due: localDay(), reviews: 0, correct: 0 }]);
    setSingle({ front: '', back: '' });
    toast.success('Kart eklendi, bugün çalışılacaklar arasında 🃏');
  };

  if (studying) {
    const done = new Set(studying.cards.map(c => c.id));
    const next = pickFor(studying.deck, done);
    return (
      <div className="pb-16 pt-2">
        <Session key={studying.cards.map(c => c.id).join()} deck={studying.deck} cards={studying.cards} moreLeft={next.length}
          onMore={() => setStudying({ deck: studying.deck, cards: next })} onGrade={grade} onExit={() => setStudying(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Bilgi Kartları 🃏</h1>
          <p className="text-ink-soft mt-2">Aralıklı tekrar: bildiğin kart daha seyrek, zorlandığın daha sık gelir. Bugün {totalDue} kart seni bekliyor.</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-black uppercase tracking-widest text-ink-muted">Oturum başına</span>
            <div className="flex p-1 rounded-xl bg-glass/50 border border-glass/70">
              {SESSION_SIZES.map(n => (
                <button key={n} onClick={() => setSessionSize(n)} className={cn('px-3 py-1 rounded-lg text-xs font-black transition-all', sessionSize === n ? 'bg-moss text-white shadow' : 'text-ink-soft')}>{n || 'Tümü'}</button>
              ))}
            </div>
            <span className="text-xs font-semibold text-ink-muted">kart</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLibrary(true)} className="btn-ghost px-5 py-3 text-sm w-fit whitespace-nowrap">
            <Package className="w-4 h-4 mr-1.5" /> Hazır desteler
          </button>
          <button onClick={() => setNewDeck({ name: '', emoji: DECK_EMOJIS[0], color: SUBJECT_COLORS[decks.length % SUBJECT_COLORS.length] })} className="btn-primary px-5 py-3 text-sm w-fit whitespace-nowrap">
            <Plus className="w-4 h-4 mr-1.5" /> Yeni deste
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
        {decks.map(d => {
          const s = stats[d.id];
          return (
            <div key={d.id} className="relative group pt-14">
              {/* Index cards peeking out of the box, with Leitner divider tabs */}
              <div className="absolute inset-x-6 top-0 h-28 flex items-end justify-center transition-transform duration-300 group-hover:-translate-y-2" aria-hidden>
                {Array.from({ length: Math.min(Math.max(s.total, 1), 7) }, (_, i) => (
                  <span key={i} className="absolute bottom-0 w-[86%] h-24 rounded-t-md bg-white border border-black/5 shadow-sm"
                    style={{ transform: `translateY(${i * 5}px) rotate(${(i % 3 - 1) * 1.2}deg)` }}>
                    <span className="absolute top-3 inset-x-0 h-px bg-[#e05a5a]/50" />
                    <span className="absolute top-6 inset-x-0 h-px bg-[#8fb3dd]/40" />
                    <span className="absolute top-9 inset-x-0 h-px bg-[#8fb3dd]/40" />
                  </span>
                ))}
                {[1, 2, 3, 4, 5].map(box => {
                  const n = cards.filter(c => c.deckId === d.id && c.box === box).length;
                  return (
                    <span key={box} className="absolute bottom-[4.4rem] px-1.5 py-0.5 rounded-t-md text-[9px] font-black text-white shadow-sm" title={`Kutu ${box}: ${n} kart`}
                      style={{ left: `${8 + (box - 1) * 18}%`, background: d.color, opacity: n ? 0.45 + box * 0.11 : 0.25 }}>
                      K{box}·{n}
                    </span>
                  );
                })}
              </div>
              {/* The box */}
              <div className={cn('relative rounded-b-2xl rounded-t-md p-4 pt-5 shadow-[0_18px_28px_-16px_rgba(0,0,0,0.5),inset_0_3px_0_rgba(255,255,255,0.25)]', openDeck === d.id && 'ring-2 ring-moss ring-offset-2 ring-offset-cream')}
                style={{ background: `linear-gradient(170deg, color-mix(in srgb, ${d.color} 80%, white), ${d.color} 60%, color-mix(in srgb, ${d.color} 75%, black))` }}>
                {s.due > 0 && <span className="absolute -top-3 -right-2 px-2.5 py-1 rounded-full bg-clay text-white text-xs font-black shadow-md rotate-6">{s.due} bugün</span>}
                {/* Metal label holder */}
                <div className="mx-auto w-[78%] p-1 rounded-md bg-[linear-gradient(180deg,#e9ecf0,#a9b0ba)] shadow-md">
                  <div className="rounded-sm bg-[#fffaf0] px-3 py-1.5 text-center text-[#3b2f2a]">
                    <p className="font-hand text-2xl leading-6 truncate">{d.emoji} {d.name}</p>
                    <p className="text-[10px] font-black opacity-60">{s.total} kart · {s.mastered} ezber</p>
                  </div>
                </div>
                {/* Finger pull */}
                <span className="block mx-auto mt-2 w-10 h-2 rounded-full bg-black/25 shadow-inner" aria-hidden />
                <div className="flex gap-2 mt-3">
                  {s.total === 0 ? (
                    <button onClick={() => openManage(d.id)} className="flex-1 py-2.5 rounded-xl bg-white/90 text-sm font-black shadow hover:bg-white flex items-center justify-center gap-1.5" style={{ color: d.color }}>
                      <Plus className="w-4 h-4" /> Kart ekle
                    </button>
                  ) : (
                    <button onClick={() => study(d)} className="flex-1 py-2.5 rounded-xl bg-white/90 text-sm font-black shadow hover:bg-white flex items-center justify-center gap-1.5" style={{ color: d.color }}
                      title={s.due ? 'Sırası gelen kartlar, sonra ekstra pratik' : 'Bugünkü tekrar bitti — ekstra pratik yap'}>
                      <Play className="w-4 h-4 fill-current" /> {s.due ? `${Math.min(s.due, sessionSize || s.due)} kart çalış` : 'Ekstra pratik ✨'}
                    </button>
                  )}
                  <button onClick={() => study(d, true)} className="px-3 py-2.5 rounded-xl bg-black/20 text-white hover:bg-black/30" title="Tümünü tekrar et" aria-label="Tümünü tekrar et"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => (openDeck === d.id ? setOpenDeck(null) : openManage(d.id))} className="px-3 py-2.5 rounded-xl bg-black/20 text-white hover:bg-black/30" title="Kart ekle / yönet" aria-label="Kart ekle / yönet"><Layers className="w-4 h-4" /></button>
                </div>
                <button onClick={() => { setDecks(prev => prev.filter(x => x.id !== d.id)); setCards(prev => prev.filter(c => c.deckId !== d.id)); }} aria-label="Desteyi sil"
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/70 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {deck && (
        <div ref={panelRef} className="glass-panel p-6 space-y-5 animate-fade-in scroll-mt-28">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-ink">{deck.emoji} {deck.name} · kartlar</h2>
            <button onClick={() => setOpenDeck(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={addSingle} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input autoFocus value={single.front} onChange={e => setSingle(x => ({ ...x, front: e.target.value }))} placeholder="Ön yüz (soru)" className="px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <input value={single.back} onChange={e => setSingle(x => ({ ...x, back: e.target.value }))} placeholder="Arka yüz (cevap)" className="px-4 py-3 glass-input rounded-xl text-ink font-medium" />
            <button type="submit" disabled={!single.front.trim() || !single.back.trim()} className="btn-primary px-5 py-3 text-sm disabled:opacity-50"><Plus className="w-4 h-4 mr-1" /> Kart ekle</button>
          </form>
          <div>
            <p className="text-sm font-bold text-ink-soft mb-2">Toplu ekle <span className="text-ink-muted font-semibold">— her satıra bir kart: "ön - arka"</span></p>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={4} placeholder={'git fetch - Uzak değişiklikleri indirir ama birleştirmez\nmap() - Her elemanı dönüştürüp yeni dizi döndürür'} className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium resize-y" />
            <button onClick={addBulk} className="btn-ghost mt-2 px-4 py-2.5 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Hepsini ekle</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
            {cards.filter(c => c.deckId === deck.id).map(c => (
              <div key={c.id} className="group relative flex items-center gap-3 p-3 pt-4 rounded-md bg-white text-[#2c2a30] shadow-sm border border-black/5 bg-[linear-gradient(transparent_10px,rgba(224,90,90,0.45)_10px,rgba(224,90,90,0.45)_11px,transparent_11px)]">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white" style={{ background: deck.color, opacity: 0.4 + c.box * 0.12 }}>K{c.box}</span>
                <span className="flex-1 min-w-0"><span className="font-hand text-xl leading-5 block truncate">{c.front}</span><span className="text-xs opacity-60 block truncate">{c.back}</span></span>
                <button onClick={() => setCards(prev => prev.filter(x => x.id !== c.id))} aria-label="Kartı sil" className="p-1 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {library && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setLibrary(false)} />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-cream border border-glass/70 shadow-2xl animate-pop overflow-hidden">
            <header className="flex items-start justify-between gap-3 p-6 pb-3">
              <div>
                <h2 className="text-xl font-bold font-serif text-ink">Hazır desteler 📦</h2>
                <p className="text-sm text-ink-soft">{FLASH_PACKS.length} deste · {PACK_CARD_TOTAL} kart. Eklediğin desteler kendi destelerinin arasına girer.</p>
              </div>
              <button onClick={() => setLibrary(false)} className="p-1.5 rounded-full hover:bg-glass/60 text-ink-soft" aria-label="Kapat"><X className="w-5 h-5" /></button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FLASH_PACKS.map(pack => {
                const missing = missingFor(pack);
                const complete = missing === 0;
                return (
                  <div key={pack.id} className="flex items-center gap-3 p-3 rounded-2xl bg-glass/50 border border-glass/70">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner" style={{ background: `color-mix(in srgb, ${pack.color} 22%, white)` }}>{pack.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">{pack.name}</p>
                      <p className="text-xs text-ink-muted truncate">{pack.description} · {pack.cards.length} kart</p>
                    </div>
                    {complete
                      ? <span className="flex items-center gap-1 text-xs font-black text-moss shrink-0"><Check className="w-4 h-4" /> Eklendi</span>
                      : <button onClick={() => addPack(pack)} className="btn-primary px-3 py-2 text-xs shrink-0">{missing === pack.cards.length ? 'Ekle' : `+${missing} kart`}</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {newDeck && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setNewDeck(null)} />
          <form role="dialog" aria-modal="true" onSubmit={(e) => {
            e.preventDefault();
            if (!newDeck.name.trim()) return;
            const id = uuidv4();
            setDecks(prev => [...prev, { id, name: newDeck.name.trim(), emoji: newDeck.emoji, color: newDeck.color, createdAt: new Date().toISOString() }]);
            setNewDeck(null);
            setOpenDeck(id);
          }} className="relative z-10 w-full max-w-md rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <h2 className="text-xl font-bold font-serif text-ink">Yeni deste 🃏</h2>
            <input autoFocus value={newDeck.name} onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })} placeholder="Örn: Docker komutları" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <div className="grid grid-cols-6 gap-1.5">
              {DECK_EMOJIS.map(e => <button type="button" key={e} onClick={() => setNewDeck({ ...newDeck, emoji: e })} className={cn('aspect-square rounded-xl text-2xl', newDeck.emoji === e ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{e}</button>)}
            </div>
            <div className="flex gap-2">
              {SUBJECT_COLORS.map(c => <button type="button" key={c} onClick={() => setNewDeck({ ...newDeck, color: c })} aria-label={`Renk ${c}`} className={cn('w-8 h-8 rounded-full border-2', newDeck.color === c ? 'border-ink scale-110' : 'border-white')} style={{ background: c }} />)}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNewDeck(null)} className="btn-ghost px-4 py-2.5 text-sm">Vazgeç</button>
              <button type="submit" disabled={!newDeck.name.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Oluştur</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
