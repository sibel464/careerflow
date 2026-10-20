import React from 'react';
import { cn } from '../Utils/classNames';

const TONES = [
  'from-[#2c5e4a] to-[#3d7a62]',
  'from-[#c05c3e] to-[#d8a48b]',
  'from-[#6b4c3a] to-[#a38b76]',
  'from-[#b88a2a] to-[#e8b923]',
  'from-[#4f6d7a] to-[#7fa3b0]',
  'from-[#8c3a3a] to-[#c46a5a]',
];

/** A warm, deterministic monogram so every company gets its own color. */
export const CompanyAvatar: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const clean = name.trim() || '?';
  const hash = [...clean].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const initials = clean
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toLocaleUpperCase('tr-TR');

  return (
    <div
      className={cn(
        'h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br text-white font-black font-serif flex items-center justify-center shadow-md border border-white/40 select-none',
        TONES[hash % TONES.length],
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};
