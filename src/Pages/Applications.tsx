import React, { useState } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Briefcase } from 'lucide-react';
import { useApplications } from '../Hooks/ApplicationContext';
import { ApplicationTable } from '../Components/ApplicationTable';
import { ApplicationCard } from '../Components/ApplicationCard';
import { ApplicationModal } from '../Components/ApplicationModal';
import { ConfirmModal } from '../Components/ConfirmModal';
import { Application, ApplicationStatus } from '../Interfaces';

export const Applications: React.FC = () => {
  const { applications, addApplication, updateApplication, deleteApplication } = useApplications();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'Tümü'>('Tümü');
  const [sortBy, setSortBy] = useState<'date' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleAdd = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    addApplication(appData);
  };

  const handleUpdate = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApp) {
      updateApplication(editingApp.id, appData);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteApplication(deletingId);
    }
  };

  // Apply filters and sort
  let filteredApps = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tümü' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filteredApps.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.applicationDate).getTime();
      const dateB = new Date(b.applicationDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const compA = a.companyName.toLowerCase();
      const compB = b.companyName.toLowerCase();
      if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
      if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-[#4a3f35] tracking-tight">Başvurular 🌿</h1>
          <p className="text-[#6b4c3a] mt-2">Kariyer fırsatlarınızı buradan yönetin ve detaylandırın.</p>
        </div>
        <button 
          onClick={() => { setEditingApp(null); setIsModalOpen(true); }}
          className="inline-flex items-center px-5 py-3 text-sm font-bold text-[#fdfbf7] bg-[#2c5e4a]/90 backdrop-blur-md rounded-xl hover:bg-[#2c5e4a] transition-all shadow-lg border border-[#3d7a62]/50 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Ekle
        </button>
      </div>

      <div className="glass-panel p-5 bg-white/40 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#a38b76]" />
          </div>
          <input
            type="text"
            placeholder="Firma veya pozisyon ara... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm text-[#4a3f35] font-medium placeholder:text-[#a38b76]"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-[#a38b76]" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-11 pr-8 py-3 glass-input rounded-xl text-sm font-bold text-[#4a3f35] appearance-none"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Başvuruldu">Başvuruldu</option>
              <option value="Mülakat Bekleniyor">Mülakat Bekleniyor</option>
              <option value="Mülakat Yapıldı">Mülakat Yapıldı</option>
              <option value="Kabul Edildi">Kabul Edildi</option>
              <option value="Reddedildi">Reddedildi</option>
            </select>
          </div>

          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-[#a38b76]" /> : <SortDesc className="w-4 h-4 text-[#a38b76]" />}
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="pl-11 pr-8 py-3 glass-input rounded-xl text-sm font-bold text-[#4a3f35] appearance-none"
            >
              <option value="date-desc">En Yeni Tarih</option>
              <option value="date-asc">En Eski Tarih</option>
              <option value="company-asc">Firma (A-Z)</option>
              <option value="company-desc">Firma (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-16 text-center bg-white/30">
          <div className="w-24 h-24 bg-white/60 border border-white/80 text-[#6b4c3a] mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Briefcase className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-[#4a3f35] mb-3">Hiç Başvuru Bulunamadı 🏜️</h3>
          <p className="text-[#6b4c3a] text-lg max-w-md mx-auto mb-8">Kariyer yolculuğunuzun ilk adımını atın ve başvurularınızı eklemeye başlayın.</p>
          <button 
            onClick={() => { setEditingApp(null); setIsModalOpen(true); }}
            className="inline-flex items-center px-8 py-4 bg-[#2c5e4a] text-white rounded-xl font-bold hover:bg-[#3d7a62] hover:scale-105 transition-all shadow-lg text-lg"
          >
            İlk Başvuruyu Ekle ✨
          </button>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-panel p-12 text-center bg-white/30">
          <p className="text-[#6b4c3a] font-medium text-lg">Arama kriterlerinize uygun başvuru bulunamadı. 🔍</p>
        </div>
      ) : (
        <>
          <ApplicationTable 
            applications={filteredApps} 
            onEdit={(app) => { setEditingApp(app); setIsModalOpen(true); }}
            onDelete={confirmDelete}
          />
          <div className="md:hidden space-y-4">
            {filteredApps.map(app => (
              <ApplicationCard 
                key={app.id} 
                application={app} 
                onEdit={(app) => { setEditingApp(app); setIsModalOpen(true); }}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        </>
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={editingApp ? handleUpdate : handleAdd}
        initialData={editingApp}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Başvuruyu Sil"
        message="Bu başvuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
      />
    </div>
  );
};
