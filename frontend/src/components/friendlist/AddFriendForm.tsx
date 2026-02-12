import React, { useState } from "react";
import { sendFriendRequest } from "../../services/friendsApi";
import { FriendRequestResult } from "../../types/friends.types";
import PixelButton from "../elements/PixelButton";

interface AddFriendFormProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: { userName: string; avatar: string };
  onSuccess: (data: FriendRequestResult, email: string) => void;
  onError: (msg: string) => void;
}

export function AddFriendForm({ token, onSuccess, onError }: AddFriendFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const data = await sendFriendRequest(token, email);
      if (data.autoAccepted) {
        onSuccess(data, email);
      } else {
        onSuccess(data, email);
        setEmail("");
      }
    } catch (err) {
      if (err instanceof Error) {
        onError(err.message);
      } else {
        onError(String(err) || "Failed to send request");
      }
    }  finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-4 h-35">
      {/* PixelButton background for form */}
      <PixelButton
        colorA="#a5b6dd"
        colorB="#384071"
        colorText="#384071"
        textSize="16px"
        height="100%"
        width="100%"
        cursorPointer={false} // just background
      />

      {/* Form content overlay */}
      <div className="absolute inset-0 p-3 pt-1 px-5 flex flex-col justify-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          className="w-full p-2 text-sm font-mono rounded mb-2 bg-[#ffffff] text-[#384071]"
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-2 text-sm font-mono bg-[#3fb174] text-white rounded ${
            loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {loading ? "..." : "Add Friend"}
        </button>
      </div>
    </div>
  );
}