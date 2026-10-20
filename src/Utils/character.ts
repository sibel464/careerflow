/** A Bitmoji-style, fully customizable character drawn in SVG (see Components/Character). */

export type FaceShape = 'round' | 'oval' | 'heart';
export type HairStyle = 'bob' | 'long' | 'ponytail' | 'buns' | 'braids' | 'curly' | 'short' | 'spiky';
export type EyeStyle = 'round' | 'lashes' | 'sparkle' | 'happy' | 'sleepy' | 'wink';
export type BrowStyle = 'soft' | 'arched' | 'straight' | 'thick';
export type MouthStyle = 'smile' | 'grin' | 'cat' | 'o' | 'tongue' | 'smirk';
export type Glasses = 'none' | 'round' | 'square' | 'cateye' | 'sun';
export type Headwear = 'none' | 'beanie' | 'cap' | 'headphones' | 'bow' | 'flower' | 'crown' | 'catears';
export type Earrings = 'none' | 'studs' | 'hoops';
export type Top = 'hoodie' | 'tee' | 'sweater' | 'shirt' | 'dress' | 'jacket';
export type Bottom = 'jeans' | 'joggers' | 'skirt' | 'shorts';
export type Shoes = 'sneakers' | 'boots';

export interface CharacterConfig {
  skin: string;
  face: FaceShape;
  freckles: boolean;
  blush: boolean;
  hair: HairStyle;
  hairColor: string;
  eyes: EyeStyle;
  eyeColor: string;
  brows: BrowStyle;
  mouth: MouthStyle;
  glasses: Glasses;
  headwear: Headwear;
  earrings: Earrings;
  top: Top;
  topColor: string;
  bottom: Bottom;
  bottomColor: string;
  shoes: Shoes;
  shoeColor: string;
  background: string;
  badge: string;
}

export const SKINS = ['#ffe6d6', '#fcd5bd', '#efbf9c', '#d39b72', '#a8704c', '#714a34'];
export const HAIR_COLORS = ['#2b2220', '#4a3028', '#7a4a2e', '#a0522d', '#e2b866', '#d9773a', '#f29ab8', '#b39ddb', '#6fa8dc', '#c9c9d1'];
export const EYE_COLORS = ['#5b3a24', '#2b2220', '#4f86c0', '#4f9a72', '#9a7b3a', '#8a5ab8'];
export const CLOTH_COLORS = ['#b9a6e8', '#f6a8c4', '#8fd1ad', '#9fd4ff', '#ffd36e', '#f28c6b', '#ffffff', '#3b3a48', '#c9714a', '#4f86c0', '#e0525a', '#7a8f5a'];
export const PANTS_COLORS = ['#4f6f9a', '#2f3e5c', '#3b3a48', '#c9b79c', '#f6a8c4', '#7a8f5a', '#ffffff', '#b9a6e8'];
export const SHOE_COLORS = ['#ffffff', '#3b3a48', '#e0525a', '#f6a8c4', '#c9714a', '#8fd1ad'];

export const CHARACTER_BACKGROUNDS = [
  'linear-gradient(135deg, #ffd1dc 0%, #ffe9b3 100%)',
  'linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
];
export const CHARACTER_BADGES = ['', '😊', '📚', '☕', '💪', '🎧', '✨', '🌸', '🔥', '💻', '🎯', '🐾'];

export const OPTIONS = {
  face: [['round', 'Yuvarlak'], ['oval', 'Oval'], ['heart', 'Kalp']],
  hair: [['bob', 'Küt'], ['long', 'Uzun'], ['ponytail', 'At kuyruğu'], ['buns', 'Topuz'], ['braids', 'Örgü'], ['curly', 'Kıvırcık'], ['short', 'Kısa'], ['spiky', 'Dağınık']],
  eyes: [['round', 'Yuvarlak'], ['lashes', 'Kirpikli'], ['sparkle', 'Parıltılı'], ['happy', 'Gülen'], ['sleepy', 'Uykulu'], ['wink', 'Göz kırpan']],
  brows: [['soft', 'Yumuşak'], ['arched', 'Kavisli'], ['straight', 'Düz'], ['thick', 'Kalın']],
  mouth: [['smile', 'Gülümseme'], ['grin', 'Kahkaha'], ['cat', 'Kedi :3'], ['o', 'Şaşkın'], ['tongue', 'Dil'], ['smirk', 'Yan gülüş']],
  glasses: [['none', 'Yok'], ['round', 'Yuvarlak'], ['square', 'Kare'], ['cateye', 'Kedi göz'], ['sun', 'Güneş']],
  headwear: [['none', 'Yok'], ['beanie', 'Bere'], ['cap', 'Şapka'], ['headphones', 'Kulaklık'], ['bow', 'Fiyonk'], ['flower', 'Çiçek'], ['crown', 'Taç'], ['catears', 'Kedi kulağı']],
  earrings: [['none', 'Yok'], ['studs', 'Taş'], ['hoops', 'Halka']],
  top: [['hoodie', 'Kapüşonlu'], ['tee', 'Tişört'], ['sweater', 'Çizgili kazak'], ['shirt', 'Gömlek'], ['dress', 'Elbise'], ['jacket', 'Ceket']],
  bottom: [['jeans', 'Kot'], ['joggers', 'Eşofman'], ['skirt', 'Etek'], ['shorts', 'Şort']],
  shoes: [['sneakers', 'Spor ayakkabı'], ['boots', 'Bot']],
} as const;

export const DEFAULT_CHARACTER: CharacterConfig = {
  skin: SKINS[1], face: 'round', freckles: false, blush: true,
  hair: 'bob', hairColor: HAIR_COLORS[1],
  eyes: 'round', eyeColor: EYE_COLORS[0], brows: 'soft', mouth: 'smile',
  glasses: 'none', headwear: 'none', earrings: 'none',
  top: 'hoodie', topColor: CLOTH_COLORS[0], bottom: 'jeans', bottomColor: PANTS_COLORS[0], shoes: 'sneakers', shoeColor: SHOE_COLORS[0],
  background: CHARACTER_BACKGROUNDS[3], badge: '📚',
};

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const pickId = (k: keyof typeof OPTIONS): string => pick(OPTIONS[k] as readonly (readonly [string, string])[])[0];

export const randomCharacter = (): CharacterConfig => ({
  skin: pick(SKINS), face: pickId('face') as FaceShape, freckles: Math.random() < 0.25, blush: Math.random() < 0.8,
  hair: pickId('hair') as HairStyle, hairColor: pick(HAIR_COLORS),
  eyes: pick(['round', 'lashes', 'sparkle', 'round'] as const), eyeColor: pick(EYE_COLORS), brows: pickId('brows') as BrowStyle, mouth: pick(['smile', 'grin', 'cat', 'smile'] as const),
  glasses: Math.random() < 0.35 ? pick(['round', 'square', 'cateye'] as const) : 'none',
  headwear: Math.random() < 0.4 ? pickId('headwear') as Headwear : 'none',
  earrings: pickId('earrings') as Earrings,
  top: pickId('top') as Top, topColor: pick(CLOTH_COLORS), bottom: pickId('bottom') as Bottom, bottomColor: pick(PANTS_COLORS),
  shoes: pickId('shoes') as Shoes, shoeColor: pick(SHOE_COLORS),
  background: pick(CHARACTER_BACKGROUNDS), badge: pick(CHARACTER_BADGES),
});

/** Older saves may miss fields; fill them in. */
export const normalizeCharacter = (saved: unknown): CharacterConfig =>
  saved && typeof saved === 'object' ? { ...DEFAULT_CHARACTER, ...(saved as Partial<CharacterConfig>) } : DEFAULT_CHARACTER;
