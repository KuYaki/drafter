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
  Icon,
} from 'semantic-ui-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Draft } from '@/types/draft';
import { useTheme } from '@/lib/theme/ThemeContext';

interface DraftCardProps {
  draft: Draft;
  onDelete: (data: {
    name: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function DraftCard({ draft, onDelete }: DraftCardProps) {
  const t = useTranslations('drafts');
  const tc = useTranslations('common');
  const tg = useTranslations('games');
  const { isDark } = useTheme();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await onDelete({
        name: draft.name,
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

  return (
    <>
      <Card style={{ overflow: 'hidden' }} as="a" fluid>
        <Image src={`/images/games/${draft.game_id}/header.jpg`} />
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
            {draft.params.loose_bans ? (
              <Label color="blue" style={{ margin: '0.2rem' }}>
                {t('loserBans')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.loose_bans}
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
        <Card.Content extra>
          <div className="flex items-center gap-[1rem]">
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
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {tc('delete')}
            </Button>
          </div>
        </Card.Content>
      </Card>

      <Modal
        size="tiny"
        className={isDark ? 'dark' : ''}
        closeIcon
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dimmer="blurring"
      >
        <Modal.Header>{t('confirmDelete')}</Modal.Header>
        <Modal.Content>
          <p style={{ color: 'black', marginBottom: '0.5rem' }}>
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
        </Modal.Content>
        <Modal.Actions>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsDeleteModalOpen(false)}>
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
          </div>
        </Modal.Actions>
      </Modal>
    </>
  );
}
