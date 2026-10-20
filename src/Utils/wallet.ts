import { format, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const WALLET_KEYS = { tx: 'careerflow_wallet_tx', settings: 'careerflow_wallet_settings' } as const;

export type TxType = 'out' | 'in';

export interface Tx { id: string; type: TxType; amount: number; category: string; note: string; date: string }

export interface WalletSettings { budget: number; goalTitle: string; goalTarget: number; saved: number }

export const DEFAULT_WALLET: WalletSettings = { budget: 6000, goalTitle: 'Yaz tatili', goalTarget: 5000, saved: 1350 };

export const CATEGORIES: { id: string; label: string; emoji: string; color: string; type: TxType }[] = [
  { id: 'food', label: 'Yemek', emoji: '🍔', color: '#c97b5a', type: 'out' },
  { id: 'coffee', label: 'Kahve', emoji: '☕', color: '#8a5a3c', type: 'out' },
  { id: 'transport', label: 'Ulaşım', emoji: '🚌', color: '#4f86c0', type: 'out' },
  { id: 'school', label: 'Okul', emoji: '📚', color: '#7a4a8a', type: 'out' },
  { id: 'fun', label: 'Eğlence', emoji: '🎬', color: '#d9a441', type: 'out' },
  { id: 'shopping', label: 'Alışveriş', emoji: '🛍️', color: '#c2577a', type: 'out' },
  { id: 'bills', label: 'Fatura', emoji: '🏠', color: '#5a7a6a', type: 'out' },
  { id: 'health', label: 'Sağlık', emoji: '💊', color: '#3f8f9a', type: 'out' },
  { id: 'other', label: 'Diğer', emoji: '🎁', color: '#9a8b7a', type: 'out' },
  { id: 'allowance', label: 'Harçlık', emoji: '💰', color: '#3a9a6e', type: 'in' },
  { id: 'job', label: 'İş', emoji: '💼', color: '#2f6b5a', type: 'in' },
  { id: 'scholarship', label: 'Burs', emoji: '🎓', color: '#4c58a8', type: 'in' },
];

export const categoryOf = (id: string) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[8];

export const money = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);

export const seedTx = (): Tx[] => {
  const d = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd');
  const t = (daysAgo: number, type: TxType, amount: number, category: string, note: string): Tx => ({ id: uuidv4(), type, amount, category, note, date: d(daysAgo) });
  return [
    t(0, 'out', 85, 'coffee', 'Latte + kurabiye'),
    t(0, 'out', 40, 'transport', 'Metro kart dolum'),
    t(1, 'out', 210, 'food', 'Arkadaşlarla pizza'),
    t(2, 'out', 320, 'school', 'Udemy React kursu'),
    t(3, 'out', 65, 'coffee', 'Filtre kahve'),
    t(4, 'out', 450, 'fun', 'Konser bileti'),
    t(6, 'out', 180, 'food', 'Market'),
    t(8, 'in', 4000, 'allowance', 'Aylık harçlık'),
    t(9, 'out', 260, 'shopping', 'Kazak'),
    t(12, 'in', 1500, 'scholarship', 'KYK bursu'),
  ];
};
