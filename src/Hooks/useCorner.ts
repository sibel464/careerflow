import { useLocalStorage } from './useLocalStorage';
import {
  CORNER_KEYS, ShelfBook, BoardNote, Capsule, seedBooks, seedNotes, seedCapsules,
} from '../Utils/corner';

/** Bookshelf, cork board and time capsules — persisted and synced across pages. */
export const useCorner = () => {
  const [books, setBooks] = useLocalStorage<ShelfBook[]>(CORNER_KEYS.books, seedBooks);
  const [bookGoal, setBookGoal] = useLocalStorage<number>(CORNER_KEYS.bookGoal, 12);
  const [notes, setNotes] = useLocalStorage<BoardNote[]>(CORNER_KEYS.notes, seedNotes);
  const [capsules, setCapsules] = useLocalStorage<Capsule[]>(CORNER_KEYS.capsules, seedCapsules);
  return { books, setBooks, bookGoal, setBookGoal, notes, setNotes, capsules, setCapsules };
};
