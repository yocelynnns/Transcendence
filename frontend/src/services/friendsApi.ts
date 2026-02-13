import { Battle } from "../types/battleTypes";
import { BlockedListResponse, Friend, FriendRequest, BattleInvite } from "../types/friends.types";

const API_URL = "https://localhost/api";

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

export async function fetchBattleInvites(token: string): Promise<BattleInvite[]> {
  const res = await fetch(`${API_URL}/battle/invites/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch battle invites");
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
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to send request");
  }
  
  return data;
}

export async function acceptFriendRequest(token: string, requestId: string) {
  const res = await fetch(`${API_URL}/friends/accept/${requestId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to accept request");
  }
  
  return res.json();
}

export async function rejectFriendRequest(token: string, requestId: string) {
  const res = await fetch(`${API_URL}/friends/reject/${requestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to reject request");
  }
}

export async function removeFriend(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/friends/${friendAvatarId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to remove friend");
  }
}

export async function blockMessages(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/block-messages/${friendAvatarId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to block messages");
  }
}

export async function unblockMessages(token: string, friendAvatarId: string) {
  const res = await fetch(`${API_URL}/block-messages/${friendAvatarId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to unblock messages");
  }
}

export async function fetchBattle(battleId: string): Promise<Battle> {
  const res = await fetch(`${API_URL}/battle/${battleId}`);
  if (!res.ok) throw new Error("Failed to fetch battle");
  return res.json();
}