import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Application, DashboardStats } from '../Interfaces';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { usePreferences } from './PreferencesContext';
import { fireConfetti } from '../Utils/confetti';

interface ApplicationContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => void;
  toggleTodo: (appId: string, todoId: string) => void;
  importApplications: (apps: Application[]) => void;
  resetApplications: (withDemoData?: boolean) => void;
  getStats: () => DashboardStats;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

const STORAGE_KEY = 'careerflow_applications';

const DAY = 86400000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const inDays = (n: number, hour: number, minute = 0) => {
  const d = new Date(Date.now() + n * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const buildMockData = (): Application[] => [
  {
    id: uuidv4(),
    companyName: 'Spotify',
    position: 'Frontend Developer',
    city: 'Uzaktan',
    applicationDate: daysAgo(6),
    status: 'Mülakat Bekleniyor',
    notes: 'Kültür uyumu çok iyi gözüküyor. Ekipler arası iletişim önemli.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    salaryExpectation: '50.000 TL',
    jobUrl: 'https://www.lifeatspotify.com',
    companyIndustry: 'Müzik & Teknoloji',
    platform: 'LinkedIn',
    workModel: 'Uzaktan 🏠',
    interviewStage: 'İK Görüşmesi 🗣️',
    interviewDate: inDays(2, 14),
    companyRating: 5,
    contactPerson: 'Ceren Yılmaz',
    interviewQuestions: '- React hooklarının çalışma prensibi\n- Daha önce karşılaştığın en zor bug neydi?\n- Spotify kültürüne nasıl uyum sağlarsın?',
    cvLink: 'https://drive.google.com/cv-frontend-v2',
    history: [
      { status: 'Başvuruldu', date: daysAgo(6) },
      { status: 'Mülakat Bekleniyor', date: daysAgo(1) },
    ],
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
    applicationDate: daysAgo(18),
    status: 'Mülakat Yapıldı',
    notes: 'Teknik mülakat çok zordu ama genel olarak iyi geçti. Canlı kodlama (live coding) yaptık.',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(3),
    salaryExpectation: '65.000 TL',
    jobUrl: 'https://www.trendyol.com',
    companyIndustry: 'E-Ticaret',
    platform: 'Kariyer.net',
    workModel: 'Hibrit ☕',
    interviewStage: 'Teknik Mülakat 💻',
    interviewDate: inDays(5, 10, 30),
    companyRating: 4,
    contactPerson: 'Ahmet Kaya',
    interviewQuestions: '- React Native Bridge yapısı\n- Performans optimizasyonu nasıl yapılır?\n- FlatList vs ScrollView',
    cvLink: 'https://drive.google.com/cv-mobile',
    history: [
      { status: 'Başvuruldu', date: daysAgo(18) },
      { status: 'Mülakat Bekleniyor', date: daysAgo(11) },
      { status: 'Mülakat Yapıldı', date: daysAgo(3) },
    ],
    todos: [
      { id: 't4', text: 'Teknik case (ödev) için repoyu klonla ve başla', completed: false }
    ]
  },
  {
    id: uuidv4(),
    companyName: 'Büyütech',
    position: 'UI/UX Designer',
    city: 'Ankara',
    applicationDate: daysAgo(10),
    status: 'Başvuruldu',
    notes: 'Otonom araçlar üzerine çalışıyorlar, çok ilgimi çekti.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
    salaryExpectation: '40.000 TL',
    companyIndustry: 'Otomotiv Teknoloji',
    platform: 'Kendi Siteleri',
    workModel: 'Ofis 🏢',
    interviewStage: 'Henüz Yok',
    companyRating: 5,
    history: [{ status: 'Başvuruldu', date: daysAgo(10) }],
    todos: [
      { id: 't5', text: 'Figma tasarımlarını Behance\'e yükle', completed: true },
      { id: 't6', text: 'Şirketin ürünlerini araştır', completed: false }
    ]
  },
  {
    id: uuidv4(),
    companyName: 'Getir',
    position: 'Frontend Engineer',
    city: 'İstanbul',
    applicationDate: daysAgo(2),
    status: 'Başvuruldu',
    notes: 'Hızlı büyüyen bir ekip, ürün odaklı çalışıyorlar.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    salaryExpectation: '55.000 TL',
    companyIndustry: 'Hızlı Teslimat',
    platform: 'LinkedIn',
    workModel: 'Hibrit ☕',
    interviewStage: 'Henüz Yok',
    companyRating: 4,
    history: [{ status: 'Başvuruldu', date: daysAgo(2) }],
    todos: []
  },
  {
    id: uuidv4(),
    companyName: 'Papara',
    position: 'Web Developer',
    city: 'İstanbul',
    applicationDate: daysAgo(31),
    status: 'Reddedildi',
    notes: 'Daha deneyimli birini aradıklarını söylediler. Geri bildirim için teşekkür ettim.',
    createdAt: daysAgo(31),
    updatedAt: daysAgo(14),
    companyIndustry: 'Fintech',
    platform: 'Kariyer.net',
    workModel: 'Ofis 🏢',
    interviewStage: 'İK Görüşmesi 🗣️',
    companyRating: 3,
    history: [
      { status: 'Başvuruldu', date: daysAgo(31) },
      { status: 'Mülakat Bekleniyor', date: daysAgo(24) },
      { status: 'Mülakat Yapıldı', date: daysAgo(20) },
      { status: 'Reddedildi', date: daysAgo(14) },
    ],
    todos: []
  },
  {
    id: uuidv4(),
    companyName: 'Insider',
    position: 'Junior Frontend Developer',
    city: 'İstanbul',
    applicationDate: daysAgo(45),
    status: 'Mülakat Yapıldı',
    notes: 'Yönetici görüşmesi çok samimiydi. Teklif aşamasına geçebiliriz!',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(4),
    salaryExpectation: '45.000 TL',
    companyIndustry: 'SaaS',
    platform: 'Referans',
    workModel: 'Hibrit ☕',
    interviewStage: 'Teklif Aşaması 📜',
    interviewDate: inDays(9, 16),
    companyRating: 5,
    contactPerson: 'Zeynep Aksoy',
    history: [
      { status: 'Başvuruldu', date: daysAgo(45) },
      { status: 'Mülakat Bekleniyor', date: daysAgo(38) },
      { status: 'Mülakat Yapıldı', date: daysAgo(4) },
    ],
    todos: [
      { id: 't7', text: 'Teklif için maaş araştırması yap', completed: false }
    ]
  },
];

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      // Only seed demo data on the very first visit, so deleting everything sticks.
      return item ? JSON.parse(item) : buildMockData();
    } catch (error) {
      console.error('Error reading localStorage', error);
      return buildMockData();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (error) {
      console.error('Error writing localStorage', error);
    }
  }, [applications]);

  const celebrate = () => {
    if (preferences.celebrate) fireConfetti();
    toast.success('Tebrikler! Yeni işin hayırlı olsun! 🎉🌻');
  };

  const addApplication = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newApp: Application = {
      ...appData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      history: [{ status: appData.status, date: now }],
    };
    setApplications((prev) => [newApp, ...prev]);
    if (newApp.status === 'Kabul Edildi') celebrate();
    else toast.success('Başvuru başarıyla eklendi! 🌱');
  };

  const updateApplication = (id: string, updatedData: Partial<Application>) => {
    const previous = applications.find(app => app.id === id);
    const now = new Date().toISOString();
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const newStatus = updatedData.status;
        const history = newStatus && newStatus !== app.status
          ? [...(app.history || [{ status: app.status, date: app.applicationDate }]), { status: newStatus, date: now }]
          : app.history;
        return { ...app, ...updatedData, history, updatedAt: now };
      })
    );
    if (updatedData.status === 'Kabul Edildi' && previous?.status !== 'Kabul Edildi') celebrate();
    else toast.success('Başvuru güncellendi.');
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.info('Başvuru silindi.');
  };

  const duplicateApplication = (id: string) => {
    const source = applications.find(app => app.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Application = {
      ...source,
      id: uuidv4(),
      companyName: `${source.companyName} (kopya)`,
      status: 'Başvuruldu',
      interviewStage: 'Henüz Yok',
      applicationDate: now,
      createdAt: now,
      updatedAt: now,
      interviewDate: undefined,
      history: [{ status: 'Başvuruldu', date: now }],
      todos: (source.todos || []).map(todo => ({ ...todo, id: uuidv4(), completed: false })),
    };
    setApplications(prev => [copy, ...prev]);
    toast.success('Başvuru kopyalandı. 📋');
  };

  const toggleTodo = (appId: string, todoId: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === appId
          ? { ...app, todos: (app.todos || []).map(t => t.id === todoId ? { ...t, completed: !t.completed } : t) }
          : app
      )
    );
  };

  const importApplications = (apps: Application[]) => {
    setApplications(apps);
    toast.success(`${apps.length} başvuru geri yüklendi! 📦`);
  };

  const resetApplications = (withDemoData = false) => {
    setApplications(withDemoData ? buildMockData() : []);
    toast.info(withDemoData ? 'Örnek veriler yüklendi. 🌿' : 'Tüm başvurular silindi.');
  };

  const getStats = (): DashboardStats => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'Başvuruldu' || app.status === 'Mülakat Bekleniyor').length;
    const accepted = applications.filter((app) => app.status === 'Kabul Edildi').length;
    const rejected = applications.filter((app) => app.status === 'Reddedildi').length;

    return { total, pending, accepted, rejected };
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications, addApplication, updateApplication, deleteApplication, duplicateApplication,
        toggleTodo, importApplications, resetApplications, getStats,
      }}
    >
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
