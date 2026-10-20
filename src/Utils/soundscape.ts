/**
 * Real recordings from Wikimedia Commons (public domain / Creative Commons), streamed on demand.
 * One shared engine so music keeps playing while moving between pages.
 */

export interface Track {
  id: string;
  title: string;
  composer: string;
  instrument: string;
  emoji: string;
  performer: string;
  license: string;
  url: string;
  source: string;
}

export interface NatureSound {
  id: string;
  label: string;
  emoji: string;
  credit: string;
  license: string;
  url: string;
  source: string;
}

const UP = 'https://upload.wikimedia.org/wikipedia/commons';
const FILE = 'https://commons.wikimedia.org/wiki/File:';

export const TRACKS: Track[] = [
  { id: 'vivaldi-spring', title: 'Dört Mevsim: Bahar — Largo', composer: 'Vivaldi', instrument: 'Keman', emoji: '🎻', performer: 'John Harrison', license: 'CC BY-SA 4.0',
    url: `${UP}/transcoded/9/9f/Vivaldi_-_Four_Seasons_1_Spring_mvt_2_Largo_-_John_Harrison_violin.oga/Vivaldi_-_Four_Seasons_1_Spring_mvt_2_Largo_-_John_Harrison_violin.oga.mp3`,
    source: `${FILE}Vivaldi_-_Four_Seasons_1_Spring_mvt_2_Largo_-_John_Harrison_violin.oga` },
  { id: 'satie', title: 'Gymnopédie No. 1', composer: 'Satie', instrument: 'Piyano', emoji: '🎹', performer: 'Robin Alciatore', license: 'Kamu malı',
    url: `${UP}/transcoded/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg.mp3`,
    source: `${FILE}Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg` },
  { id: 'bach-air', title: 'G Teli Üzerine Arya', composer: 'Bach', instrument: 'Yaylılar', emoji: '🎻', performer: 'Wikimedia Commons', license: 'Kamu malı',
    url: `${UP}/transcoded/1/1e/Air_%28Bach%29.ogg/Air_%28Bach%29.ogg.mp3`,
    source: `${FILE}Air_(Bach).ogg` },
  { id: 'debussy', title: 'Clair de Lune', composer: 'Debussy', instrument: 'Piyano', emoji: '🎹', performer: 'Wikimedia Commons', license: 'Kamu malı',
    url: `${UP}/transcoded/b/be/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg.mp3`,
    source: `${FILE}Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg` },
  { id: 'vivaldi-winter', title: 'Dört Mevsim: Kış — Largo', composer: 'Vivaldi', instrument: 'Keman', emoji: '🎻', performer: 'John Harrison', license: 'CC BY-SA 4.0',
    url: `${UP}/transcoded/b/b1/11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg/11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg.mp3`,
    source: `${FILE}11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg` },
  { id: 'chopin', title: 'Noktürn Op. 9 No. 2', composer: 'Chopin', instrument: 'Piyano', emoji: '🎹', performer: 'Wikimedia Commons', license: 'Kamu malı',
    url: `${UP}/8/82/Nocturne_in_E_flat_major%2C_Op._9_no._2.mp3`,
    source: `${FILE}Nocturne_in_E_flat_major,_Op._9_no._2.mp3` },
  { id: 'bach-cello', title: 'Çello Süiti No. 5 — Prelüd', composer: 'Bach', instrument: 'Çello', emoji: '🎻', performer: 'Wikimedia Commons', license: 'CC BY-SA 2.0',
    url: `${UP}/transcoded/b/b4/Bach_-_Cello_Suite_No._5_-_1._Prelude.ogg/Bach_-_Cello_Suite_No._5_-_1._Prelude.ogg.mp3`,
    source: `${FILE}Bach_-_Cello_Suite_No._5_-_1._Prelude.ogg` },
  { id: 'beethoven', title: 'Ay Işığı Sonatı — 1. Bölüm', composer: 'Beethoven', instrument: 'Piyano', emoji: '🎹', performer: 'Wikimedia Commons', license: 'CC BY-SA 2.0 DE',
    url: `${UP}/transcoded/e/eb/Beethoven_Moonlight_1st_movement.ogg/Beethoven_Moonlight_1st_movement.ogg.mp3`,
    source: `${FILE}Beethoven_Moonlight_1st_movement.ogg` },
];

export const NATURE: NatureSound[] = [
  { id: 'rain', label: 'Yağmur', emoji: '🌧️', credit: 'valvalion', license: 'CC BY 3.0',
    url: `${UP}/transcoded/4/4f/Falling_Rain_SFX_1_2016-11-19.oga/Falling_Rain_SFX_1_2016-11-19.oga.mp3`, source: `${FILE}Falling_Rain_SFX_1_2016-11-19.oga` },
  { id: 'thunder', label: 'Gök gürültüsü', emoji: '⛈️', credit: 'ezwa', license: 'Kamu malı',
    url: `${UP}/transcoded/b/bb/Rain_and_thunder_%281%29.ogg/Rain_and_thunder_%281%29.ogg.mp3`, source: `${FILE}Rain_and_thunder_(1).ogg` },
  { id: 'waves', label: 'Okyanus', emoji: '🌊', credit: 'Luftrum', license: 'CC BY 3.0',
    url: `${UP}/transcoded/f/f1/Oceanwavescrushing.ogg/Oceanwavescrushing.ogg.mp3`, source: `${FILE}Oceanwavescrushing.ogg` },
  { id: 'birds', label: 'Sabah kuşları', emoji: '🐦', credit: 'Matutinho', license: 'CC BY-SA 4.0',
    url: `${UP}/transcoded/e/e7/Birdsong_morning_01.ogg/Birdsong_morning_01.ogg.mp3`, source: `${FILE}Birdsong_morning_01.ogg` },
  { id: 'wind', label: 'Ormanda rüzgâr', emoji: '🍃', credit: 'Robert EA Harvey', license: 'CC BY-SA 4.0',
    url: `${UP}/a/a3/Bourne_woods_windy_2020-05-05_0757.mp3`, source: `${FILE}Bourne_woods_windy_2020-05-05_0757.mp3` },
  { id: 'forest-rain', label: 'Yağmurda orman', emoji: '🌦️', credit: 'Robert EA Harvey', license: 'CC BY-SA 4.0',
    url: `${UP}/2/24/Bourne_woods_Birdsong_and_rain_2020-06-17_0742.mp3`, source: `${FILE}Bourne_woods_Birdsong_and_rain_2020-06-17_0742.mp3` },
];

export interface SoundState {
  trackIndex: number;
  playing: boolean;
  loading: boolean;
  musicVolume: number;
  shuffle: boolean;
  position: number;
  duration: number;
  nature: Record<string, number>;
  natureLoading: Record<string, boolean>;
  error: string | null;
}

/** Smoothly move an audio element's volume to a target, then optionally stop it. */
const fade = (audio: HTMLAudioElement, to: number, ms = 600, done?: () => void) => {
  const from = audio.volume;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / ms, 1);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
    if (t < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
};

class Soundscape {
  private music: HTMLAudioElement | null = null;
  private natureAudio = new Map<string, HTMLAudioElement>();
  private listeners = new Set<() => void>();
  state: SoundState = {
    trackIndex: 0, playing: false, loading: false, musicVolume: 0.7, shuffle: false,
    position: 0, duration: 0, nature: {}, natureLoading: {}, error: null,
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  getSnapshot = () => this.state;

  private set(changes: Partial<SoundState>) {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach(l => l());
  }

  get track() {
    return TRACKS[this.state.trackIndex];
  }

  get anyPlaying() {
    return this.state.playing || Object.values(this.state.nature).some(v => v > 0);
  }

  private ensureMusic() {
    if (this.music) return this.music;
    const audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('timeupdate', () => this.set({ position: audio.currentTime, duration: audio.duration || 0 }));
    audio.addEventListener('waiting', () => this.set({ loading: true }));
    audio.addEventListener('playing', () => this.set({ loading: false, playing: true, error: null }));
    audio.addEventListener('ended', () => this.next());
    audio.addEventListener('error', () => this.set({ loading: false, playing: false, error: 'Parça yüklenemedi. İnternet bağlantını kontrol et.' }));
    this.music = audio;
    return audio;
  }

  private updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const t = this.track;
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: `${t.composer} · ${t.performer}`, album: 'CareerFlow Odak Müziği' });
    navigator.mediaSession.setActionHandler('play', () => this.toggleMusic());
    navigator.mediaSession.setActionHandler('pause', () => this.toggleMusic());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
  }

  playTrack(index: number) {
    const audio = this.ensureMusic();
    const i = (index + TRACKS.length) % TRACKS.length;
    this.set({ trackIndex: i, loading: true, position: 0, duration: 0, error: null });
    audio.src = TRACKS[i].url;
    audio.volume = 0;
    audio.play()
      .then(() => { fade(audio, this.state.musicVolume, 1200); this.updateMediaSession(); })
      .catch(() => this.set({ loading: false, playing: false }));
  }

  toggleMusic() {
    const audio = this.ensureMusic();
    if (this.state.playing) {
      fade(audio, 0, 400, () => audio.pause());
      this.set({ playing: false });
    } else if (!audio.src) {
      this.playTrack(this.state.trackIndex);
    } else {
      audio.volume = 0;
      audio.play().then(() => fade(audio, this.state.musicVolume, 600)).catch(() => undefined);
      this.set({ playing: true });
    }
  }

  next() {
    const i = this.state.shuffle
      ? (this.state.trackIndex + 1 + Math.floor(Math.random() * (TRACKS.length - 1))) % TRACKS.length
      : this.state.trackIndex + 1;
    this.playTrack(i);
  }

  previous() {
    if (this.music && this.music.currentTime > 5) {
      this.music.currentTime = 0;
      return;
    }
    this.playTrack(this.state.trackIndex - 1);
  }

  seek(fraction: number) {
    if (this.music && this.state.duration) this.music.currentTime = fraction * this.state.duration;
  }

  setMusicVolume(volume: number) {
    if (this.music) this.music.volume = volume;
    this.set({ musicVolume: volume });
  }

  toggleShuffle() {
    this.set({ shuffle: !this.state.shuffle });
  }

  setNature(id: string, volume: number) {
    const sound = NATURE.find(n => n.id === id);
    if (!sound) return;
    let audio = this.natureAudio.get(id);
    if (volume > 0) {
      if (!audio) {
        audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = 0;
        audio.addEventListener('playing', () => this.set({ natureLoading: { ...this.state.natureLoading, [id]: false } }));
        this.natureAudio.set(id, audio);
        this.set({ natureLoading: { ...this.state.natureLoading, [id]: true } });
        audio.play().catch(() => this.set({ error: 'Ses yüklenemedi. İnternet bağlantını kontrol et.' }));
      }
      fade(audio, volume, 900);
    } else if (audio) {
      const stopping = audio;
      this.natureAudio.delete(id);
      fade(stopping, 0, 800, () => { stopping.pause(); stopping.src = ''; });
    }
    this.set({ nature: { ...this.state.nature, [id]: volume } });
  }

  applyScene(scene: { track?: string; nature: Record<string, number> }) {
    NATURE.forEach(n => this.setNature(n.id, scene.nature[n.id] ?? 0));
    if (scene.track) {
      const i = TRACKS.findIndex(t => t.id === scene.track);
      if (i >= 0 && (i !== this.state.trackIndex || !this.state.playing)) this.playTrack(i);
    }
  }

  stopAll() {
    NATURE.forEach(n => this.setNature(n.id, 0));
    if (this.state.playing) this.toggleMusic();
  }
}

export const soundscape = new Soundscape();

export const SCENES: { name: string; emoji: string; description: string; track?: string; nature: Record<string, number> }[] = [
  { name: 'Yağmurlu Kütüphane', emoji: '📚', description: 'Clair de Lune + yağmur', track: 'debussy', nature: { rain: 0.5 } },
  { name: 'Orman Sabahı', emoji: '🌲', description: 'Gymnopédie + kuşlar + rüzgâr', track: 'satie', nature: { birds: 0.45, wind: 0.25 } },
  { name: 'Sahilde Keman', emoji: '🏖️', description: 'Vivaldi Bahar + dalgalar', track: 'vivaldi-spring', nature: { waves: 0.4 } },
  { name: 'Fırtınalı Gece', emoji: '⛈️', description: 'Ay Işığı Sonatı + yağmur + gök gürültüsü', track: 'beethoven', nature: { rain: 0.5, thunder: 0.35 } },
  { name: 'Sadece Doğa', emoji: '🍃', description: 'Yağmurda orman ve kuşlar', nature: { 'forest-rain': 0.6, birds: 0.25 } },
];
