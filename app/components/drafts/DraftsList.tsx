'use client';

import { Message, Loader } from 'semantic-ui-react';
import { useTranslations } from 'next-intl';
import DraftCard from './DraftCard';
import type { Draft } from '@/types/draft';
import CardGroup from '@/app/components/shared/ui/CardGroup';

interface DraftsListProps {
  drafts: Draft[];
  loading: boolean;
  error: string | null;
  onDeleteDraft: (params: {
    id: string;
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
  const tc = useTranslations('common');

  if (loading) {
    return (
      <Loader active inline="centered">
        {tc('loading')}
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
    <CardGroup itemsPerRow={4 as const} doubling stackable>
      {drafts.map((draft) => (
        <DraftCard key={draft.id} draft={draft} onDelete={onDeleteDraft} />
      ))}
    </CardGroup>
  );
}
