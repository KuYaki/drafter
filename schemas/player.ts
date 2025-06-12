import { z } from 'zod';
import { CharacterIdSchema } from './character';

export const colors = [
  'red',
  'blue',
  'green',
  'brown',
  'orange',
  'teal',
  'purple',
  'olive',
  'violet',
  'yellow',
  'pink',
  'grey',
  'white',
  'black',
] as const;

export const PlayerColorSchema = z.enum(colors);

export const PlayerCharacterSchema = z.object({
  id: CharacterIdSchema,
  amount: z.number(),
});

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  password: z.string(),
  color: PlayerColorSchema,
  banned: z.array(CharacterIdSchema),
  loser_banned: z.array(PlayerCharacterSchema),
  locked: CharacterIdSchema.optional(),
  skipped: z.array(PlayerCharacterSchema),
  available: z.array(CharacterIdSchema),
  state: z.enum(['choosing', 'banning', 'locked', 'playing', 'waiting']),
  disabled: z.boolean(),
});
