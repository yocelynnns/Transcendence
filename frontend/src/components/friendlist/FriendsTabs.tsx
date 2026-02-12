import React from "react";
import PixelButton from "../elements/PixelButton";

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

  const buttonHeight = 45;
  const buttonWidth = 130;

  const getColors = (tab: "friends" | "requests" | "battles") =>
    activeTab === tab
      ? { colorA: "#ffcc00", colorB: "#d4a500", colorText: "#000000" } // active: yellow gradient
      : { colorA: "#677fb4", colorB: "#384071", colorText: "#ffffff" }; // inactive: normal pinkish

  return (
    <div className="flex justify-between mb-4">
      <PixelButton
        onClick={() => setActiveTab("friends")}
        width={buttonWidth}
        height={buttonHeight}
        textSize="14px"
        cursorPointer={true}
        {...getColors("friends")}
      >
        Friends ({friendsCount})
      </PixelButton>

      <PixelButton
        onClick={() => setActiveTab("requests")}
        width={buttonWidth}
        height={buttonHeight}
        textSize="14px"
        cursorPointer={true}
        {...getColors("requests")}
      >
        Requests{requestsCount > 0 && ` (${requestsCount})`}
      </PixelButton>

      <PixelButton
        onClick={() => setActiveTab("battles")}
        width={buttonWidth}
        height={buttonHeight}
        textSize="14px"
        cursorPointer={true}
        {...getColors("battles")}
      >
        Battles{battleInvitesCount > 0 && ` (${battleInvitesCount})`}
      </PixelButton>
    </div>
  );
}