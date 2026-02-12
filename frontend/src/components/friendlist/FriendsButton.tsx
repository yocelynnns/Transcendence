import React from "react";

interface FriendsButtonProps {
  onClick: () => void;
  notificationCount: number;
}

export function FriendsButton({ onClick, notificationCount }: FriendsButtonProps) {
  return (
    <div
      onClick={onClick}
      className="absolute top-5 left-5 w-12 h-12 rounded-full border-2 border-gray-800 bg-yellow-400 flex items-center justify-center text-2xl z-100 transform transition-transform duration-200 hover:scale-110 cursor-pointer"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      👥
      {notificationCount > 0 && (
        <div
          className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-white text-[${notificationCount > 9 ? "9px" : "11px"}]`}
          style={{
            backgroundColor: notificationCount > 9 ? "#ff5555" : "#ff9800",
          }}
        >
          {notificationCount > 9 ? "9+" : notificationCount}
        </div>
      )}
    </div>
  );
}