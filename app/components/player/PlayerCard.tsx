'use client';

import {
  Card,
  Image,
  Button,
  Label,
  LabelDetail,
  Dropdown,
  Icon,
  Popup,
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
  const t = useTranslations('characters');
  const tc = useTranslations('common.color');
  const tp = useTranslations('players');

  const handleColorChange = (value: PlayerColor) => {
    onColorChange({ playerId: player.id, color: value });
  };
  
  const scrollToCharacter = (characterId: string) => {
    const element = document.getElementById(`character-${characterId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const editable = player.id === userId;

  const showDescription =
    player.banned.length > 0 ||
    player.available.length > 0 ||
    player.skipped.length > 0 ||
    player.loser_banned.length > 0 ||
    player.loser_slots > 0;

  return (
    <>
      <Card
        disabled={player.disabled}
        style={{
          overflow: 'hidden',
          opacity: player.disabled ? 0.6 : 1,
        }}
        link={editable}
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
              ? `/images/games/${gameId}/chars/${player.locked.id}.webp`
              : `/images/games/${gameId}/chars/default.webp`
          }
          alt={
            player.locked
              ? t(`${gameId}.${player.locked.id}`)
              : t('common.random')
          }
          style={{
            objectFit: 'contain',
            height: '10rem',
            backgroundColor: 'var(--background)',
          }}
        />
        <Card.Content style={{ paddingTop: '0.3rem', paddingBottom: '0.3rem' }}>
          <Card.Header>
            {player.locked
              ? t(`${gameId}.${player.locked.id}`)
              : t('common.random')}
          </Card.Header>
          <Card.Meta style={{ paddingTop: '0.3rem' }}>
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
              {player.banned.length > 0 ? (
                <div>
                  {tp('banned')}:
                  {player.banned.map((character) => {
                    return (
                      <Label
                        key={character}
                        color="red"
                        style={{ margin: '0.2rem', cursor: 'pointer' }}
                        onClick={() => scrollToCharacter(character)}
                      >
                        {t(`${gameId}.${character}`)}
                      </Label>
                    );
                  })}
                </div>
              ) : null}
              {player.available.length > 0 ? (
                <div>
                  {tp('available')}:
                  {player.available.map((character) => {
                    return (
                      <Label
                        key={character}
                        color="orange"
                        style={{ margin: '0.2rem', cursor: 'pointer' }}
                        onClick={() => scrollToCharacter(character)}
                      >
                        {t(`${gameId}.${character}`)}
                      </Label>
                    );
                  })}
                </div>
              ) : null}
              {player.skipped.length > 0 ? (
                <div>
                  {tp('skipped')}:
                  {player.skipped.map((character) => {
                    return (
                      <Label
                        key={character.id}
                        color="blue"
                        style={{ margin: '0.2rem', cursor: 'pointer' }}
                        onClick={() => scrollToCharacter(character.id)}
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
                </div>
              ) : null}
              {player.loser_banned.length > 0 || player.loser_slots > 0 ? (
                <div>
                  {tp('loserBanned')}
                  {player.loser_slots > 0 ? (
                    <Popup
                      content={tp('loserSlots') + ': ' + player.loser_slots}
                      position="top center"
                      trigger={
                        <Button
                          compact
                          content={'✯ ' + player.loser_slots}
                          basic
                          color="violet"
                          style={{
                            marginRight: '0.1rem',
                            marginLeft: '0.3rem',
                            padding: '0.3rem 0.5rem',
                          }}
                        />
                      }
                    />
                  ) : null}
                  {player.loser_banned.length > 0 ? ':' : null}
                  {player.loser_banned.map((character) => {
                    return (
                      <Label
                        key={character.id}
                        color="brown"
                        style={{ margin: '0.2rem', cursor: 'pointer' }}
                        onClick={() => scrollToCharacter(character.id)}
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
                </div>
              ) : null}
            </Card.Description>
          )}
        </Card.Content>
      </Card>
    </>
  );
}
