import type { Palette } from '../Hooks/PreferencesContext';

/** Swatches for the picker; the actual colors live in index.css (generated from the same table). */
export const PALETTES: { id: Palette; name: string; emoji: string; mood: string; bg: string; primary: string; accent: string; blob: string; ink: string }[] = [
  { id: 'lavender', name: 'Lavanta', emoji: '💜', mood: 'Sakin ve odaklı', bg: '#eeebf6', primary: '#4c58a8', accent: '#d0644a', blob: '#d9d4f0', ink: '#353150' },
  { id: 'peach', name: 'Şeftali', emoji: '🍑', mood: 'Sıcak ve enerjik', bg: '#fbf1ea', primary: '#c4553a', accent: '#3a7d6b', blob: '#ffd9c7', ink: '#43302b' },
  { id: 'ocean', name: 'Okyanus', emoji: '🌊', mood: 'Ferah ve berrak', bg: '#eaf4f6', primary: '#1f6f8b', accent: '#e07a5f', blob: '#c8ecf2', ink: '#1d3742' },
  { id: 'matcha', name: 'Matcha', emoji: '🍵', mood: 'Doğal ve huzurlu', bg: '#f1f4ea', primary: '#4a7c59', accent: '#c97b63', blob: '#dceccd', ink: '#2f3a2c' },
  { id: 'rose', name: 'Gül', emoji: '🌹', mood: 'Tatlı ve yumuşak', bg: '#fbeef2', primary: '#b0457a', accent: '#4f86c0', blob: '#f8d3e1', ink: '#432a36' },
];

export type MotifShapeId = 'star' | 'moon' | 'dot' | 'heart' | 'sun' | 'flower' | 'bubble' | 'wave' | 'leaf' | 'sprig' | 'petal';

/** Each color theme has its own little shapes floating softly behind everything. */
export const MOTIFS: Record<Palette, { shapes: MotifShapeId[]; label: string }> = {
  lavender: { shapes: ['star', 'moon', 'dot', 'star'], label: 'Yıldız ve ay' },
  peach: { shapes: ['heart', 'sun', 'dot', 'flower'], label: 'Kalp ve güneş' },
  ocean: { shapes: ['bubble', 'wave', 'dot', 'bubble'], label: 'Baloncuk ve dalga' },
  matcha: { shapes: ['leaf', 'sprig', 'dot', 'leaf'], label: 'Yaprak ve filiz' },
  rose: { shapes: ['petal', 'heart', 'flower', 'dot'], label: 'Taç yaprağı ve çiçek' },
};
