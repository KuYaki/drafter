import { z } from 'zod';

export const characterIdsCoe5 = [
  'baron',
  'necromancer',
  'demonologist',
  'witch',
  'priestess',
  'bakemono',
  'barbarian',
  'senator',
  'pale',
  'druid',
  'burgmeister',
  'warlock',
  'priest',
  'troll',
  'enchanter',
  'cultist',
  'dwarf',
  'el',
  'illusionist',
  'markgraf',
  'dryad',
  'scourge',
  'cloud',
  'kobold',
  'maharaja',
  'raksharaja',
  'guild',
] as const;
export const CharacterIdSchemaCoe5 = z.enum(characterIdsCoe5);

export const characterIdsCiv6 = ['ekaterina', 'makedonsky'] as const;
export const CharacterIdSchemaCiv6 = z.enum(characterIdsCiv6);

export const CharacterIdSchema = CharacterIdSchemaCoe5.or(
  CharacterIdSchemaCiv6
);

export const CharacterPlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  amount: z.number().optional(),
});

export const CharacterSchema = z.object({
  id: CharacterIdSchema,
  locked_by: CharacterPlayerSchema.optional(),
  was_locked_by: z.array(CharacterPlayerSchema),
  banned_by: CharacterPlayerSchema.optional(),
  loser_banned_for: z.array(CharacterPlayerSchema),
  available_for: z.array(CharacterPlayerSchema),
  user_looser_banned: CharacterPlayerSchema.optional(),
  disabled: z.boolean(),
});
