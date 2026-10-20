/** Minimal typings for the (still vendor-prefixed) Web Speech API. */
export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

export const getSpeechRecognition = (): Ctor | null => {
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const FILLERS = ['şey', 'yani', 'hani', 'işte', 'aslında', 'falan', 'filan', 'açıkçası', 'ııı', 'ıı', 'eee', 'ee', 'hmm', 'mesela'];

export interface AnswerAnalysis {
  words: number;
  wpm: number;
  fillers: { word: string; count: number }[];
  fillerTotal: number;
  hasNumbers: boolean;
  hasReflection: boolean;
  score: number;
  tips: string[];
  /** Seconds used for pace; estimated when the answer was typed rather than spoken. */
  seconds: number;
  estimated: boolean;
}

export function analyzeAnswer(text: string, seconds: number): AnswerAnalysis {
  const tokens = text.toLocaleLowerCase('tr-TR').match(/[a-zçğıöşü0-9]+/giu) || [];
  const words = tokens.length;
  // Nobody speaks 220+ words a minute — the answer was typed, so assume a natural pace.
  const estimated = words > 0 && words / (Math.max(seconds, 1) / 60) > 220;
  if (estimated) seconds = Math.round((words / 130) * 60);
  const minutes = Math.max(seconds, 1) / 60;
  const wpm = Math.round(words / minutes);
  const fillers = FILLERS
    .map(word => ({ word, count: tokens.filter(t => t === word).length }))
    .filter(f => f.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillers.reduce((s, f) => s + f.count, 0);
  const fillerRate = words ? (fillerTotal / words) * 100 : 0;
  const hasNumbers = /\d|yüzde|kat\b|bin\b|milyon/iu.test(text);
  const hasReflection = /(öğrendim|sonuç|başardı|kazandı|geliştird|sağladım|artırdım|azalttım)/iu.test(text);

  const tips: string[] = [];
  let score = 100;

  if (seconds < 45) { score -= 20; tips.push('Cevabın biraz kısa kaldı. 1-2 dakika, bir hikâyeyi anlatmak için ideal. ⏱️'); }
  else if (seconds > 180) { score -= 10; tips.push('3 dakikayı geçtin; en güçlü noktalara odaklanıp kısaltmayı dene. ✂️'); }

  if (estimated) { /* pace is unknown for typed answers */ }
  else if (words > 0 && wpm < 95) { score -= 10; tips.push(`Dakikada ${wpm} kelime biraz yavaş. Biraz daha akıcı olabilirsin. 🐢`); }
  else if (wpm > 170) { score -= 10; tips.push(`Dakikada ${wpm} kelime hızlı! Nefes alıp vurgulara zaman tanı. 🐇`); }

  if (fillerRate > 4) { score -= 20; tips.push(`Dolgu kelimeler çok (${fillerTotal} adet). Duraksamak "şey" demekten daha güçlü görünür. 🤫`); }
  else if (fillerRate > 2) { score -= 10; tips.push(`Birkaç dolgu kelime var (${fillerTotal}). Fena değil, ama azaltılabilir.`); }

  if (!hasNumbers) { score -= 15; tips.push('Somut bir rakam ekle (%30 hızlanma, 3 kişilik ekip gibi). Rakamlar akılda kalır. 📈'); }
  if (!hasReflection) { score -= 10; tips.push('Sonucu ve ne öğrendiğini vurgula; STAR\'ın "R"si (Result) çok önemli. 🎯'); }
  if (words < 20) { score -= 15; }

  if (tips.length === 0) tips.push('Harika bir cevap! Net, ölçülü ve somut. Aynen böyle devam. 🌟');

  return { seconds, estimated, words, wpm: words ? wpm : 0, fillers, fillerTotal, hasNumbers, hasReflection, score: Math.max(0, Math.min(100, score)), tips };
}
