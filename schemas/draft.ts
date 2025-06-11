import { z } from 'zod';

export const gameIds = ['coe5', 'civ6'] as const;
export const GameIdSchema = z.enum(gameIds);

export const DraftParamsSchema = z.object({
  random: z.number(),
  bans: z.number(),
  loose_bans: z.number(),
  repick: z.number(),
});

export const DraftSchema = z.object({
  name: z.string(),
  password: z.string(),
  game_id: GameIdSchema,
  params: DraftParamsSchema,
  created_at: z.number(),
  updated_at: z.number(),
});
