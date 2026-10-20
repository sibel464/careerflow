import React, { useEffect, useState } from 'react';
import type { Space } from '../Hooks/useSpace';
import { SPACE_META } from '../Utils/navigation';

const BACKDROP: Record<Space, string> = {
  career: 'linear-gradient(135deg, #2c5e4a 0%, #6b4c3a 100%)',
  study: 'linear-gradient(135deg, #4c58a8 0%, #7a4a8a 100%)',
};

const GREETING: Record<Space, string> = {
  career: 'Hayalindeki işe bir adım daha',
  study: 'Odaklanma zamanı',
};

/**
 * A short "walking into another room" moment when switching spaces:
 * the new space's color grows out from the switcher, shows its name, then fades away.
 */
export const SpaceTransition: React.FC<{ space: Space }> = ({ space }) => {
  const [shown, setShown] = useState<{ space: Space; id: number } | null>(null);
  const [previous, setPrevious] = useState(space);

  if (previous !== space) {
    setPrevious(space);
    setShown(prev => ({ space, id: (prev?.id ?? 0) + 1 }));
  }

  useEffect(() => {
    if (!shown) return;
    const id = window.setTimeout(() => setShown(null), 1100);
    return () => window.clearTimeout(id);
  }, [shown]);

  if (!shown) return null;
  const meta = SPACE_META[shown.space];

  return (
    <div
      key={shown.id}
      aria-hidden="true"
      className="space-transition fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
      style={{ background: BACKDROP[shown.space] }}
    >
      <div className="space-transition-content text-center text-white">
        <div className="text-7xl mb-4 drop-shadow-lg">{meta.emoji}</div>
        <p className="text-4xl font-black font-serif tracking-tight">{meta.brand}</p>
        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-80 mt-2">{GREETING[shown.space]}</p>
      </div>
    </div>
  );
};
