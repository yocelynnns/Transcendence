import React from "react";

interface FriendsTabsProps {
  activeTab: "friends" | "requests" | "battles";
  setActiveTab: (tab: "friends" | "requests" | "battles") => void;
  friendsCount: number;
  requestsCount: number;
  battleInvitesCount: number;
}

export function FriendsTabs({
  activeTab,
  setActiveTab,
  friendsCount,
  requestsCount,
  battleInvitesCount,
}: FriendsTabsProps) {

  const baseTabClasses =
    "flex-1 px-2 py-1 text-xs font-mono border-2 rounded-md cursor-pointer text-center";

  const getTabClasses = (tab: "friends" | "requests" | "battles") =>
  `${baseTabClasses} ${
    activeTab === tab
      ? "bg-yellow-400 font-bold border-gray-800"
      : "bg-white font-normal border-gray-800"
  }`;

  return (
    <div className="flex gap-1 mb-4">
      <button 
        onClick={() => setActiveTab("friends")}
        className={getTabClasses("friends")}
      >
        Friends ({friendsCount})
      </button>
      <button 
        onClick={() => setActiveTab("requests")}
        className={getTabClasses("requests")}
      >
        Requests{requestsCount > 0 && ` (${requestsCount})`}
      </button>
      <button 
        onClick={() => setActiveTab("battles")}
        className={getTabClasses("battles")}
      >
        Battles{battleInvitesCount > 0 && ` (${battleInvitesCount})`}
      </button>
    </div>
  );
}