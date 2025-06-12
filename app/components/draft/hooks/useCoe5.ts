'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { Character, characterIdsCoe5 } from '@/types/character';
import { Draft } from '@/types/draft';

interface useDraftProps {
  players: Player[];
  user: Player | null;
  draft: Draft;
}

export function useCoe5({ players, user, draft }: useDraftProps) {
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

  useEffect(() => {
    const updatedCharacters = characters.map((character) => {
      const locked_by = players.find(
        (player) => player.locked === character.id
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
          amount: player.loser_banned.find(
            (loser_banned) => loser_banned.id === character.id
          )?.amount,
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
        user_looser_banned !== undefined ||
        banned_by !== undefined ||
        (locked_by !== undefined && locked_by.id !== user.id) ||
        (draft.params.repick > 0 &&
          was_locked_by.reduce((sum, item) => sum + (item.amount || 0), 0) >
            draft.params.repick) ||
        (draft.params.random > 0 &&
          !available_for.some((player) => player.id === user.id));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  return {
    characters,
    error,
  };
}

export default useCoe5;
