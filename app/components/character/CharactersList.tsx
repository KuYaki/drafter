'use client';

import { Message } from 'semantic-ui-react';
import CharacterCard from './CharacterCard';
import type { Character, CharacterId } from '@/types/character';
import CardGroup from '@/app/components/shared/ui/CardGroup';
import type { GameId } from '@/types/draft';
import type { Player } from '@/types/player';

interface CharactersListProps {
  characters: Character[];
  gameId: GameId;
  user: Player | null;
  error: string | null;
  onClick: (characterId: CharacterId) => void;
}

export default function CharactersList({
  characters,
  gameId,
  user,
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
          user={user}
          onClick={onClick}
        />
      ))}
    </CardGroup>
  );
}
