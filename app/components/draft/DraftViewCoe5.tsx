'use client';

import { Button, Container, Divider, Header } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Draft } from '@/types/draft';
import CharactersList from '@/app/components/character/CharactersList';
import { useCoe5 } from '@/app/components/draft/hooks/useCoe5';
import { useDraft } from '@/app/components/draft/hooks/useDraft';
import PlayersList from '@/app/components/player/PlayersList';
import { CharacterId } from '@/types/character';

interface DraftViewCoe5Props {
  draft: Draft;
}

export default function DraftViewCoe5({ draft }: DraftViewCoe5Props) {
  const tc = useTranslations('characters.common');
  const { isDark } = useTheme();
  const {
    players,
    user,
    loading,
    updating,
    error: playersError,
    handleJoin,
    handleLeave,
    handleSetColor,
    handleStart,
    handleBan,
    handlePick,
    handleSkip,
    handleLose,
  } = useDraft({ draft });
  const { characters, error: characterError } = useCoe5({
    players,
    user,
    draft,
  });

  const handleCharacterClick = (characterId: CharacterId) => {
    if (user?.state === 'choosing') {
      handlePick({ characterId });
    } else if (user?.state === 'banning') {
      handleBan({
        characterId,
        characterIds: characters.map((c) => c.id),
      });
    }
  };

  return (
    <Container>
      <PlayersList
        players={players}
        gameId={draft.game_id}
        userId={user?.id}
        draftName={draft.name}
        loading={loading}
        updating={updating}
        error={playersError}
        onColorChange={handleSetColor}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />
      <Divider />
      <div className="flex justify-between items-center gap-[1rem] m-[1rem]">
        <Header inverted={isDark} style={{ margin: 0 }}>
          {tc('characters')}
        </Header>
        {players?.some((player) => player.state === 'hosting') && (
          <Button
            onClick={() =>
              user?.state === 'hosting' &&
              handleStart(characters.map((c) => c.id))
            }
            disabled={user?.state !== 'hosting'}
            content={tc('start')}
            color="green"
          />
        )}
        {players?.some((player) => player.state === 'choosing') && (
          <Button
            onClick={() => user?.state === 'choosing' && handleSkip()}
            disabled={user?.state !== 'choosing'}
            content={tc('skip')}
            color="blue"
          />
        )}
        {players?.some((player) => player.state === 'playing') && (
          <Button
            onClick={() => user?.state === 'playing' && handleLose()}
            disabled={user?.state !== 'playing'}
            content={tc('lose')}
            color="red"
          />
        )}
      </div>

      <CharactersList
        characters={characters}
        gameId={draft.game_id}
        userId={user?.id}
        error={characterError}
        onClick={handleCharacterClick}
      />
    </Container>
  );
}
