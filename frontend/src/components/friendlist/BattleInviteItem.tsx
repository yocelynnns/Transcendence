import React from "react";
import { BattleInvite } from "../../types/friends.types";
import { ASSETS } from "../../assets";
import PixelButton from "../elements/PixelButton";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface BattleInviteItemProps {
  invite: BattleInvite;
  onAccept: () => void;
  onDecline: () => void;
}

export function BattleInviteItem({ invite, onAccept, onDecline }: BattleInviteItemProps) {
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

      <div className="absolute top-1 left-0 w-full h-full flex items-center justify-between px-4">
        <div
          className="relative w-10 h-10 shrink-0 rounded-full border-2 border-gray-800 bg-center bg-cover"
          style={{ backgroundImage: `url(${invite.senderAvatar || defaultAvatar})` }}
        >
        </div>
        <div className="flex-1 min-w-0 px-2">
          <div className="flex items-center text-[13px] font-bold text-[#384071] mb-0.5 overflow-hidden whitespace-nowrap">
            {invite.senderName}
          </div>
          <div className="text-[11px] text-[#677fb4]">
            Wants to battle!
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDecline} 
            className="w-9 h-9 flex items-center justify-center text-sm cursor-pointer"
          >
            <img
              src={ASSETS.CHATICONS.X}
              alt="no"
              className="w-10 h-10 object-contain image-rendering-pixelated"
            />
          </button>
          <button onClick={onAccept} 
            className="w-9 h-9 flex items-center justify-center text-sm cursor-pointer"
          >
            <img
              src={ASSETS.CHATICONS.TICK}
              alt="yes"
              className="w-10 h-10 object-contain image-rendering-pixelated"
            />
          </button>
        </div>
      </div>
    </div>
  );
}