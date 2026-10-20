import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AvatarConfig, DEFAULT_AVATAR, normalizeAvatar } from '../Utils/avatar';
import { CharacterConfig, DEFAULT_CHARACTER, normalizeCharacter } from '../Utils/character';
import { Decor, DEFAULT_DECOR } from '../Utils/decor';

export type Palette = 'lavender' | 'peach' | 'ocean' | 'matcha' | 'rose';

export interface Preferences {
  userName: string;
  avatar: string;
  weeklyGoal: number;
  celebrate: boolean;
  look: AvatarConfig;
  /** The Bitmoji-style character you build in Settings. */
  character: CharacterConfig;
  /** Whether your avatar strolls around the screen. */
  companion: boolean;
  /** Show the job-hunting space (applications, interviews, offers). */
  careerModule: boolean;
  /** Color theme of the personal space. */
  palette: Palette;
  /** The theme's little floating shapes in the background. */
  motifs: boolean;
  /** Wood, board and paper styles of the "real object" pages. */
  decor: Decor;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (changes: Partial<Preferences>) => void;
}

const STORAGE_KEY = 'careerflow_preferences';

const DEFAULT_PREFERENCES: Preferences = {
  userName: '',
  avatar: '🦊',
  weeklyGoal: 5,
  celebrate: true,
  look: DEFAULT_AVATAR,
  character: DEFAULT_CHARACTER,
  companion: true,
  careerModule: false,
  palette: 'lavender',
  motifs: true,
  decor: DEFAULT_DECOR,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return DEFAULT_PREFERENCES;
      const saved = JSON.parse(item);
      return { ...DEFAULT_PREFERENCES, ...saved, look: normalizeAvatar(saved.look), character: normalizeCharacter(saved.character), decor: { ...DEFAULT_DECOR, ...saved.decor } };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error writing preferences', error);
    }
  }, [preferences]);

  const updatePreferences = (changes: Partial<Preferences>) =>
    setPreferences(prev => ({ ...prev, ...changes }));

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
