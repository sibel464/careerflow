/**
 * Procedural ambient soundscapes built with the Web Audio API — no audio files.
 * A single shared engine keeps sounds playing while the user moves between pages.
 */
export type SoundId = 'rain' | 'cafe' | 'fire' | 'forest' | 'waves';

export const SOUNDS: { id: SoundId; label: string; emoji: string }[] = [
  { id: 'rain', label: 'Yağmur', emoji: '🌧️' },
  { id: 'cafe', label: 'Kafe', emoji: '☕' },
  { id: 'fire', label: 'Şömine', emoji: '🔥' },
  { id: 'forest', label: 'Rüzgâr', emoji: '🍃' },
  { id: 'waves', label: 'Dalgalar', emoji: '🌊' },
];

type NoiseColor = 'white' | 'pink' | 'brown';

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private channels = new Map<SoundId, { gain: GainNode; stop: () => void }>();
  private listeners = new Set<() => void>();
  volumes: Record<SoundId, number> = { rain: 0, cafe: 0, fire: 0, forest: 0, waves: 0 };

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit() {
    this.listeners.forEach(l => l());
  }

  get playing() {
    return Object.values(this.volumes).some(v => v > 0);
  }

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private noise(color: NoiseColor) {
    const ctx = this.ctx!;
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'white') data[i] = white;
      else if (color === 'brown') {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        b0 = 0.997 * b0 + white * 0.029591;
        b1 = 0.985 * b1 + white * 0.032534;
        b2 = 0.95 * b2 + white * 0.048056;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.8;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  private lfo(target: AudioParam, rate: number, depth: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const amount = ctx.createGain();
    osc.frequency.value = rate;
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
    return osc;
  }

  private build(id: SoundId, out: GainNode) {
    const ctx = this.ctx!;
    const stops: (() => void)[] = [];
    const filter = (type: BiquadFilterType, freq: number, q = 0.7) => {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      return f;
    };

    if (id === 'rain') {
      const src = this.noise('pink');
      src.connect(filter('highpass', 400)).connect(filter('lowpass', 7000)).connect(out);
      src.start();
      stops.push(() => src.stop());
    }
    if (id === 'cafe') {
      const src = this.noise('brown');
      const band = filter('bandpass', 500, 0.5);
      const murmur = ctx.createGain();
      murmur.gain.value = 0.9;
      const l = this.lfo(murmur.gain, 0.3, 0.25);
      src.connect(band).connect(murmur).connect(out);
      src.start();
      // Occasional cup clinks.
      const clink = window.setInterval(() => {
        if (Math.random() > 0.35) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 1800 + Math.random() * 1400;
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(g).connect(out);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, 1500);
      stops.push(() => { src.stop(); l.stop(); window.clearInterval(clink); });
    }
    if (id === 'fire') {
      const src = this.noise('brown');
      src.connect(filter('lowpass', 900)).connect(out);
      src.start();
      // Crackles: tiny bursts of filtered white noise.
      const crackle = window.setInterval(() => {
        const pops = Math.floor(Math.random() * 3);
        for (let i = 0; i < pops; i++) {
          const pop = this.noise('white');
          const g = ctx.createGain();
          const t = ctx.currentTime + Math.random() * 0.25;
          g.gain.setValueAtTime(0.5 + Math.random() * 0.6, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
          pop.connect(filter('highpass', 1500)).connect(g).connect(out);
          pop.start(t);
          pop.stop(t + 0.1);
        }
      }, 180);
      stops.push(() => { src.stop(); window.clearInterval(crackle); });
    }
    if (id === 'forest') {
      const src = this.noise('pink');
      const band = filter('bandpass', 700, 0.9);
      const l = this.lfo(band.frequency, 0.08, 450);
      src.connect(band).connect(out);
      src.start();
      stops.push(() => { src.stop(); l.stop(); });
    }
    if (id === 'waves') {
      const src = this.noise('brown');
      const swell = ctx.createGain();
      swell.gain.value = 0.55;
      const l = this.lfo(swell.gain, 0.09, 0.5);
      src.connect(filter('lowpass', 1200)).connect(swell).connect(out);
      src.start();
      stops.push(() => { src.stop(); l.stop(); });
    }
    return () => stops.forEach(s => { try { s(); } catch { /* already stopped */ } });
  }

  setVolume(id: SoundId, volume: number) {
    this.volumes = { ...this.volumes, [id]: volume };
    if (volume > 0) {
      const ctx = this.ensureContext();
      let channel = this.channels.get(id);
      if (!channel) {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.connect(this.master!);
        channel = { gain, stop: this.build(id, gain) };
        this.channels.set(id, channel);
      }
      channel.gain.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.3);
    } else {
      const channel = this.channels.get(id);
      if (channel && this.ctx) {
        channel.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        const stop = channel.stop;
        this.channels.delete(id);
        window.setTimeout(stop, 800);
      }
    }
    this.emit();
  }

  stopAll() {
    (Object.keys(this.volumes) as SoundId[]).forEach(id => this.setVolume(id, 0));
  }
}

export const ambient = new AmbientEngine();
