import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type Space = 'career' | 'study';

/** Which "world" the current page belongs to: job hunting, or studying. */
export const useSpace = (): Space => {
  const { pathname } = useLocation();
  return pathname.startsWith('/study') ? 'study' : 'career';
};

/** Mirrors the active space onto <html> so CSS can swap the palette. */
export const useSpaceAttribute = (space: Space) => {
  useEffect(() => {
    document.documentElement.dataset.space = space;
  }, [space]);
};
