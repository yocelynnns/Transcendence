import { useState, useEffect } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { ASSETS } from "../../assets";
import ChatWindow from "../chat/ChatWindow";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

// TYPES
interface Friend {
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  characterOption: number;
  online?: boolean;
}

interface FriendRequest {
  requestId: string;
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  createdAt: string;
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
}

// STYLES - Matching GameProfile aesthetic
const styles = {
  panel: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    width: 300,
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
    gap: 8,
    marginBottom: 16,
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: "8px 12px",
    fontSize: 14,
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
    gap: 12,
    padding: 12,
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    border: "2px solid #333",
    position: "relative" as const,
  },
  onlineIndicator: (online: boolean) => ({
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "2px solid white",
  }),
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
    color: "#666",
  },
  chatBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#4CAF50",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 16,
    marginRight: 8,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#ff5555",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 16,
  },
  requestItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #ffcc00",
  },
  actionBtns: {
    display: "flex",
    gap: 6,
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#4CAF50",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 16,
  },
  rejectBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#ff5555",
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 16,
  },
  message: (isSuccess: boolean) => ({
    marginTop: 8,
    fontSize: 12,
    color: isSuccess ? "#4CAF50" : "#ff5555",
    fontWeight: "bold" as const,
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
  badge: {
    position: "absolute" as const,
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#ff5555",
    color: "white",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold" as const,
    border: "2px solid #333",
  },
};

export default function FriendsList({ token, myAvatarId, myAvatarData }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
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
        const data = await res.json();
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
      setMessage("📨 New friend request received!");
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

    return () => {
      cleanupStatusUpdate();
      cleanupStatusChange();
      cleanupAvatarUpdate();
      cleanupAutoAccept();
      cleanupRemovedByFriend();
      cleanupFriendRequestReceived();
      cleanupRequestAccepted();
    };
  }, [emitEvent, subscribeEvent, myAvatarId]);

  // INITIAL FETCH
  useEffect(() => {
    if (showPanel) {
      fetchFriends();
      fetchRequests();
    }
  }, [showPanel]);

  const isSuccessMessage = message.startsWith("✅");

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
          {requests.length > 0 && <div style={styles.badge}>{requests.length}</div>}
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
          </div>

          {/* MESSAGE */}
          {message && <div style={styles.message(isSuccessMessage)}>{message}</div>}

          {/* ADD FRIEND FORM */}
          {activeTab === "friends" && (
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
          )}

          {/* FRIENDS LIST */}
          {activeTab === "friends" && (
            <div>
              {friends.length === 0 ? (
                <div style={styles.emptyText}>No friends yet. Add some!</div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.avatarId} style={styles.friendItem}>
                    <div
                      style={{
                        ...styles.avatar,
                        background: `url(${friend.avatarImage || defaultAvatar}) center/cover`,
                      }}
                    >
                      <div style={styles.onlineIndicator(!!friend.online)} />
                    </div>
                    <div style={styles.friendInfo}>
                      <div style={styles.friendName}>{friend.userName}</div>
                      <div style={styles.friendStatus}>
                        {friend.online ? "🟢 Online" : "⚫ Offline"}
                      </div>
                    </div>
                    
                    {/* CHAT BUTTON */}
                    <button
                      onClick={() => setSelectedFriend(friend)}
                      style={styles.chatBtn}
                      title="Chat"
                    >
                      💬
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFriend(friend.avatarId)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* REQUESTS LIST */}
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
        </div>
      )}

      {/* CHAT WINDOW */}
      {selectedFriend && myAvatarData && (
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