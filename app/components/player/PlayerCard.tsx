'use client';

import {
  Card,
  Image,
  Button,
  Label,
  LabelDetail,
  Dropdown,
  Icon,
} from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import { colors, PlayerColor, type Player } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  userId?: string | null;
  gameId: string;
  onColorChange: (params: {
    playerId: string;
    color: PlayerColor;
  }) => Promise<void>;
}

export default function PlayerCard({
  player,
  userId,
  gameId,
  onColorChange,
}: PlayerCardProps) {
  const t = useTranslations('characters.common');
  const tc = useTranslations('common.color');
  const tp = useTranslations('players');

  const handleColorChange = (value: PlayerColor) => {
    onColorChange({ playerId: player.id, color: value });
  };

  const editable = player.id === userId;

  const showDescription =
    player.banned.length > 0 ||
    player.available.length > 0 ||
    player.skipped.length > 0 ||
    player.loser_banned.length > 0;

  return (
    <>
      <Card
        disabled={player.disabled}
        style={{ overflow: 'hidden' }}
        as="a"
        fluid
      >
        {editable ? (
          <Dropdown
            disabled={!editable}
            trigger={
              <Button
                icon
                color={player.color === 'white' ? undefined : player.color}
                fluid
                style={{
                  borderRadius: 0,
                }}
              >
                <div className="flex items-center justify-between gap-[0.5rem]">
                  {player.name}
                  {editable && (
                    <Icon
                      fitted
                      name="angle down"
                      style={{ paddingLeft: '0.2rem' }}
                    />
                  )}
                </div>
              </Button>
            }
            value={player.color}
            style={{ backgroundColor: 'transparent', padding: 0, margin: 0 }}
            icon={null}
            floating
            scrolling
            button
            options={colors.map((color) => ({
              key: color,
              value: color,
              label: {
                color,
                circular: true,
                content: tc(color),
              },
            }))}
            onChange={(_, data) => {
              if (editable) {
                handleColorChange(data.value as PlayerColor);
              }
            }}
          />
        ) : (
          <Button
            icon
            color={player.color === 'white' ? undefined : player.color}
            fluid
          >
            <div className="flex items-center justify-left gap-[0.5rem]">
              {player.name}
            </div>
          </Button>
        )}
        <Image
          src={
            player.locked
              ? `/images/games/${gameId}/chars/${player.locked}.webp`
              : `/images/games/${gameId}/chars/default.webp`
          }
          alt={player.locked ? t(`${gameId}.${player.locked}`) : t('random')}
          style={{
            objectFit: 'contain',
            height: '10rem',
            backgroundColor: 'var(--background)',
          }}
        />
        <Card.Content>
          <Card.Header>
            {player.locked ? t(`${gameId}.${player.locked}`) : t('random')}
          </Card.Header>
          <Card.Meta>
            <Button
              disabled
              compact
              content={tp(player.state)}
              basic
              color={
                player.state === 'choosing'
                  ? 'orange'
                  : player.state === 'banning'
                  ? 'red'
                  : player.state === 'waiting'
                  ? 'grey'
                  : player.state === 'locked'
                  ? 'blue'
                  : 'green'
              }
            />
          </Card.Meta>
          {showDescription && (
            <Card.Description>
              {player.banned ? (
                <>
                  {tp('banned')}:
                  {player.banned.map((character) => {
                    return (
                      <Label
                        key={character}
                        color="red"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(`${gameId}.${character}`)}
                      </Label>
                    );
                  })}
                </>
              ) : null}
              {player.available ? (
                <>
                  {tp('available')}:
                  {player.available.map((character) => {
                    return (
                      <Label
                        key={character}
                        color="orange"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(`${gameId}.${character}`)}
                      </Label>
                    );
                  })}
                </>
              ) : null}
              {player.skipped ? (
                <>
                  {tp('skipped')}:
                  {player.skipped.map((character) => {
                    return (
                      <Label
                        key={character.id}
                        color="blue"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(`${gameId}.${character.id}`)}
                        {character.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + character.amount}
                          </LabelDetail>
                        )}
                      </Label>
                    );
                  })}
                </>
              ) : null}
              {player.loser_banned ? (
                <>
                  {tp('loserBanned')}:
                  {player.loser_banned.map((character) => {
                    return (
                      <Label
                        key={character.id}
                        color="brown"
                        style={{ margin: '0.2rem' }}
                      >
                        {t(`${gameId}.${character.id}`)}
                        {character.amount && (
                          <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                            {'✯ ' + character.amount}
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
