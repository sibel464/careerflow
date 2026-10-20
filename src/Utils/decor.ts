/** Room decor for the "real object" pages: shelves, boards and paper. Colors live in index.css. */
import type { Wall } from './wallpapers';
export type Wood = 'oak' | 'walnut' | 'birch' | 'cherry' | 'white';
export type Board = 'cork' | 'chalk' | 'white' | 'felt' | 'linen';
export type Paper = 'cream' | 'white' | 'kraft' | 'blush' | 'mint';

export interface Decor { wood: Wood; board: Board; paper: Paper; wall: Wall }

export const DEFAULT_DECOR: Decor = { wood: 'oak', board: 'cork', paper: 'cream', wall: 'boho' };

export const WOODS: { id: Wood; name: string; a: string; b: string }[] = [
  { id: 'oak', name: 'Meşe', a: '#a87b55', b: '#6b4a32' },
  { id: 'walnut', name: 'Ceviz', a: '#6e4a33', b: '#2a1b12' },
  { id: 'birch', name: 'Huş', a: '#e6cfa8', b: '#b89a6e' },
  { id: 'cherry', name: 'Kiraz', a: '#b5584a', b: '#55211b' },
  { id: 'white', name: 'Beyaz boya', a: '#f4f1ec', b: '#d6cfc4' },
];

export const BOARDS: { id: Board; name: string; a: string; b: string }[] = [
  { id: 'cork', name: 'Mantar', a: '#c79a68', b: '#a87b4f' },
  { id: 'chalk', name: 'Kara tahta', a: '#2f4a3a', b: '#3d5c49' },
  { id: 'white', name: 'Beyaz tahta', a: '#f7f8fa', b: '#dfe3ea' },
  { id: 'felt', name: 'Keçe', a: '#3b4a6b', b: '#4d5d82' },
  { id: 'linen', name: 'Keten', a: '#e8e0d0', b: '#d5cab4' },
];

export const PAPERS: { id: Paper; name: string; a: string; b: string }[] = [
  { id: 'cream', name: 'Krem', a: '#fffaf0', b: '#4f86c0' },
  { id: 'white', name: 'Beyaz', a: '#ffffff', b: '#8fb3dd' },
  { id: 'kraft', name: 'Kraft', a: '#dcc39b', b: '#8a6a45' },
  { id: 'blush', name: 'Pembe', a: '#fff0f3', b: '#e48aa6' },
  { id: 'mint', name: 'Nane', a: '#effaf3', b: '#5fae84' },
];
