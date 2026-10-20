import { format } from 'date-fns';

export const MOOD_KEY = 'careerflow_mood';

export interface MoodEntry {
  date: string; // yyyy-MM-dd
  mood: number; // 1..5
  energy: number; // 1..5
  note: string;
  gratitude: string;
}

export const MOODS = [
  { value: 5, emoji: '🤩', label: 'Harika', color: '#3a9a6e', message: 'Bu enerjiyle bugün harikalar yaratırsın! Bir pomodoro ile başla. 🚀' },
  { value: 4, emoji: '🙂', label: 'İyi', color: '#6fb06a', message: 'Güzel bir gün! Küçük bir adım bile fark yaratır. 🌱' },
  { value: 3, emoji: '😐', label: 'Normal', color: '#d99a12', message: 'Sıradan günler de değerli. Kendine nazik ol. ☕' },
  { value: 2, emoji: '😔', label: 'Yorgun', color: '#d27a4f', message: 'Dinlenmek de ilerlemenin parçası. Bir mola hak ettin. 🍃' },
  { value: 1, emoji: '😣', label: 'Stresli', color: '#b5544a', message: 'Derin bir nefes al. Pomodoro sayfasındaki nefes egzersizi iyi gelebilir. 🌬️' },
];

export const moodFor = (value: number) => MOODS.find(m => m.value === value) ?? MOODS[2];

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');
