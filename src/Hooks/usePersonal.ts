import { useLocalStorage } from './useLocalStorage';
import {
  PERSONAL_KEYS, ClassSlot, Habit, Deck, Card, seedTimetable, seedHabits, seedDecks, seedCards,
} from '../Utils/personal';

/** Timetable, habits and flashcards — persisted and synced across pages. */
export const usePersonal = () => {
  const [timetable, setTimetable] = useLocalStorage<ClassSlot[]>(PERSONAL_KEYS.timetable, seedTimetable);
  const [habits, setHabits] = useLocalStorage<Habit[]>(PERSONAL_KEYS.habits, seedHabits);
  const [decks, setDecks] = useLocalStorage<Deck[]>(PERSONAL_KEYS.decks, seedDecks);
  const [cards, setCards] = useLocalStorage<Card[]>(PERSONAL_KEYS.cards, seedCards);
  return { timetable, setTimetable, habits, setHabits, decks, setDecks, cards, setCards };
};
