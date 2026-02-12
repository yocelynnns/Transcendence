import React from "react";
import { Friend } from "../../types/friends.types";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

const styles = {
  container: {
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
  onlineIndicator: (online: boolean): React.CSSProperties => ({
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "2px solid white",
  }),
  battleIndicator: {
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
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 13,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },
  status: { fontSize: 11, color: "#666" },
  actions: { display: "flex", gap: 4, flexShrink: 0 },
  iconBtn: (bg: string, disabled?: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: bg,
    color: "white",
    border: "2px solid #333",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    opacity: disabled ? 0.5 : 1,
  }),
  blockedBadge: {
    fontSize: 9,
    color: "#ff5555",
    fontWeight: "bold" as const,
    background: "#ffebee",
    padding: "1px 4px",
    borderRadius: 4,
    border: "1px solid #ff5555",
    marginLeft: 4,
  },
};

interface FriendItemProps {
  friend: Friend;
  isBlocked: boolean;
  onChat: () => void;
  onSpectate: () => void;
  onViewResults: () => void;
  onChallenge: () => void;
  onBlockToggle: () => void;
  onRemove: () => void;
}

export function FriendItem({
  friend,
  isBlocked,
  onChat,
  onSpectate,
  onViewResults,
  onChallenge,
  onBlockToggle,
  onRemove,
}: FriendItemProps) {
  const getStatusText = () => {
    if (isBlocked) return "🔇 Messages Blocked";
    if (friend.battleStatus === "in_battle") return "🔴 In Battle";
    if (friend.battleStatus === "viewing_results") return "📊 Viewing Results";
    if (friend.online) return "🟢 Online";
    return "⚫ Offline";
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...(styles.avatar as React.CSSProperties),
          background: `url(${friend.avatarImage || defaultAvatar}) center/cover`,
        }}
      >
        {friend.battleStatus === "in_battle" || friend.battleStatus === "viewing_results" ? (
          <div style={styles.battleIndicator as React.CSSProperties}>
            {friend.battleStatus === "in_battle" ? "⚔️" : "📊"}
          </div>
        ) : (
          <div style={styles.onlineIndicator(!!friend.online) as React.CSSProperties} />
        )}
      </div>
      <div style={styles.info}>
        <div style={styles.name}>
          {friend.userName}
          {isBlocked && <span style={styles.blockedBadge}>BLOCKED</span>}
        </div>
        <div style={styles.status}>{getStatusText()}</div>
      </div>

      <div style={styles.actions}>
        {!friend.currentBattle && (
          <button
            onClick={onChat}
            style={styles.iconBtn("#4CAF50", isBlocked)}
            title={isBlocked ? "Unblock to chat" : "Chat"}
            disabled={isBlocked}
          >
            💬
          </button>
        )}

        {friend.battleStatus === "in_battle" && (
          <button onClick={onSpectate} style={styles.iconBtn("#9c27b0")} title="Spectate">
            👁️
          </button>
        )}

        {friend.battleStatus === "viewing_results" && (
          <button onClick={onViewResults} style={styles.iconBtn("#2196F3")} title="View Results">
            📊
          </button>
        )}

        {!friend.currentBattle && friend.online && (
          <button
            onClick={onChallenge}
            style={styles.iconBtn("#ff5722", isBlocked)}
            title={isBlocked ? "Unblock to challenge" : "Challenge"}
            disabled={isBlocked}
          >
            ⚔️
          </button>
        )}

        {isBlocked ? (
          <button onClick={onBlockToggle} style={styles.iconBtn("#4CAF50")} title="Unblock Messages">
            🔔
          </button>
        ) : (
          <button onClick={onBlockToggle} style={styles.iconBtn("#ff9800")} title="Block Messages">
            🔇
          </button>
        )}

        <button onClick={onRemove} style={styles.iconBtn("#ff5555")} title="Remove Friend">
          🗑️
        </button>
      </div>
    </div>
  );
}