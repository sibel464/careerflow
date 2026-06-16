import React, { useState } from 'react';
import { useTheme } from '../Hooks/ThemeContext';
import { useApplications } from '../Hooks/ApplicationContext';
import { Download, Trash2, ShieldAlert } from 'lucide-react';
import { ConfirmModal } from '../Components/ConfirmModal';

export const Settings: React.FC = () => {
  const { applications } = useApplications();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(applications, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `careerflow_yedek_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleReset = () => {
    localStorage.removeItem('careerflow_applications');
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-serif text-[#4a3f35] tracking-tight">Ayarlar ⚙️</h1>
        <p className="text-[#6b4c3a] mt-2">Uygulama tercihlerinizi yönetin ve verilerinizi yedekleyin.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Veri Yönetimi */}
        <div className="glass-panel p-8 bg-white/40">
          <h2 className="text-xl font-bold font-serif text-[#4a3f35] mb-6 flex items-center">
            <span className="p-2 bg-white/60 rounded-xl text-[#c05c3e] mr-3 border border-white/80">
              <ShieldAlert className="w-5 h-5" />
            </span>
            Veri Yönetimi 💾
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white/50 rounded-xl border border-white/60 shadow-sm">
              <div>
                <p className="font-bold text-[#4a3f35]">Yedekle (Dışa Aktar) 📥</p>
                <p className="text-sm text-[#6b4c3a] mt-1">Tüm verilerinizi JSON olarak indirin.</p>
              </div>
              <button
                onClick={handleExport}
                className="px-5 py-2.5 bg-[#2c5e4a]/90 text-[#fdfbf7] font-bold rounded-xl hover:bg-[#2c5e4a] transition-all flex items-center shadow-md active:scale-95 border border-[#3d7a62]/50 backdrop-blur-md"
              >
                <Download className="w-4 h-4 mr-2" /> İndir
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-rose-50/50 rounded-xl border border-rose-200 shadow-sm">
              <div>
                <p className="font-bold text-[#c05c3e]">Tüm Verileri Sıfırla 🚨</p>
                <p className="text-sm text-[#a0482d] mt-1">Bu işlem geri alınamaz.</p>
              </div>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-5 py-2.5 bg-[#c05c3e]/90 text-white font-bold rounded-xl hover:bg-[#c05c3e] transition-all flex items-center shadow-md active:scale-95 border border-[#a0482d]/50 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Sıfırla
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        title="Tüm Verileri Sıfırla"
        message="Bütün başvuru verileriniz kalıcı olarak silinecek. Bu işlemi geri alamazsınız. Emin misiniz?"
        confirmText="Evet, Her Şeyi Sil"
      />
    </div>
  );
};
