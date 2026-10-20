import React, { useSyncExternalStore } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Loader2, ExternalLink, Coffee, Flame } from 'lucide-react';
import { soundscape, TRACKS, NATURE, SCENES } from '../Utils/soundscape';
import { ambient } from '../Utils/ambient';
import { cn } from '../Utils/classNames';

const useSoundscape = () => useSyncExternalStore(soundscape.subscribe, soundscape.getSnapshot);
const useAmbient = () => useSyncExternalStore((cb) => ambient.subscribe(cb), () => ambient.volumes);

const clock = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

/** Animated equalizer bars shown while something plays. */
export const Equalizer: React.FC<{ active: boolean; className?: string }> = ({ active, className }) => (
  <span className={cn('flex items-end gap-0.5 h-4', className)} aria-hidden="true">
    {[0, 1, 2, 3].map(i => (
      <span
        key={i}
        className={cn('w-1 rounded-full bg-current origin-bottom', active ? 'animate-[eq_0.9s_ease-in-out_infinite]' : 'h-1 opacity-40')}
        style={active ? { animationDelay: `${i * 0.15}s`, height: '100%' } : undefined}
      />
    ))}
  </span>
);

export const SoundLibrary: React.FC = () => {
  const s = useSoundscape();
  const synth = useAmbient();
  const track = TRACKS[s.trackIndex];
  const progress = s.duration ? s.position / s.duration : 0;

  return (
    <div className="space-y-6">
      {/* Scenes */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">Hazır sahneler</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {SCENES.map(scene => (
            <button
              key={scene.name}
              onClick={() => soundscape.applyScene(scene)}
              className="group text-left p-4 rounded-2xl bg-glass/50 border border-glass/70 hover:bg-glass/80 hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform w-fit">{scene.emoji}</span>
              <span className="block text-sm font-bold text-ink">{scene.name}</span>
              <span className="block text-[11px] font-semibold text-ink-muted mt-0.5">{scene.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Music player */}
        <div className="xl:col-span-3 rounded-3xl p-6 bg-gradient-to-br from-moss/15 via-glass/40 to-clay/10 border border-glass/70">
          <div className="flex items-center gap-5">
            <div className={cn('relative w-24 h-24 shrink-0 rounded-full bg-ink shadow-xl flex items-center justify-center', s.playing && 'animate-[spin_6s_linear_infinite]')}>
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-moss to-clay flex items-center justify-center text-xl">{track.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-moss flex items-center gap-2">
                {s.playing ? 'Şimdi çalıyor' : 'Müzik'} <Equalizer active={s.playing && !s.loading} />
              </p>
              <h3 className="text-xl font-bold font-serif text-ink truncate mt-1">{track.title}</h3>
              <p className="text-sm font-semibold text-ink-soft">{track.composer} · {track.instrument} · <span className="text-ink-muted">{track.performer}</span></p>
            </div>
          </div>

          <div className="mt-5">
            <input
              type="range" min={0} max={1000} value={Math.round(progress * 1000)}
              onChange={(e) => soundscape.seek(Number(e.target.value) / 1000)}
              aria-label="Parça konumu"
              className="w-full accent-[var(--color-moss)]"
            />
            <div className="flex justify-between text-[11px] font-bold text-ink-muted tabular-nums">
              <span>{clock(s.position)}</span><span>{clock(s.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button onClick={() => soundscape.toggleShuffle()} aria-pressed={s.shuffle} aria-label="Karışık çal" className={cn('p-2.5 rounded-xl transition-colors', s.shuffle ? 'text-moss bg-moss/10' : 'text-ink-muted hover:text-ink')}>
              <Shuffle className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => soundscape.previous()} aria-label="Önceki" className="btn-ghost w-11 h-11"><SkipBack className="w-5 h-5" /></button>
              <button onClick={() => soundscape.toggleMusic()} aria-label={s.playing ? 'Duraklat' : 'Çal'} className="btn-primary w-14 h-14 rounded-2xl">
                {s.loading ? <Loader2 className="w-6 h-6 animate-spin" /> : s.playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button onClick={() => soundscape.next()} aria-label="Sonraki" className="btn-ghost w-11 h-11"><SkipForward className="w-5 h-5" /></button>
            </div>
            <label className="flex items-center gap-2 text-ink-muted">
              {s.musicVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <input type="range" min={0} max={1} step={0.05} value={s.musicVolume} onChange={(e) => soundscape.setMusicVolume(Number(e.target.value))} aria-label="Müzik sesi" className="w-20 accent-[var(--color-moss)]" />
            </label>
          </div>
          {s.error && <p className="text-xs font-bold text-clay mt-3">{s.error}</p>}

          <div className="mt-5 grid sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {TRACKS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => (i === s.trackIndex ? soundscape.toggleMusic() : soundscape.playTrack(i))}
                className={cn('flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors', i === s.trackIndex ? 'bg-glass/80 shadow-sm' : 'hover:bg-glass/50')}
              >
                <span className="w-8 h-8 rounded-lg bg-glass/70 border border-glass/80 flex items-center justify-center shrink-0">
                  {i === s.trackIndex && s.playing ? <Equalizer active className="text-moss" /> : t.emoji}
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-sm font-bold truncate', i === s.trackIndex ? 'text-moss' : 'text-ink')}>{t.title}</span>
                  <span className="block text-[11px] font-semibold text-ink-muted truncate">{t.composer} · {t.instrument}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nature + synth */}
        <div className="xl:col-span-2 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-ink-muted">Doğa sesleri · gerçek kayıtlar</p>
          <div className="grid grid-cols-2 gap-3">
            {NATURE.map(n => {
              const vol = s.nature[n.id] ?? 0;
              const loading = s.natureLoading[n.id];
              return (
                <div key={n.id} className={cn('rounded-2xl border p-3.5 transition-all', vol > 0 ? 'bg-moss/10 border-moss/30 shadow-md' : 'bg-glass/40 border-glass/60')}>
                  <button onClick={() => soundscape.setNature(n.id, vol > 0 ? 0 : 0.5)} className="flex items-center gap-2.5 w-full text-left" aria-pressed={vol > 0}>
                    <span className={cn('text-3xl', vol > 0 && 'animate-float')}>{n.emoji}</span>
                    <span className="text-sm font-bold text-ink flex-1">{n.label}</span>
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />}
                  </button>
                  <input
                    type="range" min={0} max={1} step={0.05} value={vol}
                    onChange={(e) => soundscape.setNature(n.id, Number(e.target.value))}
                    aria-label={`${n.label} ses seviyesi`}
                    className="w-full mt-2 accent-[var(--color-moss)]"
                  />
                </div>
              );
            })}
          </div>

          <p className="text-xs font-black uppercase tracking-widest text-ink-muted pt-2">Çevrimdışı ambiyans</p>
          <div className="grid grid-cols-2 gap-3">
            {([['cafe', 'Kafe uğultusu', Coffee], ['fire', 'Şömine', Flame]] as const).map(([id, label, Icon]) => {
              const vol = synth[id];
              return (
                <div key={id} className={cn('rounded-2xl border p-3.5 transition-all', vol > 0 ? 'bg-clay/10 border-clay/30' : 'bg-glass/40 border-glass/60')}>
                  <button onClick={() => ambient.setVolume(id, vol > 0 ? 0 : 0.5)} className="flex items-center gap-2.5 w-full text-left text-sm font-bold text-ink" aria-pressed={vol > 0}>
                    <Icon className="w-5 h-5 text-clay" /> {label}
                  </button>
                  <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => ambient.setVolume(id, Number(e.target.value))} aria-label={`${label} ses seviyesi`} className="w-full mt-2 accent-[var(--color-clay)]" />
                </div>
              );
            })}
          </div>

          <details className="text-[11px] font-semibold text-ink-muted">
            <summary className="cursor-pointer hover:text-ink">🎵 Kayıtlar ve lisanslar</summary>
            <ul className="mt-2 space-y-1">
              {[...TRACKS.map(t => ({ name: `${t.composer} — ${t.title}`, by: t.performer, license: t.license, source: t.source })),
                ...NATURE.map(n => ({ name: n.label, by: n.credit, license: n.license, source: n.source }))].map(item => (
                <li key={item.source}>
                  <a href={item.source} target="_blank" rel="noopener noreferrer" className="hover:text-moss inline-flex items-center gap-1">
                    {item.name} · {item.by} · {item.license} <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2">Tüm kayıtlar Wikimedia Commons'tan, açık lisanslarla; çalmak için internet gerekir.</p>
          </details>
        </div>
      </div>
    </div>
  );
};
