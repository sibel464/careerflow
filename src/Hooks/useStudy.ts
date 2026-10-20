import { useLocalStorage } from './useLocalStorage';
import {
  STUDY_KEYS, Subject, Exam, StudyTask, StudyLog, Reward, Redemption, StudySettings,
  seedSubjects, seedExams, seedTasks, seedLog, seedRewards, DEFAULT_SETTINGS, coinBalance,
} from '../Utils/study';

/** All study-space data, persisted and kept in sync across pages. */
export const useStudy = () => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(STUDY_KEYS.subjects, seedSubjects);
  const [exams, setExams] = useLocalStorage<Exam[]>(STUDY_KEYS.exams, seedExams);
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>(STUDY_KEYS.tasks, seedTasks);
  const [log, setLog] = useLocalStorage<StudyLog[]>(STUDY_KEYS.log, seedLog);
  const [rewards, setRewards] = useLocalStorage<Reward[]>(STUDY_KEYS.rewards, seedRewards);
  const [redemptions, setRedemptions] = useLocalStorage<Redemption[]>(STUDY_KEYS.redemptions, []);
  const [settings, setSettings] = useLocalStorage<StudySettings>(STUDY_KEYS.settings, DEFAULT_SETTINGS);

  const subjectById = (id?: string | null) => subjects.find(s => s.id === id);
  const coins = coinBalance(log, tasks, subjects, redemptions);

  return {
    subjects, setSubjects, exams, setExams, tasks, setTasks, log, setLog,
    rewards, setRewards, redemptions, setRedemptions, settings, setSettings,
    subjectById, coins,
  };
};
