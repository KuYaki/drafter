'use client';

import { Button, Container, Divider, Header } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Draft } from '@/types/draft';
import CharactersList from '@/app/components/character/CharactersList';
import { useCoe5 } from '@/app/components/draft/hooks/useCoe5';
import { useDraft } from '@/app/components/draft/hooks/useDraft';
import PlayersList from '@/app/components/player/PlayersList';

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
    handleCharacterClick,
  } = useDraft({ draft });
  const { characters, error: characterError } = useCoe5({
    players,
    user,
    draft,
  });

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
        <Button
          onClick={() => user?.id && handleStart(user.id)}
          disabled={!user}
          content={tc('start')}
          color="green"
        />
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
