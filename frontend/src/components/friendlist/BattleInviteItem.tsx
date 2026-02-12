import React from "react";
import { BattleInvite } from "../../types/friends.types";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface BattleInviteItemProps {
  invite: BattleInvite;
  onAccept: () => void;
  onDecline: () => void;
}

export function BattleInviteItem({ invite, onAccept, onDecline }: BattleInviteItemProps) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-orange-50 border-2 border-orange-500 rounded mb-2">
      <img
        src={invite.senderAvatar || defaultAvatar}
        alt=""
        className="w-9 h-9 rounded-full border-2 border-gray-800"
      />
      <div className="flex-1">
        <div className="font-bold text-[13px]">{invite.senderName}</div>
        <div className="text-[11px] text-gray-500">Wants to battle!</div>
      </div>
      <div className="flex gap-1">
        <button onClick={onAccept} 
          className="w-7 h-7 rounded-full bg-green-500 text-white border-2 border-gray-800 flex items-center justify-center text-sm cursor-pointer"
        >
          ✓
        </button>
        <button onClick={onDecline} 
          className="w-7 h-7 rounded-full bg-red-500 text-white border-2 border-gray-800 flex items-center justify-center text-sm cursor-pointer"
        >
            ✕
        </button>
      </div>
    </div>
  );
}