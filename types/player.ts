import { z } from 'zod';
import { colors, PlayerColorSchema, PlayerSchema } from '@/schemas/player';

export { colors };

export type PlayerColor = z.infer<typeof PlayerColorSchema>;
export type Player = z.infer<typeof PlayerSchema>;
