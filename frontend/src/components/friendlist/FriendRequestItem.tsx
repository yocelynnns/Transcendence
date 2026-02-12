import React from "react";
import { FriendRequest } from "../../types/friends.types";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-gray-100 border-2 border-yellow-400 rounded mb-2">
      <div
        className="w-10 h-10 rounded-full border-2 border-gray-800 bg-center bg-cover"
        style={{ backgroundImage: `url(${request.avatarImage || defaultAvatar})` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-gray-800 mb-0.5 overflow-hidden whitespace-nowrap text-ellipsis">
          {request.userName}
        </div>
        <div className="text-[11px] text-gray-500">
          {request.email}
        </div>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={onAccept}
          className="w-7 h-7 rounded-full bg-green-500 text-white border-2 border-gray-800 flex items-center justify-center text-sm cursor-pointer"
        >
          ✓
        </button>
        <button
          onClick={onReject}
          className="w-7 h-7 rounded-full bg-red-500 text-white border-2 border-gray-800 flex items-center justify-center text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}