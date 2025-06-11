'use client';

import {
  Card,
  Button,
  Modal,
  Form,
  Message,
  Label,
  LabelDetail,
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
      <Card fluid color={isDark ? 'blue' : 'teal'}>
        <Card.Content>
          <Card.Header>{draft.name}</Card.Header>
          <Card.Meta>{tg(draft.game_id)}</Card.Meta>
          <Card.Description>
            {draft.params.random && (
              <Label color="yellow">
                {t('random')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.random}
                </LabelDetail>
              </Label>
            )}
            {draft.params.bans && (
              <Label color="red">
                {t('bans')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.bans}
                </LabelDetail>
              </Label>
            )}
            {draft.params.loose_bans && (
              <Label color="blue">
                {t('looseBans')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.loose_bans}
                </LabelDetail>
              </Label>
            )}
            {draft.params.repick && (
              <Label color="green">
                {t('repick')}
                <LabelDetail style={{ whiteSpace: 'nowrap' }}>
                  {'✯ ' + draft.params.repick}
                </LabelDetail>
              </Label>
            )}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <div className="ui two buttons">
            <Button basic color="green">
              {tc('open')}
            </Button>
            <Button
              basic
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
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dimmer="blurring"
      >
        <Modal.Header>{t('confirmDelete')}</Modal.Header>
        <Modal.Content>
          <p>{t('deleteWarning', { name: draft.name })}</p>
          <Form>
            <Form.Input
              label={t('password')}
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
          <Button negative onClick={() => setIsDeleteModalOpen(false)}>
            {tc('cancel')}
          </Button>
          <Button
            positive
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting || !password}
          >
            {tc('confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
