import { useEffect, useState } from 'react';
import { loadMedia } from '../Utils/mediaStore';

/** Loads a stored photo/drawing by id. */
export const useMedia = (id: string) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadMedia(id).then(value => { if (alive) setSrc(value ?? null); }).catch(() => undefined);
    return () => { alive = false; };
  }, [id]);
  return src;
};
