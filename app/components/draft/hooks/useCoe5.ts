'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { Character, characterIdsCoe5 } from '@/types/character';
import { Draft } from '@/types/draft';

const societies = [
  'dark',
  'agricultural',
  'empire',
  'fallen',
  'monarchy',
  'dawn',
] as const;

export function useCoe5(players: Player[], user: Player | null, draft: Draft) {
  const [error] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>(
    characterIdsCoe5.map((id) => ({
      id,
      was_locked_by: [],
      loser_banned_for: [],
      available_for: [],
      disabled: true,
    }))
  );
  const [society, setSociety] = useState<string | null>(null);

  const calculateSociety = (seed?: number[]) => {
    // If no previous values, use a default seed
    if (!seed || seed.length === 0) {
      return null; // Default to first society if no seed
    }

    // Calculate all previous society indices based on the seed history
    const previousIndices: number[] = [];

    // For each seed value, calculate what society index it would produce
    for (let i = 0; i < seed.length; i++) {
      // For the first seed, just use the direct mapping
      if (i === 0) {
        previousIndices.push(Math.floor(seed[i] * societies.length));
        continue;
      }

      // For subsequent seeds, use the previous result to calculate the next one
      const prevIndex = previousIndices[i - 1];
      const currentSeed = seed[i];

      // Use a deterministic function based on the current seed and previous index
      const hashValue = (currentSeed * 9301 + prevIndex * 49297) % 233280;
      const normalizedHash = hashValue / 233280;

      // Generate all possible indices except the previous one
      const possibleIndices = Array.from(
        { length: societies.length - 1 },
        (_, j) => (j >= prevIndex ? j + 1 : j)
      );

      // Select deterministically
      const nextIndex =
        possibleIndices[Math.floor(normalizedHash * possibleIndices.length)];
      previousIndices.push(nextIndex);
    }

    return societies[previousIndices[previousIndices.length - 1]];
  };

  useEffect(() => {
    const updatedCharacters = characters.map((character) => {
      const locked_by = players.find(
        (player) => player.locked?.id === character.id
      );
      const banned_by = players.find((player) =>
        player.banned.some((banned) => banned === character.id)
      );
      const was_locked_by = players
        .filter((player) =>
          player.skipped.some((skipped) => skipped.id === character.id)
        )
        .map((player) => ({
          id: player.id,
          name: player.name,
          color: player.color,
          amount: player.skipped.find((skipped) => skipped.id === character.id)
            ?.amount,
        }));
      const loser_banned_for = players
        .filter((player) =>
          player.loser_banned.some(
            (loser_banned) => loser_banned.id === character.id
          )
        )
        .map((player) => ({
          id: player.id,
          name: player.name,
          color: player.color,
          amount: player.loser_banned.find(
            (loser_banned) => loser_banned.id === character.id
          )?.amount,
        }));
      const available_for = players
        .filter((player) =>
          player.available.some((available) => available === character.id)
        )
        .map((player) => ({
          id: player.id,
          name: player.name,
          color: player.color,
        }));
      const user_looser_banned = loser_banned_for.find(
        (player) => player.id === user?.id
      );
      const disabled =
        user?.id === undefined ||
        (user.state !== 'choosing' && user.state !== 'banning') ||
        banned_by !== undefined ||
        (locked_by !== undefined && locked_by.id !== user.id) ||
        (draft.params.repick > 0 &&
          was_locked_by.reduce((sum, item) => sum + (item.amount || 0), 0) >=
            draft.params.repick) ||
        (user.state !== 'banning' &&
          ((draft.params.random > 0 &&
            !available_for.some((player) => player.id === user.id)) ||
            user_looser_banned !== undefined));
      return {
        ...character,
        locked_by: locked_by
          ? {
              id: locked_by.id,
              name: locked_by.name,
              color: locked_by.color,
            }
          : undefined,
        was_locked_by,
        banned_by: banned_by
          ? {
              id: banned_by.id,
              name: banned_by.name,
              color: banned_by.color,
            }
          : undefined,
        loser_banned_for,
        available_for,
        user_looser_banned,
        disabled,
      };
    });
    setCharacters(updatedCharacters);
    setSociety(calculateSociety(user?.seed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, user, players]);

  return {
    characters,
    society,
    error,
  };
}

export default useCoe5;
