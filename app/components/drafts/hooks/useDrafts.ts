'use client';

import { useState, useEffect, useCallback } from 'react';
import { createDraft, deleteDraft, getDrafts } from '@/app/actions/draft';
import type { Draft, DraftParams, GameId } from '@/types/draft';

interface useDraftsProps {
  sortBy: 'created_at' | 'updated_at';
}

export function useDrafts({ sortBy }: useDraftsProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all drafts
  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDrafts({ sortBy });

      if (result.success) {
        setDrafts(result.drafts);
      } else {
        setError(result.error || 'Unknown error');
        setDrafts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new draft
  const handleCreateDraft = useCallback(
    async (data: {
      name: string;
      password: string;
      game_id: GameId;
      params: DraftParams;
    }) => {
      try {
        const result = await createDraft(data);

        if (result.success) {
          // Refresh drafts list
          fetchDrafts();
          return { success: true };
        }

        return { success: false, error: result.error };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create draft',
        };
      }
    },
    [fetchDrafts]
  );

  // Delete a draft
  const handleDeleteDraft = useCallback(
    async (data: { name: string; password: string }) => {
      try {
        const result = await deleteDraft(data);

        if (result.success) {
          // Refresh drafts list
          fetchDrafts();
          return { success: true };
        }

        return { success: false, error: result.error };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete draft',
        };
      }
    },
    [fetchDrafts]
  );

  // Load drafts on initial render
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  return {
    drafts,
    loading,
    error,
    createDraft: handleCreateDraft,
    deleteDraft: handleDeleteDraft,
    refreshDrafts: fetchDrafts,
  };
}

export default useDrafts;
