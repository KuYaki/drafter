import { z } from 'zod';
import {
  characterIdsCoe5,
  characterIdsCiv6,
  CharacterIdSchema,
  CharacterSchema,
} from '@/schemas/character';

export { characterIdsCoe5, characterIdsCiv6 };

export type CharacterId = z.infer<typeof CharacterIdSchema>;
export type Character = z.infer<typeof CharacterSchema>;
