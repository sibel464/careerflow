export type ApplicationStatus = 'Başvuruldu' | 'Mülakat Bekleniyor' | 'Mülakat Yapıldı' | 'Kabul Edildi' | 'Reddedildi';
export type WorkModel = 'Bilinmiyor' | 'Uzaktan 🏠' | 'Hibrit ☕' | 'Ofis 🏢';
export type InterviewStage = 'Henüz Yok' | 'İK Görüşmesi 🗣️' | 'Teknik Mülakat 💻' | 'Yönetici Görüşmesi 🤝' | 'Teklif Aşaması 📜';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StatusChange {
  status: ApplicationStatus;
  date: string;
}

export interface Application {
  id: string;
  companyName: string;
  position: string;
  city: string;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  
  // V1 Genişleme
  salaryExpectation?: string;
  jobUrl?: string;
  companyIndustry?: string;
  platform?: string;

  // V2 Bohem Genişleme
  workModel?: WorkModel;
  interviewStage?: InterviewStage;
  companyRating?: number; // 1 to 5
  contactPerson?: string;

  // V3 Pro Genişleme
  todos?: TodoItem[];
  interviewQuestions?: string;
  cvLink?: string;

  // V4 Takvim & Geçmiş
  interviewDate?: string; // ISO datetime of the next interview
  history?: StatusChange[];
}
