'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPlayersFromBlob, setPlayersToBlob } from '@/app/actions/players';
import type { Draft } from '@/types/draft';
import { colors, Player, PlayerColor } from '@/types/player';
import Cookies from 'js-cookie';
import Pusher from 'pusher-js';
import { v4 as uuidv4 } from 'uuid';

interface useDraftProps {
  draft: Draft;
}

export function useDraft({ draft }: useDraftProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [user, setUser] = useState<Player | null>(null);

  const notifyPlayers = useCallback(
    async (newPlayers: Player[]) => {
      setUpdating(true);
      await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: draft.id,
          event: 'set-players',
          message: newPlayers,
        }),
      });
      setUpdating(false);
      setPlayersToBlob({
        draftId: draft.id,
        players: newPlayers,
      });
    },
    [draft.id]
  );

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
    setError(null);
    setLoading(false);
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

    // Init Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'eu',
    });

    const channel = pusher.subscribe(draft.id);
    channel.bind('set-players', function (data: { message: Player[] }) {
      setPlayers(data.message);
    });

    async function fetchPlayers() {
      try {
        const currentPlayers = await getPlayersFromBlob(draft.id);
        setPlayers(currentPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
        setPlayers([]);
      } finally {
        setLoading(false);
        setUpdating(false);
      }
    }

    fetchPlayers();
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
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
        const newPlayer: Player = {
          id: uuidv4(),
          name: data.name,
          password: data.password,
          color: colors.filter(
            (color) => !players.some((player) => player.color === color)
          )[0],
          banned: [],
          loser_banned: [],
          skipped: [],
          available: [],
          state: 'waiting',
          disabled: true,
        };
        await notifyPlayers([...players, newPlayer]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join draft');
      }
    },
    [players, notifyPlayers]
  );

  const handleLeave = useCallback(async () => {
    if (!user) {
      setError('User not joined');
      return;
    }
    try {
      const newPlayers = players.filter((player) => player.id !== user.id);
      await notifyPlayers(newPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave draft');
    } finally {
      setUser(null);
    }
  }, [user, players, notifyPlayers]);

  const handleSetColor = useCallback(
    async (data: { color: PlayerColor }) => {
      if (!user) {
        setError('User not joined');
        return;
      }
      try {
        const newPlayers = players.map((player) => {
          if (player.id === user.id) {
            return {
              ...player,
              color: data.color,
            };
          }
          return player;
        });
        await notifyPlayers(newPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set color');
      }
    },
    [user, players, notifyPlayers]
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
    updating,
    error,
    handleJoin,
    handleLeave,
    handleSetColor,
    handleStart,
    handleCharacterClick,
  };
}

export default useDraft;
