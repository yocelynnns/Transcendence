import React from "react";
import { Friend } from "../../types/friends.types";
import { ASSETS } from "../../assets";

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
    <div className="flex items-center gap-2.5 p-2.5 bg-gray-100 border-2 border-gray-800 rounded mb-2">
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center text-[13px] font-bold text-gray-800 mb-0.5 overflow-hidden whitespace-nowrap">
          {friend.userName}
          {isBlocked && 
            <span 
              className="ml-1 text-[9px] font-bold text-red-500 bg-red-100 px-1 rounded border border-red-500">
                BLOCKED
            </span>}
        </div>
        <div className="text-[11px] text-gray-500">{getStatusText()}</div>
      </div>

      <div className="flex gap-1 shrink-0">
        {!friend.currentBattle && (
          <button
            onClick={onChat}
            className={`w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center text-[12px] text-white ${
              isBlocked ? "bg-green-500 cursor-not-allowed opacity-50" : "bg-green-500 cursor-pointer"
            }`}
            title={isBlocked ? "Unblock to chat" : "Chat"}
            disabled={isBlocked}
          >
            💬
          </button>
        )}

        {friend.battleStatus === "in_battle" && (
          <button onClick={onSpectate}
            className="w-7 h-7 rounded-full bg-purple-600 border-2 border-gray-800 text-white flex items-center justify-center text-[12px] cursor-pointer"
            title="Spectate">
            👁️
          </button>
        )}

        {friend.battleStatus === "viewing_results" && (
          <button onClick={onViewResults}
            className="w-7 h-7 rounded-full bg-blue-600 border-2 border-gray-800 text-white flex items-center justify-center text-[12px] cursor-pointer"
            title="View Results">
            📊
          </button>
        )}

        {!friend.currentBattle && friend.online && (
          <button
            onClick={onChallenge}
            className={`w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center text-[12px] text-white ${
              isBlocked ? "bg-orange-600 cursor-not-allowed opacity-50" : "bg-orange-600 cursor-pointer"
            }`}
            title={isBlocked ? "Unblock to challenge" : "Challenge"}
            disabled={isBlocked}
          >
            ⚔️
          </button>
        )}

        {isBlocked ? (
          <button onClick={onBlockToggle}
            className="w-7 h-7 rounded-full bg-green-500 border-2 border-gray-800 text-white flex items-center justify-center text-[12px] cursor-pointer"
            title="Unblock Messages">
            🔔
          </button>
        ) : (
          <button onClick={onBlockToggle}
            className="w-7 h-7 rounded-full bg-yellow-500 border-2 border-gray-800 text-white flex items-center justify-center text-[12px] cursor-pointer"
            title="Block Messages">
            🔇
          </button>
        )}

        <button onClick={onRemove}
          className="w-7 h-7 rounded-full bg-red-500 border-2 border-gray-800 text-white flex items-center justify-center text-[12px] cursor-pointer"
          title="Remove Friend">
          🗑️
        </button>
      </div>
    </div>
  );
}