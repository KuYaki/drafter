'use client';

import { Card, Image, Button, Label, LabelDetail } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import type { Character, CharacterId } from '@/types/character';
import type { GameId } from '@/types/draft';

interface CharacterCardProps {
  character: Character;
  gameId: GameId;
  userId?: string | null;
  disabled?: boolean;
  onClick: (characterId: CharacterId) => void;
}

export default function CharacterCard({
  character,
  gameId,
  userId,
  disabled,
  onClick,
}: CharacterCardProps) {
  const t = useTranslations('characters');
  const tc = useTranslations('characters.common');

  const handleClick = async () => {
    userId && onClick(character.id);
  };

  const userLooserBanned = character.loser_banned_for.find(
    (player) => player.id === userId
  );

  const meta = character.locked_by
    ? tc('lockedBy', { player: character.locked_by.name })
    : character.available_for.length > 0
    ? tc('availableFor', { players: character.available_for.join(', ') })
    : character.banned_by
    ? tc('bannedBy', { player: character.banned_by.name })
    : userLooserBanned
    ? tc('loserBannedForYou', { count: userLooserBanned.amount as number })
    : null;

  const showMeta =
    character.locked_by ||
    character.available_for.length > 0 ||
    character.banned_by ||
    character.loser_banned_for.some((player) => player.id === userId);

  const showDescription =
    character.was_locked_by || character.loser_banned_for.length > 0;

  return (
    <>
      <Card
        disabled={disabled}
        style={{ overflow: 'hidden', opacity: disabled ? 0.8 : 1 }}
        as={disabled ? undefined : 'a'}
        fluid
        onClick={handleClick}
      >
        <Image
          src={`/images/games/${gameId}/chars/${character.id}.webp`}
          alt={t(`${gameId}.${character.id}`)}
          style={{
            objectFit: 'contain',
            height: '7rem',
            backgroundColor: 'var(--background)',
          }}
        />
        <Card.Content>
          <Card.Header>{t(`${gameId}.${character.id}`)}</Card.Header>
          {showMeta && (
            <Card.Meta>
              <Button
                disabled
                compact
                content={meta}
                basic
                color={
                  character.locked_by
                    ? 'green'
                    : character.banned_by
                    ? 'red'
                    : userLooserBanned
                    ? 'orange'
                    : 'blue'
                }
              />
            </Card.Meta>
          )}
          {showDescription && (
            <Card.Description>
              {character.loser_banned_for ? (
                <>
                  {tc('loserBannedFor')}:
                  {character.loser_banned_for.map((player) => {
                    return (
                      <Label
                        key={player.id}
                        color="red"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(player.name)}
                        {player.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + player.amount}
                          </LabelDetail>
                        )}
                      </Label>
                    );
                  })}
                </>
              ) : null}
              {character.was_locked_by ? (
                <>
                  {tc('wasLockedBy')}:
                  {character.was_locked_by.map((player) => {
                    return (
                      <Label
                        key={player.id}
                        color="red"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(player.name)}
                        {player.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + player.amount}
                          </LabelDetail>
                        )}
                      </Label>
                    );
                  })}
                </>
              ) : null}
            </Card.Description>
          )}
        </Card.Content>
      </Card>
    </>
  );
}
