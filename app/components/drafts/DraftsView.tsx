'use client';

import { useState } from 'react';
import {
  Container,
  Header,
  Segment,
  Button,
  Divider,
} from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import DraftsList from './DraftsList';
import DraftCreateModal from './DraftCreateModal';
import useDrafts from './hooks/useDrafts';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function DraftsView() {
  const t = useTranslations('drafts');
  const { isDark } = useTheme();
  
  // Draft management hooks
  const { drafts, loading, error, createDraft, deleteDraft } =
    useDrafts({
      sortBy: 'created_at',
    });
    
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Open create modal
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  // Close create modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <Container>
      <Segment
        padded
        color={isDark ? 'blue' : 'teal'}
        inverted={isDark}
      >
        <Header as="h2">{t('drafts')}</Header>
        <Button primary onClick={handleOpenCreateModal}>
          {t('createDraft')}
        </Button>
      </Segment>

      <Divider />

      <Segment
        padded
        color={isDark ? 'blue' : 'teal'}
        inverted={isDark}
      >
        <Header as="h2">{t('yourDrafts')}</Header>
        <DraftsList
          drafts={drafts}
          loading={loading}
          error={error}
          onDeleteDraft={deleteDraft}
        />
      </Segment>
      
      {/* Create Draft Modal */}
      <DraftCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={createDraft}
      />
    </Container>
  );
}
