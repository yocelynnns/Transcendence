import React from "react";

interface FriendsTabsProps {
  activeTab: "friends" | "requests" | "battles";
  setActiveTab: (tab: "friends" | "requests" | "battles") => void;
  friendsCount: number;
  requestsCount: number;
  battleInvitesCount: number;
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "6px 8px",
  fontSize: 12,
  fontFamily: "monospace",
  cursor: "pointer",
  border: "2px solid #333",
  borderRadius: 6,
  background: active ? "#ffcc00" : "white",
  fontWeight: active ? "bold" : "normal",
});

export function FriendsTabs({
  activeTab,
  setActiveTab,
  friendsCount,
  requestsCount,
  battleInvitesCount,
}: FriendsTabsProps) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
      <button onClick={() => setActiveTab("friends")} style={tabStyle(activeTab === "friends")}>
        Friends ({friendsCount})
      </button>
      <button onClick={() => setActiveTab("requests")} style={tabStyle(activeTab === "requests")}>
        Requests{requestsCount > 0 && ` (${requestsCount})`}
      </button>
      <button onClick={() => setActiveTab("battles")} style={tabStyle(activeTab === "battles")}>
        Battles{battleInvitesCount > 0 && ` (${battleInvitesCount})`}
      </button>
    </div>
  );
}