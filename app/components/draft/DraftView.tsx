'use client';

import { Draft } from '@/types/draft';
import DraftViewCoe5 from './DraftViewCoe5';
import DraftViewCiv6 from './DraftViewCiv6';

interface DraftViewProps {
  draft: Draft;
}

export default function DraftView({ draft }: DraftViewProps) {
  if (draft.game_id === 'coe5') return <DraftViewCoe5 draft={draft} />;
  if (draft.game_id === 'civ6') return <DraftViewCiv6 draft={draft} />;
}
