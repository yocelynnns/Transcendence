import React from "react";
import { FriendRequest } from "../../types/friends.types";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #ffcc00",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid #333",
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
  email: { fontSize: 11, color: "#666" },
  actions: { display: "flex", gap: 4 },
  btn: (bg: string): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: bg,
    color: "white",
    border: "2px solid #333",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  }),
};

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {
  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.avatar,
          background: `url(${request.avatarImage || defaultAvatar}) center/cover`,
        }}
      />
      <div style={styles.info}>
        <div style={styles.name}>{request.userName}</div>
        <div style={styles.email}>{request.email}</div>
      </div>
      <div style={styles.actions}>
        <button onClick={onAccept} style={styles.btn("#4CAF50")}>✓</button>
        <button onClick={onReject} style={styles.btn("#ff5555")}>✕</button>
      </div>
    </div>
  );
}