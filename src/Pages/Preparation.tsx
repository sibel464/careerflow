import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, Save, Edit3, CheckCircle2, Plus, Trash2, Eye, EyeOff, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../Utils/classNames';

interface InterviewQuestion {
  id: string;
  question: string;
  hint: string;
  answer: string;
  custom?: boolean;
}

const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'Bize kısaca kendinden bahseder misin?',
    hint: 'Çok eskiye gitmeden, kariyerindeki kırılma noktalarını ve mevcut yeteneklerini özetle.',
    answer: ''
  },
  {
    id: 'q2',
    question: 'Neden bizim şirketimizde çalışmak istiyorsun?',
    hint: 'Şirketin ürünlerini, kültürünü veya vizyonunu kendi kariyer hedeflerinle bağdaştır.',
    answer: ''
  },
  {
    id: 'q3',
    question: 'Kariyerinde en çok zorlandığın an neydi ve nasıl üstesinden geldin?',
    hint: 'Bir kriz anını seç. Ne yaptığını ve oradan ne öğrendiğini anlat. (Problem Çözme)',
    answer: ''
  },
  {
    id: 'q4',
    question: '5 yıl sonra kendini nerede görüyorsun?',
    hint: 'Daha çok sorumluluk alan, ekibe değer katan ve bu sektörde uzmanlaşmış bir profil çiz.',
    answer: ''
  },
  {
    id: 'q5',
    question: 'En güçlü ve en zayıf yönlerin neler?',
    hint: 'Güçlü yönünü örneklendir. Zayıf yönünü ise "nasıl düzelttiğini" göstererek anlat.',
    answer: ''
  },
  {
    id: 'q6',
    question: 'Bir ekip arkadaşınla anlaşmazlık yaşadığın bir durumu anlatır mısın?',
    hint: 'Suçlamadan anlat; empati kurduğun ve ortak bir çözüme vardığın anı öne çıkar.',
    answer: ''
  },
  {
    id: 'q7',
    question: 'Maaş beklentin nedir?',
    hint: 'Piyasa araştırmana dayanan bir aralık ver ve toplam paketi (yan haklar, gelişim) konuşmaya açık ol.',
    answer: ''
  },
  {
    id: 'q8',
    question: 'Bize sormak istediğin bir şey var mı?',
    hint: 'Her zaman "evet" de! Ekibin çalışma şekli, başarı ölçütleri veya ilk 90 gün hakkında sor.',
    answer: ''
  }
];

const STORAGE_KEY = 'careerflow_preparation';

export const Preparation: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      const parsed: InterviewQuestion[] = item ? JSON.parse(item) : [];
      if (parsed.length === 0) return DEFAULT_QUESTIONS;
      // Pick up default questions added in later versions without losing saved answers.
      const missing = DEFAULT_QUESTIONS.filter(d => !parsed.some(q => q.id === d.id));
      return [...parsed, ...missing];
    } catch (error) {
      console.error('Error loading prep', error);
      return DEFAULT_QUESTIONS;
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAnswer, setTempAnswer] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  const answered = questions.filter(q => q.answer.trim()).length;
  const progress = Math.round((answered / Math.max(questions.length, 1)) * 100);

  const startEditing = (q: InterviewQuestion) => {
    setEditingId(q.id);
    setTempAnswer(q.answer);
  };

  const saveAnswer = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, answer: tempAnswer } : q));
    setEditingId(null);
    toast.success('Cevabın başarıyla kaydedildi! 🌟');
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions(prev => [...prev, {
      id: uuidv4(),
      question: newQuestion.trim(),
      hint: 'Kendi sorun! STAR tekniğiyle somut bir örnek vermeyi dene.',
      answer: '',
      custom: true,
    }]);
    setNewQuestion('');
    toast.success('Soru eklendi. 📝');
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast.info('Soru silindi.');
  };

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-moss" />
              Mülakat Hazırlığı 📚
            </h1>
            <p className="text-ink-soft mt-2 max-w-2xl font-medium">
              Klasik İK sorularına önceden kendi cevaplarını hazırla. Mülakattan önce buraya gelip kendini motive et! Zaten harikasın, sadece bunu onlara da göster. ✨
            </p>
          </div>
          <button
            onClick={() => { setPracticeMode(p => !p); setRevealed(new Set()); setEditingId(null); }}
            className={cn('px-5 py-3 text-sm shrink-0', practiceMode ? 'btn-primary' : 'btn-ghost')}
          >
            {practiceMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {practiceMode ? 'Pratik modundan çık' : 'Pratik modu'}
          </button>
        </div>

        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-ink-soft">{answered} / {questions.length} soru hazır</span>
            <span className="text-moss">%{progress}</span>
          </div>
          <div className="h-3 rounded-full bg-sand/50 overflow-hidden">
            <div className="h-full bg-moss rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 glass-panel p-5">
        <Lightbulb className="w-6 h-6 text-sun shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-ink-soft">
          <span className="font-black text-ink">STAR tekniği:</span> Davranışsal sorularda <b>Durum</b> (Situation), <b>Görev</b> (Task), <b>Eylem</b> (Action) ve <b>Sonuç</b> (Result) sırasıyla anlat. Sonucu mümkünse rakamla destekle! 📈
          {practiceMode && <span className="block mt-1 text-moss font-bold">Pratik modundasın: önce cevabı sesli söyle, sonra kontrol etmek için karta tıkla. 🎤</span>}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const hidden = practiceMode && !revealed.has(q.id);
          return (
            <div key={q.id} className="glass-panel p-6 group relative overflow-hidden">
              <div className={cn('absolute top-0 left-0 w-1.5 h-full', q.answer ? 'bg-moss' : 'bg-sand')}></div>
              <div className="pl-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold font-serif text-ink">
                    <span className="text-moss mr-2">Soru {index + 1}:</span>
                    {q.question}
                  </h3>
                  {q.custom && (
                    <button onClick={() => removeQuestion(q.id)} aria-label="Soruyu sil" className="p-2 text-ink-muted hover:text-clay hover:bg-glass/50 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!practiceMode && (
                  <div className="flex items-start bg-glass/50 p-3 rounded-xl border border-glass/60 mb-4 shadow-sm">
                    <HelpCircle className="w-5 h-5 text-clay mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-ink-soft">{q.hint}</p>
                  </div>
                )}

                {editingId === q.id ? (
                  <div className="space-y-3 animate-fade-in">
                    <textarea
                      autoFocus
                      value={tempAnswer}
                      onChange={(e) => setTempAnswer(e.target.value)}
                      onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && saveAnswer(q.id)}
                      rows={5}
                      placeholder="Buraya kendi cevabını yaz... Mülakatta bu metni hatırlayacaksın! 📝"
                      className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium resize-y focus:ring-2 focus:ring-moss/30"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-ink-muted">{tempAnswer.trim().split(/\s+/).filter(Boolean).length} kelime · Ctrl+Enter ile kaydet</span>
                      <div className="flex gap-3">
                        <button onClick={() => setEditingId(null)} className="btn-ghost px-4 py-2 text-sm">
                          İptal
                        </button>
                        <button onClick={() => saveAnswer(q.id)} className="btn-primary px-4 py-2 text-sm shadow-md">
                          <Save className="w-4 h-4 mr-2" /> Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all group-hover:shadow-md',
                      q.answer ? 'bg-glass/70 border-glass/80' : 'bg-glass/30 border-glass/40 border-dashed'
                    )}
                    onClick={() => (practiceMode ? toggleReveal(q.id) : startEditing(q))}
                  >
                    {hidden ? (
                      <div className="flex flex-col items-center justify-center py-4 text-ink-muted">
                        <Eye className="w-6 h-6 mb-2 opacity-60" />
                        <p className="text-sm font-bold">Cevabını kafanda kur, sonra görmek için tıkla 🤫</p>
                      </div>
                    ) : q.answer ? (
                      <div className="relative">
                        <p className="text-ink font-medium whitespace-pre-wrap pr-8">{q.answer}</p>
                        <CheckCircle2 className="absolute top-0 right-0 w-5 h-5 text-moss opacity-60" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-ink-muted">
                        <Edit3 className="w-6 h-6 mb-2 opacity-50" />
                        <p className="text-sm font-bold">{practiceMode ? 'Bu soruya henüz cevap yazmadın.' : 'Henüz cevap yazmadın. Eklemek için tıkla! ✨'}</p>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={addQuestion} className="glass-panel p-5 flex flex-col sm:flex-row gap-3">
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Kendi sorunu ekle (örn: Neden bu pozisyon? 🤔)"
          className="flex-1 px-4 py-3 glass-input rounded-xl text-ink font-medium placeholder:text-ink-muted"
        />
        <button type="submit" disabled={!newQuestion.trim()} className="btn-primary px-5 py-3 text-sm disabled:opacity-50 disabled:pointer-events-none">
          <Plus className="w-4 h-4 mr-2" /> Soru Ekle
        </button>
      </form>
    </div>
  );
};
