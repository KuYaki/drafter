'use server';

import { revalidatePath } from 'next/cache';
import type { Draft, DraftParams, GameId } from '@/types/draft';
import {
  saveDraftToBlob,
  deleteDraftFromBlob,
  getAllDraftsFromBlob,
  getDraftFromBlob,
} from '@/lib/storage/blob-storage';

/**
 * Get a draft by name
 */
async function getDraftByName(name: string): Promise<Draft | null> {
  try {
    return await getDraftFromBlob(name);
  } catch (error) {
    console.error('Error getting draft by name:', error);
    return null;
  }
}

// Input validation schemas
interface createDraftProps {
  name: string;
  password: string;
  game_id: GameId;
  params: DraftParams;
}

/**
 * Creates a new draft
 */
export async function createDraft(props: createDraftProps) {
  try {
    const timestamp = Date.now();

    // Create draft object with user-provided ID
    const draft: Draft = {
      name: props.name,
      password: props.password, // In a real app, password should be hashed
      game_id: props.game_id,
      params: props.params,
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Check if draft with this name already exists
    const existingDraft = await getDraftByName(props.name);
    if (existingDraft) {
      return { success: false, error: 'Draft with this name already exists' };
    }

    // Save draft to Blob Storage
    const saved = await saveDraftToBlob(draft);
    if (!saved) {
      return { success: false, error: 'Failed to save draft' };
    }

    // Revalidate home page
    revalidatePath('/');

    return { success: true, draft };
  } catch (error) {
    console.error('Error creating draft:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error creating draft',
    };
  }
}

interface deleteDraftProps {
  name: string;
  password: string;
}

/**
 * Deletes a draft by name and password
 */
export async function deleteDraft(props: deleteDraftProps) {
  try {
    // Get draft by name
    const draft = await getDraftByName(props.name);

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Check password
    if (draft.password !== props.password) {
      return { success: false, error: 'Invalid password' };
    }

    // Delete draft from Blob Storage
    const deleted = await deleteDraftFromBlob(draft.name);
    if (!deleted) {
      return { success: false, error: 'Failed to delete draft' };
    }

    // Revalidate home page
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error deleting draft',
    };
  }
}

interface getDraftsProps {
  sortBy: 'created_at' | 'updated_at';
}

/**
 * Get all drafts
 */
export async function getDrafts(props: getDraftsProps) {
  try {
    // Get all drafts from Blob Storage
    const allDrafts = await getAllDraftsFromBlob();

    // Sort by the requested field (newest first)
    const drafts = allDrafts.sort((a, b) => b[props.sortBy] - a[props.sortBy]);

    return { success: true, drafts };
  } catch (error) {
    console.error('Error getting drafts:', error);
    return { success: false, error: 'Failed to get drafts', drafts: [] };
  }
}
