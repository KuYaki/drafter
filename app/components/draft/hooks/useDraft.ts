'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPlayersFromBlob, setPlayersToBlob } from '@/app/actions/players';
import type { Draft } from '@/types/draft';
import { colors, Player, PlayerColor } from '@/types/player';
import Cookies from 'js-cookie';
import Pusher from 'pusher-js';
import { v4 as uuidv4 } from 'uuid';
import { CharacterId } from '@/types/character';

export function useDraft(draft: Draft) {
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
          message: {
            old: players,
            new: newPlayers,
          },
        }),
      });
      setUpdating(false);
      setPlayersToBlob({
        draftId: draft.id,
        players: newPlayers,
      });
    },
    [draft.id, players]
  );

  const mergePlayers = useCallback(
    (oldPlayers: Player[], currentPlayers: Player[], newPlayers: Player[]) => {
      // Create maps for faster lookups
      const oldPlayersMap = new Map(oldPlayers.map((p) => [p.id, p]));
      const newPlayersMap = new Map(newPlayers.map((p) => [p.id, p]));
      const oldPlayersPositions = new Map(
        oldPlayers.map((p, index) => [p.id, index])
      );
      const shiftIndex = new Map(
        newPlayers.map((p, index) => [
          p.id,
          (oldPlayersPositions.get(p.id) ?? index) - index,
        ])
      );

      // Find added, modified, and deleted players
      const addedPlayers: [string, string[]][] = newPlayers
        .map((p, index): [string, string[]] => [
          p.id,
          newPlayers.slice(index, newPlayers.length).map((p) => p.id),
        ])
        .filter(([id]) => !oldPlayersMap.has(id));
      const modifiedPlayerIds = new Set(
        newPlayers
          .filter(
            (player) =>
              oldPlayersMap.has(player.id) &&
              JSON.stringify(oldPlayersMap.get(player.id)) !==
                JSON.stringify(player)
          )
          .map((p) => p.id)
      );
      const deletedPlayerIds = new Set(
        oldPlayers
          .filter((player) => !newPlayersMap.has(player.id))
          .map((p) => p.id)
      );

      // Start with current players that haven't been deleted
      let result = currentPlayers.filter((p) => !deletedPlayerIds.has(p.id));

      // Update modified players
      result = result.map((player) => {
        if (modifiedPlayerIds.has(player.id)) {
          const oldPlayer = oldPlayersMap.get(player.id);
          const newPlayer = newPlayersMap.get(player.id)!;

          // Create a new player object with only the modified fields
          const updatedPlayer = { ...player };

          // Compare each field and update only those that changed
          Object.keys(newPlayer).forEach((key) => {
            const typedKey = key as keyof Player;
            if (
              JSON.stringify(oldPlayer?.[typedKey]) !==
              JSON.stringify(newPlayer[typedKey])
            ) {
              (updatedPlayer as any)[typedKey] = newPlayer[typedKey];
            }
          });

          return updatedPlayer;
        }
        return player;
      });

      // Add new players in the correct position
      for (const [id, postIds] of addedPlayers) {
        const playerIndex = result.findIndex((p) => postIds.includes(p.id));
        const player = newPlayersMap.get(id);
        if (!player) continue; // Skip if player not found (shouldn't happen)

        if (playerIndex === -1) {
          result.push(player);
        } else if (id === result[playerIndex].id) {
          result[playerIndex] = player;
        } else {
          result.splice(playerIndex, 0, player);
        }
      }

      const weights = new Map(
        result.map((p, index) => [p.id, index - (shiftIndex.get(p.id) ?? 0)])
      );
      return result.sort(
        (a, b) => (weights.get(a.id) ?? 0) - (weights.get(b.id) ?? 0)
      );
    },
    []
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

  const prepareDraft = useCallback((currentPlayers: Player[]) => {
    const newPlayers = currentPlayers.map((player) => {
      const newPlayer: Player = {
        ...player,
        banned: [],
        skipped: [],
        available: [],
        state: 'hosting',
        disabled: false,
      };
      return newPlayer;
    });
    return newPlayers;
  }, []);

  const prepareRandomDraft = useCallback(
    (currentPlayers: Player[], characterIds: CharacterId[]) => {
      const filteredCharacterIds = characterIds.filter(
        (id) =>
          !currentPlayers.some((player) =>
            player.banned.some((banned) => banned === id)
          )
      );
      if (
        filteredCharacterIds.length <
        draft.params.random * currentPlayers.length
      ) {
        setError('Not enough not banned characters for random draft');
        return currentPlayers;
      }
      const randomCharacterIds = filteredCharacterIds.sort(
        () => 0.5 - Math.random()
      );
      var selectedCharacters: CharacterId[] = [];
      const newPlayers = currentPlayers.map((player) => {
        const draftAmount = Math.max(
          1,
          draft.params.random - player.loser_slots
        );
        var available: CharacterId[] = [];
        var notBannedCharacters = randomCharacterIds.filter(
          (id) =>
            !player.loser_banned.some(
              (loser_banned) => loser_banned.id === id
            ) && !selectedCharacters.includes(id)
        );
        if (notBannedCharacters.length < draftAmount) {
          notBannedCharacters = randomCharacterIds.filter(
            (id) => !selectedCharacters.includes(id)
          );
        }
        available.push(...notBannedCharacters.slice(0, draftAmount));
        selectedCharacters.push(...available);
        const newPlayer: Player = {
          ...player,
          available,
        };
        return newPlayer;
      });
      return newPlayers;
    },
    [draft]
  );

  const prepareNextPlayer = useCallback(
    (currentPlayers: Player[]): Player[] => {
      if (!user) {
        setError('User not joined');
        return currentPlayers;
      }
      if (user.state !== 'choosing' && user.state !== 'banning') {
        setError('User not in choosing or banning state');
        return currentPlayers;
      }
      const currentPlayerIndex = currentPlayers.findIndex(
        (player) => player.id === user.id
      );
      if (currentPlayerIndex === -1) {
        setError('No current player found');
        return currentPlayers;
      }
      const nextPlayerIndex =
        currentPlayerIndex === currentPlayers.length - 1
          ? 0
          : currentPlayerIndex + 1;
      const nextPlayer = currentPlayers[nextPlayerIndex];
      const newNextPlayer: Player = {
        ...nextPlayer,
        state: user.state,
        disabled: false,
      };
      const newPlayers: Player[] = currentPlayers.map((player) => {
        if (player.id === nextPlayer.id) {
          return newNextPlayer;
        }
        return { ...player, disabled: true };
      });
      return newPlayers;
    },
    [user]
  );

  const startBan = useCallback((currentPlayers: Player[]) => {
    const newPlayers = currentPlayers.map((player, id) => {
      const newPlayer: Player = {
        ...player,
        banned: [],
        skipped: [],
        available: [],
        state: id === 0 ? 'banning' : 'waiting',
        disabled: id === 0 ? false : true,
      };
      return newPlayer;
    });
    return newPlayers;
  }, []);

  const startDraft = useCallback(
    (currentPlayers: Player[], characterIds: CharacterId[]) => {
      const preparedPlayers =
        draft.params.random > 0
          ? prepareRandomDraft(currentPlayers, characterIds)
          : currentPlayers;
      const newPlayers = preparedPlayers.map((player, id) => {
        const newPlayer: Player = {
          ...player,
          state: id === 0 ? 'choosing' : 'waiting',
          disabled: id === 0 ? false : true,
        };
        return newPlayer;
      });
      return newPlayers;
    },
    [draft, prepareRandomDraft]
  );

  const startGame = useCallback((currentPlayers: Player[]) => {
    const newPlayers = currentPlayers.map((player) => {
      const newPlayer: Player = {
        ...player,
        locked: player.locked
          ? player.locked
          : player.available.length > 0
          ? {
              id: player.available[
                Math.floor(Math.random() * player.available.length) * 0.999
              ],
              amount: 0,
            }
          : undefined,
        state: 'playing',
        disabled: true,
      };
      return newPlayer;
    });
    return newPlayers;
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
    channel.bind(
      'set-players',
      function (data: { message: { old: Player[]; new: Player[] } }) {
        setPlayers((prev) =>
          mergePlayers(data.message.old, prev, data.message.new)
        );
      }
    );

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
  }, [draft.id, mergePlayers]);

  const handleJoin = useCallback(
    async (data: { name: string; password: string }) => {
      setError(null);
      if (
        players.length > 0 &&
        !players.some((player) => player.state === 'hosting')
      ) {
        const possiblePlayer = players.find(
          (player) => player.name === data.name
        );
        if (possiblePlayer) {
          if (possiblePlayer.password !== data.password) {
            setError('Incorrect password');
            return;
          }
          setCurrentUser(possiblePlayer);
          return;
        } else {
          setError(
            'No possible to join for new players during draft in progress'
          );
          return;
        }
      }
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
          loser_slots: 0,
          skipped: [],
          available: [],
          state: players.length > 0 ? 'waiting' : 'hosting',
          disabled: players.length > 0 ? true : false,
          seed: players.length > 0 ? players[0].seed : [],
        };
        await notifyPlayers([...players, newPlayer]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join draft');
      }
    },
    [players, notifyPlayers, setCurrentUser]
  );

  const handleLeave = useCallback(async () => {
    setError(null);
    if (!user) {
      setError('User not joined');
      return;
    }
    try {
      const filteredPlayers = players.filter((player) => player.id !== user.id);
      const newPlayers = prepareDraft(filteredPlayers);
      await notifyPlayers(newPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave draft');
    } finally {
      setUser(null);
    }
  }, [user, players, prepareDraft, notifyPlayers]);

  const handleSetColor = useCallback(
    async (data: { color: PlayerColor }) => {
      setError(null);
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

  const handleStart = useCallback(
    async (characterIds: CharacterId[]) => {
      setError(null);
      if (!user) {
        setError('User not joined');
        return;
      }
      if (user.state !== 'hosting') {
        setError('User is not hosting');
        return;
      }
      const newSeed = user.seed
        ? user.seed.length > 19
          ? user.seed.slice(-10).concat(Math.random())
          : user.seed.concat(Math.random())
        : [Math.random()];
      // Shift players by one position in a circular manner
      const shuffledPlayers =
        players.length > 0 ? [...players.slice(1), players[0]] : [...players];
      const clearedPlayers = shuffledPlayers.map((player) => ({
        ...player,
        locked: null,
        banned: [],
        skipped: [],
        available: [],
        seed: newSeed,
      }));
      const newPlayers =
        draft.params.bans > 0
          ? startBan(clearedPlayers)
          : startDraft(clearedPlayers, characterIds);
      try {
        await notifyPlayers(newPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start draft');
      }
    },
    [draft, user, players, startBan, startDraft, notifyPlayers]
  );

  const handleSkip = useCallback(async () => {
    setError(null);
    if (!user) {
      setError('User not joined');
      return;
    }
    if (!user.locked) {
      setError('Leader not chosen');
      return;
    }
    if (user.state !== 'choosing') {
      setError('User not in choosing state');
      return;
    }
    const newPlayer: Player = {
      ...user,
      locked: {
        ...user.locked,
        amount: user.locked.amount + 1,
      },
      state: user.locked.amount === 0 ? 'locked' : 'ready',
    };
    const stateUpdatedPlayers: Player[] = players.map((player) => {
      if (player.id === user.id) {
        return newPlayer;
      }
      return player;
    });
    const shouldStartGame =
      stateUpdatedPlayers.every(
        (player) => player.state === 'locked' || player.state === 'ready'
      ) ||
      stateUpdatedPlayers.reduce(
        (acc, player) => acc + (player.state === 'ready' ? 1 : 0),
        0
      ) >
        players.length / 2;
    const newPlayers: Player[] = shouldStartGame
      ? startGame(stateUpdatedPlayers)
      : prepareNextPlayer(stateUpdatedPlayers);
    try {
      await notifyPlayers(newPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start draft');
    }
  }, [user, players, startGame, prepareNextPlayer, notifyPlayers]);

  const handleLose = useCallback(async () => {
    setError(null);
    if (!user) {
      setError('User not joined');
      return;
    }
    if (!user.locked) {
      setError('Leader not chosen');
      return;
    }
    const loseCountedPlayers: Player[] = players.map((player) => {
      const loser_banned =
        player.id === user.id
          ? [
              ...user.loser_banned,
              { id: user.locked!.id, amount: draft.params.loser_bans },
            ].filter((loser_banned) => {
              return loser_banned.amount > 0;
            })
          : player.loser_banned
              .map((loser_banned) => {
                return { id: loser_banned.id, amount: loser_banned.amount - 1 };
              })
              .filter((loser_banned) => {
                return loser_banned.amount > 0;
              });
      const loser_slots =
        player.id === user.id
          ? Math.min(
              draft.params.random,
              player.loser_slots + draft.params.loser_slots
            )
          : Math.max(0, player.loser_slots - 1);
      const newPlayer: Player = {
        ...player,
        loser_banned,
        loser_slots,
      };
      return newPlayer;
    });
    const newPlayers = prepareDraft(loseCountedPlayers);
    try {
      await notifyPlayers(newPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start draft');
    }
  }, [draft, user, players, prepareDraft, notifyPlayers]);

  const handleBan = useCallback(
    async (data: { characterId: CharacterId; characterIds: CharacterId[] }) => {
      setError(null);
      if (!user) {
        setError('User not joined');
        return;
      }
      if (user.state !== 'banning') {
        setError('User not in banning state');
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const newPlayer: Player = {
        ...user,
        banned: [...user.banned, data.characterId],
        state: 'waiting',
      };
      const banCountedPlayers: Player[] = players.map((player) => {
        if (player.id === user.id) {
          return newPlayer;
        }
        return player;
      });
      const shouldStartDraft = banCountedPlayers.every(
        (player) => player.banned.length >= draft.params.bans
      );
      const newPlayers = shouldStartDraft
        ? startDraft(banCountedPlayers, data.characterIds)
        : prepareNextPlayer(banCountedPlayers);
      try {
        await notifyPlayers(newPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start draft');
      }
    },
    [draft, user, players, startDraft, prepareNextPlayer, notifyPlayers]
  );

  const handlePick = useCallback(
    async (data: { characterId: CharacterId }) => {
      setError(null);
      if (!user) {
        setError('User not joined');
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (user.locked?.id === data.characterId) {
        handleSkip();
        return;
      }
      const unlockedPlayers: Player[] =
        (user.locked?.amount || 0) > 0
          ? players.map((player) => {
              if (player.locked) {
                return {
                  ...player,
                  locked: {
                    ...player.locked,
                    amount: player.locked.amount > 0 ? 1 : 0,
                  },
                  state: player.locked.amount > 0 ? 'locked' : 'waiting',
                };
              }
              return player;
            })
          : players;
      const possibleSkipped = user.skipped.find(
        (skipped) => skipped.id === user.locked?.id
      );
      const skipped = possibleSkipped
        ? user.skipped.map((skipped) => {
            if (skipped.id === user.locked?.id) {
              return {
                ...skipped,
                amount: skipped.amount + 1,
              };
            }
            return skipped;
          })
        : user.locked
        ? [...user.skipped, { id: user.locked.id, amount: 1 }]
        : user.skipped;
      const newPlayer: Player = {
        ...user,
        locked: {
          id: data.characterId,
          amount: draft.params.repick > 0 ? 0 : 1,
        },
        state: draft.params.repick > 0 ? 'waiting' : 'locked',
        skipped,
      };
      const lockedPlayers: Player[] = unlockedPlayers.map((player) => {
        if (player.id === user.id) {
          return newPlayer;
        }
        return player;
      });
      const newPlayers = prepareNextPlayer(lockedPlayers);
      try {
        await notifyPlayers(newPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set color');
      }
    },
    [draft, user, players, prepareNextPlayer, handleSkip, notifyPlayers]
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
    handleBan,
    handlePick,
    handleSkip,
    handleLose,
  };
}

export default useDraft;
