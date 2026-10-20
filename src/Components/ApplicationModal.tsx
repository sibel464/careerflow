import React, { useState, useEffect } from 'react';
import { History, CalendarClock, X, Building, MapPin, Calendar, Link as LinkIcon, DollarSign, Briefcase, Star, User, Sparkles, MessageSquare, CheckSquare, Plus, Trash2, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Application, ApplicationStatus, WorkModel, InterviewStage, TodoItem } from '../Interfaces';
import { STATUS_OPTIONS, WORK_MODEL_OPTIONS, INTERVIEW_STAGE_OPTIONS, STATUS_COLORS, STATUS_EMOJI } from '../Utils/constants';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Application | null;
  initialStatus?: ApplicationStatus;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSave, initialData, initialStatus }) => {
  const [activeTab, setActiveTab] = useState<'temel' | 'notlar' | 'gorevler' | 'gecmis'>('temel');
  const [newTodoText, setNewTodoText] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    city: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'Başvuruldu' as ApplicationStatus,
    notes: '',
    salaryExpectation: '',
    jobUrl: '',
    companyIndustry: '',
    platform: '',
    workModel: 'Bilinmiyor' as WorkModel,
    interviewStage: 'Henüz Yok' as InterviewStage,
    companyRating: 0,
    contactPerson: '',
    interviewQuestions: '',
    cvLink: '',
    interviewDate: '',
    todos: [] as TodoItem[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        position: initialData.position || '',
        city: initialData.city || '',
        applicationDate: initialData.applicationDate.split('T')[0],
        status: initialData.status,
        notes: initialData.notes || '',
        salaryExpectation: initialData.salaryExpectation || '',
        jobUrl: initialData.jobUrl || '',
        companyIndustry: initialData.companyIndustry || '',
        platform: initialData.platform || '',
        workModel: initialData.workModel || 'Bilinmiyor',
        interviewStage: initialData.interviewStage || 'Henüz Yok',
        companyRating: initialData.companyRating || 0,
        contactPerson: initialData.contactPerson || '',
        interviewQuestions: initialData.interviewQuestions || '',
        cvLink: initialData.cvLink || '',
        interviewDate: initialData.interviewDate ? format(parseISO(initialData.interviewDate), "yyyy-MM-dd'T'HH:mm") : '',
        todos: initialData.todos || []
      });
    } else {
      setFormData({
        companyName: '',
        position: '',
        city: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: initialStatus || 'Başvuruldu',
        notes: '',
        salaryExpectation: '',
        jobUrl: '',
        companyIndustry: '',
        platform: '',
        workModel: 'Bilinmiyor',
        interviewStage: 'Henüz Yok',
        companyRating: 0,
        contactPerson: '',
        interviewQuestions: '',
        cvLink: '',
        interviewDate: '',
        todos: []
      });
    }
    setActiveTab('temel');
    setNewTodoText('');
  }, [initialData, initialStatus, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Required fields live on the first tab, which may not be mounted — validate by hand.
    if (!formData.companyName.trim() || !formData.position.trim() || !formData.city.trim()) {
      setActiveTab('temel');
      toast.error('Firma adı, pozisyon ve şehir zorunlu. 🌿');
      return;
    }
    onSave({
      ...formData,
      applicationDate: new Date(formData.applicationDate).toISOString(),
      interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : undefined,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;
    const newTodo: TodoItem = {
      id: uuidv4(),
      text: newTodoText.trim(),
      completed: false
    };
    setFormData(prev => ({ ...prev, todos: [...prev.todos, newTodo] }));
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
    }));
  };

  const removeTodo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== id)
    }));
  };

  const statusOptions = STATUS_OPTIONS;
  const workModelOptions = WORK_MODEL_OPTIONS;
  const interviewStageOptions = INTERVIEW_STAGE_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="fixed inset-0 bg-ink/20 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" className="glass-panel w-full max-w-4xl overflow-hidden transform transition-all z-10 flex flex-col max-h-[95vh] animate-slide-up border-glass/80 shadow-[0_20px_60px_rgba(107,76,58,0.15)] bg-glass/70 dark:bg-cream/90">
        
        {/* Header */}
        <div className="px-5 sm:px-8 py-6 border-b border-glass/50 flex justify-between items-center relative bg-glass/40">
          <div>
            <h3 className="text-2xl font-bold text-ink flex items-center font-serif">
              {initialData ? '📝 Başvuruyu İncele' : '✨ Yeni Bir Tohum Ek'}
            </h3>
            <p className="text-sm text-ink-soft mt-1 font-medium">
              {initialData ? 'Gelişmeleri kaydet, mülakatlara hazırlan, görevlerini tamamla! 🚀' : 'Kariyer ağacına yeni bir dal daha. Bol şans! 🍀'}
            </p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Kapat"
            className="text-ink-soft hover:text-clay bg-glass/50 p-2.5 rounded-xl transition-all hover:scale-110 border border-glass/60 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex px-4 sm:px-8 pt-4 space-x-2 overflow-x-auto border-b border-glass/40 bg-glass/20">
          <button 
            type="button"
            onClick={() => setActiveTab('temel')}
            className={`px-4 sm:px-5 py-3 text-sm font-bold rounded-t-xl whitespace-nowrap transition-all flex items-center ${activeTab === 'temel' ? 'bg-glass/60 text-moss border-t border-x border-glass/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-ink-soft hover:bg-glass/30'}`}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Temel Bilgiler
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('notlar')}
            className={`px-4 sm:px-5 py-3 text-sm font-bold rounded-t-xl whitespace-nowrap transition-all flex items-center ${activeTab === 'notlar' ? 'bg-glass/60 text-moss border-t border-x border-glass/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-ink-soft hover:bg-glass/30'}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Mülakat & Notlar
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('gorevler')}
            className={`px-4 sm:px-5 py-3 text-sm font-bold rounded-t-xl whitespace-nowrap transition-all flex items-center ${activeTab === 'gorevler' ? 'bg-glass/60 text-moss border-t border-x border-glass/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-ink-soft hover:bg-glass/30'}`}
          >
            <CheckSquare className="w-4 h-4 mr-2" /> Görevler 
            {formData.todos.length > 0 && (
              <span className="ml-2 bg-clay text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {formData.todos.filter(t => !t.completed).length}
              </span>
            )}
          </button>
          {initialData && (
            <button
              type="button"
              onClick={() => setActiveTab('gecmis')}
              className={`px-4 sm:px-5 py-3 text-sm font-bold rounded-t-xl whitespace-nowrap transition-all flex items-center ${activeTab === 'gecmis' ? 'bg-glass/60 text-moss border-t border-x border-glass/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-ink-soft hover:bg-glass/30'}`}
            >
              <History className="w-4 h-4 mr-2" /> Geçmiş
            </button>
          )}
        </div>
        
        <form id="application-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
          
          {/* TAB 1: Temel Bilgiler */}
          {activeTab === 'temel' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <Building className="w-4 h-4 mr-2 text-moss" /> Firma Adı <span className="text-clay ml-1">*</span>
                  </label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: Spotify 🎵" />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <Briefcase className="w-4 h-4 mr-2 text-moss" /> Pozisyon <span className="text-clay ml-1">*</span>
                  </label>
                  <input type="text" name="position" required value={formData.position} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: Frontend Developer 💻" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <MapPin className="w-4 h-4 mr-2 text-moss" /> Şehir / Lokasyon <span className="text-clay ml-1">*</span>
                  </label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: İstanbul 🌍" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <Calendar className="w-4 h-4 mr-2 text-moss" /> Başvuru Tarihi <span className="text-clay ml-1">*</span>
                  </label>
                  <input type="date" name="applicationDate" required value={formData.applicationDate} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">Çalışma Modeli 🏕️</label>
                  <select name="workModel" value={formData.workModel} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium appearance-none">
                    {workModelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <LinkIcon className="w-4 h-4 mr-2 text-moss" /> İlan Linki & Platform
                  </label>
                  <div className="flex space-x-2">
                    <input type="text" name="platform" value={formData.platform} onChange={handleChange}
                      className="w-1/3 px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="LinkedIn" />
                    <input type="url" name="jobUrl" value={formData.jobUrl} onChange={handleChange}
                      className="w-2/3 px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-ink-soft">Sektör 🏢</label>
                  <input type="text" name="companyIndustry" value={formData.companyIndustry} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: Finans, E-Ticaret" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <DollarSign className="w-4 h-4 mr-2 text-moss" /> Maaş Beklentisi / Teklif
                  </label>
                  <input type="text" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: 40.000 TL 💵" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-ink-soft">Güncel Durum 📈</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold appearance-none bg-glass/70">
                    {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-center">
                  <label className="flex items-center justify-between text-sm font-bold text-ink-soft mb-2">
                    <span>Şirket Puanı (Senin Gözünden) 🌟</span>
                  </label>
                  <div className="flex space-x-2">
                    {[1,2,3,4,5].map(num => (
                      <button type="button" key={num} onClick={() => setFormData(prev => ({...prev, companyRating: num}))}
                        className={`p-1.5 transition-transform hover:scale-125 rounded-lg ${formData.companyRating >= num ? 'text-sun bg-glass/60 shadow-sm' : 'text-sand hover:bg-glass/40'}`}>
                        <Star className="w-7 h-7 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mülakat & Notlar */}
          {activeTab === 'notlar' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    Mülakat Aşaması 🎯
                  </label>
                  <select name="interviewStage" value={formData.interviewStage} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium appearance-none">
                    {interviewStageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-ink-soft">
                    <User className="w-4 h-4 mr-2 text-moss" /> İletişim Kişisi (İK / Yönetici)
                  </label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="Örn: Ayşe Yılmaz" />
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-clay/5 border border-clay/20">
                <label htmlFor="interviewDate" className="flex items-center text-sm font-bold text-ink-soft">
                  <CalendarClock className="w-4 h-4 mr-2 text-clay" /> Mülakat Tarihi & Saati
                </label>
                <div className="flex gap-2">
                  <input id="interviewDate" type="datetime-local" name="interviewDate" value={formData.interviewDate} onChange={handleChange}
                    className="flex-1 px-4 py-3 glass-input rounded-xl text-ink font-medium" />
                  {formData.interviewDate && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, interviewDate: '' }))} className="btn-ghost px-3" aria-label="Tarihi temizle">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-ink-muted">Takvimde görünür, panoda geri sayım başlar ve tek tıkla Google Takvim'e eklenebilir. ⏰</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-bold text-ink-soft">
                  <FileText className="w-4 h-4 mr-2 text-moss" /> Kullanılan CV / Portfolyo Linki
                </label>
                <input type="url" name="cvLink" value={formData.cvLink} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium" placeholder="https://drive.google.com/..." />
                <p className="text-xs text-ink-muted">Bu firma için hangi CV'ni gönderdiğini buraya yapıştırabilirsin.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-ink-soft">Mülakat Soru Havuzu 💬</label>
                <textarea name="interviewQuestions" rows={4} value={formData.interviewQuestions} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium resize-y"
                  placeholder="Bana neler sordular? Teknik mülakatta ne çıktı? Ben onlara ne sordum? 📝"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-ink-soft">Genel Notlar & Düşünceler 💭</label>
                <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-ink font-medium resize-y"
                  placeholder="Görüşme nasıl geçti? Ofis nasıldı? İçinden geçenleri yaz..."
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 3: Görevler */}
          {activeTab === 'gorevler' && (
            <div className="space-y-6 animate-fade-in flex flex-col h-full">
              <div className="bg-glass/40 p-5 rounded-2xl border border-glass/60 shadow-sm flex items-center space-x-3">
                <input 
                  type="text" 
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTodo())}
                  placeholder="Yeni bir görev ekle (örn: İK'ya teşekkür maili at) 📌"
                  className="flex-1 px-4 py-3 glass-input rounded-xl text-ink font-medium"
                />
                <button 
                  type="button"
                  onClick={handleAddTodo}
                  className="bg-moss text-white p-3 rounded-xl hover:bg-moss-light hover:scale-105 transition-transform shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mt-4">
                {formData.todos.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-ink-muted font-medium">Henüz bir görev eklemedin. Süreci takip etmek için harika bir yer!</p>
                  </div>
                ) : (
                  formData.todos.map(todo => (
                    <div key={todo.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${todo.completed ? 'bg-glass/30 border-glass/40 opacity-70' : 'bg-glass/60 border-glass/80 shadow-sm'}`}>
                      <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 transition-colors ${todo.completed ? 'bg-moss border-moss' : 'border-ink-muted bg-white'}`}>
                          {todo.completed && <CheckSquare className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-bold text-sm ${todo.completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                          {todo.text}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        className="p-2 text-ink-muted hover:text-clay hover:bg-glass/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Geçmiş */}
          {activeTab === 'gecmis' && initialData && (
            <div className="animate-fade-in">
              <ol className="relative border-l-2 border-sand ml-3 space-y-6">
                {(initialData.history?.length ? initialData.history : [{ status: initialData.status, date: initialData.applicationDate }])
                  .map((change, i, all) => (
                    <li key={i} className="ml-6">
                      <span
                        className={`absolute -left-[11px] w-5 h-5 rounded-full border-4 border-cream ${i === all.length - 1 ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: STATUS_COLORS[change.status] }}
                      />
                      <p className="font-bold text-ink">{STATUS_EMOJI[change.status]} {change.status}</p>
                      <p className="text-xs font-semibold text-ink-muted">
                        {format(parseISO(change.date), "d MMMM yyyy, HH:mm", { locale: tr })}
                        {i > 0 && ` · ${differenceInCalendarDays(parseISO(change.date), parseISO(all[i - 1].date))} gün sonra`}
                      </p>
                    </li>
                  ))}
              </ol>
              <p className="text-xs font-semibold text-ink-muted mt-8 p-3 rounded-xl bg-glass/40 border border-glass/60">
                🕰️ Durum her değiştiğinde buraya otomatik bir kayıt düşülür. Toplam süreç: {differenceInCalendarDays(new Date(), parseISO(initialData.applicationDate))} gün.
              </p>
            </div>
          )}

        </form>
        
        {/* Footer */}
        <div className="bg-glass/40 px-5 sm:px-8 py-5 border-t border-glass/50 flex justify-between items-center">
          <span className="text-xs text-ink-muted font-bold">
            <span className="hidden sm:inline">Esc ile kapat · </span>{initialData ? `Son güncelleme: ${format(parseISO(initialData.updatedAt), 'd MMM HH:mm', { locale: tr })}` : 'Yeni kayıt'}
          </span>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-ink-soft bg-glass/50 border border-glass/80 hover:bg-glass/70 transition-all active:scale-95 shadow-sm">
              Kapat 🍂
            </button>
            <button type="submit" form="application-form"
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-[#fdfbf7] bg-moss/90 backdrop-blur-md hover:bg-moss border border-moss-light/50 transition-all active:scale-95 shadow-lg shadow-moss/20">
              {initialData ? 'Tümünü Güncelle ✨' : 'Kaydet 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
