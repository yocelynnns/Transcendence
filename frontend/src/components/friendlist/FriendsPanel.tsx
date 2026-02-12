import { Friend, FriendRequest, BattleInvite, FriendRequestResult } from "../../types/friends.types";
import { FriendsTabs } from "./FriendsTabs";
import { AddFriendForm } from "./AddFriendForm";
import { FriendItem } from "./FriendItem";
import { FriendRequestItem } from "./FriendRequestItem";
import { BattleInviteItem } from "./BattleInviteItem";
import PixelButton from "../elements/PixelButton";
import { ASSETS } from "../../assets";

interface FriendsPanelProps {
  // State
  friends: Friend[];
  requests: FriendRequest[];
  battleInvites: BattleInvite[];
  activeTab: "friends" | "requests" | "battles";
  setActiveTab: (tab: "friends" | "requests" | "battles") => void;
  blockedFriends: Set<string>;
  message: string;
  isSuccessMessage: boolean;
  
  // Auth
  token: string;
  myAvatarId: string;
  myAvatarData?: { userName: string; avatar: string };
  
  // Actions
  onClose: () => void;
  onAddFriendSuccess: (data: FriendRequestResult, email: string) => void;
  onAddFriendError: (msg: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onAcceptBattleInvite: (inviteId: string) => void;
  onDeclineBattleInvite: (inviteId: string) => void;
  onChat: (friend: Friend) => void;
  onSpectate: (friend: Friend) => void;
  onViewResults: (friend: Friend) => void;
  onChallenge: (friend: Friend) => void;
  onBlockToggle: (friend: Friend, isBlocked: boolean) => void;
  onRemove: (friendAvatarId: string) => void;
}

export function FriendsPanel({
  friends,
  requests,
  battleInvites,
  activeTab,
  setActiveTab,
  blockedFriends,
  message,
  isSuccessMessage,
  token,
  myAvatarId,
  myAvatarData,
  onClose,
  onAddFriendSuccess,
  onAddFriendError,
  onAcceptRequest,
  onRejectRequest,
  onAcceptBattleInvite,
  onDeclineBattleInvite,
  onChat,
  onSpectate,
  onViewResults,
  onChallenge,
  onBlockToggle,
  onRemove,
}: FriendsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative top-6 w-7/8 left-1/16">
        <div className="relative mb-5 w-full">
          <PixelButton
            colorA="#677fb4"
            colorB="#384071"
            colorText="#ffffff"
            textSize="1rem"
            height={80}
            width="100%"
            cursorPointer={false}
          />

          {/* Header Content Layer */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <img
              src={ASSETS.CHATICONS.FRIENDLIST}
              alt="Friendlist"
              className="w-11 h-11 object-contain image-rendering-pixelated mb-1"
            />
            <div className="flex-1 text-left text-3xl text-[#ffffff] p-3 pl-5 pixelify-sans">
              Friends
            </div>

            <div className="text-right">
              <button
                onClick={onClose}
              >
                <img
                  src={ASSETS.CHATICONS.X}
                  alt="X"
                  className="w-10 h-10 object-contain image-rendering-pixelated hover:scale-110"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-visible">
        <div className="relative w-7/8 left-1/16 top-4">
          {/* Tabs */}
          <FriendsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            friendsCount={friends.length}
            requestsCount={requests.length}
            battleInvitesCount={battleInvites.length}
          />
        </div>
        <div className="relative h-17/20 w-7/8 left-1/16 top-3">

        <PixelButton
          colorA="#677fb4"   
          colorB="#384071"  
          colorText="#ab7b81"  
          textSize="16px"
          height="100%"
          width="100%"
          cursorPointer={false}
        />
        
        <div className="absolute inset-0 p-4 overflow-y-auto overscroll-contain">
          {/* Message */}
          {message && 
            <div 
              className={`mb-2 text-sm font-bold text-center ${
                isSuccessMessage ? "text-[#8cffb2]" : "text-[#ff8ea8]"
              }`}
            >
              {message}
            </div>}

          {/* FRIENDS TAB */}
          {activeTab === "friends" && (
            <>
              <AddFriendForm
                token={token}
                myAvatarId={myAvatarId}
                myAvatarData={myAvatarData}
                onSuccess={onAddFriendSuccess}
                onError={onAddFriendError}
              />

              <div>
                {friends.length === 0 ? (
                  <div className="text-center text-white text-[1rem] p-5">
                    No friends yet. Add some!
                  </div>
                ) : (
                  friends.map((friend) => {
                    const isBlocked = blockedFriends.has(friend.avatarId);
                    return (
                      <FriendItem
                        key={friend.avatarId}
                        friend={friend}
                        isBlocked={isBlocked}
                        onChat={() => onChat(friend)}
                        onSpectate={() => onSpectate(friend)}
                        onViewResults={() => onViewResults(friend)}
                        onChallenge={() => onChallenge(friend)}
                        onBlockToggle={() => onBlockToggle(friend, isBlocked)}
                        onRemove={() => onRemove(friend.avatarId)}
                      />
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div>
              {requests.length === 0 ? (
                <div className="text-center text-white text-[1rem] p-5">
                  No pending requests
                </div>
              ) : (
                requests.map((request) => (
                  <FriendRequestItem
                    key={request.requestId}
                    request={request}
                    onAccept={() => onAcceptRequest(request.requestId)}
                    onReject={() => onRejectRequest(request.requestId)}
                  />
                ))
              )}
            </div>
          )}

          {/* BATTLES TAB */}
          {activeTab === "battles" && (
            <div>
              {/* Battle Invites */}
              {battleInvites.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-100 border-2 border-orange-500 rounded-lg">
                  <div className="flex items-center gap-1 mb-2 text-orange-800 font-bold text-sm">
                    ⚔️ Challenges Received
                  </div>
                  {battleInvites.map((invite) => (
                    <BattleInviteItem
                      key={invite.inviteId}
                      invite={invite}
                      onAccept={() => onAcceptBattleInvite(invite.inviteId)}
                      onDecline={() => onDeclineBattleInvite(invite.inviteId)}
                    />
                  ))}
                </div>
              )}

              {/* Friends In Battle */}
              <div>
                <div className="flex items-center gap-1 mb-2 text-gray-800 font-bold text-sm">
                  👁️ Spectate Friends
                </div>
                {friends.filter((f) => f.battleStatus === "in_battle").length === 0 ? (
                  <div className="text-center text-white text-[1rem] p-5">
                    No friends in battle
                  </div>
                ) : (
                  friends
                    .filter((f) => f.battleStatus === "in_battle")
                    .map((friend) => (
                      <div
                        key={friend.avatarId}
                        className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg mb-2 border-2 border-purple-600"
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-800 relative bg-cover bg-center"
                          style={{ backgroundImage: `url(${friend.avatarImage})` }}
                        >
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[8px]">
                            ⚔️
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold">{friend.userName}</div>
                          <div className="text-xs text-gray-500">🔴 In Battle</div>
                        </div>
                        <button
                          onClick={() => onSpectate(friend)}
                          className="w-7 h-7 rounded-full bg-purple-600 text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                          title="Spectate"
                        >
                          👁️
                        </button>
                      </div>
                    ))
                )}
              </div>

              {/* Friends Viewing Results */}
              {friends.filter((f) => f.battleStatus === "viewing_results").length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1 mb-2 text-blue-600 font-bold text-sm">
                    📊 Viewing Results
                  </div>
                  {friends
                    .filter((f) => f.battleStatus === "viewing_results")
                    .map((friend) => (
                      <div
                        key={friend.avatarId}
                        className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg mb-2 border-2 border-blue-500"
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-800 relative bg-cover bg-center"
                          style={{ backgroundImage: `url(${friend.avatarImage})` }}
                        >
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px]">
                            📊
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold">{friend.userName}</div>
                          <div className="text-xs text-gray-500">📊 Viewing Results</div>
                        </div>
                        <button
                          onClick={() => onViewResults(friend)}
                          className="w-7 h-7 rounded-full bg-blue-500 text-white border-2 border-gray-800 flex items-center justify-center text-xs"
                          title="View Results"
                        >
                          📊
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}