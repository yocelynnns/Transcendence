import React from "react";

const styles = {
  button: {
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
  badge: (color: string, count: number) => ({
    position: "absolute" as const,
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: color,
    color: "white",
    fontSize: count > 9 ? 9 : 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold" as const,
    border: "2px solid #333",
  }),
};

interface FriendsButtonProps {
  onClick: () => void;
  notificationCount: number;
}

export function FriendsButton({ onClick, notificationCount }: FriendsButtonProps) {
  return (
    <div
      onClick={onClick}
      style={styles.button}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      👥
      {notificationCount > 0 && (
        <div style={styles.badge(notificationCount > 9 ? "#ff5555" : "#ff9800", notificationCount)}>
          {notificationCount > 9 ? "9+" : notificationCount}
        </div>
      )}
    </div>
  );
}