import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BookOpen, Mic, PenLine, Scale, BarChart2, Sprout, Coins, Smile, Sparkles, Library, CalendarDays, Layers, BookMarked, Pin, Hourglass, GraduationCap } from 'lucide-react';
import { ThemeProvider, useTheme } from './Hooks/ThemeContext';
import { ApplicationProvider } from './Hooks/ApplicationContext';
import { PreferencesProvider } from './Hooks/PreferencesContext';
import { FocusProvider } from './Hooks/FocusContext';
import { Layout } from './Components/Layout';
import { SectionTabs } from './Components/SectionTabs';
import { Dashboard, Applications, Settings, Preparation, Calendar, Garden, Studio } from './Pages';

// Heavier pages load on demand.
const Analytics = lazy(() => import('./Pages/Analytics').then(m => ({ default: m.Analytics })));
const Offers = lazy(() => import('./Pages/Offers').then(m => ({ default: m.Offers })));
const Simulator = lazy(() => import('./Pages/Simulator').then(m => ({ default: m.Simulator })));
const FocusRoom = lazy(() => import('./Pages/FocusRoom').then(m => ({ default: m.FocusRoom })));
const Mood = lazy(() => import('./Pages/Mood').then(m => ({ default: m.Mood })));
const VisionBoard = lazy(() => import('./Pages/VisionBoard').then(m => ({ default: m.VisionBoard })));
const StudyHome = lazy(() => import('./Pages/Study/StudyHome').then(m => ({ default: m.StudyHome })));
const Tasks = lazy(() => import('./Pages/Study/Tasks').then(m => ({ default: m.Tasks })));
const Subjects = lazy(() => import('./Pages/Study/Subjects').then(m => ({ default: m.Subjects })));
const Rewards = lazy(() => import('./Pages/Study/Rewards').then(m => ({ default: m.Rewards })));
const Journal = lazy(() => import('./Pages/Study/Journal').then(m => ({ default: m.Journal })));
const Notebooks = lazy(() => import('./Pages/Study/Notebooks').then(m => ({ default: m.Notebooks })));
const Forest = lazy(() => import('./Pages/Study/Forest').then(m => ({ default: m.Forest })));
const Habits = lazy(() => import('./Pages/Study/Habits').then(m => ({ default: m.Habits })));
const Timetable = lazy(() => import('./Pages/Study/Timetable').then(m => ({ default: m.Timetable })));
const StudyCalendar = lazy(() => import('./Pages/Study/StudyCalendar').then(m => ({ default: m.StudyCalendar })));
const Bookshelf = lazy(() => import('./Pages/Study/Bookshelf').then(m => ({ default: m.Bookshelf })));
const Corkboard = lazy(() => import('./Pages/Study/Corkboard').then(m => ({ default: m.Corkboard })));
const TimeCapsule = lazy(() => import('./Pages/Study/TimeCapsule').then(m => ({ default: m.TimeCapsule })));
const Grades = lazy(() => import('./Pages/Study/Grades').then(m => ({ default: m.Grades })));
const Wallet = lazy(() => import('./Pages/Study/Wallet').then(m => ({ default: m.Wallet })));
const Goals = lazy(() => import('./Pages/Study/Goals').then(m => ({ default: m.Goals })));
const Plants = lazy(() => import('./Pages/Study/Plants').then(m => ({ default: m.Plants })));
const Chat = lazy(() => import('./Pages/Study/Chat').then(m => ({ default: m.Chat })));
const Flashcards = lazy(() => import('./Pages/Study/Flashcards').then(m => ({ default: m.Flashcards })));

function ThemedToasts() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
}

/** Addresses used by earlier versions, kept working. */
const LEGACY_REDIRECTS: Record<string, string> = {
  preparation: '/interview',
  simulator: '/interview/simulator',
  studio: '/tools',
  offers: '/tools/offers',
  analytics: '/growth',
  garden: '/growth/garden',
  focus: '/study/focus',
  mood: '/study/motivation/mood',
  vision: '/study/motivation/vision',
  'study/rewards': '/study/motivation',
  'study/mood': '/study/motivation/mood',
  'study/vision': '/study/motivation/vision',
};

function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <ApplicationProvider>
          <FocusProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* 💼 Career space */}
                  <Route index element={<Dashboard />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="interview" element={<SectionTabs title="Mülakat" emoji="🎙️" tabs={[
                    { to: '/interview', label: 'Soru Bankası', icon: BookOpen, end: true },
                    { to: '/interview/simulator', label: 'Simülatör', icon: Mic },
                  ]} />}>
                    <Route index element={<Preparation />} />
                    <Route path="simulator" element={<Simulator />} />
                  </Route>
                  <Route path="tools" element={<SectionTabs title="Araçlar" emoji="🧰" tabs={[
                    { to: '/tools', label: 'Yazı Stüdyosu', icon: PenLine, end: true },
                    { to: '/tools/offers', label: 'Teklif Karşılaştırıcı', icon: Scale },
                  ]} />}>
                    <Route index element={<Studio />} />
                    <Route path="offers" element={<Offers />} />
                  </Route>
                  <Route path="growth" element={<SectionTabs title="Gelişim" emoji="📈" tabs={[
                    { to: '/growth', label: 'Analizler', icon: BarChart2, end: true },
                    { to: '/growth/garden', label: 'Kariyer Bahçem', icon: Sprout },
                  ]} />}>
                    <Route index element={<Analytics />} />
                    <Route path="garden" element={<Garden />} />
                  </Route>
                  <Route path="settings" element={<Settings />} />

                  {/* 📚 Study space */}
                  <Route path="study" element={<StudyHome />} />
                  <Route path="study/focus" element={<FocusRoom />} />
                  <Route path="study/tasks" element={<Tasks />} />
                  <Route path="study/habits" element={<Habits />} />
                  <Route path="study/subjects" element={<SectionTabs title="Dersler" emoji="📖" tabs={[
                    { to: '/study/subjects', label: 'Dersler & Sınavlar', icon: Library, end: true },
                    { to: '/study/subjects/program', label: 'Ders Programı', icon: CalendarDays, end: false },
                    { to: '/study/subjects/cards', label: 'Bilgi Kartları', icon: Layers, end: false },
                    { to: '/study/subjects/grades', label: 'Not Çizelgem', icon: GraduationCap, end: false },
                  ]} />}>
                    <Route index element={<Subjects />} />
                    <Route path="program" element={<Timetable />} />
                    <Route path="cards" element={<Flashcards />} />
                    <Route path="grades" element={<Grades />} />
                  </Route>
                  <Route path="study/motivation" element={<SectionTabs title="Motivasyon" emoji="💛" tabs={[
                    { to: '/study/motivation', label: 'Ödül Dükkanı', icon: Coins, end: true },
                    { to: '/study/motivation/mood', label: 'Ruh Hali', icon: Smile },
                    { to: '/study/motivation/vision', label: 'Hayal Panosu', icon: Sparkles },
                  ]} />}>
                    <Route index element={<Rewards />} />
                    <Route path="mood" element={<Mood />} />
                    <Route path="vision" element={<VisionBoard />} />
                  </Route>
                  <Route path="study/calendar" element={<StudyCalendar />} />
                  <Route path="study/wallet" element={<Wallet />} />
                  <Route path="study/plants" element={<Plants />} />
                  <Route path="study/goals" element={<Goals />} />
                  <Route path="study/chat" element={<Chat />} />
                  <Route path="study/corner" element={<SectionTabs title="Köşem" emoji="🪴" tabs={[
                    { to: '/study/corner', label: 'Kitaplığım', icon: BookMarked, end: true },
                    { to: '/study/corner/board', label: 'Not Panosu', icon: Pin },
                    { to: '/study/corner/capsule', label: 'Zaman Kapsülü', icon: Hourglass },
                  ]} />}>
                    <Route index element={<Bookshelf />} />
                    <Route path="board" element={<Corkboard />} />
                    <Route path="capsule" element={<TimeCapsule />} />
                  </Route>
                  <Route path="study/journal" element={<Journal />} />
                  <Route path="study/notebooks" element={<Notebooks />} />
                  <Route path="study/forest" element={<Forest />} />
                  <Route path="study/tools" element={<SectionTabs title="Araçlar" emoji="🧰" tabs={[
                    { to: '/study/tools', label: 'Yazı Stüdyosu', icon: PenLine, end: true },
                    { to: '/study/tools/practice', label: 'Konuşma Provası', icon: Mic },
                  ]} />}>
                    <Route index element={<Studio />} />
                    <Route path="practice" element={<Simulator />} />
                  </Route>
                  <Route path="study/settings" element={<Settings />} />

                  {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
                    <Route key={from} path={from} element={<Navigate to={to} replace />} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <ThemedToasts />
          </FocusProvider>
        </ApplicationProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
