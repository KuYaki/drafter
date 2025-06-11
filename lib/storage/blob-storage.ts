import { put, del, list, head } from '@vercel/blob';
import type { Draft } from '@/types/draft';

const DRAFTS_BLOB_PREFIX = 'drafts/';

/**
 * Save a draft to Blob Storage
 * @param draft Draft to save
 */
export async function saveDraftToBlob(draft: Draft): Promise<boolean> {
  try {
    // Create a blob path for this draft
    const blobPath = `${DRAFTS_BLOB_PREFIX}${draft.name}.json`;

    // Save draft as JSON
    const blob = await put(blobPath, JSON.stringify(draft), {
      contentType: 'application/json',
      access: 'public', // or 'private' depending on security requirements
    });

    console.log(`Draft saved to blob: ${blob.url}`);
    return true;
  } catch (error) {
    console.error('Error saving draft to Blob Storage:', error);
    return false;
  }
}

/**
 * Delete a draft from Blob Storage
 * @param draftName Name of the draft to delete
 */
export async function deleteDraftFromBlob(draftName: string): Promise<boolean> {
  try {
    // Create blob path for this draft
    const blobPath = `${DRAFTS_BLOB_PREFIX}${draftName}.json`;

    // Delete the blob
    await del(blobPath);

    console.log(`Draft deleted: ${draftName}`);
    return true;
  } catch (error) {
    console.error('Error deleting draft from Blob Storage:', error);
    return false;
  }
}

/**
 * Get all drafts from Blob Storage
 */
export async function getAllDraftsFromBlob(): Promise<Draft[]> {
  try {
    // List all blobs with the drafts prefix
    const blobs = await list({ prefix: DRAFTS_BLOB_PREFIX });

    // Fetch each draft
    const draftsPromises = blobs.blobs.map(async (blob) => {
      try {
        // Fetch the blob content
        const response = await fetch(blob.url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch draft: ${response.status} ${response.statusText}`
          );
        }

        // Parse the JSON content
        const draft = await response.json();
        return draft as Draft;
      } catch (error) {
        console.error(`Error fetching draft from ${blob.url}:`, error);
        return null;
      }
    });

    // Wait for all drafts to be fetched
    const drafts = await Promise.all(draftsPromises);

    // Filter out any nulls from failed fetches
    return drafts.filter((draft): draft is Draft => draft !== null);
  } catch (error) {
    console.error('Error getting drafts from Blob Storage:', error);
    return [];
  }
}

/**
 * Get a specific draft from Blob Storage
 * @param draftName Name of the draft to get
 */
export async function getDraftFromBlob(
  draftName: string
): Promise<Draft | null> {
  try {
    // Create blob path for this draft
    const blobPath = `${DRAFTS_BLOB_PREFIX}${draftName}.json`;

    // Check if the blob exists
    try {
      await head(blobPath);
    } catch (error) {
      // Blob doesn't exist
      return null;
    }

    // Get the blob URL
    const { url } = await head(blobPath);

    // Fetch the blob content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch draft: ${response.status} ${response.statusText}`
      );
    }

    // Parse the JSON content
    const draft = await response.json();
    return draft as Draft;
  } catch (error) {
    console.error(`Error getting draft ${draftName} from Blob Storage:`, error);
    return null;
  }
}
