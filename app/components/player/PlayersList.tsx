'use client';

import {
  Button,
  Form,
  Header,
  Loader,
  Message,
  Modal,
  Segment,
} from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import PlayerCard from './PlayerCard';
import type { Player, PlayerColor } from '@/types/player';
import CardGroup from '@/app/components/shared/ui/CardGroup';
import type { GameId } from '@/types/draft';
import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import Cookies from 'js-cookie';

interface PlayersListProps {
  players: Player[];
  gameId: GameId;
  userId?: string | null;
  draftName?: string;
  loading: boolean;
  updating: boolean;
  error: string | null;
  onColorChange: (params: {
    playerId: string;
    color: PlayerColor;
  }) => Promise<void>;
  onJoin: (params: { name: string; password: string }) => Promise<void>;
  onLeave: () => Promise<void>;
}

export default function PlayersList({
  players,
  gameId,
  userId,
  draftName,
  loading,
  updating,
  error,
  onColorChange,
  onJoin,
  onLeave,
}: PlayersListProps) {
  const t = useTranslations('players');
  const tc = useTranslations('common');
  const { isDark } = useTheme();
  const [name, setName] = useState(Cookies.get('user_name') || '');
  const [password, setPassword] = useState(Cookies.get('user_password') || '');
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openLeaveModal, setOpenLeaveModal] = useState(false);

  if (loading) {
    return (
      <Loader active inline="centered">
        {tc('loading')}
      </Loader>
    );
  }

  const joinable = userId ? false : true;

  return (
    <>
      <div className="flex items-center justify-between gap-[1rem] m-[1rem]">
        <Header inverted={isDark} style={{ margin: 0 }}>
          {t('players') + (draftName ? ' ' + draftName : '')}
        </Header>
        <Button
          content={joinable ? t('join') : t('leave')}
          disabled={
            updating ||
            (joinable &&
              players.length > 0 &&
              !players.some((player) => player.state === 'hosting'))
          }
          loading={updating}
          primary={joinable}
          basic={!joinable}
          inverted={isDark && !joinable}
          onClick={() =>
            joinable ? setOpenJoinModal(true) : setOpenLeaveModal(true)
          }
        />
      </div>
      {error && <Message negative content={error} />}
      <CardGroup
        itemsPerRow={5 as const}
        doubling
        stackable
        style={{ marginBottom: '0.5rem' }}
      >
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            userId={userId}
            gameId={gameId}
            onColorChange={onColorChange}
          />
        ))}
      </CardGroup>
      <Modal
        basic
        closeIcon
        size="tiny"
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        dimmer="blurring"
      >
        <Modal.Header>{t('join')}</Modal.Header>
        <Modal.Content>
          <Segment inverted={isDark}>
            <Header as="h4">{t('joinDescription')}</Header>
            <Form inverted={isDark}>
              <Form.Field>
                <input
                  value={name}
                  placeholder={t('enterName')}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Field>
              <Form.Field>
                <input
                  value={password}
                  placeholder={t('enterPassword')}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Field>
            </Form>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              setOpenJoinModal(false);
            }}
            inverted={isDark}
            content={tc('cancel')}
          />
          <Button
            onClick={() => {
              onJoin({ name, password });
              setOpenJoinModal(false);
            }}
            primary
            icon="sign in"
            content={t('join')}
          />
        </Modal.Actions>
      </Modal>
      <Modal
        basic
        closeIcon
        size="tiny"
        open={openLeaveModal}
        onClose={() => setOpenLeaveModal(false)}
        dimmer="blurring"
      >
        <Modal.Header>{t('leave')}</Modal.Header>
        <Modal.Content>
          <Message error>{t('leaveDescription')}</Message>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              setOpenLeaveModal(false);
            }}
            inverted={isDark}
            content={tc('cancel')}
          />
          <Button
            onClick={() => {
              userId && onLeave();
              setOpenLeaveModal(false);
            }}
            inverted={isDark}
            color="red"
            icon="sign out"
            labelPosition="right"
            content={t('leave')}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
}
