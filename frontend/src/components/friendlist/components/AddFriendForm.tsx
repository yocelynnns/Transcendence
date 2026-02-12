import React, { useState } from "react";
import { sendFriendRequest } from "../services/friendsApi";

interface AddFriendFormProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: { userName: string; avatar: string };
  onSuccess: (data: any, email: string) => void;
  onError: (msg: string) => void;
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

export function AddFriendForm({ token, myAvatarId, myAvatarData, onSuccess, onError }: AddFriendFormProps) {
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
    } catch (err: any) {
      onError(err.message || "Failed to send request");
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