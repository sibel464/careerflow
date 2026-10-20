import { useApplications } from './ApplicationContext';
import { usePreferences } from './PreferencesContext';
import { evaluateGarden, readPreparedAnswers } from '../Utils/achievements';
import { readStored, useDataVersion } from './useLocalStorage';

/** Live XP, level and badge state for the career space. */
export const useGarden = () => {
  const { applications } = useApplications();
  const { preferences } = usePreferences();
  // Re-evaluate when interview prep or practice data is saved anywhere.
  useDataVersion();
  const practice = readStored<{ score: number }[]>('careerflow_simulator', []);
  return evaluateGarden({
    apps: applications,
    preferences,
    preparedAnswers: readPreparedAnswers(),
    practiceSessions: practice.length,
    bestPractice: practice.reduce((m, s) => Math.max(m, s.score), 0),
  });
};
