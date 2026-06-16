import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, Save, Edit3, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface InterviewQuestion {
  id: string;
  question: string;
  hint: string;
  answer: string;
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
  }
];

const STORAGE_KEY = 'careerflow_preparation';

export const Preparation: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      const parsed = item ? JSON.parse(item) : [];
      return parsed.length > 0 ? parsed : DEFAULT_QUESTIONS;
    } catch (error) {
      console.error('Error loading prep', error);
      return DEFAULT_QUESTIONS;
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAnswer, setTempAnswer] = useState<string>('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  const startEditing = (q: InterviewQuestion) => {
    setEditingId(q.id);
    setTempAnswer(q.answer);
  };

  const saveAnswer = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, answer: tempAnswer } : q));
    setEditingId(null);
    toast.success('Cevabın başarıyla kaydedildi! 🌟');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 glass-panel p-8 bg-white/30 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold font-serif text-[#4a3f35] tracking-tight flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-[#2c5e4a]" />
            Mülakat Hazırlığı 📚
          </h1>
          <p className="text-[#6b4c3a] mt-2 max-w-2xl font-medium">
            Klasik İK sorularına önceden kendi mükemmel cevaplarını hazırla. Mülakatlardan önce bu sayfaya gelip kendini motive et! Zaten harikasın, sadece bunu onlara da göster. ✨
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="glass-panel p-6 bg-white/40 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2c5e4a] opacity-50"></div>
            <div className="pl-4">
              <h3 className="text-xl font-bold font-serif text-[#4a3f35] mb-2 flex items-start">
                <span className="text-[#2c5e4a] mr-2">Soru {index + 1}:</span> 
                {q.question}
              </h3>
              <div className="flex items-start bg-white/50 p-3 rounded-xl border border-white/60 mb-4 shadow-sm">
                <HelpCircle className="w-5 h-5 text-[#c05c3e] mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-[#6b4c3a]">{q.hint}</p>
              </div>

              {editingId === q.id ? (
                <div className="space-y-3 animate-fade-in">
                  <textarea 
                    autoFocus
                    value={tempAnswer}
                    onChange={(e) => setTempAnswer(e.target.value)}
                    rows={4}
                    placeholder="Buraya kendi mükemmel cevabını yaz... Mülakatta bu metni hatırlayacaksın! 📝"
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium resize-y focus:ring-2 focus:ring-[#2c5e4a]/30"
                  />
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-sm font-bold text-[#6b4c3a] bg-white/50 border border-white/80 rounded-xl hover:bg-white/70 transition-all shadow-sm"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={() => saveAnswer(q.id)}
                      className="px-4 py-2 flex items-center text-sm font-bold text-white bg-[#2c5e4a]/90 backdrop-blur-md rounded-xl border border-[#3d7a62]/50 hover:bg-[#2c5e4a] transition-all shadow-md"
                    >
                      <Save className="w-4 h-4 mr-2" /> Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`p-4 rounded-xl border transition-all cursor-pointer group-hover:shadow-md ${q.answer ? 'bg-white/70 border-white/80' : 'bg-white/30 border-white/40 border-dashed'}`}
                  onClick={() => startEditing(q)}
                >
                  {q.answer ? (
                    <div className="relative">
                      <p className="text-[#4a3f35] font-medium whitespace-pre-wrap pr-8">{q.answer}</p>
                      <CheckCircle2 className="absolute top-0 right-0 w-5 h-5 text-[#2c5e4a] opacity-50" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-[#a38b76]">
                      <Edit3 className="w-6 h-6 mb-2 opacity-50" />
                      <p className="text-sm font-bold">Henüz cevap yazmadın. Eklemek için tıkla! ✨</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
