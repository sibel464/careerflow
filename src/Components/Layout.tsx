import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePreferences } from '../Hooks/PreferencesContext';
import { wallStyle } from '../Utils/wallpapers';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from './CommandPalette';
import { EditorProvider } from '../Hooks/EditorContext';
import { AchievementWatcher } from './AchievementWatcher';
import { Pet } from './Pet/Pet';
import { ThemeMotifs } from './ThemeMotifs';
import { TaskConfetti } from './TaskConfetti';
import { GlobalShortcuts } from './GlobalShortcuts';
import { SpaceTransition } from './SpaceTransition';
import { useSpace, useSpaceAttribute } from '../Hooks/useSpace';
import { useTheme } from '../Hooks/ThemeContext';

const BLOBS = [
  { className: 'top-[-10%] left-[-10%] w-[50vw] h-[50vw]', opacity: 0.6, career: { light: '#e8d5bc', dark: '#3a2a1e' }, study: { light: '#d9d4f0', dark: '#262040' } },
  { className: 'top-[20%] right-[-10%] w-[45vw] h-[45vw] animate-delay-200', opacity: 0.4, career: { light: '#fbdca9', dark: '#1f3a2f' }, study: { light: '#c9d8f2', dark: '#1b2645' } },
  { className: 'bottom-[-20%] left-[20%] w-[60vw] h-[60vw] animate-delay-300', opacity: 0.5, career: { light: '#e3cda4', dark: '#2e2219' }, study: { light: '#e6d5ee', dark: '#2c2040' } },
  { className: 'bottom-[10%] right-[10%] w-[35vw] h-[35vw] animate-delay-100', opacity: 0.3, career: { light: '#d8a48b', dark: '#4a2a1e' }, study: { light: '#f2d4c9', dark: '#3a2233' } },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const space = useSpace();
  const dark = useTheme().theme === 'dark';
  useSpaceAttribute(space);

  // Close the mobile drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setSidebarOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Pages that use the whole screen, edge to edge.
  const fullBleed = location.pathname === '/study/chat';

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const { preferences } = usePreferences();
  const wallpaper = space === 'study' ? wallStyle(preferences.decor.wall) : null;

  useEffect(() => {
    document.documentElement.dataset.palette = preferences.palette;
  }, [preferences.palette]);

  useEffect(() => {
    const d = document.documentElement.dataset;
    d.wood = preferences.decor.wood;
    d.board = preferences.decor.board;
    d.paper = preferences.decor.paper;
  }, [preferences.decor]);

  // With the career module off, the personal space is the whole app.
  if (!preferences.careerModule && space === 'career') {
    return <Navigate to={location.pathname === '/settings' ? '/study/settings' : '/study'} replace />;
  }

  return (
    <EditorProvider>
      <div className="flex h-screen overflow-hidden relative font-sans">
        {/* Living Animated Mesh Background — each space has its own mood */}
        <div className="absolute inset-0 bg-cream z-0 overflow-hidden transition-colors duration-700">
          {wallpaper ? (
            <>
              {/* A real wall: patterned paper, a little grain, daylight from the window and a soft floor shadow */}
              <div className="absolute inset-0" style={wallpaper} />
              <div className="absolute inset-0 wall-grain" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,248,235,0.55),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(80,50,30,0.16),transparent_60%)]" />
              <div className="absolute inset-0 bg-[#e6d2b0]/50 dark:bg-[#120d0a]/78" />
              {preferences.motifs && <ThemeMotifs palette={preferences.palette} />}
            </>
          ) : BLOBS.map((blob, i) => (
            <div
              key={i}
              className={`absolute rounded-full blur-3xl animate-blob pointer-events-none transition-colors duration-1000 mix-blend-multiply dark:mix-blend-normal ${blob.className}`}
              style={{ backgroundColor: space === 'study' ? `var(--blob-${i + 1})` : dark ? blob.career.dark : blob.career.light, opacity: dark ? 0.5 : blob.opacity }}
            />
          ))}
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-md md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 p-4 transform md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </div>

        <div className="z-10 hidden md:flex p-4">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 w-full min-w-0 z-10 h-full relative">
          <Navbar onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setPaletteOpen(true)} />
          <main className={fullBleed ? 'flex-1 min-h-0 overflow-hidden p-2 sm:p-3 sm:px-6' : 'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar'}>
            <div key={location.pathname} className={fullBleed ? 'h-full animate-fade-in' : 'mx-auto max-w-7xl h-full animate-fade-in'}>
              <Suspense fallback={<div className="flex justify-center py-24 text-4xl animate-bounce">{space === 'study' ? '📚' : '🌱'}</div>}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>

        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
        <GlobalShortcuts onOpenPalette={openPalette} />
        <AchievementWatcher />
        <Pet />
        <TaskConfetti />
        <SpaceTransition space={space} />
      </div>
    </EditorProvider>
  );
};
