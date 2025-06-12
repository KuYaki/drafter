'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import type { Draft, DraftParams, GameId } from '@/types/draft';
import {
  saveDraftToBlob,
  deleteDraftFromBlob,
  getAllDraftsFromBlob,
  getDraftFromBlob,
} from '@/lib/storage/blob-storage';

/**
 * Get a draft by ID
 */
export async function getDraftById(id: string): Promise<Draft | null> {
  try {
    return await getDraftFromBlob(id);
  } catch (error) {
    console.error('Error getting draft by ID:', error);
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
    const id = uuidv4();

    // Create draft object with user-provided ID
    const draft: Draft = {
      id,
      name: props.name,
      password: props.password, // In a real app, password should be hashed
      game_id: props.game_id,
      params: props.params,
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Check if draft with this ID already exists
    const existingDraft = await getDraftById(id);
    if (existingDraft) {
      return { success: false, error: 'Draft with this ID already exists' };
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
  id: string;
  password: string;
}

/**
 * Deletes a draft by ID and password
 */
export async function deleteDraft(props: deleteDraftProps) {
  try {
    // Get draft by ID
    const draft = await getDraftById(props.id);

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Check password
    if (draft.password !== props.password) {
      return { success: false, error: 'Invalid password' };
    }

    // Delete draft from Blob Storage
    const deleted = await deleteDraftFromBlob(draft.id);
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
