import {
  LayoutDashboard, Briefcase, CalendarDays, Mic, Wrench, TrendingUp, Settings,
  Sun, Timer, ListChecks, Library, Heart, BookHeart, NotebookPen, Trees, PenLine, Droplets, Armchair, WalletCards, Sprout, Map as MapIcon, MessageCircle, LucideIcon,
} from 'lucide-react';
import type { Space } from '../Hooks/useSpace';

export interface NavEntry {
  path: string;
  label: string;
  emoji: string;
  icon: LucideIcon;
  /** Second key of the "G then …" shortcut. */
  key: string;
  description: string;
  /** Small heading shown above this entry in the menu. */
  section?: string;
}

/** The single source of truth for both spaces' menus, the command palette and shortcuts. */
export const NAVIGATION: Record<Space, NavEntry[]> = {
  career: [
    { path: '/', label: 'Pano', emoji: '☕', icon: LayoutDashboard, key: 'p', description: 'Kariyer özetin' },
    { path: '/applications', label: 'Başvurular', emoji: '🌿', icon: Briefcase, key: 'b', description: 'Liste ve Kanban' },
    { path: '/calendar', label: 'Takvim', emoji: '📅', icon: CalendarDays, key: 't', description: 'Mülakat günleri' },
    { path: '/interview', label: 'Mülakat', emoji: '🎙️', icon: Mic, key: 'm', description: 'Soru bankası ve simülatör' },
    { path: '/tools', label: 'Araçlar', emoji: '🧰', icon: Wrench, key: 'a', description: 'Yazı stüdyosu ve teklifler' },
    { path: '/growth', label: 'Gelişim', emoji: '📈', icon: TrendingUp, key: 'e', description: 'Analizler ve bahçen' },
  ],
  study: [
    { path: '/study', label: 'Bugün', emoji: '☀️', icon: Sun, key: 'c', description: 'Günün özeti', section: 'Gün' },
    { path: '/study/tasks', label: 'Görevler', emoji: '✅', icon: ListChecks, key: 'l', description: 'Yapılacaklar listesi' },
    { path: '/study/calendar', label: 'Takvim', emoji: '🗓️', icon: CalendarDays, key: 'z', description: 'Dersler, sınavlar, günlük — tek takvimde' },
    { path: '/study/habits', label: 'Alışkanlıklar', emoji: '💧', icon: Droplets, key: 'h', description: 'Su, kitap, spor… her gün biraz' },
    { path: '/study/focus', label: 'Pomodoro', emoji: '🍅', icon: Timer, key: 'o', description: 'Odak zamanlayıcısı ve gerçek sesler' },
    { path: '/study/journal', label: 'Günlüğüm', emoji: '📔', icon: BookHeart, key: 'j', description: 'Yaz, çiz, fotoğraf ekle', section: 'Defter' },
    { path: '/study/notebooks', label: 'Defterler', emoji: '📒', icon: NotebookPen, key: 'k', description: 'Konu konu notların' },
    { path: '/study/corner', label: 'Köşem', emoji: '🪴', icon: Armchair, key: 'r', description: 'Kitaplık, not panosu, zaman kapsülü' },
    { path: '/study/subjects', label: 'Dersler', emoji: '📖', icon: Library, key: 'd', description: 'Konular, sınavlar, program, bilgi kartları', section: 'Gelişim' },
    { path: '/study/goals', label: 'Hedef Haritam', emoji: '🗺️', icon: MapIcon, key: 'x', description: 'Büyük hedeflerin, yolculuk haritası olarak' },
    { path: '/study/chat', label: 'Sohbet', emoji: '💬', icon: MessageCircle, key: 's', description: 'Arkadaşlarınla yazış, ilerlemeni paylaş' },
    { path: '/study/forest', label: 'Ormanım', emoji: '🌲', icon: Trees, key: 'f', description: 'Her 5 saat odak bir ağaç' },
    { path: '/study/motivation', label: 'Motivasyon', emoji: '💛', icon: Heart, key: 'v', description: 'Ödüller, ruh hali, hayaller' },
    { path: '/study/wallet', label: 'Cüzdanım', emoji: '👛', icon: WalletCards, key: 'u', description: 'Bütçe, harcamalar, kumbara', section: 'Evim' },
    { path: '/study/plants', label: 'Bitkilerim', emoji: '🪴', icon: Sprout, key: 'i', description: 'Sulama takvimi, susayan bitkiler' },
    { path: '/study/tools', label: 'Araçlar', emoji: '🧰', icon: PenLine, key: 'w', description: 'Yazı stüdyosu ve konuşma provası' },
  ],
};

export const SETTINGS_ENTRY: Record<Space, NavEntry> = {
  career: { path: '/settings', label: 'Ayarlar', emoji: '⚙️', icon: Settings, key: 'y', description: 'Profil, hedefler, yedek' },
  study: { path: '/study/settings', label: 'Ayarlar', emoji: '⚙️', icon: Settings, key: 'y', description: 'Profil, hedefler, yedek' },
};

export const SPACE_META: Record<Space, { name: string; brand: string; emoji: string; home: string; tagline: string }> = {
  career: { name: 'Kariyer', brand: 'CareerFlow', emoji: '💼', home: '/', tagline: 'Başvurular · Mülakatlar · Teklifler' },
  study: { name: 'Kişisel', brand: 'Sibilia', emoji: '🌸', home: '/study', tagline: 'Ders · Odak · Günlük · Notlar' },
};
