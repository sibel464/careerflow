import React, { useState } from 'react';
import { Dices, Check } from 'lucide-react';
import { usePreferences } from '../Hooks/PreferencesContext';
import { CharacterArt, CharacterPose } from './Character/CharacterArt';
import {
  CharacterConfig, OPTIONS, SKINS, HAIR_COLORS, EYE_COLORS, CLOTH_COLORS, PANTS_COLORS, SHOE_COLORS,
  CHARACTER_BACKGROUNDS, CHARACTER_BADGES, randomCharacter,
} from '../Utils/character';
import { cn } from '../Utils/classNames';

type Tab = 'face' | 'hair' | 'eyes' | 'mouth' | 'extras' | 'outfit' | 'bg';
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'face', label: 'Yüz', emoji: '🙂' },
  { id: 'hair', label: 'Saç', emoji: '💇' },
  { id: 'eyes', label: 'Gözler', emoji: '👀' },
  { id: 'mouth', label: 'Ağız', emoji: '👄' },
  { id: 'extras', label: 'Aksesuar', emoji: '🎀' },
  { id: 'outfit', label: 'Kıyafet', emoji: '👕' },
  { id: 'bg', label: 'Arka plan', emoji: '🎨' },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-muted mb-2.5 mt-5 first:mt-0">{children}</p>
);

const Swatches: React.FC<{ colors: readonly string[]; value: string; onPick: (c: string) => void }> = ({ colors, value, onPick }) => (
  <div className="flex flex-wrap gap-2">
    {colors.map(c => (
      <button key={c} onClick={() => onPick(c)} aria-label={c} aria-pressed={value === c}
        className={cn('w-9 h-9 rounded-full border-2 border-black/10 transition-transform hover:scale-110', value === c && 'ring-2 ring-moss ring-offset-2 ring-offset-cream scale-110')}
        style={{ background: c }} />
    ))}
  </div>
);

/** A grid of little previews — each one is your character wearing that option. */
function Options<K extends keyof typeof OPTIONS>({ field, look, crop, onPick }: {
  field: K; look: CharacterConfig; crop: 'head' | 'body'; onPick: (changes: Partial<CharacterConfig>) => void;
}) {
  const list = OPTIONS[field] as readonly (readonly [string, string])[];
  return (
    <div className={cn('grid gap-2', crop === 'head' ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-6')}>
      {list.map(([id, label]) => {
        const on = (look[field as keyof CharacterConfig] as string) === id;
        const preview = { ...look, [field]: id } as CharacterConfig;
        return (
          <button key={id} onClick={() => onPick({ [field]: id } as Partial<CharacterConfig>)} aria-pressed={on}
            className={cn('relative rounded-2xl border-2 p-1 transition-all', on ? 'border-moss bg-moss/10 shadow-md' : 'border-transparent bg-glass/50 hover:bg-glass/80')}>
            <span className={cn('block overflow-hidden rounded-xl', crop === 'head' ? 'aspect-square' : 'aspect-[4/5]')} style={{ background: look.background }}>
              <CharacterArt config={preview} crop={crop} className={cn('w-full h-full', crop === 'head' && 'translate-y-[6%]')} />
            </span>
            <span className="block text-[11px] font-bold text-ink-soft mt-1 truncate">{label}</span>
            {on && <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-moss text-white flex items-center justify-center"><Check className="w-3 h-3" /></span>}
          </button>
        );
      })}
    </div>
  );
}

const Toggle: React.FC<{ label: string; on: boolean; onChange: () => void }> = ({ label, on, onChange }) => (
  <button onClick={onChange} className={cn('px-4 py-2 rounded-xl text-sm font-bold transition-all', on ? 'bg-moss text-white shadow' : 'bg-glass/60 text-ink-soft')}>{on ? '✓ ' : ''}{label}</button>
);

/** Build your own character, Bitmoji-style: every part has its own little preview. */
export const AvatarBuilder: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const look = preferences.character;
  const [tab, setTab] = useState<Tab>('face');
  const [pose, setPose] = useState<CharacterPose>('wave');
  const [joy, setJoy] = useState(false);

  const change = (changes: Partial<CharacterConfig>) => {
    updatePreferences({ character: { ...look, ...changes } });
    // A little happy hop on every change.
    setJoy(true);
    setPose('jump');
    window.setTimeout(() => { setJoy(false); setPose('idle'); }, 650);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-8">
      {/* Preview */}
      <div className="flex flex-col items-center lg:sticky lg:top-0 self-start">
        <div className="relative w-60 h-80 sm:w-64 sm:h-[22rem] rounded-[2.5rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]" style={{ background: look.background }}
          onMouseEnter={() => setPose('wave')} onMouseLeave={() => setPose('idle')}>
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)]" aria-hidden />
          <CharacterArt config={look} pose={pose} joy={joy} className="relative w-full h-full p-4" />
          {look.badge && <span className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl">{look.badge}</span>}
        </div>
        <p className="mt-4 text-xl font-black font-serif text-ink">{preferences.userName || 'Sen'}</p>
        <p className="text-xs font-semibold text-ink-muted">Ana sayfada yürüyen ve her yerde görünen karakterin bu.</p>
        <button onClick={() => change(randomCharacter())} className="btn-primary mt-4 px-5 py-2.5 text-sm">
          <Dices className="w-4 h-4 mr-2" /> Bana sürpriz yap
        </button>
      </div>

      {/* Editor */}
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('shrink-0 px-4 py-2 rounded-xl text-sm font-black transition-all', tab === t.id ? 'bg-moss text-white shadow-md' : 'bg-glass/50 text-ink-soft hover:bg-glass/80')}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 animate-fade-in" key={tab}>
          {tab === 'face' && <>
            <Label>Ten rengi</Label>
            <Swatches colors={SKINS} value={look.skin} onPick={skin => change({ skin })} />
            <Label>Yüz şekli</Label>
            <Options field="face" look={look} crop="head" onPick={change} />
            <Label>Detaylar</Label>
            <div className="flex flex-wrap gap-2">
              <Toggle label="Allık" on={look.blush} onChange={() => change({ blush: !look.blush })} />
              <Toggle label="Çil" on={look.freckles} onChange={() => change({ freckles: !look.freckles })} />
            </div>
          </>}

          {tab === 'hair' && <>
            <Label>Saç rengi</Label>
            <Swatches colors={HAIR_COLORS} value={look.hairColor} onPick={hairColor => change({ hairColor })} />
            <Label>Saç modeli</Label>
            <Options field="hair" look={look} crop="head" onPick={change} />
          </>}

          {tab === 'eyes' && <>
            <Label>Göz rengi</Label>
            <Swatches colors={EYE_COLORS} value={look.eyeColor} onPick={eyeColor => change({ eyeColor })} />
            <Label>Gözler</Label>
            <Options field="eyes" look={look} crop="head" onPick={change} />
            <Label>Kaşlar</Label>
            <Options field="brows" look={look} crop="head" onPick={change} />
          </>}

          {tab === 'mouth' && <>
            <Label>Ağız</Label>
            <Options field="mouth" look={look} crop="head" onPick={change} />
          </>}

          {tab === 'extras' && <>
            <Label>Gözlük</Label>
            <Options field="glasses" look={look} crop="head" onPick={change} />
            <Label>Başlık</Label>
            <Options field="headwear" look={look} crop="head" onPick={change} />
            <Label>Küpe</Label>
            <Options field="earrings" look={look} crop="head" onPick={change} />
          </>}

          {tab === 'outfit' && <>
            <Label>Üst</Label>
            <Options field="top" look={look} crop="body" onPick={change} />
            <div className="mt-3"><Swatches colors={CLOTH_COLORS} value={look.topColor} onPick={topColor => change({ topColor })} /></div>
            {look.top !== 'dress' && <>
              <Label>Alt</Label>
              <Options field="bottom" look={look} crop="body" onPick={change} />
              <div className="mt-3"><Swatches colors={PANTS_COLORS} value={look.bottomColor} onPick={bottomColor => change({ bottomColor })} /></div>
            </>}
            <Label>Ayakkabı</Label>
            <Options field="shoes" look={look} crop="body" onPick={change} />
            <div className="mt-3"><Swatches colors={SHOE_COLORS} value={look.shoeColor} onPick={shoeColor => change({ shoeColor })} /></div>
          </>}

          {tab === 'bg' && <>
            <Label>Arka plan</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CHARACTER_BACKGROUNDS.map(bg => (
                <button key={bg} onClick={() => change({ background: bg })} aria-pressed={look.background === bg}
                  className={cn('aspect-square rounded-2xl border-2 transition-transform hover:scale-105', look.background === bg ? 'border-moss ring-2 ring-moss/30' : 'border-white/60')}
                  style={{ background: bg }} />
              ))}
            </div>
            <Label>Rozet</Label>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_BADGES.map(b => (
                <button key={b || 'none'} onClick={() => change({ badge: b })} aria-pressed={look.badge === b}
                  className={cn('w-11 h-11 rounded-full text-xl flex items-center justify-center transition-all', look.badge === b ? 'bg-moss/15 ring-2 ring-moss' : 'bg-glass/60 hover:bg-glass/90')}>
                  {b || '∅'}
                </button>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
};
