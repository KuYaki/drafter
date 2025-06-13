'use client';

import { Message } from 'semantic-ui-react';
import CharacterCard from './CharacterCard';
import type { Character, CharacterId } from '@/types/character';
import CardGroup from '@/app/components/shared/ui/CardGroup';
import type { GameId } from '@/types/draft';

interface CharactersListProps {
  characters: Character[];
  gameId: GameId;
  userId?: string | null;
  error: string | null;
  onClick: (characterId: CharacterId) => void;
}

export default function CharactersList({
  characters,
  gameId,
  userId,
  error,
  onClick,
}: CharactersListProps) {
  if (error) {
    return <Message negative content={error} />;
  }

  return (
    <CardGroup itemsPerRow={4 as const} doubling stackable>
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          gameId={gameId}
          userId={userId}
          onClick={onClick}
        />
      ))}
    </CardGroup>
  );
}
