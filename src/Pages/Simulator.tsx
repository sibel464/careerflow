import React, { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Mic, Square, Video, VideoOff, Shuffle, RotateCcw, Save, Sparkles, MicOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage, readStored } from '../Hooks/useLocalStorage';
import { getSpeechRecognition, analyzeAnswer, SpeechRecognitionLike, AnswerAnalysis } from '../Utils/speech';
import { cn } from '../Utils/classNames';

export const SIMULATOR_KEY = 'careerflow_simulator';

export interface PracticeSession {
  id: string;
  date: string;
  question: string;
  seconds: number;
  words: number;
  wpm: number;
  fillers: number;
  score: number;
}

const BANK: Record<string, string[]> = {
  'Genel 🌿': [
    'Bize kısaca kendinden bahseder misin?',
    'Neden bu pozisyona başvurdun?',
    'Bizim şirketimizi neden seçtin?',
    '5 yıl sonra kendini nerede görüyorsun?',
  ],
  'Davranışsal 🧭': [
    'Bir ekip arkadaşınla anlaşmazlık yaşadığın bir durumu anlat.',
    'Baskı altında çalıştığın bir projeyi anlat. Nasıl yönettin?',
    'Bir hata yaptığın ve ondan ders çıkardığın bir anı paylaş.',
    'Liderlik gösterdiğin bir örnek verebilir misin?',
  ],
  'Motivasyon 🔥': [
    'Seni işte en çok ne motive eder?',
    'En gurur duyduğun başarın nedir?',
    'İdeal çalışma ortamını nasıl tarif edersin?',
  ],
  'Teknik Sohbet 💻': [
    'Son zamanlarda öğrendiğin yeni bir teknolojiyi anlat.',
    'Zorlu bir hatayı nasıl ayıkladığını adım adım anlat.',
    'Kodun kalitesini nasıl güvence altına alırsın?',
  ],
};

type Phase = 'idle' | 'countdown' | 'recording' | 'review';

export const Simulator: React.FC = () => {
  const ownQuestions = readStored<{ question: string }[]>('careerflow_preparation', []).map(q => q.question);
  const bank = ownQuestions.length ? { ...BANK, 'Benim Sorularım 📚': ownQuestions } : BANK;
  const categories = Object.keys(bank);

  const [category, setCategory] = useState(categories[0]);
  const [question, setQuestion] = useState(bank[categories[0]][0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [camera, setCamera] = useState(false);
  const [history, setHistory] = useLocalStorage<PracticeSession[]>(SIMULATOR_KEY, []);

  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechSupported = !!getSpeechRecognition();

  const pickRandom = (cat = category) => {
    const pool = bank[cat].filter(q => q !== question);
    setQuestion(pool[Math.floor(Math.random() * pool.length)] ?? bank[cat][0]);
    setPhase('idle');
    setAnalysis(null);
    setTranscript('');
  };

  // 3-2-1 countdown, then start recording.
  useEffect(() => {
    if (phase !== 'countdown') return;
    const id = window.setTimeout(() => {
      if (countdown === 0) setPhase('recording');
      else setCountdown(c => c - 1);
    }, countdown === 0 ? 300 : 800);
    return () => window.clearTimeout(id);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const id = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Camera mirror for a realistic rehearsal.
  useEffect(() => {
    if (!camera) return;
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error('Kameraya erişilemedi. Tarayıcı izinlerini kontrol et. 📷');
        setCamera(false);
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [camera]);

  // Live speech-to-text while recording; stops on finish or when leaving the page.
  useEffect(() => {
    if (phase !== 'recording') return;
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;
    const rec = new Recognition();
    rec.lang = 'tr-TR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + ' ';
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript(t => (t + ' ' + finalText).trim());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') toast.error('Mikrofon izni verilmedi. Cevabını yazarak da verebilirsin. 🎙️');
    };
    // Chrome stops after a pause — restart while we're still recording.
    rec.onend = () => {
      if (recognition.current === rec) {
        try { rec.start(); } catch { /* already running */ }
      }
    };
    recognition.current = rec;
    try { rec.start(); } catch { /* ignore */ }
    return () => {
      recognition.current = null;
      rec.stop();
    };
  }, [phase]);

  const begin = () => {
    setTranscript('');
    setInterim('');
    setSeconds(0);
    setAnalysis(null);
    setCountdown(3);
    setPhase('countdown');
  };

  const finish = () => {
    const text = (transcript + ' ' + interim).trim();
    setTranscript(text);
    setInterim('');
    setAnalysis(analyzeAnswer(text, seconds));
    setPhase('review');
  };

  const reanalyze = () => setAnalysis(analyzeAnswer(transcript, seconds));

  const save = () => {
    if (!analysis) return;
    setHistory(prev => [{
      id: uuidv4(), date: new Date().toISOString(), question, seconds: analysis.seconds,
      words: analysis.words, wpm: analysis.wpm, fillers: analysis.fillerTotal, score: analysis.score,
    }, ...prev].slice(0, 50));
    toast.success('Prova kaydedildi! Bir sonraki daha da iyi olacak. 🎤');
    pickRandom();
  };

  const best = history.reduce((m, s) => Math.max(m, s.score), 0);
  const average = history.length ? Math.round(history.reduce((s, x) => s + x.score, 0) / history.length) : 0;
  const scoreTone = (s: number) => (s >= 80 ? 'text-moss' : s >= 60 ? 'text-sun' : 'text-clay');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Mülakat Simülatörü 🎙️</h1>
          <p className="text-ink-soft mt-2">Soruyu sesli cevapla, konuşman yazıya dökülsün, anında geri bildirim al.</p>
        </div>
        <div className="flex gap-3 text-center">
          {[['Prova', history.length], ['Ortalama', average], ['En iyi', best]].map(([label, value]) => (
            <div key={label} className="glass-panel px-4 py-2.5 rounded-2xl">
              <p className="text-xl font-black text-ink">{value}</p>
              <p className="text-[10px] font-bold uppercase text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); pickRandom(c); }}
            disabled={phase === 'recording' || phase === 'countdown'}
            className={cn('px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all disabled:opacity-50',
              category === c ? 'bg-moss text-white border-moss shadow-md' : 'bg-glass/40 text-ink-soft border-glass/60 hover:bg-glass/70')}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Stage */}
        <div className="xl:col-span-3 glass-panel p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-clay mb-2">Soru</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-ink leading-snug">"{question}"</h2>
            </div>
            <button onClick={() => pickRandom()} disabled={phase === 'recording'} className="btn-ghost p-2.5 shrink-0 disabled:opacity-40" title="Başka soru" aria-label="Başka soru">
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-ink/5 border border-glass/60 aspect-video flex items-center justify-center">
            {camera ? (
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
            ) : (
              <div className="text-center text-ink-muted">
                <span className="text-6xl block mb-2">{phase === 'recording' ? '🎙️' : '🪑'}</span>
                <p className="text-sm font-bold">{phase === 'recording' ? 'Dinliyorum…' : 'Kamerayı açarak kendini gerçek bir mülakattaymış gibi görebilirsin'}</p>
              </div>
            )}

            {phase === 'countdown' && (
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center">
                <span key={countdown} className="text-8xl font-black text-white animate-pop">{countdown || '🎬'}</span>
              </div>
            )}
            {phase === 'recording' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> KAYIT · {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </div>
            )}
            {phase === 'recording' && (transcript || interim) && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <p className="text-white text-sm font-semibold line-clamp-3">{transcript} <span className="opacity-60">{interim}</span></p>
              </div>
            )}
            <button
              onClick={() => setCamera(c => !c)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
              aria-label={camera ? 'Kamerayı kapat' : 'Kamerayı aç'}
            >
              {camera ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {(phase === 'idle' || phase === 'review') && (
              <button onClick={begin} className="btn-primary px-8 py-4 text-base rounded-2xl">
                <Mic className="w-5 h-5 mr-2" /> {phase === 'review' ? 'Tekrar Dene' : 'Cevaplamaya Başla'}
              </button>
            )}
            {phase === 'recording' && (
              <button onClick={finish} className="px-8 py-4 rounded-2xl bg-clay text-white font-bold flex items-center shadow-lg hover:scale-105 transition-transform">
                <Square className="w-5 h-5 mr-2 fill-current" /> Bitir ve Analiz Et
              </button>
            )}
          </div>
          {!speechSupported && (
            <p className="flex items-center justify-center gap-2 text-xs font-bold text-ink-muted mt-4">
              <MicOff className="w-4 h-4" /> Tarayıcın konuşma tanımayı desteklemiyor; cevabını aşağıya yazarak analiz ettirebilirsin (Chrome/Edge önerilir).
            </p>
          )}
        </div>

        {/* Analysis */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold font-serif text-ink mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-sun" /> Analiz</h3>
            {phase === 'review' && analysis ? (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-sand/50" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                        className={cn('transition-all duration-1000', analysis.score >= 80 ? 'stroke-moss' : analysis.score >= 60 ? 'stroke-sun' : 'stroke-clay')}
                        strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - analysis.score / 100)} />
                    </svg>
                    <span className={cn('absolute inset-0 flex items-center justify-center text-3xl font-black', scoreTone(analysis.score))}>{analysis.score}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm">
                    <span className="text-ink-muted font-bold">Süre</span><span className="font-black text-ink">{analysis.estimated ? '~' : ''}{analysis.seconds} sn</span>
                    <span className="text-ink-muted font-bold">Kelime</span><span className="font-black text-ink">{analysis.words}</span>
                    <span className="text-ink-muted font-bold">Hız</span><span className="font-black text-ink">{analysis.estimated ? '—' : `${analysis.wpm} k/dk`}</span>
                    <span className="text-ink-muted font-bold">Dolgu</span><span className="font-black text-ink">{analysis.fillerTotal}</span>
                  </div>
                </div>
                {analysis.fillers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.fillers.map(f => (
                      <span key={f.word} className="text-xs font-bold px-2 py-1 rounded-lg bg-clay/10 text-clay">"{f.word}" ×{f.count}</span>
                    ))}
                  </div>
                )}
                <ul className="space-y-2">
                  {analysis.tips.map(t => <li key={t} className="text-sm font-semibold text-ink-soft p-3 rounded-xl bg-glass/50 border border-glass/70">{t}</li>)}
                </ul>
              </div>
            ) : (
              <p className="text-sm font-medium text-ink-muted">
                Cevabını bitirdiğinde süre, konuşma hızı, dolgu kelimeler ("şey", "yani", "hani"…), somut rakam kullanımı ve STAR yapısına göre 100 üzerinden puan alacaksın. 🎯
              </p>
            )}
          </div>

          {phase === 'review' && (
            <div className="glass-panel p-6 animate-fade-in">
              <label htmlFor="transcript" className="text-sm font-bold text-ink-soft">Döküm <span className="text-ink-muted font-semibold">(düzeltebilir ya da yazabilirsin)</span></label>
              <textarea id="transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={6}
                className="w-full mt-2 px-4 py-3 glass-input rounded-xl text-ink font-medium resize-y" placeholder="Cevabın burada görünecek…" />
              <div className="flex gap-2 mt-3">
                <button onClick={reanalyze} className="btn-ghost flex-1 px-3 py-2.5 text-sm"><RotateCcw className="w-4 h-4 mr-1.5" /> Yeniden analiz</button>
                <button onClick={save} className="btn-primary flex-1 px-3 py-2.5 text-sm"><Save className="w-4 h-4 mr-1.5" /> Kaydet</button>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold font-serif text-ink mb-4">Son Provalar</h3>
              <div className="flex items-end gap-1.5 h-16 mb-4" aria-label="Puan geçmişi">
                {[...history].slice(0, 14).reverse().map(s => (
                  <span key={s.id} title={`${s.score} puan`} className={cn('flex-1 rounded-t-md', s.score >= 80 ? 'bg-moss' : s.score >= 60 ? 'bg-sun' : 'bg-clay')} style={{ height: `${Math.max(s.score, 6)}%` }} />
                ))}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.slice(0, 8).map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-glass/50 border border-glass/70">
                    <span className={cn('text-lg font-black w-10 text-center', scoreTone(s.score))}>{s.score}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-ink truncate">{s.question}</span>
                      <span className="block text-[10px] font-semibold text-ink-muted">{format(parseISO(s.date), 'd MMM HH:mm', { locale: tr })} · {s.seconds} sn · {s.wpm} k/dk</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
