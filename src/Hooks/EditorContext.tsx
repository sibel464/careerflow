import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application, ApplicationStatus } from '../Interfaces';
import { useApplications } from './ApplicationContext';
import { ApplicationModal } from '../Components/ApplicationModal';
import { ConfirmModal } from '../Components/ConfirmModal';

interface EditorContextType {
  /** Opens the application editor; pass null for a new application. */
  openEditor: (app: Application | null, initialStatus?: ApplicationStatus) => void;
  requestDelete: (id: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addApplication, updateApplication, deleteApplication, applications } = useApplications();
  const [isOpen, setIsOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openEditor = (app: Application | null, status?: ApplicationStatus) => {
    setEditingApp(app);
    setInitialStatus(status);
    setIsOpen(true);
  };

  const handleSave = (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApp) updateApplication(editingApp.id, data);
    else addApplication(data);
  };

  const deletingApp = applications.find(app => app.id === deletingId);

  return (
    <EditorContext.Provider value={{ openEditor, requestDelete: setDeletingId }}>
      {children}
      <ApplicationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        initialData={editingApp}
        initialStatus={initialStatus}
      />
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteApplication(deletingId)}
        title="Başvuruyu Sil"
        message={`${deletingApp ? `"${deletingApp.companyName}" başvurusunu` : 'Bu başvuruyu'} silmek istediğine emin misin? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
      />
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
