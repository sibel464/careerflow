import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Calendar, Link as LinkIcon, DollarSign, Briefcase, Star, User, Coffee, Sparkles, MessageSquare, CheckSquare, Plus, Trash2, FileText } from 'lucide-react';
import { Application, ApplicationStatus, WorkModel, InterviewStage, TodoItem } from '../Interfaces';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Application | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState<'temel' | 'notlar' | 'gorevler'>('temel');
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
        todos: initialData.todos || []
      });
    } else {
      setFormData({
        companyName: '',
        position: '',
        city: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Başvuruldu',
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
        todos: []
      });
    }
    setActiveTab('temel');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      applicationDate: new Date(formData.applicationDate).toISOString(),
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
      id: Date.now().toString(),
      text: newTodoText,
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

  const statusOptions: ApplicationStatus[] = [
    'Başvuruldu', 'Mülakat Bekleniyor', 'Mülakat Yapıldı', 'Kabul Edildi', 'Reddedildi'
  ];
  
  const workModelOptions: WorkModel[] = [
    'Bilinmiyor', 'Uzaktan 🏠', 'Hibrit ☕', 'Ofis 🏢'
  ];

  const interviewStageOptions: InterviewStage[] = [
    'Henüz Yok', 'İK Görüşmesi 🗣️', 'Teknik Mülakat 💻', 'Yönetici Görüşmesi 🤝', 'Teklif Aşaması 📜'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="fixed inset-0 bg-[#e8d5bc]/50 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      <div className="glass-panel w-full max-w-4xl overflow-hidden transform transition-all z-10 flex flex-col max-h-[95vh] animate-slide-up border-white/80 shadow-[0_20px_60px_rgba(107,76,58,0.15)] bg-white/70">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/50 flex justify-between items-center relative bg-white/40">
          <div>
            <h3 className="text-2xl font-bold text-[#4a3f35] flex items-center font-serif">
              {initialData ? '📝 Başvuruyu İncele' : '✨ Yeni Bir Tohum Ek'}
            </h3>
            <p className="text-sm text-[#6b4c3a] mt-1 font-medium">
              {initialData ? 'Gelişmeleri kaydet, mülakatlara hazırlan, görevlerini tamamla! 🚀' : 'Kariyer ağacına yeni bir dal daha. Bol şans! 🍀'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6b4c3a] hover:text-[#c05c3e] bg-white/50 p-2.5 rounded-xl transition-all hover:scale-110 border border-white/60 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex px-8 pt-4 space-x-2 border-b border-white/40 bg-white/20">
          <button 
            type="button"
            onClick={() => setActiveTab('temel')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all flex items-center ${activeTab === 'temel' ? 'bg-white/60 text-[#2c5e4a] border-t border-x border-white/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-[#6b4c3a] hover:bg-white/30'}`}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Temel Bilgiler
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('notlar')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all flex items-center ${activeTab === 'notlar' ? 'bg-white/60 text-[#2c5e4a] border-t border-x border-white/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-[#6b4c3a] hover:bg-white/30'}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Mülakat & Notlar
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('gorevler')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all flex items-center ${activeTab === 'gorevler' ? 'bg-white/60 text-[#2c5e4a] border-t border-x border-white/80 shadow-[0_-4px_6px_rgba(0,0,0,0.02)]' : 'text-[#6b4c3a] hover:bg-white/30'}`}
          >
            <CheckSquare className="w-4 h-4 mr-2" /> Görevler 
            {formData.todos.length > 0 && (
              <span className="ml-2 bg-[#c05c3e] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {formData.todos.filter(t => !t.completed).length}
              </span>
            )}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* TAB 1: Temel Bilgiler */}
          {activeTab === 'temel' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <Building className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Firma Adı <span className="text-[#c05c3e] ml-1">*</span>
                  </label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: Spotify 🎵" />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <Briefcase className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Pozisyon <span className="text-[#c05c3e] ml-1">*</span>
                  </label>
                  <input type="text" name="position" required value={formData.position} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: Frontend Developer 💻" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <MapPin className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Şehir / Lokasyon <span className="text-[#c05c3e] ml-1">*</span>
                  </label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: İstanbul 🌍" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <Calendar className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Başvuru Tarihi <span className="text-[#c05c3e] ml-1">*</span>
                  </label>
                  <input type="date" name="applicationDate" required value={formData.applicationDate} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">Çalışma Modeli 🏕️</label>
                  <select name="workModel" value={formData.workModel} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium appearance-none">
                    {workModelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <LinkIcon className="w-4 h-4 mr-2 text-[#2c5e4a]" /> İlan Linki & Platform
                  </label>
                  <div className="flex space-x-2">
                    <input type="text" name="platform" value={formData.platform} onChange={handleChange}
                      className="w-1/3 px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="LinkedIn" />
                    <input type="url" name="jobUrl" value={formData.jobUrl} onChange={handleChange}
                      className="w-2/3 px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#6b4c3a]">Sektör 🏢</label>
                  <input type="text" name="companyIndustry" value={formData.companyIndustry} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: Finans, E-Ticaret" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <DollarSign className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Maaş Beklentisi / Teklif
                  </label>
                  <input type="text" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: 40.000 TL 💵" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#6b4c3a]">Güncel Durum 📈</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-bold appearance-none bg-white/70">
                    {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-center">
                  <label className="flex items-center justify-between text-sm font-bold text-[#6b4c3a] mb-2">
                    <span>Şirket Puanı (Senin Gözünden) 🌟</span>
                  </label>
                  <div className="flex space-x-2">
                    {[1,2,3,4,5].map(num => (
                      <button type="button" key={num} onClick={() => setFormData(prev => ({...prev, companyRating: num}))}
                        className={`p-1.5 transition-transform hover:scale-125 rounded-lg ${formData.companyRating >= num ? 'text-[#e8b923] bg-white/60 shadow-sm' : 'text-[#d4c5b0] hover:bg-white/40'}`}>
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
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    Mülakat Aşaması 🎯
                  </label>
                  <select name="interviewStage" value={formData.interviewStage} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium appearance-none">
                    {interviewStageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                    <User className="w-4 h-4 mr-2 text-[#2c5e4a]" /> İletişim Kişisi (İK / Yönetici)
                  </label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="Örn: Ayşe Yılmaz" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-bold text-[#6b4c3a]">
                  <FileText className="w-4 h-4 mr-2 text-[#2c5e4a]" /> Kullanılan CV / Portfolyo Linki
                </label>
                <input type="url" name="cvLink" value={formData.cvLink} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium" placeholder="https://drive.google.com/..." />
                <p className="text-xs text-[#a38b76]">Bu firma için hangi CV'ni gönderdiğini buraya yapıştırabilirsin.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#6b4c3a]">Mülakat Soru Havuzu 💬</label>
                <textarea name="interviewQuestions" rows={4} value={formData.interviewQuestions} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium resize-y"
                  placeholder="Bana neler sordular? Teknik mülakatta ne çıktı? Ben onlara ne sordum? 📝"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#6b4c3a]">Genel Notlar & Düşünceler 💭</label>
                <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange}
                  className="w-full px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium resize-y"
                  placeholder="Görüşme nasıl geçti? Ofis nasıldı? İçinden geçenleri yaz..."
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 3: Görevler */}
          {activeTab === 'gorevler' && (
            <div className="space-y-6 animate-fade-in flex flex-col h-full">
              <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm flex items-center space-x-3">
                <input 
                  type="text" 
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTodo())}
                  placeholder="Yeni bir görev ekle (örn: İK'ya teşekkür maili at) 📌"
                  className="flex-1 px-4 py-3 glass-input rounded-xl text-[#4a3f35] font-medium"
                />
                <button 
                  type="button"
                  onClick={handleAddTodo}
                  className="bg-[#2c5e4a] text-white p-3 rounded-xl hover:bg-[#3d7a62] hover:scale-105 transition-transform shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mt-4">
                {formData.todos.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-[#a38b76] font-medium">Henüz bir görev eklemedin. Süreci takip etmek için harika bir yer!</p>
                  </div>
                ) : (
                  formData.todos.map(todo => (
                    <div key={todo.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${todo.completed ? 'bg-white/30 border-white/40 opacity-70' : 'bg-white/60 border-white/80 shadow-sm'}`}>
                      <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 transition-colors ${todo.completed ? 'bg-[#2c5e4a] border-[#2c5e4a]' : 'border-[#a38b76] bg-white'}`}>
                          {todo.completed && <CheckSquare className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-bold text-sm ${todo.completed ? 'text-[#a38b76] line-through' : 'text-[#4a3f35]'}`}>
                          {todo.text}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        className="p-2 text-[#a38b76] hover:text-[#c05c3e] hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </form>
        
        {/* Footer */}
        <div className="bg-white/40 px-8 py-5 border-t border-white/50 flex justify-between items-center">
          <span className="text-xs text-[#a38b76] font-bold">
            Sekme: {activeTab === 'temel' ? '1/3' : activeTab === 'notlar' ? '2/3' : '3/3'}
          </span>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#6b4c3a] bg-white/50 border border-white/80 hover:bg-white/70 transition-all active:scale-95 shadow-sm">
              Kapat 🍂
            </button>
            <button type="button" onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-[#fdfbf7] bg-[#2c5e4a]/90 backdrop-blur-md hover:bg-[#2c5e4a] border border-[#3d7a62]/50 transition-all active:scale-95 shadow-lg shadow-[#2c5e4a]/20">
              {initialData ? 'Tümünü Güncelle ✨' : 'Kaydet 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
