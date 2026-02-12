import React, { useState } from "react";
import { sendFriendRequest } from "../../services/friendsApi";
import { FriendRequestResult } from "../../types/friends.types";

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
    <div className="bg-gray-100 p-3 rounded-lg mb-4 border-2 border-gray-800">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="friend@email.com"
        className="w-full p-2 text-sm font-mono border-2 border-gray-800 rounded mb-2 box-border"
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full p-2 text-sm font-mono bg-green-500 text-white border-2 border-gray-800 rounded ${
          loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {loading ? "..." : "Add Friend"}
      </button>
    </div>
  );
}