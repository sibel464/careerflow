import { ApplicationStatus, InterviewStage, WorkModel } from '../Interfaces';

export const STATUS_OPTIONS: ApplicationStatus[] = [
  'Başvuruldu', 'Mülakat Bekleniyor', 'Mülakat Yapıldı', 'Kabul Edildi', 'Reddedildi'
];

export const WORK_MODEL_OPTIONS: WorkModel[] = [
  'Bilinmiyor', 'Uzaktan 🏠', 'Hibrit ☕', 'Ofis 🏢'
];

export const INTERVIEW_STAGE_OPTIONS: InterviewStage[] = [
  'Henüz Yok', 'İK Görüşmesi 🗣️', 'Teknik Mülakat 💻', 'Yönetici Görüşmesi 🤝', 'Teklif Aşaması 📜'
];

/** Chart / dot colors per status — validated for color-vision deficiency in this order. */
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Başvuruldu': '#4f86c0',
  'Mülakat Bekleniyor': '#d99a12',
  'Mülakat Yapıldı': '#b8502c',
  'Kabul Edildi': '#3a9a6e',
  'Reddedildi': '#7a4a8a',
};

export const STATUS_EMOJI: Record<ApplicationStatus, string> = {
  'Başvuruldu': '📮',
  'Mülakat Bekleniyor': '⏳',
  'Mülakat Yapıldı': '🗣️',
  'Kabul Edildi': '🎉',
  'Reddedildi': '🍂',
};

/** Applications without news for this many days get a follow-up reminder. */
export const FOLLOW_UP_DAYS = 7;
