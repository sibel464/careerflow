import React from 'react';
import type { Species, TraitId } from '../../Utils/pet';
import { CuteAnimal } from './CuteAnimal';

/** The pet's drawing; poses are driven by `pose` and the .pet-* classes around it. */
export const PetArt: React.FC<{ species: Species; color: string; pose: string; traits?: TraitId[] }> = ({ species, color, pose, traits }) => (
  <CuteAnimal species={species} color={color} pose={pose} traits={traits} />
);
