import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";
import { 
  fetchFriends, 
  fetchBlockedList, 
  fetchPendingRequests,
  fetchBattle,
  fetchBattleInvites
} from "../services/friendsApi";
import { 
  Friend, 
  FriendRequest, 
  BattleInvite, 
  FriendsListProps 
} from "../types/friends.types";
import { Battle } from "../types/battleTypes";

// User-friendly error message mapping
const ERROR_MESSAGES: Record<string, string> = {
  "ALREADY_FRIENDS": "You are already friends with this user",
  "REQUEST_ALREADY_SENT": "Friend request already sent to this user",
  "USER_NOT_FOUND": "No user found with this email",
  "CANNOT_ADD_SELF": "You cannot add yourself as a friend",
  "USER_BLOCKED": "Unable to send request - user blocked",
  "FRIEND_REQUEST_NOT_FOUND": "Friend request not found or already processed",
  "INVALID_REQUEST_ID": "Invalid request ID",
  "FRIEND_NOT_FOUND": "Friend not found",
};

export function getFriendlyErrorMessage(error: string | Error): string {
  const errorStr = typeof error === "string" ? error : error.message;
  // Check for exact match first
  if (ERROR_MESSAGES[errorStr]) {
    return ERROR_MESSAGES[errorStr];
  }
  // Check if error contains any of the keys
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorStr.includes(key)) {
      return message;
    }
  }
  // Return original if no mapping found
  return errorStr;
}

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
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "battles">("friends");
  const [blockedFriends, setBlockedFriends] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Notification tracking
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [hasNewBattles, setHasNewBattles] = useState(false);
  const [seenRequestsCount, setSeenRequestsCount] = useState(0);
  const [seenBattlesCount, setSeenBattlesCount] = useState(0);

  // Actions - DEFINED FIRST (before loadFriends)
  const showMessage = useCallback((msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  // Data fetching - NOW CAN safely use showMessage
  const loadFriends = useCallback(async () => {
    try {
      const [friendsData, requestsData, invitesData] = await Promise.all([
        fetchFriends(token),
        fetchPendingRequests(token),
        fetchBattleInvites(token)
      ]);
      
      setFriends(friendsData);
      setRequests(requestsData);
      setBattleInvites(invitesData);
      
      console.log("✅ Friends:", friendsData.length, "Requests:", requestsData.length, "Invites:", invitesData.length);
      
      if (friendsData.length > 0) {
        emitEvent("requestFriendsStatus", friendsData.map((f) => f.avatarId));
      }
    } catch (err) {
      console.error("❌ Failed to fetch friends data:", err);
      showMessage("❌ Failed to load friends data");
    }
  }, [token, emitEvent, showMessage]);

  const loadBlockedList = useCallback(async () => {
    try {
      const blockedIds = await fetchBlockedList(token);
      setBlockedFriends(new Set(blockedIds));
    } catch (err) {
      console.error("Failed to fetch blocked list:", err);
    }
  }, [token]);

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
      console.error("Failed to spectate:", err);
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
      console.error("Failed to view results:", err);
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

  // Refs for socket listeners to avoid stale closures
  const loadFriendsRef = useRef(loadFriends);
  const showMessageRef = useRef(showMessage);
  
  useEffect(() => {
    loadFriendsRef.current = loadFriends;
    showMessageRef.current = showMessage;
  }, [loadFriends, showMessage]);

  // Socket listeners
  useEffect(() => {
    emitEvent("userOnline", myAvatarId);

    const cleanups: (() => void)[] = [];

    // Status updates
    cleanups.push(
      subscribeEvent<{ avatarId: string; online: boolean; battleStatus?: string; currentBattle?: string | null }[]>(
        "friendsStatusUpdate",
        (statuses) => {
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

    cleanups.push(
      subscribeEvent<
        { avatarId: string; currentBattle: string | null; battleStatus?: string }[]
      >("friendsBattleStatusUpdate", (statuses) => {
        setFriends((prev) =>
          prev.map((friend) => {
            const status = statuses.find((s) => s.avatarId === friend.avatarId);
            if (!status) return friend;

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
          setBattleInvites((prev) => {
            if (prev.some(inv => inv.inviteId === data.inviteId)) return prev;
            return [...prev, { ...data, createdAt: new Date() }];
          });
          showMessageRef.current(`⚔️ Battle challenge from ${data.senderName}!`, 5000);
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ by: string }>("matchInviteDeclined", () => {
        showMessageRef.current("❌ Challenge declined");
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

    // FIXED: When someone accepts MY request, refresh my friend list
    cleanups.push(
      subscribeEvent<{ avatarId: string; userName: string; avatarImage: string; message: string }>(
        "friendRequestAcceptedByOther",
        (data) => {
          // Refresh friends list to show the new friend
          loadFriendsRef.current();
          showMessageRef.current(`✅ ${data.userName} ${data.message}`);
        }
      )
    );

    cleanups.push(
      subscribeEvent<{ avatarId: string; userName: string; avatarImage: string }>(
        "friendRequestAutoAccepted",
        (data) => {
          loadFriendsRef.current();
          setRequests((prev) => prev.filter((req) => req.avatarId !== data.avatarId));
          showMessageRef.current(`✅ ${data.userName} accepted your request!`);
        }
      )
    );

    // FIXED: When removed by friend, immediately remove from list
    cleanups.push(
      subscribeEvent<{ removerAvatarId: string; removerName?: string; removerAvatarImage?: string }>(
        "removedByFriend", 
        (data) => {
          setFriends((prev) => prev.filter((f) => f.avatarId !== data.removerAvatarId));
          setBlockedFriends((prev) => {
            const next = new Set(prev);
            next.delete(data.removerAvatarId);
            return next;
          });
          showMessageRef.current(`${data.removerName || "A friend"} removed you`);
        }
      )
    );

    cleanups.push(
      subscribeEvent<FriendRequest>("friendRequestReceived", (data) => {
        setRequests((prev) => [...prev, data]);
        showMessageRef.current("📨 New friend request!");
      })
    );

    cleanups.push(
      subscribeEvent<{ error: string }>("matchInviteError", (data) => {
        showMessageRef.current(`❌ ${data.error}`, 5000);
      })
    );

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [emitEvent, subscribeEvent, myAvatarId, navigate, setCurrentBattle]);

  // Initial data load
  useEffect(() => {
    if (!token) return;
    
    loadFriends();
    loadBlockedList();
    
    const initCounts = setTimeout(() => {
      setSeenRequestsCount(requests.length);
      setSeenBattlesCount(battleInvites.length);
    }, 1000);
    
    return () => clearTimeout(initCounts);
  }, [token, loadFriends, loadBlockedList]);

  // Detect NEW notifications
  useEffect(() => {
    if (requests.length > seenRequestsCount && seenRequestsCount > 0) {
      setHasNewRequests(true);
    }
  }, [requests.length, seenRequestsCount]);

  useEffect(() => {
    if (battleInvites.length > seenBattlesCount && seenBattlesCount > 0) {
      setHasNewBattles(true);
    }
  }, [battleInvites.length, seenBattlesCount]);

  // Clear highlights when viewing tabs
  useEffect(() => {
    if (activeTab === "requests") {
      setHasNewRequests(false);
      setSeenRequestsCount(requests.length);
    }
  }, [activeTab, requests.length]);

  useEffect(() => {
    if (activeTab === "battles") {
      setHasNewBattles(false);
      setSeenBattlesCount(battleInvites.length);
    }
  }, [activeTab, battleInvites.length]);

  return {
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
    loadFriends,
    showMessage,
    handleSpectate,
    handleViewResults,
    handleChallengeFriend,
    handleAcceptBattleInvite,
    handleDeclineBattleInvite,
    totalNotifications: requests.length + battleInvites.length,
    isSuccessMessage: message.startsWith("✅") || message.startsWith("⚔️") || message.startsWith("🔔"),
    setRequests,
    hasNewRequests,
    hasNewBattles,
  };
}