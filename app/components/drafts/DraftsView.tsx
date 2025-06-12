'use client';

import { useState } from 'react';
import { Container, Header, Button, Divider } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import DraftsList from './DraftsList';
import DraftCreateModal from './DraftCreateModal';
import { useDrafts } from './hooks/useDrafts';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function DraftsView() {
  const t = useTranslations('drafts');
  const { isDark } = useTheme();

  // Draft management hooks
  const { drafts, loading, error, createDraft, deleteDraft } = useDrafts({
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
      <div className="flex items-center justify-between gap-[1rem]">
        <Header inverted={isDark} as="h1" style={{ margin: 0 }}>
          {t('drafts')}
        </Header>
        <Button primary onClick={handleOpenCreateModal}>
          {t('createDraft')}
        </Button>
      </div>

      <Divider />
      <DraftsList
        drafts={drafts}
        loading={loading}
        error={error}
        onDeleteDraft={deleteDraft}
      />

      {/* Create Draft Modal */}
      <DraftCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={createDraft}
      />
    </Container>
  );
}
