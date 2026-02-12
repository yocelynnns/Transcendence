import { Battle } from "./battleTypes";

export interface Friend {
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  characterOption: number;
  online?: boolean;
  currentBattle?: string | null;
  battleStatus?: "online" | "in_battle" | "viewing_results";
}

export interface FriendRequest {
  requestId: string;
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  createdAt: string;
}

export interface BattleInvite {
  inviteId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: Date;
}

export interface AvatarDataFriend {
  _id: string;
  userName: string;
  avatar: string;
  characterOption?: number;
}

export interface FriendsListProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: AvatarDataFriend;
  setSpectatingBattle?: React.Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: React.Dispatch<React.SetStateAction<Battle | null>>;
}

export interface FriendRequestResult {
  autoAccepted: boolean;
  friendId?: string;
  userName?: string;
}

export interface BlockedFriend {
  avatarId: string;
  userName?: string;
  email?: string;
}

export interface BlockedListResponse {
  count: number;
  blockedFriends: BlockedFriend[];
}
