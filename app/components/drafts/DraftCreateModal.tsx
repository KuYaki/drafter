'use client';

import { useState } from 'react';
import {
  Button,
  Form,
  Modal,
  Message,
  Dropdown,
  Segment,
} from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/lib/theme/ThemeContext';
import { GameId, gameIds } from '@/types/draft';

// Define the props interface for the component
interface DraftCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    password: string;
    game_id: GameId;
    params: {
      random: number;
      bans: number;
      loser_bans: number;
      repick: number;
    };
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function DraftCreateModal({
  isOpen,
  onClose,
  onCreate,
}: DraftCreateModalProps) {
  // Get translations
  const t = useTranslations('drafts');
  const tg = useTranslations('games');
  const { isDark } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    game_id: 'coe5' as GameId,
    params: {
      random: 0,
      bans: 0,
      loser_bans: 0,
      repick: 0,
    },
  });

  // Form status
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle dropdown changes
  const handleGameChange = (_e: React.SyntheticEvent, data: any) => {
    setFormData({
      ...formData,
      game_id: data.value as GameId,
    });
  };

  // Handle param changes
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      params: {
        ...formData.params,
        [name]: parseInt(value) || 0,
      },
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const result = await onCreate(formData);

      if (result.success) {
        setFormSuccess(t('draftCreated'));
        setFormData({
          name: '',
          password: '',
          game_id: 'coe5' as GameId,
          params: {
            random: 0,
            bans: 0,
            loser_bans: 0,
            repick: 0,
          },
        });
        // Close modal after successful creation
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFormError(result.error || t('createError'));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate game options for dropdown
  const gameOptions = gameIds.map((id) => ({
    key: id,
    text: tg(id),
    value: id,
  }));

  return (
    <Modal
      basic
      closeIcon
      open={isOpen}
      onClose={onClose}
      size="small"
      dimmer="blurring"
    >
      <Modal.Header>{t('createDraft')}</Modal.Header>
      <Modal.Content>
        <Segment inverted={isDark}>
          <Form
            inverted={isDark}
            onSubmit={handleSubmit}
            error={!!formError}
            success={!!formSuccess}
            loading={isSubmitting}
          >
            <Form.Input
              label={t('name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('enterName')}
              required
            />
            <Form.Input
              label={t('password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('enterPassword')}
              required
            />
            <Form.Field>
              <label>{t('game')}</label>
              <Dropdown
                fluid
                selection
                options={gameOptions}
                value={formData.game_id}
                onChange={handleGameChange}
              />
            </Form.Field>

            <Form.Group widths="equal">
              <Form.Input
                label={t('random')}
                name="random"
                type="number"
                min="0"
                max="10"
                value={formData.params.random}
                onChange={handleParamChange}
              />
              <Form.Input
                label={t('bans')}
                name="bans"
                type="number"
                min="0"
                max="10"
                value={formData.params.bans}
                onChange={handleParamChange}
              />
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Input
                label={t('loserBans')}
                name="loser_bans"
                type="number"
                min="0"
                max="10"
                value={formData.params.loser_bans}
                onChange={handleParamChange}
              />
              <Form.Input
                label={t('repick')}
                name="repick"
                type="number"
                min="0"
                max="10"
                value={formData.params.repick}
                onChange={handleParamChange}
              />
            </Form.Group>

            {formError && (
              <Message error>
                <Message.Header>{t('error')}</Message.Header>
                <p>{formError}</p>
              </Message>
            )}

            {formSuccess && (
              <Message success>
                <Message.Header>{t('success')}</Message.Header>
                <p>{formSuccess}</p>
              </Message>
            )}
          </Form>
        </Segment>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('cancel')}
        </Button>
        <Button
          primary
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('create')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
