import React from "react";
import { FriendRequest } from "../../types/friends.types";
import { ASSETS } from "../../assets";
import PixelButton from "../elements/PixelButton";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {
  return (
    <div className="relative mb-6 h-16 w-full">
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
        <div
          className="relative w-10 h-10 shrink-0 rounded-full border-2 border-gray-800 bg-center bg-cover"
          style={{ backgroundImage: `url(${request.avatarImage || defaultAvatar})` }}
        />
        <div className="flex-1 min-w-0 px-2">
          <div className="flex items-center text-[13px] font-bold text-[#384071] mb-0.5 overflow-hidden whitespace-nowrap">
            {request.userName}
          </div>
          <div className="text-[11px] text-[#384071]">
            {request.email}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onReject}
            className="w-9 h-9 flex items-center justify-center cursor-pointer"
          >
            <img
              src={ASSETS.FRIENDICON.X}
              alt="no"
              className="w-10 h-10 object-contain image-rendering-pixelated"
            />
          </button>
          <button 
            onClick={onAccept}
            className="w-9 h-9 flex items-center justify-center cursor-pointer"
          >
            <img
              src={ASSETS.FRIENDICON.TICK}
              alt="yes"
              className="w-10 h-10 object-contain image-rendering-pixelated"
            />
          </button>
        </div>
      </div>
    </div>
  );
}