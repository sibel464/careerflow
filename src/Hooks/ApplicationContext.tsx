import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Application, DashboardStats } from '../Interfaces';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

interface ApplicationContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  getStats: () => DashboardStats;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

const STORAGE_KEY = 'careerflow_applications';

const MOCK_DATA: Application[] = [
  {
    id: uuidv4(),
    companyName: 'Spotify',
    position: 'Frontend Developer',
    city: 'Uzaktan',
    applicationDate: new Date().toISOString(),
    status: 'Mülakat Bekleniyor',
    notes: 'Kültür uyumu çok iyi gözüküyor. Ekipler arası iletişim önemli.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    salaryExpectation: '50.000 TL',
    jobUrl: 'https://spotify.jobs',
    companyIndustry: 'Müzik & Teknoloji',
    platform: 'LinkedIn',
    workModel: 'Uzaktan 🏠',
    interviewStage: 'İK Görüşmesi 🗣️',
    companyRating: 5,
    contactPerson: 'Ceren Yılmaz',
    interviewQuestions: '- React hooklarının çalışma prensibi\n- Daha önce karşılaştığın en zor bug neydi?\n- Spotify kültürüne nasıl uyum sağlarsın?',
    cvLink: 'https://drive.google.com/cv-frontend-v2',
    todos: [
      { id: 't1', text: 'Mülakat öncesi Spotify Engineering blogunu oku', completed: false },
      { id: 't2', text: 'TypeScript portfolio projesini GitHub\'a pushla', completed: true },
      { id: 't3', text: 'İK\'ya teşekkür maili taslağı hazırla', completed: false }
    ]
  },
  {
    id: uuidv4(),
    companyName: 'Trendyol',
    position: 'React Native Developer',
    city: 'İstanbul',
    applicationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'Mülakat Yapıldı',
    notes: 'Teknik mülakat çok zordu ama genel olarak iyi geçti. Canlı kodlama (live coding) yaptık.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    salaryExpectation: '65.000 TL',
    jobUrl: 'https://trendyol.jobs',
    companyIndustry: 'E-Ticaret',
    platform: 'Kariyer.net',
    workModel: 'Hibrit ☕',
    interviewStage: 'Teknik Mülakat 💻',
    companyRating: 4,
    contactPerson: 'Ahmet Kaya',
    interviewQuestions: '- React Native Bridge yapısı\n- Performans optimizasyonu nasıl yapılır?\n- FlatList vs ScrollView',
    cvLink: 'https://drive.google.com/cv-mobile',
    todos: [
      { id: 't4', text: 'Teknik case (ödev) için repoyu klonla ve başla', completed: false }
    ]
  },
  {
    id: uuidv4(),
    companyName: 'Büyütech',
    position: 'UI/UX Designer',
    city: 'Ankara',
    applicationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'Başvuruldu',
    notes: 'Otonom araçlar üzerine çalışıyorlar, çok ilgimi çekti.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    salaryExpectation: '40.000 TL',
    companyIndustry: 'Otomotiv Teknoloji',
    platform: 'Kendi Siteleri',
    workModel: 'Ofis 🏢',
    interviewStage: 'Henüz Yok',
    companyRating: 5,
    todos: [
      { id: 't5', text: 'Figma tasarımlarını Behance\'e yükle', completed: true },
      { id: 't6', text: 'Şirketin ürünlerini araştır', completed: false }
    ]
  }
];

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      const parsed = item ? JSON.parse(item) : [];
      return parsed.length > 0 ? parsed : MOCK_DATA;
    } catch (error) {
      console.error('Error reading localStorage', error);
      return MOCK_DATA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (error) {
      console.error('Error writing localStorage', error);
    }
  }, [applications]);

  const addApplication = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: Application = {
      ...appData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    toast.success('Başvuru başarıyla eklendi!');
  };

  const updateApplication = (id: string, updatedData: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, ...updatedData, updatedAt: new Date().toISOString() } : app
      )
    );
    toast.success('Başvuru güncellendi.');
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.info('Başvuru silindi.');
  };

  const getStats = (): DashboardStats => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'Başvuruldu' || app.status === 'Mülakat Bekleniyor').length;
    const accepted = applications.filter((app) => app.status === 'Kabul Edildi').length;
    const rejected = applications.filter((app) => app.status === 'Reddedildi').length;

    return { total, pending, accepted, rejected };
  };

  return (
    <ApplicationContext.Provider value={{ applications, addApplication, updateApplication, deleteApplication, getStats }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
