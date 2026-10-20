/**
 * 3D avatars from Microsoft Fluent Emoji (MIT licensed), pinned to a fixed commit.
 * https://github.com/microsoft/fluentui-emoji
 */
const FLUENT = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets';

export type SkinTone = 'Default' | 'Light' | 'Medium-Light' | 'Medium' | 'Medium-Dark' | 'Dark';
export type Gender = 'Woman' | 'Man' | 'Person';
export type CharacterGroup = 'look' | 'work' | 'fantasy';

export interface AvatarConfig {
  /** Fluent asset name without the gender prefix, e.g. "curly hair", "student"; '' for the plain person. */
  character: string;
  gender: Gender;
  tone: SkinTone;
  background: string;
  /** Optional little badge in the corner, Bitmoji-style. */
  badge: string;
}

export const SKIN_TONES: { id: SkinTone; color: string; label: string }[] = [
  { id: 'Light', color: '#f7d7c4', label: 'Açık' },
  { id: 'Medium-Light', color: '#e2b98f', label: 'Buğday açık' },
  { id: 'Medium', color: '#c68e5f', label: 'Buğday' },
  { id: 'Medium-Dark', color: '#a26a42', label: 'Esmer' },
  { id: 'Dark', color: '#5c3d2e', label: 'Koyu' },
  { id: 'Default', color: '#ffc83d', label: 'Klasik sarı' },
];

export const GENDERS: { id: Gender; label: string; emoji: string }[] = [
  { id: 'Woman', label: 'Kadın', emoji: '👩' },
  { id: 'Man', label: 'Erkek', emoji: '👨' },
  { id: 'Person', label: 'Kişi', emoji: '🧑' },
];

interface CharacterDef { id: string; label: string; group: CharacterGroup; genders: Gender[] }

const ALL: Gender[] = ['Woman', 'Man', 'Person'];
const WM: Gender[] = ['Woman', 'Man'];

export const CHARACTERS: CharacterDef[] = [
  // Looks
  { id: '', label: 'Klasik', group: 'look', genders: ALL },
  { id: 'curly hair', label: 'Kıvırcık', group: 'look', genders: ALL },
  { id: 'blonde hair', label: 'Sarışın', group: 'look', genders: ALL },
  { id: 'red hair', label: 'Kızıl', group: 'look', genders: ALL },
  { id: 'white hair', label: 'Beyaz saç', group: 'look', genders: ALL },
  { id: 'bald', label: 'Kel', group: 'look', genders: ALL },
  { id: 'beard', label: 'Sakallı', group: 'look', genders: ALL },
  { id: 'with headscarf', label: 'Tesettürlü', group: 'look', genders: ['Woman'] },
  { id: 'wearing turban', label: 'Türbanlı', group: 'look', genders: ALL },
  { id: 'with skullcap', label: 'Takkeli', group: 'look', genders: ['Person'] },
  // School & work
  { id: 'student', label: 'Öğrenci', group: 'work', genders: WM },
  { id: 'teacher', label: 'Öğretmen', group: 'work', genders: WM },
  { id: 'technologist', label: 'Yazılımcı', group: 'work', genders: WM },
  { id: 'scientist', label: 'Bilim insanı', group: 'work', genders: WM },
  { id: 'artist', label: 'Sanatçı', group: 'work', genders: WM },
  { id: 'singer', label: 'Şarkıcı', group: 'work', genders: WM },
  { id: 'office worker', label: 'Ofis', group: 'work', genders: WM },
  { id: 'health worker', label: 'Sağlıkçı', group: 'work', genders: WM },
  { id: 'cook', label: 'Aşçı', group: 'work', genders: WM },
  { id: 'judge', label: 'Hukukçu', group: 'work', genders: WM },
  { id: 'pilot', label: 'Pilot', group: 'work', genders: WM },
  { id: 'astronaut', label: 'Astronot', group: 'work', genders: WM },
  { id: 'detective', label: 'Dedektif', group: 'work', genders: WM },
  { id: 'mechanic', label: 'Mühendis', group: 'work', genders: WM },
  { id: 'farmer', label: 'Bahçıvan', group: 'work', genders: WM },
  { id: 'firefighter', label: 'İtfaiyeci', group: 'work', genders: WM },
  // Fantasy
  { id: 'superhero', label: 'Süper kahraman', group: 'fantasy', genders: ALL },
  { id: 'mage', label: 'Büyücü', group: 'fantasy', genders: ALL },
  { id: 'fairy', label: 'Peri', group: 'fantasy', genders: ALL },
  { id: 'elf', label: 'Elf', group: 'fantasy', genders: ALL },
  { id: 'merpeople', label: 'Deniz halkı', group: 'fantasy', genders: ALL },
  { id: 'vampire', label: 'Vampir', group: 'fantasy', genders: ALL },
  { id: 'with crown', label: 'Taçlı', group: 'fantasy', genders: ['Person'] },
];

export const GROUPS: { id: CharacterGroup; label: string; emoji: string }[] = [
  { id: 'look', label: 'Görünüm', emoji: '💇' },
  { id: 'work', label: 'Okul & İş', emoji: '🎓' },
  { id: 'fantasy', label: 'Fantastik', emoji: '✨' },
];

/** Soft gradients behind the portrait. */
export const BACKGROUNDS = [
  'linear-gradient(135deg, #ffd1dc 0%, #ffe9b3 100%)',
  'linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
];

export const BADGES = ['', '😊', '📚', '☕', '💪', '🎧', '✨', '🌸', '🔥', '💤', '🎯', '💻'];

export const DEFAULT_AVATAR: AvatarConfig = {
  character: 'student',
  gender: 'Woman',
  tone: 'Medium-Light',
  background: BACKGROUNDS[1],
  badge: '📚',
};

/** Characters available for a gender (some only exist for one). */
export const charactersFor = (gender: Gender, group: CharacterGroup) =>
  CHARACTERS.filter(c => c.group === group && c.genders.includes(gender));

export const avatarName = (c: AvatarConfig) => (c.character ? `${c.gender} ${c.character}` : c.gender);

export const avatarSrc = (c: AvatarConfig) => {
  const name = avatarName(c);
  const file = `${name.toLowerCase().replace(/ /g, '_')}_3d_${c.tone.toLowerCase()}.png`;
  return `${FLUENT}/${encodeURIComponent(name)}/${c.tone}/3D/${file}`;
};

/** Older saves used a different avatar format; fall back to the default look. */
export const normalizeAvatar = (saved: unknown): AvatarConfig => {
  const s = saved as Partial<AvatarConfig> | undefined;
  if (!s || typeof s.gender !== 'string' || typeof s.character !== 'string') return DEFAULT_AVATAR;
  const exists = CHARACTERS.some(c => c.id === s.character && c.genders.includes(s.gender as Gender));
  return { ...DEFAULT_AVATAR, ...s, character: exists ? s.character : '' } as AvatarConfig;
};

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

export const randomAvatar = (): AvatarConfig => {
  const gender = pick(GENDERS).id;
  return {
    gender,
    character: pick(CHARACTERS.filter(c => c.genders.includes(gender))).id,
    tone: pick(SKIN_TONES.slice(0, 5)).id,
    background: pick(BACKGROUNDS),
    badge: pick(BADGES),
  };
};
