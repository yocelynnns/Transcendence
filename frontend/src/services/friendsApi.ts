import { Battle } from "../types/battleTypes";
import { BlockedListResponse, Friend, FriendRequest } from "../types/friends.types";

const API_URL = "http://localhost:5001/api";

export async function fetchFriends(token: string): Promise<Friend[]> {
  const res = await fetch(`${API_URL}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
}

export async function fetchBlockedList(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/blocked-messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch blocked list");
  const data: BlockedListResponse = await res.json();

  return data.blockedFriends.map(f => f.avatarId);
}

export async function fetchPendingRequests(token: string): Promise<FriendRequest[]> {
  const res = await fetch(`${API_URL}/friends/requests/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

export async function sendFriendRequest(token: string, friendEmail: string) {
  const res = await fetch(`${API_URL}/friends/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendEmail: friendEmail.trim() }),
  });
  
  // Check if response is not OK
  if (!res.ok) {
    // Parse the error JSON and throw the message
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to send request");
  }
  
  return res.json();
}

export async function acceptFriendRequest(token: string, requestId: string) {
  const res = await fetch(`${API_URL}/friends/accept/${requestId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to accept request");
  return res.json();
}

export async function rejectFriendRequest(token: string, requestId: string) {
  const res = await fetch(`${API_URL}/friends/reject/${requestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to reject request");
}

export async function removeFriend(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/friends/${friendAvatarId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove friend");
}

export async function blockMessages(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/block-messages/${friendAvatarId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to block messages");
}

export async function unblockMessages(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/block-messages/${friendAvatarId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to unblock messages");
}

export async function fetchBattle(battleId: string): Promise<Battle> {
  const res = await fetch(`${API_URL}/battle/${battleId}`);
  if (!res.ok) throw new Error("Failed to fetch battle");
  return res.json();
}