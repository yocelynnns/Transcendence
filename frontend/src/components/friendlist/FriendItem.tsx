import React from "react";
import { Friend } from "../../types/friends.types";
import { ASSETS } from "../../assets";
import PixelButton from "../elements/PixelButton";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

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
    <div className="relative mb-6 h-16 w-full">
      {/* PIXEL BACKGROUND */}
      <PixelButton
        colorA="#a5b6dd"
        colorB="#384071"
        colorText="#384071"
        textSize="0"
        height={80}
        width="100%"
        cursorPointer={false}
      />

      {/* CONTENT ON TOP */}
      <div className="absolute top-1 left-0 w-full h-full flex items-center justify-between px-4">
        {/* Avatar */}
        <div
          className="relative w-10 h-10 shrink-0 rounded-full border-2 border-gray-800 bg-center bg-cover"
          style={{ backgroundImage: `url(${friend.avatarImage || defaultAvatar})` }}
        >
          {friend.battleStatus === "in_battle" || friend.battleStatus === "viewing_results" ? (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[8px]">
              {friend.battleStatus === "in_battle" ? "⚔️" : "📊"}
            </div>
          ) : (
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                friend.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          )}
        </div>

        {/* Name & Status */}
        <div className="flex-1 min-w-0 px-2">
          <div className="flex items-center text-[13px] font-bold text-[#384071] mb-0.5 overflow-hidden whitespace-nowrap">
            {friend.userName}
            {isBlocked && 
              <span className="ml-1 text-[9px] font-bold text-red-500 bg-red-100 px-1 rounded border border-red-500">
                BLOCKED
              </span>}
          </div>
          <div className="text-[11px] text-[#384071]">{getStatusText()}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 shrink-0">
          {!friend.currentBattle && (
            <button
              onClick={onChat}
              className={`w-9 h-9 rounded-full bg-[#677fb4] border-2 border-[#384071] flex items-center justify-center ${
                isBlocked ? "cursor-not-allowed opacity-20" : "cursor-pointer"
              }`}
              title={isBlocked ? "Unblock to chat" : "Chat"}
              disabled={isBlocked}
            >
              <img
                src={ASSETS.CHATICONS.CHAT}
                alt="X"
                className="w-6 h-6 object-contain image-rendering-pixelated"
              />
            </button>
          )}
          {friend.battleStatus === "in_battle" && (
            <button
              onClick={onSpectate}
              className="w-9 h-9 rounded-full bg-[#677fb4] border-2 border-[#384071] flex items-center justify-center cursor-pointer"
              title="Spectate"
            >
              <img
                src={ASSETS.CHATICONS.SPECTATE}
                alt="X"
                className="w-10 h-10 object-contain image-rendering-pixelated"
              />
            </button>
          )}
          {friend.battleStatus === "viewing_results" && (
            <button
              onClick={onViewResults}
              className="w-9 h-9 rounded-full bg-[#677fb4] border-2 border-[#384071] flex items-center justify-center cursor-not-allowed opacity-20"
              title="View Results"
            >
              <img
                src={ASSETS.CHATICONS.SPECTATE}
                alt="X"
                className="w-10 h-10 object-contain image-rendering-pixelated"
              />
            </button>
          )}
          {!friend.currentBattle && friend.online && (
            <button
              onClick={onChallenge}
              className={`w-9 h-9 flex items-center justify-center ${
                isBlocked ? "cursor-not-allowed opacity-20" : "cursor-pointer"
              }`}
              title={isBlocked ? "Unblock to challenge" : "Challenge"}
              disabled={isBlocked}
            >
              <img
                src={ASSETS.CHATICONS.BATTLE}
                alt="X"
                className="w-9 h-9 object-contain image-rendering-pixelated"
              />
            </button>
          )}
          {isBlocked ? (
            <button
              onClick={onBlockToggle}
              className="w-9 h-9 flex items-center justify-center cursor-pointer"
              title="Unblock Messages"
            >
              <img
                src={ASSETS.CHATICONS.UNBLOCK}
                alt="X"
                className="w-9 h-9 object-contain image-rendering-pixelated"
              />
            </button>
          ) : (
            <button
              onClick={onBlockToggle}
              className="w-9 h-9 flex items-center justify-center cursor-pointer"
              title="Block Messages"
            >
              <img
                src={ASSETS.CHATICONS.BLOCK}
                alt="X"
                className="w-9 h-9 object-contain image-rendering-pixelated"
              />
            </button>
          )}
          <button
            onClick={onRemove}
            className="w-9 h-9 flex items-center justify-center cursor-pointer"
            title="Remove Friend"
          >
            <img
              src={ASSETS.CHATICONS.X}
              alt="X"
              className="w-10 h-10 object-contain image-rendering-pixelated"
            />
          </button>
        </div>
      </div>
    </div>
  );
}