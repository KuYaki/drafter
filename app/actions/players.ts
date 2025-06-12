'use server';

import {
  getPlayersFromBlobByDraftId,
  setPlayersToBlobByDraftId,
} from '@/lib/storage/blob-storage';
import { Player, PlayerColor } from '@/types/player';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get players for a draft
 */
export async function getPlayers(draftId: string): Promise<Player[]> {
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
export async function setPlayers(
  props: setPlayersProps
): Promise<{ success: boolean; error?: string }> {
  try {
    const saved = await setPlayersToBlobByDraftId(props.draftId, props.players);
    if (!saved) {
      return { success: false, error: 'Failed to save players' };
    }

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

// Input validation schemas
interface addPlayerProps {
  draftId: string;
  name: string;
  password: string;
  color: PlayerColor;
}

export async function addPlayer(
  props: addPlayerProps
): Promise<{ success: boolean; error?: string; players?: Player[] }> {
  try {
    const players = await getPlayersFromBlobByDraftId(props.draftId);
    if (!players) {
      return { success: false, error: 'Failed to get players' };
    }

    const potentialUser = players.find((player) => player.name === props.name);
    if (potentialUser) {
      if (potentialUser.password !== props.password) {
        return { success: false, error: 'Incorrect password' };
      }
      return { success: true, players };
    }

    players.push({
      id: uuidv4(),
      name: props.name,
      password: props.password,
      color: props.color,
      banned: [],
      loser_banned: [],
      skipped: [],
      available: [],
      state: 'waiting',
      disabled: true,
    });
    const saved = await setPlayersToBlobByDraftId(props.draftId, players);
    if (!saved) {
      return { success: false, error: 'Failed to save players' };
    }

    return { success: true, players };
  } catch (error) {
    console.error('Error adding player:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error adding player',
    };
  }
}

interface removePlayerProps {
  draftId: string;
  playerId: string;
  password: string;
}

export async function removePlayer(
  props: removePlayerProps
): Promise<{ success: boolean; error?: string; players?: Player[] }> {
  try {
    const players = await getPlayersFromBlobByDraftId(props.draftId);
    if (!players) {
      return { success: false, error: 'Failed to get players' };
    }

    const player = players.find((player) => player.id === props.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    if (player.password !== props.password) {
      return { success: false, error: 'Invalid password' };
    }

    const updatedPlayers = players.filter(
      (player) => player.id !== props.playerId
    );
    const saved = await setPlayersToBlobByDraftId(
      props.draftId,
      updatedPlayers
    );
    if (!saved) {
      return { success: false, error: 'Failed to save players' };
    }

    return { success: true, players: updatedPlayers };
  } catch (error) {
    console.error('Error removing player:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error removing player',
    };
  }
}

interface updatePlayerColorProps {
  draftId: string;
  playerId: string;
  password: string;
  color: PlayerColor;
}

export async function updatePlayerColor(
  props: updatePlayerColorProps
): Promise<{ success: boolean; error?: string; players?: Player[] }> {
  try {
    const players = await getPlayersFromBlobByDraftId(props.draftId);
    if (!players) {
      return { success: false, error: 'Failed to get players' };
    }

    const player = players.find((player) => player.id === props.playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    if (player.password !== props.password) {
      return { success: false, error: 'Invalid password' };
    }

    const updatedPlayers = players.map((player) => {
      if (player.id === props.playerId) {
        return {
          ...player,
          color: props.color,
        };
      }
      return player;
    });
    const saved = await setPlayersToBlobByDraftId(
      props.draftId,
      updatedPlayers
    );
    if (!saved) {
      return { success: false, error: 'Failed to save players' };
    }

    return { success: true, players: updatedPlayers };
  } catch (error) {
    console.error('Error updating player:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error updating player',
    };
  }
}
