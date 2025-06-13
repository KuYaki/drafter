'use server';

import {
  getPlayersFromBlobByDraftId,
  setPlayersToBlobByDraftId,
} from '@/lib/storage/blob-storage';
import { Player } from '@/types/player';
import { revalidatePath } from 'next/cache';

/**
 * Get players for a draft
 */
export async function getPlayersFromBlob(draftId: string): Promise<Player[]> {
  try {
    const result = await getPlayersFromBlobByDraftId(draftId);
    if (!result) {
      return [];
    }
    return result;
  } catch (error) {
    console.error('Error getting players by draft ID:', error);
    return [];
  }
}

interface setPlayersProps {
  draftId: string;
  players: Player[];
}

/**
 * Set players for a draft
 */
export async function setPlayersToBlob(
  props: setPlayersProps
): Promise<{ success: boolean; error?: string }> {
  try {
    const saved = await setPlayersToBlobByDraftId(props.draftId, props.players);
    if (!saved) {
      return { success: false, error: 'Failed to save players' };
    }

    revalidatePath('/drafts/' + props.draftId);

    return { success: true };
  } catch (error) {
    console.error('Error setting players:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error setting players',
    };
  }
}
