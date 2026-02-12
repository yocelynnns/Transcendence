import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";
import { 
  fetchFriends, 
  fetchBlockedList, 
  fetchPendingRequests,
  fetchBattle 
} from "../services/friendsApi";
import { 
  Friend, 
  FriendRequest, 
  BattleInvite, 
  FriendsListProps 
} from "../types/friends.types";
import { Battle } from "../types/battleTypes";

export function useFriends({
  token,
  myAvatarId,
  setSpectatingBattle,
  setCurrentBattle,
}: FriendsListProps) {
  const navigate = useNavigate();
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  
  // State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [battleInvites, setBattleInvites] = useState<BattleInvite[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "battles">("friends");
  const [blockedFriends, setBlockedFriends] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Data fetching
  const loadFriends = useCallback(async () => {
    try {
      const data = await fetchFriends(token);
      setFriends(data);
      if (data.length > 0) {
        emitEvent("requestFriendsStatus", data.map((f) => f.avatarId));
      }
    } catch (err) {
      console.log("Failed to fetch friends:", err);
    }
  }, [token, emitEvent]);

  const loadBlockedList = useCallback(async () => {
    try {
      const blockedIds = await fetchBlockedList(token);
      setBlockedFriends(new Set(blockedIds));
    } catch (err) {
      console.log("Failed to fetch blocked list:", err);
    }
  }, [token]);

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchPendingRequests(token);
      setRequests(data);
    } catch (err) {
      console.log("Failed to fetch requests:", err);
    }
  }, [token]);

  // Actions
  const showMessage = useCallback((msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const handleSpectate = useCallback(async (friend: Friend) => {
    if (!friend.currentBattle) {
      alert("This friend is not in a battle!");
      return;
    }
    try {
      emitEvent("joinAsSpectator", { battleId: friend.currentBattle });
      const battleData = await fetchBattle(friend.currentBattle);
      setSpectatingBattle?.(battleData);
      navigate(`/spectating/${friend.currentBattle}`);
      setShowPanel(false);
    } catch (err) {
      console.log("Failed to spectate:", err);
      alert("Failed to join spectator mode");
    }
  }, [emitEvent, navigate, setSpectatingBattle]);

  const handleViewResults = useCallback(async (friend: Friend) => {
    if (!friend.currentBattle) return;
    try {
      const battleData = await fetchBattle(friend.currentBattle);
      setSpectatingBattle?.(battleData);
      navigate(`/spectating/${friend.currentBattle}`);
      setShowPanel(false);
    } catch (err) {
      console.log("Failed to view results:", err);
    }
  }, [navigate, setSpectatingBattle]);

  const handleChallengeFriend = useCallback((friend: Friend) => {
    if (!friend.online) {
      alert("Friend is offline!");
      return;
    }
    if (friend.currentBattle) {
      alert("Friend is already in a battle!");
      return;
    }
    emitEvent("sendMatchInvite", { receiverId: friend.avatarId });
    showMessage(`⚔️ Challenge sent to ${friend.userName}!`);
  }, [emitEvent, showMessage]);

  const handleAcceptBattleInvite = useCallback((inviteId: string) => {
    emitEvent("respondToMatchInvite", { inviteId, accept: true });
    setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
  }, [emitEvent]);

  const handleDeclineBattleInvite = useCallback((inviteId: string) => {
    emitEvent("respondToMatchInvite", { inviteId, accept: false });
    setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
  }, [emitEvent]);

  // Socket listeners
  useEffect(() => {
    emitEvent("userOnline", myAvatarId);

    const cleanups: (() => void)[] = [];

    // Status updates
    cleanups.push(
      subscribeEvent<{ avatarId: string; online: boolean; battleStatus?: string; currentBattle?: string | null }[]>(
        "friendsStatusUpdate",
        (statuses) => {
          // setFriends((prev) =>
          //   prev.map((friend) => {
          //     const status = statuses.find((s) => s.avatarId === friend.avatarId);
          //     return status ? {
          //       ...friend,
          //       online: status.online,
          //       battleStatus: status.battleStatus || friend.battleStatus,
          //       currentBattle: status.currentBattle !== undefined ? status.currentBattle : friend.currentBattle,
          //     } : friend;
          //   })
          // );
          setFriends((prev) =>
            prev.map((friend) => {
              const status = statuses.find((s) => s.avatarId === friend.avatarId);

              if (!status) return friend;

              return {
                ...friend,
                online: status.online,
                battleStatus: status.battleStatus as "online" | "in_battle" | "viewing_results" | undefined,
                currentBattle: status.currentBattle !== undefined ? status.currentBattle : friend.currentBattle,
              };
            })
          );
        }
      )
    );

    // cleanups.push(
    //   subscribeEvent<{ avatarId: string; online: boolean; battleStatus?: string; currentBattle?: string | null }>(
    //     "userStatusChange",
    //     ({ avatarId, online, battleStatus, currentBattle }) => {
    //       setFriends((prev) =>
    //         prev.map((friend) =>
    //           friend.avatarId === avatarId
    //             ? {
    //                 ...friend,
    //                 online,
    //                 ...(battleStatus && { battleStatus }),
    //                 ...(currentBattle !== undefined && { currentBattle }),
    //               }
    //             : friend
    //         )
    //       );
    //     }
    //   )
    // );

  cleanups.push(
    subscribeEvent<{
      avatarId: string;
      online: boolean;
      battleStatus?: string;
      currentBattle?: string | null;
    }>(
      "userStatusChange",
      ({ avatarId, online, battleStatus, currentBattle }) => {
        setFriends((prev) =>
          prev.map((friend) => {
            if (friend.avatarId !== avatarId) return friend;

            return {
              ...friend,
              online,
              battleStatus:
                battleStatus === "online" ||
                battleStatus === "in_battle" ||
                battleStatus === "viewing_results"
                  ? battleStatus
                  : friend.battleStatus,
              currentBattle:
                currentBattle !== undefined ? currentBattle : friend.currentBattle,
            };
          })
        );
      }
    )
  );


    // cleanups.push(
    //   subscribeEvent<{ avatarId: string; currentBattle: string | null; battleStatus?: string }[]>(
    //     "friendsBattleStatusUpdate",
    //     (statuses) => {
    //       setFriends((prev) =>
    //         prev.map((friend) => {
    //           const status = statuses.find((s) => s.avatarId === friend.avatarId);
    //           return status ? {
    //             ...friend,
    //             currentBattle: status.currentBattle,
    //             battleStatus: status.battleStatus || (status.currentBattle ? "in_battle" : "online"),
    //           } : friend;
    //         })
    //       );
    //     }
    //   )
    // );

    cleanups.push(
      subscribeEvent<
        { avatarId: string; currentBattle: string | null; battleStatus?: string }[]
      >("friendsBattleStatusUpdate", (statuses) => {
        setFriends((prev) =>
          prev.map((friend) => {
            const status = statuses.find((s) => s.avatarId === friend.avatarId);
            if (!status) return friend;

            // Normalize battleStatus to allowed union
            let normalizedBattleStatus: "online" | "in_battle" | "viewing_results" | undefined;

            if (
              status.battleStatus === "online" ||
              status.battleStatus === "in_battle" ||
              status.battleStatus === "viewing_results"
            ) {
              normalizedBattleStatus = status.battleStatus;
            } else if (status.currentBattle) {
              normalizedBattleStatus = "in_battle";
            } else {
              normalizedBattleStatus = "online";
            }

            return {
              ...friend,
              currentBattle: status.currentBattle,
              battleStatus: normalizedBattleStatus,
            };
          })
        );
      })
    );


    // Battle events
    cleanups.push(
      subscribeEvent<{ avatarId: string; battleId: string }>(
        "friendBattleStarted",
        ({ avatarId, battleId }) => {
          setFriends((prev) =>
            prev.map((friend) =>
              friend.avatarId === avatarId
                ? { ...friend, currentBattle: battleId, battleStatus: "in_battle" }
                : friend
            )
          );
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ avatarId: string; battleId: string }>(
        "battleEnded",
        ({ avatarId, battleId }) => {
          setFriends((prev) =>
            prev.map((friend) =>
              friend.avatarId === avatarId
                ? { ...friend, currentBattle: battleId, battleStatus: "viewing_results" }
                : friend
            )
          );
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ avatarId: string }>(
        "friendReturnedHome",
        ({ avatarId }) => {
          setFriends((prev) =>
            prev.map((friend) =>
              friend.avatarId === avatarId
                ? { ...friend, currentBattle: null, battleStatus: "online" }
                : friend
            )
          );
        }
      )
    );

    // Battle invites
    cleanups.push(
      subscribeEvent<{ inviteId: string; senderId: string; senderName: string; senderAvatar: string }>(
        "matchInviteReceived",
        (data) => {
          setBattleInvites((prev) => [...prev, { ...data, createdAt: new Date() }]);
          showMessage(`⚔️ Battle challenge from ${data.senderName}!`, 5000);
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ by: string }>("matchInviteDeclined", () => {
        showMessage("❌ Challenge declined");
      })
    );

    cleanups.push(
      subscribeEvent<{ battle: Battle }>("directMatchReady", ({ battle }) => {
        setCurrentBattle(battle);
        navigate(`/teamSelect/${battle._id}`, { state: { battle } });
        setShowPanel(false);
      })
    );

    // Friend management
    cleanups.push(
      subscribeEvent<{ avatarId: string; avatarImage: string; userName?: string }>(
        "friendAvatarUpdated",
        (update) => {
          setFriends((prev) =>
            prev.map((f) =>
              f.avatarId === update.avatarId
                ? { ...f, avatarImage: update.avatarImage, ...(update.userName && { userName: update.userName }) }
                : f
            )
          );
          setRequests((prev) =>
            prev.map((r) =>
              r.avatarId === update.avatarId
                ? { ...r, avatarImage: update.avatarImage, ...(update.userName && { userName: update.userName }) }
                : r
            )
          );
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ avatarId: string; userName: string; avatarImage: string }>(
        "friendRequestAutoAccepted",
        (data) => {
          loadFriends();
          setRequests((prev) => prev.filter((req) => req.avatarId !== data.avatarId));
          showMessage(`✅ ${data.userName} accepted your request!`);
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ removerAvatarId: string }>("removedByFriend", (data) => {
        setFriends((prev) => prev.filter((f) => f.avatarId !== data.removerAvatarId));
        setBlockedFriends((prev) => {
          const next = new Set(prev);
          next.delete(data.removerAvatarId);
          return next;
        });
        showMessage("A friend removed you");
      })
    );

    cleanups.push(
      subscribeEvent<FriendRequest>("friendRequestReceived", (data) => {
        setRequests((prev) => [...prev, data]);
        showMessage("📨 New friend request!");
      })
    );

    cleanups.push(
      subscribeEvent<{ avatarId: string; userName: string; avatarImage: string; message: string }>(
        "friendRequestAcceptedByOther",
        (data) => {
          loadFriends();
          showMessage(`✅ ${data.userName} ${data.message}`);
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ error: string }>("matchInviteError", (data) => {
        showMessage(`❌ ${data.error}`, 5000);
      })
    );

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [emitEvent, subscribeEvent, myAvatarId, loadFriends, navigate, setCurrentBattle, showMessage]);

  // // Initial data fetch
  // useEffect(() => {
  //   if (showPanel) {
  //     loadFriends();
  //     loadRequests();
  //     loadBlockedList();
  //   }
  // }, [showPanel, loadFriends, loadRequests, loadBlockedList]);

  useEffect(() => {
    if (!showPanel) return;

    const fetchData = async () => {
      await loadFriends();
      await loadRequests();
      await loadBlockedList();
    };

    fetchData();
  }, [showPanel, loadFriends, loadRequests, loadBlockedList]);


  return {
    // State
    friends,
    requests,
    battleInvites,
    showPanel,
    setShowPanel,
    activeTab,
    setActiveTab,
    blockedFriends,
    setBlockedFriends,
    message,
    selectedFriend,
    setSelectedFriend,
    
    // Actions
    loadFriends,
    showMessage,
    handleSpectate,
    handleViewResults,
    handleChallengeFriend,
    handleAcceptBattleInvite,
    handleDeclineBattleInvite,
    
    // Derived
    totalNotifications: requests.length + battleInvites.length,
    isSuccessMessage: message.startsWith("✅") || message.startsWith("⚔️") || message.startsWith("🔔"),
    setRequests,
  };
}