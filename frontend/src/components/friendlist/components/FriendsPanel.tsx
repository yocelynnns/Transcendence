import React from "react";
import { Friend, FriendRequest, BattleInvite } from "../types/friends.types";
import { FriendsTabs } from "./FriendsTabs";
import { AddFriendForm } from "./AddFriendForm";
import { FriendItem } from "./FriendItem";
import { FriendRequestItem } from "./FriendRequestItem";
import { BattleInviteItem } from "./BattleInviteItem";

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
  title: { fontSize: 20, fontWeight: "bold" as const, color: "#333", margin: 0 },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#333",
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
  section: {
    marginBottom: 16,
    padding: 12,
    background: "#fff8e1",
    borderRadius: 8,
    border: "2px solid #ff9800",
  },
  sectionTitle: (color: string) => ({
    margin: "0 0 10px 0",
    fontSize: 14,
    color,
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    gap: 6,
  }),
};

interface FriendsPanelProps {
  // State
  friends: Friend[];
  requests: FriendRequest[];
  battleInvites: BattleInvite[];
  activeTab: "friends" | "requests" | "battles";
  setActiveTab: (tab: "friends" | "requests" | "battles") => void;
  blockedFriends: Set<string>;
  message: string;
  isSuccessMessage: boolean;
  
  // Auth
  token: string;
  myAvatarId: string;
  myAvatarData?: { userName: string; avatar: string };
  
  // Actions
  onClose: () => void;
  onAddFriendSuccess: (data: any, email: string) => void;
  onAddFriendError: (msg: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onAcceptBattleInvite: (inviteId: string) => void;
  onDeclineBattleInvite: (inviteId: string) => void;
  onChat: (friend: Friend) => void;
  onSpectate: (friend: Friend) => void;
  onViewResults: (friend: Friend) => void;
  onChallenge: (friend: Friend) => void;
  onBlockToggle: (friend: Friend, isBlocked: boolean) => void;
  onRemove: (friendAvatarId: string) => void;
}

export function FriendsPanel({
  friends,
  requests,
  battleInvites,
  activeTab,
  setActiveTab,
  blockedFriends,
  message,
  isSuccessMessage,
  token,
  myAvatarId,
  myAvatarData,
  onClose,
  onAddFriendSuccess,
  onAddFriendError,
  onAcceptRequest,
  onRejectRequest,
  onAcceptBattleInvite,
  onDeclineBattleInvite,
  onChat,
  onSpectate,
  onViewResults,
  onChallenge,
  onBlockToggle,
  onRemove,
}: FriendsPanelProps) {
  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Friends</h2>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* Tabs */}
      <FriendsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        friendsCount={friends.length}
        requestsCount={requests.length}
        battleInvitesCount={battleInvites.length}
      />

      {/* Message */}
      {message && <div style={styles.message(isSuccessMessage)}>{message}</div>}

      {/* FRIENDS TAB */}
      {activeTab === "friends" && (
        <>
          <AddFriendForm
            token={token}
            myAvatarId={myAvatarId}
            myAvatarData={myAvatarData}
            onSuccess={onAddFriendSuccess}
            onError={onAddFriendError}
          />

          <div>
            {friends.length === 0 ? (
              <div style={styles.emptyText}>No friends yet. Add some!</div>
            ) : (
              friends.map((friend) => {
                const isBlocked = blockedFriends.has(friend.avatarId);
                return (
                  <FriendItem
                    key={friend.avatarId}
                    friend={friend}
                    isBlocked={isBlocked}
                    onChat={() => onChat(friend)}
                    onSpectate={() => onSpectate(friend)}
                    onViewResults={() => onViewResults(friend)}
                    onChallenge={() => onChallenge(friend)}
                    onBlockToggle={() => onBlockToggle(friend, isBlocked)}
                    onRemove={() => onRemove(friend.avatarId)}
                  />
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
              <FriendRequestItem
                key={request.requestId}
                request={request}
                onAccept={() => onAcceptRequest(request.requestId)}
                onReject={() => onRejectRequest(request.requestId)}
              />
            ))
          )}
        </div>
      )}

      {/* BATTLES TAB */}
      {activeTab === "battles" && (
        <div>
          {/* Battle Invites */}
          {battleInvites.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle("#e65100")}>⚔️ Challenges Received</div>
              {battleInvites.map((invite) => (
                <BattleInviteItem
                  key={invite.inviteId}
                  invite={invite}
                  onAccept={() => onAcceptBattleInvite(invite.inviteId)}
                  onDecline={() => onDeclineBattleInvite(invite.inviteId)}
                />
              ))}
            </div>
          )}

          {/* Friends In Battle */}
          <div>
            <div style={{ ...styles.sectionTitle("#333"), marginBottom: 10 }}>
              👁️ Spectate Friends
            </div>
            {friends.filter((f) => f.battleStatus === "in_battle").length === 0 ? (
              <div style={styles.emptyText}>No friends in battle</div>
            ) : (
              friends
                .filter((f) => f.battleStatus === "in_battle")
                .map((friend) => (
                  <div
                    key={friend.avatarId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 10,
                      background: "#f9f9f9",
                      borderRadius: 8,
                      marginBottom: 8,
                      border: "2px solid #9c27b0",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "2px solid #333",
                        background: `url(${friend.avatarImage}) center/cover`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
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
                        }}
                      >
                        ⚔️
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: "bold" }}>{friend.userName}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>🔴 In Battle</div>
                    </div>
                    <button
                      onClick={() => onSpectate(friend)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#9c27b0",
                        color: "white",
                        border: "2px solid #333",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Spectate"
                    >
                      👁️
                    </button>
                  </div>
                ))
            )}
          </div>

          {/* Friends Viewing Results */}
          {friends.filter((f) => f.battleStatus === "viewing_results").length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ ...styles.sectionTitle("#2196F3"), marginBottom: 10 }}>
                📊 Viewing Results
              </div>
              {friends
                .filter((f) => f.battleStatus === "viewing_results")
                .map((friend) => (
                  <div
                    key={friend.avatarId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 10,
                      background: "#f9f9f9",
                      borderRadius: 8,
                      marginBottom: 8,
                      border: "2px solid #2196F3",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "2px solid #333",
                        background: `url(${friend.avatarImage}) center/cover`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#2196F3",
                          border: "2px solid white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                        }}
                      >
                        📊
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: "bold" }}>{friend.userName}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>📊 Viewing Results</div>
                    </div>
                    <button
                      onClick={() => onViewResults(friend)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#2196F3",
                        color: "white",
                        border: "2px solid #333",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="View Results"
                    >
                      📊
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}