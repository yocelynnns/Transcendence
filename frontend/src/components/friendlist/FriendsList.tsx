import { useState, useEffect } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { ASSETS } from "../../assets";
import ChatWindow from "../chat/ChatWindow";
import { useNavigate } from "react-router-dom";
import { Battle } from "../../types/battleTypes";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

// TYPES
interface Friend {
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  characterOption: number;
  online?: boolean;
  currentBattle?: string | null;
}

interface FriendRequest {
  requestId: string;
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  createdAt: string;
}

interface BattleInvite {
  inviteId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: Date;
}

interface AvatarData {
  _id: string;
  userName: string;
  avatar: string;
  characterOption?: number;
}

interface FriendsListProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: AvatarData;
  setSpectatingBattle?: React.Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: React.Dispatch<React.SetStateAction<Battle | null>>;
}

// STYLES
const styles = {
  panel: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    width: 320,
    maxHeight: "80vh",
    overflowY: "auto" as const,
    padding: 20,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    zIndex: 100,
    fontFamily: "monospace",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "2px solid #333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#333",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#333",
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 16,
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: "6px 8px",
    fontSize: 12,
    fontFamily: "monospace",
    cursor: "pointer",
    border: "2px solid #333",
    borderRadius: 6,
    background: active ? "#ffcc00" : "white",
    fontWeight: active ? "bold" as const : "normal" as const,
  }),
  addFriendBox: {
    background: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    border: "2px solid #333",
  },
  input: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    fontFamily: "monospace",
    border: "2px solid #333",
    borderRadius: 4,
    marginBottom: 8,
    boxSizing: "border-box" as const,
  },
  addBtn: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    fontFamily: "monospace",
    background: "#4CAF50",
    color: "white",
    border: "2px solid #333",
    borderRadius: 4,
    cursor: "pointer",
  },
  friendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 10,
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #333",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid #333",
    position: "relative" as const,
    flexShrink: 0,
  },
  onlineIndicator: (online: boolean) => ({
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "2px solid white",
  }),
  battleIndicator: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#ff9800",
    border: "2px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
  },
  battleEndedIndicator: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#9c27b0",
    border: "2px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
  },
  friendInfo: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontSize: 13,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },
  friendStatus: {
    fontSize: 11,
    color: "#666",
  },
  actionButtons: {
    display: "flex",
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: (bg: string) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: bg,
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  }),
  requestItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #ffcc00",
  },
  inviteItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "#fff3e0",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #ff9800",
  },
  actionBtns: {
    display: "flex",
    gap: 4,
  },
  acceptBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#4CAF50",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  rejectBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#ff5555",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  message: (isSuccess: boolean) => ({
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    color: isSuccess ? "#4CAF50" : "#ff5555",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
  }),
  emptyText: {
    textAlign: "center" as const,
    color: "#666",
    fontSize: 14,
    padding: 20,
  },
  friendBtn: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #333",
    background: "#ffcc00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    zIndex: 100,
  },
  badge: (color: string) => ({
    position: "absolute" as const,
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: color,
    color: "white",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold" as const,
    border: "2px solid #333",
  }),
  battleInvitesSection: {
    marginBottom: 16,
    padding: 12,
    background: "#fff8e1",
    borderRadius: 8,
    border: "2px solid #ff9800",
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: 14,
    color: "#e65100",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
};

export default function FriendsList({ 
  token, 
  myAvatarId, 
  myAvatarData,
  setSpectatingBattle,
  setCurrentBattle  
}: FriendsListProps) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [battleInvites, setBattleInvites] = useState<BattleInvite[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "battles">("friends");
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  // NEW: Track which friends have ended battles but not acknowledged
  const [battleEndedFriends, setBattleEndedFriends] = useState<Set<string>>(new Set());

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
      setShowPanel(false);
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
    
    emitEvent("sendMatchInvite", { receiverId: friend.avatarId });
    setMessage(`⚔️ Challenge sent to ${friend.userName}!`);
    setTimeout(() => setMessage(""), 3000);
  };

  // ACCEPT BATTLE INVITE
  const handleAcceptBattleInvite = (inviteId: string) => {
    emitEvent("respondToMatchInvite", { inviteId, accept: true });
    setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
  };

  // DECLINE BATTLE INVITE
  const handleDeclineBattleInvite = (inviteId: string) => {
    emitEvent("respondToMatchInvite", { inviteId, accept: false });
    setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
  };

  // SEND FRIEND REQUEST
  const handleSendRequest = async () => {
    if (!friendEmail.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5001/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendEmail: friendEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.autoAccepted) {
          setMessage("✅ Auto-accepted! You are now friends!");
          
          const normalizedEmail = friendEmail.trim().toLowerCase();
          setRequests((prev) => prev.filter((req) => 
            req.email.toLowerCase() !== normalizedEmail
          ));
          
          fetchFriends();
          
          if (data.accepterInfo) {
            setFriends((prev) => [...prev, { ...data.accepterInfo, online: false }]);
          }
          
          if (data.targetAvatarId) {
            emitEvent("friendRequestAccepted", {
              targetAvatarId: data.targetAvatarId,
              accepterInfo: {
                avatarId: myAvatarId,
                userName: myAvatarData?.userName || "Unknown",
                avatarImage: myAvatarData?.avatar || "",
              },
            });
          }
        } else {
          setMessage("✅ Friend request sent!");
          setFriendEmail("");
          if (data.targetAvatarId) {
            emitEvent("friendRequestSent", {
              targetAvatarId: data.targetAvatarId,
              requesterInfo: data.requesterInfo,
            });
          }
        }
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Failed to send request");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
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
        // Remove from battleEnded set if they started a new battle
        setBattleEndedFriends((prev) => {
          const next = new Set(prev);
          next.delete(avatarId);
          return next;
        });
      }
    );

    // UPDATED: Handle battle ended with acknowledgment
    const cleanupBattleEnded = subscribeEvent<{ avatarId: string; battleId: string; acknowledged?: boolean }>(
      "friendBattleEnded",
      ({ avatarId, acknowledged }) => {
        if (acknowledged) {
          // Player clicked home - fully available
          setFriends((prev) =>
            prev.map((friend) =>
              friend.avatarId === avatarId 
                ? { ...friend, currentBattle: null, online: true } 
                : friend
            )
          );
          setBattleEndedFriends((prev) => {
            const next = new Set(prev);
            next.delete(avatarId);
            return next;
          });
        } else {
          // Battle ended but not acknowledged - show special state
          setBattleEndedFriends((prev) => new Set(prev).add(avatarId));
          setFriends((prev) =>
            prev.map((friend) =>
              friend.avatarId === avatarId 
                ? { ...friend, currentBattle: null } 
                : friend
            )
          );
        }
        // Refresh to get latest state
        fetchFriends();
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
        setShowPanel(false);
        console.log("🎮 Navigation called to:", `/teamSelect/${battle._id}`);
      }
    );

    const cleanupMatchInviteCancelled = subscribeEvent<{
      inviteId: string;
      reason: string;
      message: string;
      senderName: string;
    }>("matchInviteCancelled", (data) => {
      // Remove the cancelled invite from UI
      setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== data.inviteId));
      setMessage(`❌ ${data.message}`);
      setTimeout(() => setMessage(""), 5000);
    });

    const cleanupMatchInviteDeclined = subscribeEvent<{
      inviteId?: string;
      by: string;
      reason?: string;
      message?: string;
    }>("matchInviteDeclined", (data) => {
      // If we have a specific inviteId, remove it
      if (data.inviteId) {
        setBattleInvites((prev) => prev.filter((inv) => inv.inviteId !== data.inviteId));
      }
      setMessage(data.message || "❌ Invitation declined. Receiver joined another battle.");
      setTimeout(() => setMessage(""), 5000);
    });

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
      cleanupAvatarUpdate();
      cleanupAutoAccept();
      cleanupRemovedByFriend();
      cleanupFriendRequestReceived();
      cleanupRequestAccepted();
      cleanupDirectMatchReady?.();
      cleanupMatchInviteError?.();
      cleanupMatchInviteCancelled?.();
      cleanupMatchInviteDeclined?.();

    };
  }, [emitEvent, subscribeEvent, myAvatarId]);

  // INITIAL FETCH
  useEffect(() => {
    if (showPanel) {
      fetchFriends();
      fetchRequests();
    }
  }, [showPanel]);

  const isSuccessMessage = message.startsWith("✅") || message.startsWith("⚔️");

  // Get total notification count
  const totalNotifications = requests.length + battleInvites.length;

  // NEW: Helper to get friend status display
  const getFriendStatus = (friend: Friend) => {
    if (battleEndedFriends.has(friend.avatarId)) {
      return { text: "🏁 Viewing Results", color: "#9c27b0" };
    }
    if (friend.currentBattle) {
      return { text: "🔴 In Battle", color: "#ff5722" };
    }
    if (friend.online) {
      return { text: "🟢 Online", color: "#4CAF50" };
    }
    return { text: "⚫ Offline", color: "#666" };
  };

  return (
    <>
      {/* FRIENDS BUTTON */}
      {!showPanel && (
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
      )}

      {/* FRIENDS PANEL */}
      {showPanel && (
        <div style={styles.panel}>
          {/* HEADER */}
          <div style={styles.header}>
            <h2 style={styles.title}>Friends</h2>
            <button onClick={() => setShowPanel(false)} style={styles.closeBtn}>
              ✕
            </button>
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab("friends")}
              style={styles.tab(activeTab === "friends")}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              style={styles.tab(activeTab === "requests")}
            >
              Requests{requests.length > 0 && ` (${requests.length})`}
            </button>
            <button
              onClick={() => setActiveTab("battles")}
              style={styles.tab(activeTab === "battles")}
            >
              Battles{battleInvites.length > 0 && ` (${battleInvites.length})`}
            </button>
          </div>

          {/* MESSAGE */}
          {message && <div style={styles.message(isSuccessMessage)}>{message}</div>}

          {/* FRIENDS TAB */}
          {activeTab === "friends" && (
            <>
              {/* ADD FRIEND FORM */}
              <div style={styles.addFriendBox}>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@email.com"
                  style={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && handleSendRequest()}
                />
                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  style={{
                    ...styles.addBtn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "..." : "Add Friend"}
                </button>
              </div>

              {/* FRIENDS LIST */}
              <div>
                {friends.length === 0 ? (
                  <div style={styles.emptyText}>No friends yet. Add some!</div>
                ) : (
                  friends.map((friend) => {
                    const status = getFriendStatus(friend);
                    const isBattleEnded = battleEndedFriends.has(friend.avatarId);
                    
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
                          ) : isBattleEnded ? (
                            <div style={styles.battleEndedIndicator}>🏁</div>
                          ) : (
                            <div style={styles.onlineIndicator(!!friend.online)} />
                          )}
                        </div>
                        <div style={styles.friendInfo}>
                          <div style={styles.friendName}>{friend.userName}</div>
                          <div style={{ ...styles.friendStatus, color: status.color }}>
                            {status.text}
                          </div>
                        </div>
                        
                        <div style={styles.actionButtons}>
                          {friend.currentBattle ? (
                            <button
                              onClick={() => handleSpectate(friend)}
                              style={styles.iconBtn("#9c27b0")}
                              title="Spectate"
                            >
                              👁️
                            </button>
                          ) : isBattleEnded ? (
                            // Can't challenge or chat while viewing results
                            <button
                              style={{ ...styles.iconBtn("#ccc"), cursor: "not-allowed" }}
                              title="Viewing battle results"
                              disabled
                            >
                              ⏳
                            </button>
                          ) : friend.online ? (
                            <>
                              <button
                                onClick={() => handleChallengeFriend(friend)}
                                style={styles.iconBtn("#ff5722")}
                                title="Challenge"
                              >
                                ⚔️
                              </button>
                              <button
                                onClick={() => setSelectedFriend(friend)}
                                style={styles.iconBtn("#4CAF50")}
                                title="Chat"
                              >
                                💬
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedFriend(friend)}
                              style={styles.iconBtn("#4CAF50")}
                              title="Chat"
                            >
                              💬
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoveFriend(friend.avatarId)}
                            style={styles.iconBtn("#ff5555")}
                            title="Remove"
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
                <div style={styles.emptyText}>No pending requests</div>
              ) : (
                requests.map((request) => (
                  <div key={request.requestId} style={styles.requestItem}>
                    <div
                      style={{
                        ...styles.avatar,
                        background: `url(${request.avatarImage || defaultAvatar}) center/cover`,
                      }}
                    />
                    <div style={styles.friendInfo}>
                      <div style={styles.friendName}>{request.userName}</div>
                      <div style={styles.friendStatus}>{request.email}</div>
                    </div>
                    <div style={styles.actionBtns}>
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        style={styles.acceptBtn}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.requestId)}
                        style={styles.rejectBtn}
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
            <div>
              {/* BATTLE INVITES */}
              {battleInvites.length > 0 && (
                <div style={styles.battleInvitesSection}>
                  <div style={styles.sectionTitle}>⚔️ Challenges Received</div>
                  {battleInvites.map((invite) => (
                    <div key={invite.inviteId} style={styles.inviteItem}>
                      <img 
                        src={invite.senderAvatar || defaultAvatar} 
                        alt="" 
                        style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #333" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: 13 }}>{invite.senderName}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>Wants to battle!</div>
                      </div>
                      <div style={styles.actionBtns}>
                        <button
                          onClick={() => handleAcceptBattleInvite(invite.inviteId)}
                          style={styles.acceptBtn}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleDeclineBattleInvite(invite.inviteId)}
                          style={styles.rejectBtn}
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
                <div style={{ ...styles.sectionTitle, color: "#333", marginBottom: 10 }}>
                  👁️ Spectate Friends
                </div>
                {friends.filter(f => f.currentBattle).length === 0 ? (
                  <div style={styles.emptyText}>No friends in battle</div>
                ) : (
                  friends
                    .filter(f => f.currentBattle)
                    .map((friend) => (
                      <div key={friend.avatarId} style={{ ...styles.friendItem, borderColor: "#9c27b0" }}>
                        <div
                          style={{
                            ...styles.avatar,
                            background: `url(${friend.avatarImage || defaultAvatar}) center/cover`,
                          }}
                        >
                          <div style={styles.battleIndicator}>⚔️</div>
                        </div>
                        <div style={styles.friendInfo}>
                          <div style={styles.friendName}>{friend.userName}</div>
                          <div style={styles.friendStatus}>🔴 In Battle</div>
                        </div>
                        <button
                          onClick={() => handleSpectate(friend)}
                          style={styles.iconBtn("#9c27b0")}
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
      )}

      {/* CHAT WINDOW */}
      {selectedFriend && myAvatarData && !selectedFriend.currentBattle && (
        <ChatWindow
          token={token}
          myAvatarId={myAvatarId}
          myUserName={myAvatarData.userName}
          myAvatarImage={myAvatarData.avatar}
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </>
  );
}