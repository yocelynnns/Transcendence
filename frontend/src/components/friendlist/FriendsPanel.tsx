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
  onAddFriendSuccess: (data: FriendRequestResult, email?: string) => void;
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
              src={ASSETS.FRIENDICON.FRIENDLIST}
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
                  src={ASSETS.FRIENDICON.X}
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
              <div className="flex-1 min-w-0 px-2 mb-3 text-white">
                ⚔️ Challenges Received
              </div>
              {/* Battle Invites */}
              {battleInvites.length > 0 && (
                <div>
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
                <div className="flex-1 min-w-0 px-2 mb-3 pt-3 text-white">
                  👁️ Spectate Friends
                </div>
                {friends.filter((f) => f.battleStatus === "in_battle" || f.battleStatus === "viewing_results").length === 0 ? (
                  <div className="text-center text-white text-[1rem] p-5">
                    No friends in battle
                  </div>
                ) : (
                  friends
                  .filter((f) => f.battleStatus === "in_battle" || f.battleStatus === "viewing_results")
                  .map((friend) => {
                    const inBattle = friend.battleStatus === "in_battle";
                    const viewing = friend.battleStatus === "viewing_results";

                    return (
                      <div className="relative mb-6 h-16 w-full" key={friend.avatarId}>
                        {/* PIXEL BACKGROUND */}
                        <PixelButton
                          colorA="#a5b6dd"
                          colorB="#384071"
                          colorText="#384071"
                          textSize="0"
                          height={80}
                          width="100%"
                          cursorPointer={false}
                        />
                        <div
                          key={friend.avatarId}
                          className="absolute top-1 left-0 w-full h-full flex items-center justify-between px-4"
                        >
                          <div
                            className="relative w-10 h-10 shrink-0 rounded-full border-2 border-gray-800 bg-center bg-cover"
                            style={{ backgroundImage: `url(${friend.avatarImage})` }}
                          >
                            <div
                              className={`absolute -bottom-1 ml-3 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] ${
                                inBattle ? "bg-orange-500" : "bg-blue-500"
                              }`}
                            >
                              {inBattle ? "⚔️" : "📊"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 px-2">
                            <div className="flex items-center text-[13px] font-bold text-[#384071] mb-0.5 overflow-hidden whitespace-nowrap">
                              {friend.userName}
                            </div>
                            <div className="text-[11px] text-[#384071]">
                              {inBattle ? "🔴 In Battle" : "📊 Viewing Results"}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={inBattle ? () => onSpectate(friend) : undefined}
                              className={`w-9 h-9 rounded-full bg-[#677fb4] border-2 border-[#384071] flex items-center justify-center ${
                                viewing ? "opacity-20 cursor-default" : "cursor-pointer"
                              }`}
                              title={inBattle ? "Spectate" : "Viewing Results"}
                            >
                              <img
                                src={ASSETS.FRIENDICON.SPECTATE}
                                alt="Spectate"
                                className="w-10 h-10 object-contain image-rendering-pixelated"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}