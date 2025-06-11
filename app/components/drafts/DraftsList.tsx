'use client';

import { Card, Message, Loader } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import DraftCard from './DraftCard';
import type { Draft } from '@/types/draft';

interface DraftsListProps {
  drafts: Draft[];
  loading: boolean;
  error: string | null;
  onDeleteDraft: (params: {
    name: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function DraftsList({
  drafts,
  loading,
  error,
  onDeleteDraft,
}: DraftsListProps) {
  const t = useTranslations('drafts');

  if (loading) {
    return (
      <Loader active inline="centered">
        {t('loading')}
      </Loader>
    );
  }

  if (error) {
    return <Message negative content={error} />;
  }

  if (drafts.length === 0) {
    return <Message info content={t('noDrafts')} />;
  }

  return (
    <Card.Group stackable>
      {drafts.map((draft) => (
        <DraftCard key={draft.name} draft={draft} onDelete={onDeleteDraft} />
      ))}
    </Card.Group>
  );
}
