// TYPES
import {AvatarData} from "../types/avatarTypes";

export interface CreateAvatarPayload {
  userName: string;
  avatar: string;
  characterOption: number;
}

export interface CreateAvatarResponse {
  avatar : AvatarData;
  _id: string;
}

// AVATAR API
export async function createAvatar(
  token: string,
  payload: CreateAvatarPayload
): Promise<CreateAvatarResponse> {
  const res = await fetch("https://localhost/api/avatar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from server");
  }

  if (!res.ok) {
    throw new Error(data.message || "Failed to create avatar");
  }

  return data;
}

