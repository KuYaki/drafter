'use client';

import {
  Card,
  Image,
  Button,
  Label,
  LabelDetail,
  Modal,
  Header,
  Segment,
} from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import type { Character, CharacterId } from '@/types/character';
import type { GameId } from '@/types/draft';
import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Player } from '@/types/player';

interface CharacterCardProps {
  character: Character;
  gameId: GameId;
  user: Player | null;
  onClick: (characterId: CharacterId) => void;
}

export default function CharacterCard({
  character,
  gameId,
  user,
  onClick,
}: CharacterCardProps) {
  const t = useTranslations('characters');
  const tc = useTranslations('characters.common');
  const [openModal, setOpenModal] = useState(false);
  const { isDark } = useTheme();

  const handleClick = async () => {
    setOpenModal(true);
  };

  const handleModalConfirm = () => {
    user?.id && !character.disabled && onClick(character.id);
    setOpenModal(false);
  };

  const userLooserBanned = character.loser_banned_for.find(
    (player) => player.id === user?.id
  );

  const isBanning = user?.state === 'banning';

  const meta = character.locked_by
    ? tc('lockedBy', { player: character.locked_by.name })
    : character.available_for.length > 0
    ? tc('availableFor', {
        players: character.available_for
          .map((player) => player.name)
          .join(', '),
      })
    : character.banned_by
    ? tc('bannedBy', { player: character.banned_by.name })
    : userLooserBanned
    ? tc('loserBannedForYou', { count: userLooserBanned.amount as number })
    : null;

  const showMeta =
    character.locked_by ||
    character.available_for.length > 0 ||
    character.banned_by ||
    character.loser_banned_for.some((player) => player.id === user?.id);

  const showDescription =
    character.was_locked_by || character.loser_banned_for.length > 0;

  return (
    <>
      <Card
        disabled={character.disabled}
        style={{ overflow: 'hidden', opacity: character.disabled ? 0.6 : 1 }}
        link={character.disabled ? false : true}
        fluid
        onClick={character.disabled ? undefined : handleClick}
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
              {character.loser_banned_for.length > 0 ? (
                <div>
                  {tc('loserBannedFor')}:
                  {character.loser_banned_for.map((player) => {
                    return (
                      <Label
                        key={player.id}
                        color="red"
                        style={{ margin: '0.2rem' }}
                      >
                        {player.name}
                        {player.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + player.amount}
                          </LabelDetail>
                        )}
                      </Label>
                    );
                  })}
                </div>
              ) : null}
              {character.was_locked_by.length > 0 ? (
                <div>
                  {tc('wasLockedBy')}:
                  {character.was_locked_by.map((player) => {
                    return (
                      <Label
                        key={player.id}
                        color="red"
                        style={{ margin: '0.2rem' }}
                      >
                        {player.name}
                        {player.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + player.amount}
                          </LabelDetail>
                        )}
                      </Label>
                    );
                  })}
                </div>
              ) : null}
            </Card.Description>
          )}
        </Card.Content>
      </Card>
      <Modal
        basic
        closeIcon
        size="tiny"
        open={openModal}
        onClose={() => setOpenModal(false)}
        dimmer="blurring"
      >
        <Modal.Header>{isBanning ? tc('ban') : tc('pick')}</Modal.Header>
        <Modal.Content>
          <Segment inverted={isDark}>
            <Image
              src={`/images/games/${gameId}/chars/${character.id}.webp`}
              alt={t(`${gameId}.${character.id}`)}
              style={{
                objectFit: 'contain',
                height: '7rem',
                backgroundColor: 'var(--background)',
                width: '100%',
              }}
            />
            <Header as="h4">
              {isBanning
                ? tc('banHint', { character: t(`${gameId}.${character.id}`) })
                : tc('pickHint', { character: t(`${gameId}.${character.id}`) })}
            </Header>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              setOpenModal(false);
            }}
            inverted={isDark}
            content={tc('cancel')}
          />
          <Button
            onClick={() => {
              handleModalConfirm();
            }}
            inverted={isDark}
            color={isBanning ? 'red' : 'blue'}
            icon={isBanning ? 'ban' : 'unlock alternate'}
            labelPosition="right"
            content={isBanning ? tc('ban') : tc('pick')}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
}
