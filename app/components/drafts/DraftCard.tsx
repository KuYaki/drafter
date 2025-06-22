'use client';

import {
  Card,
  Image,
  Button,
  Modal,
  Form,
  Message,
  Label,
  LabelDetail,
  Segment,
} from 'semantic-ui-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Draft } from '@/types/draft';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface DraftCardProps {
  draft: Draft;
  onDelete: (data: {
    id: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function DraftCard({ draft, onDelete }: DraftCardProps) {
  const t = useTranslations('drafts');
  const tc = useTranslations('common');
  const tg = useTranslations('games');
  const { isDark } = useTheme();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await onDelete({
        id: draft.id,
        password,
      });

      if (result.success) {
        setIsDeleteModalOpen(false);
        setPassword('');
      } else {
        setError(result.error || 'Failed to delete draft');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpen = () => {
    // If no password is required, navigate directly
    if (!draft.password) {
      router.push(`/draft/${draft.id}`);
      return;
    }

    // Check if we already have the password in cookies
    const savedPassword = Cookies.get(`draft_password`);
    if (savedPassword === draft.password) {
      router.push(`/draft/${draft.id}`);
      return;
    }

    // Otherwise show the password modal
    setIsOpenModalOpen(true);
  };

  const handleOpenWithPassword = () => {
    setError(null);

    try {
      // In a real app, you might want to verify the password on the server
      // For now, we'll just check if it matches the draft password
      if (password === draft.password) {
        // Save the password in cookies
        Cookies.set(`draft_password`, password, { expires: 30 }); // Expires in 7 days

        // Close modal and navigate to draft page
        setIsOpenModalOpen(false);
        setPassword('');
        router.push(`/draft/${draft.id}`);
      } else {
        setError(t('invalidPassword'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <>
      <Card style={{ overflow: 'hidden' }} as="a" fluid onClick={handleOpen}>
        <Image
          src={`/images/games/${draft.game_id}/header.jpg`}
          alt={tg(draft.game_id)}
        />
        <Card.Content>
          <Card.Header>{draft.name}</Card.Header>
          <Card.Meta>{tg(draft.game_id)}</Card.Meta>
          <Card.Description>
            {draft.params.random ? (
              <Label color="orange" style={{ margin: '0.2rem' }}>
                {t('random')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.random}
                </LabelDetail>
              </Label>
            ) : null}
            {draft.params.bans ? (
              <Label color="red" style={{ margin: '0.2rem' }}>
                {t('bans')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.bans}
                </LabelDetail>
              </Label>
            ) : null}
            {draft.params.loser_bans ? (
              <Label color="blue" style={{ margin: '0.2rem' }}>
                {t('loserBans')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.loser_bans}
                </LabelDetail>
              </Label>
            ) : null}
            {draft.params.loser_slots ? (
              <Label color="violet" style={{ margin: '0.2rem' }}>
                {t('loserSlots')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.loser_slots}
                </LabelDetail>
              </Label>
            ) : null}
            {draft.params.repick ? (
              <Label color="green" style={{ margin: '0.2rem' }}>
                {t('repick')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.repick}
                </LabelDetail>
              </Label>
            ) : null}
          </Card.Description>
        </Card.Content>
        <Card.Content style={{ padding: '0.2rem' }}>
          <div className="flex justify-between">
            <Button
              basic
              compact
              color="green"
              icon={draft.password ? 'lock' : 'lock open'}
              content={tc('open')}
            />
            <Button
              basic
              compact
              color="red"
              icon="trash"
              content={tc('delete')}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              style={{ margin: 0 }}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Delete Modal */}
      <Modal
        size="tiny"
        basic
        closeIcon
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dimmer="blurring"
      >
        <Modal.Header>{t('confirmDelete')}</Modal.Header>
        <Modal.Content>
          <Segment inverted={isDark} style={{ overflow: 'hidden' }}>
            <p style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {t('deleteWarning', { name: draft.name })}
            </p>
            <Form>
              <Form.Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                error={!!error}
              />
              {error && <Message negative content={error} />}
            </Form>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button inverted={isDark} onClick={() => setIsDeleteModalOpen(false)}>
            {tc('cancel')}
          </Button>
          <Button
            negative
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {tc('confirm')}
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Open Draft Modal */}
      <Modal
        size="tiny"
        basic
        closeIcon
        open={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        dimmer="blurring"
      >
        <Modal.Header>{tc('open')}</Modal.Header>
        <Modal.Content>
          <Segment inverted={isDark}>
            <p style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {t('passwordRequired')}
            </p>
            <Form>
              <Form.Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                error={!!error}
              />
              {error && <Message negative content={error} />}
            </Form>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button inverted={isDark} onClick={() => setIsOpenModalOpen(false)}>
            {tc('cancel')}
          </Button>
          <Button positive onClick={handleOpenWithPassword}>
            {tc('confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
