import React from "react";
import { BattleInvite } from "../../types/friends.types";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "#fff3e0",
    borderRadius: 8,
    marginBottom: 8,
    border: "2px solid #ff9800",
  },
  avatar: { width: 36, height: 36, borderRadius: "50%", border: "2px solid #333" },
  info: { flex: 1 },
  name: { fontWeight: "bold" as const, fontSize: 13 },
  subtext: { fontSize: 11, color: "#666" },
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

interface BattleInviteItemProps {
  invite: BattleInvite;
  onAccept: () => void;
  onDecline: () => void;
}

export function BattleInviteItem({ invite, onAccept, onDecline }: BattleInviteItemProps) {
  return (
    <div style={styles.container}>
      <img src={invite.senderAvatar || defaultAvatar} alt="" style={styles.avatar} />
      <div style={styles.info}>
        <div style={styles.name}>{invite.senderName}</div>
        <div style={styles.subtext}>Wants to battle!</div>
      </div>
      <div style={styles.actions}>
        <button onClick={onAccept} style={styles.btn("#4CAF50")}>✓</button>
        <button onClick={onDecline} style={styles.btn("#ff5555")}>✕</button>
      </div>
    </div>
  );
}