'use client';

import { useState, useEffect } from 'react';
import {
  Segment,
  Loader,
  Modal,
  Form,
  Button,
  Message,
} from 'semantic-ui-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { DIMENS } from '@/constants/dimens';
import { useParams } from 'next/navigation';
import DraftViewCoe5 from '@/app/components/draft/DraftViewCoe5';
import DraftViewCiv6 from '@/app/components/draft/DraftViewCiv6';
import { getDraftById } from '@/app/actions/draft';
import { Draft } from '@/types/draft';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import BackToTop from '@/app/components/shared/ui/BackToTop';

interface DraftLayoutProps {}

export default function DraftLayout({}: DraftLayoutProps) {
  const { isDark } = useTheme();
  const params = useParams();
  const draftId = params.id as string;
  const td = useTranslations('drafts');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function fetchDraft() {
      try {
        setLoading(true);
        // Use the server action instead of direct blob storage call
        const draftData = await getDraftById(draftId);
        setDraft(draftData);

        if (!draftData) {
          setError(`Draft with ID ${draftId} not found`);
          return;
        }

        // Check if password is required
        if (draftData.password) {
          // Check if we have the correct password in cookies
          const savedPassword = Cookies.get('draft_password');
          if (savedPassword === draftData.password) {
            setHasAccess(true);
          } else {
            // Show password modal
            setIsPasswordModalOpen(true);
          }
        } else {
          // No password required
          setHasAccess(true);
        }
      } catch (err) {
        console.error('Error fetching draft:', err);
        setError('Failed to load draft data');
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [draftId]);

  const handlePasswordSubmit = () => {
    if (draft && password === draft.password) {
      // Save password to cookies
      Cookies.set('draft_password', password, { expires: 30 }); // Expires in 7 days

      // Grant access and close modal
      setHasAccess(true);
      setIsPasswordModalOpen(false);
      setPassword('');
    } else {
      setPasswordError(td('invalidPassword'));
    }
  };

  return (
    <>
      <Segment
        inverted={isDark}
        style={{
          marginBottom: DIMENS.common.bottomSpacing,
        }}
      >
        {loading ? (
          <Loader active inline="centered">
            {tc('loading')}
          </Loader>
        ) : error ? (
          <div>Error: {error}</div>
        ) : draft && hasAccess ? (
          draft.game_id === 'coe5' ? (
            <DraftViewCoe5 draft={draft} />
          ) : (
            <DraftViewCiv6 draft={draft} />
          )
        ) : draft ? (
          <div>Waiting for password verification...</div>
        ) : (
          <div>Draft not found</div>
        )}
      </Segment>

      {/* Password Modal */}
      <Modal
        size="tiny"
        closeIcon
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        dimmer="blurring"
      >
        <Modal.Header>{tc('open')}</Modal.Header>
        <Modal.Content>
          <Segment inverted={isDark}>
            <p style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {td('passwordRequired')}
            </p>
            <Form>
              <Form.Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={td('enterPassword')}
                error={!!passwordError}
              />
              {passwordError && <Message negative content={passwordError} />}
            </Form>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button
            inverted={isDark}
            onClick={() => setIsPasswordModalOpen(false)}
          >
            {tc('cancel')}
          </Button>
          <Button positive onClick={handlePasswordSubmit}>
            {tc('confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
      <BackToTop threshold={400} />
    </>
  );
}
