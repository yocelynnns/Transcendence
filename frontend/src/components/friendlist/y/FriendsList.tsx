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
  onClosePanel?: () => void; // NEW
}

// STYLES
// const styles = {
//   panel: {
//     position: "absolute" as const,
//     top: 20,
//     left: 20,
//     width: 320,
//     maxHeight: "80vh",
//     overflowY: "auto" as const,
//     padding: 20,
//     background: "white",
//     borderRadius: 12,
//     boxShadow: "0 0 10px rgba(0,0,0,0.3)",
//     zIndex: 100,
//     fontFamily: "monospace",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//     paddingBottom: 10,
//     borderBottom: "2px solid #333",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold" as const,
//     color: "#333",
//     margin: 0,
//   },
//   closeBtn: {
//     background: "transparent",
//     border: "none",
//     fontSize: 18,
//     cursor: "pointer",
//     color: "#333",
//   },
//   tabs: {
//     display: "flex",
//     gap: 4,
//     marginBottom: 16,
//   },
//   tab: (active: boolean) => ({
//     flex: 1,
//     padding: "6px 8px",
//     fontSize: 12,
//     fontFamily: "monospace",
//     cursor: "pointer",
//     border: "2px solid #333",
//     borderRadius: 6,
//     background: active ? "#ffcc00" : "white",
//     fontWeight: active ? "bold" as const : "normal" as const,
//   }),
//   addFriendBox: {
//     background: "#f9f9f9",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     border: "2px solid #333",
//   },
//   input: {
//     width: "100%",
//     padding: 8,
//     fontSize: 14,
//     fontFamily: "monospace",
//     border: "2px solid #333",
//     borderRadius: 4,
//     marginBottom: 8,
//     boxSizing: "border-box" as const,
//   },
//   addBtn: {
//     width: "100%",
//     padding: 8,
//     fontSize: 14,
//     fontFamily: "monospace",
//     background: "#4CAF50",
//     color: "white",
//     border: "2px solid #333",
//     borderRadius: 4,
//     cursor: "pointer",
//   },
//   friendItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     padding: 10,
//     background: "#f9f9f9",
//     borderRadius: 8,
//     marginBottom: 8,
//     border: "2px solid #333",
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: "50%",
//     border: "2px solid #333",
//     position: "relative" as const,
//     flexShrink: 0,
//   },
//   onlineIndicator: (online: boolean) => ({
//     position: "absolute" as const,
//     bottom: -2,
//     right: -2,
//     width: 12,
//     height: 12,
//     borderRadius: "50%",
//     background: online ? "#4CAF50" : "#999",
//     border: "2px solid white",
//   }),
//   battleIndicator: {
//     position: "absolute" as const,
//     bottom: -2,
//     right: -2,
//     width: 14,
//     height: 14,
//     borderRadius: "50%",
//     background: "#ff9800",
//     border: "2px solid white",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 8,
//   },
//   friendInfo: {
//     flex: 1,
//     minWidth: 0,
//   },
//   friendName: {
//     fontSize: 13,
//     fontWeight: "bold" as const,
//     color: "#333",
//     marginBottom: 2,
//     whiteSpace: "nowrap" as const,
//     overflow: "hidden" as const,
//     textOverflow: "ellipsis" as const,
//   },
//   friendStatus: {
//     fontSize: 11,
//     color: "#666",
//   },
//   actionButtons: {
//     display: "flex",
//     gap: 4,
//     flexShrink: 0,
//   },
//   iconBtn: (bg: string) => ({
//     width: 28,
//     height: 28,
//     borderRadius: "50%",
//     background: bg,
//     color: "white",
//     border: "2px solid #333",
//     cursor: "pointer",
//     fontSize: 12,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 0,
//   }),
//   requestItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: 10,
//     background: "#f9f9f9",
//     borderRadius: 8,
//     marginBottom: 8,
//     border: "2px solid #ffcc00",
//   },
//   inviteItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: 10,
//     background: "#fff3e0",
//     borderRadius: 8,
//     marginBottom: 8,
//     border: "2px solid #ff9800",
//   },
//   actionBtns: {
//     display: "flex",
//     gap: 4,
//   },
//   acceptBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: "50%",
//     background: "#4CAF50",
//     color: "white",
//     border: "2px solid #333",
//     cursor: "pointer",
//     fontSize: 14,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 0,
//   },
//   rejectBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: "50%",
//     background: "#ff5555",
//     color: "white",
//     border: "2px solid #333",
//     cursor: "pointer",
//     fontSize: 14,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 0,
//   },
//   message: (isSuccess: boolean) => ({
//     marginTop: 8,
//     marginBottom: 8,
//     fontSize: 12,
//     color: isSuccess ? "#4CAF50" : "#ff5555",
//     fontWeight: "bold" as const,
//     textAlign: "center" as const,
//   }),
//   emptyText: {
//     textAlign: "center" as const,
//     color: "#666",
//     fontSize: 14,
//     padding: 20,
//   },
//   friendBtn: {
//     position: "absolute" as const,
//     top: 20,
//     left: 20,
//     width: 50,
//     height: 50,
//     borderRadius: "50%",
//     cursor: "pointer",
//     border: "2px solid #333",
//     background: "#ffcc00",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 24,
//     zIndex: 100,
//   },
//   badge: (color: string) => ({
//     position: "absolute" as const,
//     top: -5,
//     right: -5,
//     width: 20,
//     height: 20,
//     borderRadius: "50%",
//     background: color,
//     color: "white",
//     fontSize: 11,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontWeight: "bold" as const,
//     border: "2px solid #333",
//   }),
//   battleInvitesSection: {
//     marginBottom: 16,
//     padding: 12,
//     background: "#fff8e1",
//     borderRadius: 8,
//     border: "2px solid #ff9800",
//   },
//   sectionTitle: {
//     margin: "0 0 10px 0",
//     fontSize: 14,
//     color: "#e65100",
//     fontWeight: "bold" as const,
//     display: "flex",
//     alignItems: "center",
//     gap: 6,
//   },
// };

export default function FriendsList({ 
  token, 
  myAvatarId, 
  myAvatarData,
  setSpectatingBattle,
  setCurrentBattle,
  onClosePanel
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
      // setShowPanel(false);
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
        // setShowPanel(false);
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
    // if (showPanel) {
      fetchFriends();
      fetchRequests();
    // }
  }, []);
  // }, [showPanel]);

  const isSuccessMessage = message.startsWith("✅") || message.startsWith("⚔️");

  // Get total notification count
  const totalNotifications = requests.length + battleInvites.length;

  return (
    <>
      {/* FRIENDS BUTTON */}
      {/* {!showPanel && (
        <div
          onClick={() => setShowPanel(true)}
        >
          <img
            src={ASSETS.ICONS.FRIENDLIST}
            alt="Friends"
            className="w-14 h-14 object-contain image-rendering-pixelated hover:scale-110"
          />
          {totalNotifications > 0 && (
            <div style={styles.badge(totalNotifications > 9 ? "#ff5555" : "#ff9800")}>
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </div>
          )}
        </div>
      )} */}

      {/* FRIENDS PANEL */}
      {/* {showPanel  && ( */}
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-6">
          {/* HEADER */}
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
                  }`}
                >
                  {loading ? "..." : "Add Friend"}
                </button>
              </div>

              {/* FRIENDS LIST */}
              <div>
                {friends.length === 0 ? (
                  <div className="text-gray-500">No friends yet. Add some!</div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.avatarId}
                      className="flex items-center justify-between p-2 border rounded border-gray-300"
                    >
                      <div >
                        <div
                          className="w-10 h-10 rounded-full bg-center bg-cover relative"
                          style={{ backgroundImage: `url(${friend.avatarImage || defaultAvatar})` }}
                        >
                          {friend.currentBattle && (
                            <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs rounded-full px-1">
                              ⚔️
                            </div>
                          )}
                          {!friend.currentBattle && (
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${
                                friend.online ? "bg-green-500" : "bg-gray-500"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-semibold">{friend.userName}</div>
                        <div className="text-xs text-gray-600">
                          {friend.currentBattle 
                            ? "🔴 In Battle" 
                            : friend.online 
                              ? "🟢 Online" 
                              : "⚫ Offline"
                          }
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {friend.currentBattle ? (
                          <button
                            onClick={() => handleSpectate(friend)}
                            className="w-7 h-7 rounded-full text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                            style={{ backgroundColor: "#9c27b0"}}
                            title="Spectate"
                          >
                            👁️
                          </button>
                        ) : friend.online ? (
                          <>
                            <button
                              onClick={() => handleChallengeFriend(friend)}
                              className="w-7 h-7 rounded-full text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                              style={{ backgroundColor: "#ff5722"}}
                              title="Challenge"
                            >
                              ⚔️
                            </button>
                            <button
                              onClick={() => setSelectedFriend(friend)}
                              className="w-7 h-7 rounded-full text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                              style={{ backgroundColor: "#4CAF50"}}
                              title="Chat"
                            >
                              💬
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedFriend(friend)}
                            className="w-7 h-7 rounded-full text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                            style={{ backgroundColor: "#4CAF50"}}
                            title="Chat"
                          >
                            💬
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemoveFriend(friend.avatarId)}
                          className="w-7 h-7 rounded-full text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                          style={{ backgroundColor: "#ff5555"}}
                          title="Remove"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
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
      {/* )} */}

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