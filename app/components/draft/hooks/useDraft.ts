'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  addPlayer,
  getPlayers,
  removePlayer,
  updatePlayerColor,
} from '@/app/actions/players';
import type { Draft } from '@/types/draft';
import { Player, PlayerColor } from '@/types/player';
import Cookies from 'js-cookie';

interface useDraftProps {
  draft: Draft;
}

export function useDraft({ draft }: useDraftProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [user, setUser] = useState<Player | null>(null);

  const getCurrentUser = useCallback(() => {
    const name = Cookies.get('user_name');
    const password = Cookies.get('user_password');
    if (name && password) {
      return { name, password };
    }
    return null;
  }, []);

  const setCurrentUser = useCallback((player: Player) => {
    // Save name and password to cookies
    Cookies.set('user_name', player.name, { expires: 30 }); // Expires in 7 days
    Cookies.set('user_password', player.password, { expires: 30 }); // Expires in 7 days
    setUser(player);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const potentialUser = players.find(
        (player) => player.name === currentUser.name
      );
      if (potentialUser && potentialUser.password == currentUser.password) {
        setCurrentUser(potentialUser);
        return;
      }
    }
    setUser(null);
  }, [players, setCurrentUser, getCurrentUser]);

  // Fetch all drafts
  useEffect(() => {
    setLoading(true);
    setError(null);

    async function fetchPlayers() {
      try {
        const currentPlayers = await getPlayers(draft.id);
        setPlayers(currentPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [draft.id]);

  const handleJoin = useCallback(
    async (data: { name: string; password: string }) => {
      Cookies.set('user_name', data.name, { expires: 30 }); // Expires in 7 days
      Cookies.set('user_password', data.password, { expires: 30 }); // Expires in 7 days
      const potentialUser = players?.find(
        (player) => player.name === data.name
      );
      try {
        if (potentialUser) {
          if (potentialUser.password !== data.password) {
            setError('Incorrect password');
            return;
          }
          setUser(potentialUser);
          return;
        }
        const { success, error, players } = await addPlayer({
          draftId: draft.id,
          name: data.name,
          password: data.password,
          color: 'white',
        });
        if (!success) {
          setError(error || 'Failed to add player');
          return;
        }
        if (players) {
          setPlayers(players);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    },
    [players, draft.id]
  );

  const handleLeave = useCallback(
    async (data: { playerId: string }) => {
      try {
        const { success, error, players } = await removePlayer({
          draftId: draft.id,
          playerId: data.playerId,
          password: user?.password || '',
        });
        if (!success) {
          setError(error || 'Failed to remove player');
          return;
        }
        if (players) {
          setPlayers(players);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    },
    [user, draft.id]
  );

  const handleSetColor = useCallback(
    async (data: { playerId: string; color: PlayerColor }) => {
      try {
        const { success, error, players } = await updatePlayerColor({
          draftId: draft.id,
          playerId: data.playerId,
          password: user?.password || '',
          color: data.color,
        });
        if (!success) {
          setError(error || 'Failed to update player');
          return;
        }
        if (players) {
          setPlayers(players);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    },
    [user, draft.id]
  );

  const handleStart = useCallback(async (userId: string) => {}, []);

  const handleCharacterClick = useCallback(
    async (data: { userId: string; characterId: string }) => {},
    []
  );

  return {
    players,
    user,
    loading,
    error,
    handleJoin,
    handleLeave,
    handleSetColor,
    handleStart,
    handleCharacterClick,
  };
}

export default useDraft;
