import React from "react";
import { useFriends } from "../../hooks/useFriends";
import { FriendsButton } from "./FriendsButton";
import { FriendsPanel } from "./FriendsPanel";
import ChatWindow from "../chat/ChatWindow"; // Existing component
import { Battle } from "../../types/battleTypes";
import { acceptFriendRequest, rejectFriendRequest, removeFriend, blockMessages, unblockMessages } from "../../services/friendsApi";
import { Friend, FriendRequestResult } from "../../types/friends.types";

// export { FriendsListProps } from "./types/friends.types";

export interface FriendsListProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: {
    _id: string;
    userName: string;
    avatar: string;
    characterOption?: number;
  };
  setSpectatingBattle?: React.Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: React.Dispatch<React.SetStateAction<Battle | null>>;
  isOpen: boolean;
  onClosePanel?: () => void;
}

export default function FriendsList(props: FriendsListProps) {
  const {
    token,
    myAvatarId,
    myAvatarData,
  } = props;

export default function FriendsList({ 
  token, 
  myAvatarId, 
  myAvatarData,
  setSpectatingBattle,
  setCurrentBattle,
  isOpen,
  onClosePanel,
}: FriendsListProps) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [battleInvites, setBattleInvites] = useState<BattleInvite[]>([]);
  // const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "battles">("friends");
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [blockedFriends, setBlockedFriends] = useState<Set<string>>(new Set());

  const { emitEvent, subscribeEvent } = useGameSocket(() => {});

  // FETCH FRIENDS
  const fetchFriends = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);

      if (data.length > 0) {
        const friendIds = data.map((f: Friend) => f.avatarId);
        emitEvent("requestFriendsStatus", friendIds);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  };

  // FETCH BLOCKED MESSAGES LIST
  const fetchBlockedList = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/blocked-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedFriends(new Set(data.blockedFriends.map((f: any) => f.avatarId)));
      }
    } catch (err) {
      console.error("Failed to fetch blocked list:", err);
    }
  };

  // FETCH FRIEND REQUESTS
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/friends/requests/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  // HANDLE SPECTATE
  const handleSpectate = async (friend: Friend) => {
    if (!friend.currentBattle) {
      alert("This friend is not in a battle!");
      return;
    }

    try {
      emitEvent("joinAsSpectator", { battleId: friend.currentBattle });

      const res = await fetch(`http://localhost:5001/api/battle/${friend.currentBattle}`);
      if (!res.ok) throw new Error("Failed to fetch battle");

      const battleData: Battle = await res.json();
      
      if (setSpectatingBattle) {
        setSpectatingBattle(battleData);
      }

      navigate(`/spectating/${friend.currentBattle}`);
      onClosePanel?.();
    } catch (err) {
      console.error("Failed to spectate:", err);
      alert("Failed to join spectator mode");
    }
  };

  // HANDLE CHALLENGE FRIEND TO BATTLE
  const handleChallengeFriend = (friend: Friend) => {
    if (!friend.online) {
      alert("Friend is offline!");
      return;
    }
    if (friend.currentBattle) {
      alert("Friend is already in a battle!");
      return;
    }
    
    // Actions
    loadFriends,
    showMessage,
    handleSpectate,
    handleViewResults,
    handleChallengeFriend,
    handleAcceptBattleInvite,
    handleDeclineBattleInvite,
    
    // Derived
    totalNotifications,
    isSuccessMessage,
    setRequests,  // ADDED
  } = useFriends(props);

  // Handlers that need API + state updates
  const handleAddFriendSuccess = (data: FriendRequestResult) => {
    if (data.autoAccepted) {
      showMessage("✅ Auto-accepted! You are now friends!");
      loadFriends();
    } else {
      showMessage("✅ Friend request sent!");
    }
  };

  const handleAddFriendError = (msg: string) => {
    showMessage(`❌ ${msg}`);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      loadFriends();
      showMessage("✅ Friend request accepted!");
    } catch (err) {
      console.log("Failed to accept request:", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      showMessage("Request rejected");
    } catch (err) {
      console.log("Failed to reject request:", err);
    }
  };

  const handleRemove = async (friendAvatarId: string) => {
    if (!confirm("Remove this friend?")) return;
    try {
      await removeFriend(token, friendAvatarId);
      loadFriends();
      setBlockedFriends((prev) => {
        const next = new Set(prev);
        next.delete(friendAvatarId);
        return next;
      });
      showMessage("Friend removed");
    } catch (err) {
      console.log("Failed to remove friend:", err);
    }
  };

  const handleBlockToggle = async (friend: Friend, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockMessages(token, friend.avatarId);
        setBlockedFriends((prev) => {
          const next = new Set(prev);
          next.delete(friend.avatarId);
          return next;
        });
        showMessage(`🔔 Messages unblocked from ${friend.userName}`);
      } else {
        await blockMessages(token, friend.avatarId);
        setBlockedFriends((prev) => new Set([...prev, friend.avatarId]));
        showMessage(`🔇 Messages blocked from ${friend.userName}`);
        if (selectedFriend?.avatarId === friend.avatarId) {
          setSelectedFriend(null);
        }
      }
    } catch {
      showMessage("❌ Failed to update block status");
    }
  };

  // ACCEPT FRIEND REQUEST
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/friends/accept/${requestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        
        if (data.requesterInfo?.avatarId) {
          emitEvent("requestFriendsStatus", [data.requesterInfo.avatarId]);
          
          setFriends((prev) => [
            ...prev,
            { ...data.requesterInfo, online: undefined },
          ]);
        } else {
          await fetchFriends();
        }
        
        setMessage("✅ Friend request accepted!");
        
        if (data.requesterAvatarId) {
          emitEvent("friendRequestAccepted", {
            targetAvatarId: data.requesterAvatarId,
            accepterInfo: data.accepterInfo,
          });
        }
        
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  // REJECT FRIEND REQUEST
  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/friends/reject/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchRequests();
        setMessage("Request rejected");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  // REMOVE FRIEND
  const handleRemoveFriend = async (friendAvatarId: string) => {
    if (!confirm("Remove this friend?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/friends/${friendAvatarId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.avatarId !== friendAvatarId));
        // Also remove from blocked list if they were blocked
        setBlockedFriends(prev => {
          const next = new Set(prev);
          next.delete(friendAvatarId);
          return next;
        });
        setMessage("Friend removed");
        
        emitEvent("friendRemoved", { targetAvatarId: friendAvatarId });
        
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
  };

  // SOCKET LISTENERS
  useEffect(() => {
    if (!isOpen) return;
    emitEvent("userOnline", myAvatarId);

    const cleanupStatusUpdate = subscribeEvent<{ avatarId: string; online: boolean }[]>(
      "friendsStatusUpdate",
      (statuses) => {
        setFriends((prev) =>
          prev.map((friend) => {
            const status = statuses.find((s) => s.avatarId === friend.avatarId);
            return status ? { ...friend, online: status.online } : friend;
          })
        );
      }
    );

    const cleanupBattleStatusUpdate = subscribeEvent<{ avatarId: string; currentBattle: string | null }[]>(
      "friendsBattleStatusUpdate",
      (statuses) => {
        setFriends((prev) =>
          prev.map((friend) => {
            const status = statuses.find((s) => s.avatarId === friend.avatarId);
            return status ? { ...friend, currentBattle: status.currentBattle } : friend;
          })
        );
      }
    );

    const cleanupStatusChange = subscribeEvent<{ avatarId: string; online: boolean }>(
      "userStatusChange",
      ({ avatarId, online }) => {
        setFriends((prev) =>
          prev.map((friend) =>
            friend.avatarId === avatarId ? { ...friend, online } : friend
          )
        );
      }
    );

    const cleanupBattleStarted = subscribeEvent<{ avatarId: string; battleId: string }>(
      "friendBattleStarted",
      ({ avatarId, battleId }) => {
        setFriends((prev) =>
          prev.map((friend) =>
            friend.avatarId === avatarId ? { ...friend, currentBattle: battleId } : friend
          )
        );
      }
    );

    const cleanupBattleEnded = subscribeEvent<{ avatarId: string; battleId: string }>(
      "friendBattleEnded",
      ({ avatarId }) => {
        setFriends((prev) =>
          prev.map((friend) =>
            friend.avatarId === avatarId ? { ...friend, currentBattle: null } : friend
          )
        );
      }
    );

    const cleanupDirectMatchReady = subscribeEvent<{ battle: any }>(
      "directMatchReady",
      ({ battle }) => {
        console.log("🎮 FRONTEND: directMatchReady received!", battle);
        console.log("🎮 Battle ID:", battle?._id);
        console.log("🎮 Setting current battle and navigating...");
        setCurrentBattle(battle);
        navigate(`/teamSelect/${battle._id}`, { state: { battle } });
        onClosePanel?.();
        console.log("🎮 Navigation called to:", `/teamSelect/${battle._id}`);
      }
    );


    // BATTLE INVITE LISTENERS
    const cleanupMatchInviteReceived = subscribeEvent<{
      inviteId: string;
      senderId: string;
      senderName: string;
      senderAvatar: string;
    }>("matchInviteReceived", (data) => {
      setBattleInvites((prev) => [
        ...prev,
        { ...data, createdAt: new Date() },
      ]);
      setMessage(`⚔️ Battle challenge from ${data.senderName}!`);
      setTimeout(() => setMessage(""), 5000);
    });

    const cleanupMatchInviteDeclined = subscribeEvent<{ by: string }>(
      "matchInviteDeclined",
      () => {
        setMessage("❌ Challenge declined");
        setTimeout(() => setMessage(""), 3000);
      }
    );

    const cleanupAvatarUpdate = subscribeEvent<{
      avatarId: string;
      avatarImage: string;
      userName?: string;
    }>("friendAvatarUpdated", (update) => {
      setFriends((prev) =>
        prev.map((friend) =>
          friend.avatarId === update.avatarId
            ? {
                ...friend,
                avatarImage: update.avatarImage,
                ...(update.userName && { userName: update.userName }),
              }
            : friend
        )
      );
      setRequests((prev) =>
        prev.map((req) =>
          req.avatarId === update.avatarId
            ? {
                ...req,
                avatarImage: update.avatarImage,
                ...(update.userName && { userName: update.userName }),
              }
            : req
        )
      );
    });

    const cleanupAutoAccept = subscribeEvent<{
      avatarId: string;
      userName: string;
      avatarImage: string;
    }>("friendRequestAutoAccepted", (data) => {
      fetchFriends();
      setRequests((prev) => prev.filter((req) => req.avatarId !== data.avatarId));
      setMessage(`✅ ${data.userName} accepted your request!`);
      setTimeout(() => setMessage(""), 3000);
    });

    const cleanupRemovedByFriend = subscribeEvent<{ removerAvatarId: string }>(
      "removedByFriend",
      (data) => {
        setFriends((prev) => prev.filter((f) => f.avatarId !== data.removerAvatarId));
        // Also clean up blocked status if they removed us
        setBlockedFriends(prev => {
          const next = new Set(prev);
          next.delete(data.removerAvatarId);
          return next;
        });
        setMessage("A friend removed you");
        setTimeout(() => setMessage(""), 3000);
      }
    );

    const cleanupFriendRequestReceived = subscribeEvent<{
      requestId: string;
      avatarId: string;
      email: string;
      userName: string;
      avatarImage: string;
      createdAt: string;
    }>("friendRequestReceived", (data) => {
      setRequests((prev) => [...prev, data]);
      setMessage("📨 New friend request!");
      setTimeout(() => setMessage(""), 3000);
    });

    const cleanupRequestAccepted = subscribeEvent<{
      avatarId: string;
      userName: string;
      avatarImage: string;
      message: string;
    }>("friendRequestAcceptedByOther", (data) => {
      fetchFriends();
      setMessage(`✅ ${data.userName} ${data.message}`);
      setTimeout(() => setMessage(""), 3000);
    });

    const cleanupMatchInviteError = subscribeEvent<{ error: string }>(
      "matchInviteError",
      (data) => {
        setMessage(`❌ ${data.error}`);
        setTimeout(() => setMessage(""), 5000);
      }
    );

    return () => {
      cleanupStatusUpdate();
      cleanupBattleStatusUpdate?.();
      cleanupStatusChange();
      cleanupBattleStarted?.();
      cleanupBattleEnded?.();
      cleanupMatchInviteReceived?.();
      cleanupMatchInviteDeclined?.();
      cleanupAvatarUpdate();
      cleanupAutoAccept();
      cleanupRemovedByFriend();
      cleanupFriendRequestReceived();
      cleanupRequestAccepted();
      cleanupDirectMatchReady?.();
      cleanupMatchInviteError?.();
    };
  }, [emitEvent, subscribeEvent, myAvatarId]);

  // INITIAL FETCH
  useEffect(() => {
    if (!isOpen) return;

    // Re-sync when panel opens
    emitEvent("userOnline", myAvatarId);
    fetchFriends();
    fetchRequests();
  }, [isOpen]);

  const isSuccessMessage = message.startsWith("✅") || message.startsWith("⚔️") || message.startsWith("🔔");

  // Get total notification count
  // const totalNotifications = requests.length + battleInvites.length;

  return (
    <>
      {/* FRIENDS BUTTON */}
      {/* {!showPanel && (
        <div
          onClick={() => setShowPanel(true)}
          style={styles.friendBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          }}
        >
          👥
          {totalNotifications > 0 && (
            <div style={styles.badge(totalNotifications > 9 ? "#ff5555" : "#ff9800")}>
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </div>
          )}
        </div>
      )} */}

      {/* FRIENDS PANEL */}
      {/* {showPanel && ( */}
        <div className="fixed top-0 right-0 h-full w-1/3 bg-white z-50 overflow-auto p-6">          {/* HEADER */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-800">
            <h2 className="text-xl font-bold">Friends</h2>
          <button onClick={() => onClosePanel?.()}
            className="text-xl font-bold hover:text-red-500">
              ✕
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-3 py-1 rounded font-semibold ${
              activeTab === "friends"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-3 py-1 rounded font-semibold ${
              activeTab === "requests"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Requests{requests.length > 0 && ` (${requests.length})`}
            </button>
            <button
              onClick={() => setActiveTab("battles")}
              className={`px-3 py-1 rounded font-semibold ${
              activeTab === "battles"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Battles{battleInvites.length > 0 && ` (${battleInvites.length})`}
            </button>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mb-4 p-2 rounded font-medium ${
                isSuccessMessage ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* FRIENDS TAB */}
          {activeTab === "friends" && (
            <>
              {/* ADD FRIEND FORM */}
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@email.com"
                  className="flex-1 border border-gray-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  onKeyPress={(e) => e.key === "Enter" && handleSendRequest()}
                />
                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className={`px-3 py-1 rounded font-semibold text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}                >
                  {loading ? "..." : "Add Friend"}
                </button>
              </div>

              {/* FRIENDS LIST */}
              <div>
                {friends.length === 0 ? (
                  <div className="text-gray-500">No friends yet. Add some!</div>
                ) : (
                  friends.map((friend) => {
                    const isBlocked = blockedFriends.has(friend.avatarId);
                    
                    return (
                      <div key={friend.avatarId} style={styles.friendItem}>
                        <div
                          style={{
                            ...styles.avatar,
                            background: `url(${friend.avatarImage || defaultAvatar}) center/cover`,
                          }}
                        >
                          {friend.currentBattle ? (
                            <div style={styles.battleIndicator}>⚔️</div>
                          ) : (
                            <div style={styles.onlineIndicator(!!friend.online)} />
                          )}
                        </div>
                        <div style={styles.friendInfo}>
                          <div style={styles.friendName}>
                            {friend.userName}
                            {isBlocked && <span style={styles.blockedBadge}>BLOCKED</span>}
                          </div>
                          <div style={styles.friendStatus}>
                            {isBlocked 
                              ? "🔇 Messages Blocked" 
                              : friend.currentBattle 
                                ? "🔴 In Battle" 
                                : friend.online 
                                  ? "🟢 Online" 
                                  : "⚫ Offline"
                            }
                          </div>
                        </div>
                        
                        <div style={styles.actionButtons}>
                          {/* CHAT BUTTON - Disabled if blocked */}
                          {!friend.currentBattle && (
                            <button
                              onClick={() => !isBlocked && setSelectedFriend(friend)}
                              style={{
                                ...styles.iconBtn(isBlocked ? "#ccc" : "#4CAF50"),
                                cursor: isBlocked ? "not-allowed" : "pointer",
                                opacity: isBlocked ? 0.5 : 1,
                              }}
                              title={isBlocked ? "Unblock to chat" : "Chat"}
                              disabled={isBlocked}
                            >
                              💬
                            </button>
                          )}

                          {/* SPECTATE BUTTON */}
                          {friend.currentBattle && (
                            <button
                              onClick={() => handleSpectate(friend)}
                              style={styles.iconBtn("#9c27b0")}
                              title="Spectate"
                            >
                              👁️
                            </button>
                          )}

                          {/* CHALLENGE BUTTON - Disabled if blocked */}
                          {!friend.currentBattle && friend.online && (
                            <button
                              onClick={() => !isBlocked && handleChallengeFriend(friend)}
                              style={{
                                ...styles.iconBtn(isBlocked ? "#ccc" : "#ff5722"),
                                cursor: isBlocked ? "not-allowed" : "pointer",
                                opacity: isBlocked ? 0.5 : 1,
                              }}
                              title={isBlocked ? "Unblock to challenge" : "Challenge"}
                              disabled={isBlocked}
                            >
                              ⚔️
                            </button>
                          )}

                          {/* BLOCK/UNBLOCK BUTTON */}
                          {isBlocked ? (
                            <button
                              onClick={() => handleUnblockMessages(friend)}
                              style={styles.unblockBtn}
                              title="Unblock Messages"
                            >
                              🔔
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockMessages(friend)}
                              style={styles.blockBtn}
                              title="Block Messages"
                            >
                              🔇
                            </button>
                          )}

                          {/* REMOVE FRIEND BUTTON */}
                          <button
                            onClick={() => handleRemoveFriend(friend.avatarId)}
                            style={styles.iconBtn("#ff5555")}
                            title="Remove Friend"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div>
              {requests.length === 0 ? (
                <div className="text-gray-500">No pending requests</div>
              ) : (
                requests.map((request) => (
                  <div key={request.requestId} 
                    className="flex items-center justify-between p-2 border rounded border-gray-300"
                  >
                    <div
                      className="w-10 h-10 rounded-full bg-center bg-cover"
                      style={{ backgroundImage: `url(${request.avatarImage || defaultAvatar})` }}
                    />
                    <div>
                      <div className="font-semibold">{request.userName}</div>
                      <div className="text-xs text-gray-600">{request.email}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        className="w-7 h-7 rounded-full bg-green-600 text-white text-xs flex items-center justify-center"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.requestId)}
                        className="w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BATTLES TAB */}
          {activeTab === "battles" && (
            <div className="space-y-4">
              {/* BATTLE INVITES */}
              {battleInvites.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-800 mb-2">⚔️ Challenges Received</div>
                  {battleInvites.map((invite) => (
                    <div
                      key={invite.inviteId}
                      className="flex items-center justify-between p-2 border rounded border-gray-300"
                    >
                      <img
                        src={invite.senderAvatar || defaultAvatar}
                        alt=""
                        className="w-9 h-9 rounded-full border-2 border-gray-800"
                      />
                      <div className="flex-1 ml-2">
                        <div className="font-bold text-sm">{invite.senderName}</div>
                        <div className="text-xs text-gray-500">Wants to battle!</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAcceptBattleInvite(invite.inviteId)}
                          className="w-7 h-7 rounded-full bg-green-600 text-white text-xs flex items-center justify-center"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleDeclineBattleInvite(invite.inviteId)}
                          className="w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FRIENDS IN BATTLE (Spectate Section) */}
              <div>
                <div className="font-semibold text-gray-800 mb-2">👁️ Spectate Friends</div>
                {friends.filter((f) => f.currentBattle).length === 0 ? (
                  <div className="text-gray-500">No friends in battle</div>
                ) : (
                  friends
                    .filter((f) => f.currentBattle)
                    .map((friend) => (
                      <div
                        key={friend.avatarId}
                        className="flex items-center justify-between p-2 border rounded border-purple-600"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full bg-center bg-cover relative"
                            style={{ backgroundImage: `url(${friend.avatarImage || defaultAvatar})` }}
                          >
                            <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs rounded-full px-1">
                              ⚔️
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{friend.userName}</div>
                            <div className="text-xs text-red-600">🔴 In Battle</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSpectate(friend)}
                          className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center"
                          title="Spectate"
                        >
                          👁️
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

      {selectedFriend && myAvatarData && !selectedFriend.currentBattle && (
        <ChatWindow
          token={token}
          myAvatarId={myAvatarId}
          myUserName={myAvatarData.userName}
          myAvatarImage={myAvatarData.avatar}
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onChallenge={(avatarId) => {
            const friend = friends.find((f) => f.avatarId === avatarId);
            if (friend) handleChallengeFriend(friend);
          }}
        />
      )}
    </>
  );
}