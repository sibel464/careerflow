/**
 * One-time switch of the old school-themed sample data (Matematik, Fizik, Türev…) to the
 * software-themed samples. Only entries that still match the old samples are touched;
 * anything you added or renamed yourself stays as it is.
 */
import { STUDY_KEYS, Subject, seedSubjects } from './study';
import { PERSONAL_KEYS, Card, Deck, packCards, packToDeck, seedCards } from './personal';
import { FLASH_PACKS } from './flashPacks';
import { CORNER_KEYS, seedBooks, seedNotes as seedBoardNotes } from './corner';
import { GRADES_KEY } from './grades';

const FLAG = 'careerflow_software_seed_v1';
const PACKS_FLAG = 'careerflow_flash_packs_v1';

const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

type Row = Record<string, unknown>;

const rename = (key: string, field: string, map: Record<string, Row>) => {
  const list = read<Row[]>(key);
  if (!Array.isArray(list)) return;
  write(key, list.map(item => {
    const hit = map[item[field] as string];
    return hit ? { ...item, ...hit } : item;
  }));
};

export function migrateToSoftwareSamples() {
  try {
    if (localStorage.getItem(FLAG)) return;

    // Subjects: same ids, new names and topics.
    const fresh = Object.fromEntries(seedSubjects().map(s => [s.id, s]));
    const oldNames: Record<string, string> = { 's-mat': 'Matematik', 's-fiz': 'Fizik', 's-ing': 'İngilizce', 's-alg': 'Algoritmalar' };
    const subjects = read<Subject[]>(STUDY_KEYS.subjects);
    if (Array.isArray(subjects)) {
      write(STUDY_KEYS.subjects, subjects.map(s => (oldNames[s.id] === s.name && fresh[s.id] ? fresh[s.id] : s)));
    }

    rename(STUDY_KEYS.exams, 'title', {
      'Matematik Vizesi': { title: 'Frontend Proje Sunumu' },
      'İngilizce Quiz': { title: 'SQL Quiz' },
    });

    rename(STUDY_KEYS.tasks, 'title', {
      'Türev uygulamaları soru çöz (20 soru)': { title: 'Responsive navbar\'ı bitir (mobil menü)' },
      'Fizik laboratuvar raporunu yaz': { title: 'useEffect ile todo uygulaması yaz' },
      'İngilizce kelime kartları (30 kelime)': { title: 'SQL JOIN alıştırmaları (15 soru)' },
      'DP problemleri için video izle': { title: 'LeetCode: 3 dinamik programlama sorusu' },
      'Kinematik özet çıkar': { title: 'GitHub\'a portfolyo reposunu yükle', subjectId: 's-mat' },
    });

    rename(PERSONAL_KEYS.timetable, 'title', {
      Matematik: { title: 'Web Geliştirme', room: 'Lab-1' },
      Fizik: { title: 'React & TypeScript', room: 'Lab-2' },
      'İngilizce': { title: 'Veritabanları', room: 'Lab-3' },
    });

    rename(PERSONAL_KEYS.habits, 'name', {
      'Kitap oku': { name: 'Kod yaz', emoji: '💻', unit: '30 dk' },
      Meditasyon: { name: 'LeetCode sorusu', emoji: '🧩', unit: 'soru' },
    });

    // Flashcards: rename the two sample decks and swap their sample cards.
    const decks = read<{ id: string; name: string }[]>(PERSONAL_KEYS.decks);
    if (Array.isArray(decks)) {
      const swapped = new Set<string>();
      write(PERSONAL_KEYS.decks, decks.map(d => {
        if (d.id === 'd-eng' && d.name === 'İngilizce Kelimeler') { swapped.add(d.id); return { ...d, name: 'Git Komutları', emoji: '🌿', subjectId: 's-mat' }; }
        if (d.id === 'd-mat' && d.name === 'Türev Formülleri') { swapped.add(d.id); return { ...d, name: 'JavaScript Kavramları', emoji: '🟨', subjectId: 's-fiz' }; }
        return d;
      }));
      const cards = read<{ deckId: string }[]>(PERSONAL_KEYS.cards);
      if (Array.isArray(cards) && swapped.size) {
        write(PERSONAL_KEYS.cards, [...cards.filter(c => !swapped.has(c.deckId)), ...seedCards().filter(c => swapped.has(c.deckId))]);
      }
    }

    rename(GRADES_KEY, 'name', {
      Matematik: { name: 'Web Geliştirme', emoji: '🌐' },
      Fizik: { name: 'React & TypeScript', emoji: '⚛️' },
      'İngilizce': { name: 'Veritabanları', emoji: '🗄️' },
    });

    // Bookshelf and cork board: swap the sample entries one for one, keeping their spots.
    const oldBooks = ['Küçük Prens', 'Atomik Alışkanlıklar', 'Kürk Mantolu Madonna', 'Sapiens', 'Simyacı', 'Fareler ve İnsanlar', 'Derin Çalışma'];
    const newBooks = seedBooks();
    const books = read<{ id: string; title: string }[]>(CORNER_KEYS.books);
    if (Array.isArray(books)) {
      write(CORNER_KEYS.books, books.map(b => {
        const i = oldBooks.indexOf(b.title);
        return i >= 0 ? { ...newBooks[i], id: b.id } : b;
      }));
    }
    const oldNotes = ['Cuma: fizik lab raporu teslim! 🧪', '“Mükemmel değil, istikrarlı ol.” ✨', 'Annemi ara 💛\nSu içmeyi unutma 💧', 'Yaz tatili planı:\n• Kapadokya 🎈\n• Ehliyet\n• Gitar 🎸', 'Hafta sonu: kitap kafe ☕📚'];
    const newNotes = seedBoardNotes();
    rename(CORNER_KEYS.notes, 'text', Object.fromEntries(oldNotes.map((t, i) => [t, { text: newNotes[i].text }])));

    rename('careerflow_notebooks', 'name', { 'Ders Notları': { name: 'Kod Notları', emoji: '💻' } });
    rename('careerflow_notes', 'title', {
      'Türev kuralları': { title: 'React hook kuralları', body: '• Hook\'lar sadece bileşenin en üstünde çağrılır\n• useState → durum tutar\n• useEffect → yan etkiler (fetch, abonelik)\n• Bağımlılık dizisini unutma! []' },
    });
    rename('careerflow_vision', 'text', {
      'Bu dönem ortalamamı 3.5 yapmak': { text: 'Bir teknoloji şirketinde staj yapmak' },
      'Her sabah 20 dakika kitap okumak': { text: 'Açık kaynak bir projeye katkı vermek', emoji: '💻' },
    });
    rename('careerflow_wallet_tx', 'note', { 'Fizik kitabı': { note: 'Udemy React kursu' } });

    localStorage.setItem(FLAG, '1');
  } catch {
    /* storage unavailable — nothing to migrate */
  }
}

/** Adds the ready-made decks (and any new cards in the two sample decks) once. */
export function addFlashPacks() {
  try {
    if (localStorage.getItem(PACKS_FLAG)) return;
    const decks = read<Deck[]>(PERSONAL_KEYS.decks);
    const cards = read<Card[]>(PERSONAL_KEYS.cards);
    if (!Array.isArray(decks) || !Array.isArray(cards)) { localStorage.setItem(PACKS_FLAG, '1'); return; } // fresh install: seeds already include them
    const have = new Set(decks.map(d => d.id));
    const newDecks = FLASH_PACKS.filter(p => !have.has(p.id)).map(packToDeck);
    const newCards = FLASH_PACKS.flatMap(p => packCards(p, new Set(cards.filter(c => c.deckId === p.id).map(c => c.front))));
    write(PERSONAL_KEYS.decks, [...decks, ...newDecks]);
    write(PERSONAL_KEYS.cards, [...cards, ...newCards]);
    localStorage.setItem(PACKS_FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}
