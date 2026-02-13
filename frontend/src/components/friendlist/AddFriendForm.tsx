import React, { useState } from "react";
import { sendFriendRequest } from "../../services/friendsApi";
import { FriendRequestResult } from "../../types/friends.types";

interface AddFriendFormProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: { userName: string; avatar: string };
  onSuccess: (data: FriendRequestResult, email?: string) => void;
  onError: (error: string) => void;
}

const styles = {
  container: {
    background: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    border: "2px solid #333",
  },
  input: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    fontFamily: "monospace",
    border: "2px solid #333",
    borderRadius: 4,
    marginBottom: 8,
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    fontFamily: "monospace",
    background: "#4CAF50",
    color: "white",
    border: "2px solid #333",
    borderRadius: 4,
    cursor: "pointer",
  },
};

export function AddFriendForm({ token, onSuccess, onError }: AddFriendFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const data = await sendFriendRequest(token, email);
      if (data.autoAccepted) {
        onSuccess(data);
      } else {
        onSuccess(data);
        setEmail("");
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to send request";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "error" in err) {
        errorMessage = String((err as { error: unknown }).error);
      } else {
        errorMessage = String(err);
      }

      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="friend@email.com"
        style={styles.input}
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "..." : "Add Friend"}
      </button>
    </div>
  );
}