import React from 'react';
import type { AvatarConfig } from '../Utils/avatar';
import type { CharacterConfig } from '../Utils/character';
import { usePreferences } from '../Hooks/PreferencesContext';
import { CharacterArt } from './Character/CharacterArt';
import { cn } from '../Utils/classNames';

interface AvatarProps {
  /** Kept for older call sites; the drawing now comes from your character in Settings. */
  config?: AvatarConfig;
  /** Draw this character instead of yours (e.g. option previews in the builder). */
  character?: CharacterConfig;
  className?: string;
  /** The whole body, no tile or badge (for scenes and the companion). */
  transparent?: boolean;
  /** Hide the corner badge even on a tile. */
  noBadge?: boolean;
  rounded?: string;
  alt?: string;
}

/** Your Bitmoji-style character: a portrait on a colored tile, or the whole body for scenes. */
export const Avatar: React.FC<AvatarProps> = ({ character, className, transparent, noBadge, rounded = 'rounded-2xl', alt = 'Avatarın' }) => {
  const { preferences } = usePreferences();
  const c = character ?? preferences.character;

  if (transparent) {
    return (
      <span className={cn('block', className)} role="img" aria-label={alt}>
        <CharacterArt config={c} className="w-full h-full" />
      </span>
    );
  }

  return (
    <span className={cn('relative block overflow-hidden [container-type:inline-size] shadow-inner', rounded, className)} style={{ background: c.background }} role="img" aria-label={alt}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)]" aria-hidden="true" />
      <CharacterArt config={c} crop="head" className="relative block w-full h-full translate-y-[6%] scale-[1.04]" />
      {!noBadge && c.badge && (
        <span className="absolute right-[4%] bottom-[4%] w-[30%] h-[30%] rounded-full bg-white shadow-md flex items-center justify-center text-[18cqw] leading-none" aria-hidden="true">
          {c.badge}
        </span>
      )}
    </span>
  );
};
