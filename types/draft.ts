import { z } from 'zod';
import {
  DraftParamsSchema,
  DraftSchema,
  GameIdSchema,
  gameIds,
} from '@/schemas/draft';

export { gameIds };

export type GameId = z.infer<typeof GameIdSchema>;
export type DraftParams = z.infer<typeof DraftParamsSchema>;
export type Draft = z.infer<typeof DraftSchema>;
