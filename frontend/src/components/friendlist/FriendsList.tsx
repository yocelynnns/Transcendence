import React from "react";
import { useEffect } from "react";
import { useFriends } from "../../hooks/useFriends";
import { FriendsButton } from "./FriendsButton";
import { FriendsPanel } from "./FriendsPanel";
import ChatWindow from "../chat/ChatWindow"; // Existing component
import { Battle } from "../../types/battleTypes";
import { acceptFriendRequest, rejectFriendRequest, removeFriend, blockMessages, unblockMessages } from "../../services/friendsApi";
import { Friend, FriendRequestResult } from "../../types/friends.types";

// export { FriendsListProps } from "./types/friends.types";

export interface FriendsListProps {
  token: string;
  myAvatarId: string;
  myAvatarData?: {
    _id: string;
    userName: string;
    avatar: string;
    characterOption?: number;
  };
  setSpectatingBattle?: React.Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: React.Dispatch<React.SetStateAction<Battle | null>>;

  onClosePanel: () => void;
  // scale: number;
}

export default function FriendsList(props: FriendsListProps) {
  const {
    token,
    myAvatarId,
    myAvatarData,
    onClosePanel, 
    // scale
  } = props;

  const BASE_WIDTH = 520;
  const BASE_HEIGHT = 860;

  const {
    // State
    friends,
    requests,
    battleInvites,
    showPanel,
    setShowPanel,
    activeTab,
    setActiveTab,
    blockedFriends,
    setBlockedFriends,
    message,
    selectedFriend,
    setSelectedFriend,
    
    // Actions
    loadFriends,
    showMessage,
    handleSpectate,
    handleViewResults,
    handleChallengeFriend,
    handleAcceptBattleInvite,
    handleDeclineBattleInvite,
    
    // Derived
    totalNotifications,
    isSuccessMessage,
    setRequests,  // ADDED
  } = useFriends(props);

  // Handlers that need API + state updates
  const handleAddFriendSuccess = (data: FriendRequestResult) => {
    if (data.autoAccepted) {
      showMessage("✅ Auto-accepted! You are now friends!");
      loadFriends();
    } else {
      showMessage("✅ Friend request sent!");
    }
  };

  const handleAddFriendError = (msg: string) => {
    showMessage(`❌ ${msg}`);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      loadFriends();
      showMessage("✅ Friend request accepted!");
    } catch (err) {
      console.log("Failed to accept request:", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      showMessage("Request rejected");
    } catch (err) {
      console.log("Failed to reject request:", err);
    }
  };

  const handleRemove = async (friendAvatarId: string) => {
    if (!confirm("Remove this friend?")) return;
    try {
      await removeFriend(token, friendAvatarId);
      loadFriends();
      setBlockedFriends((prev) => {
        const next = new Set(prev);
        next.delete(friendAvatarId);
        return next;
      });
      showMessage("Friend removed");
    } catch (err) {
      console.log("Failed to remove friend:", err);
    }
  };

  const handleBlockToggle = async (friend: Friend, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockMessages(token, friend.avatarId);
        setBlockedFriends((prev) => {
          const next = new Set(prev);
          next.delete(friend.avatarId);
          return next;
        });
        showMessage(`🔔 Messages unblocked from ${friend.userName}`);
      } else {
        await blockMessages(token, friend.avatarId);
        setBlockedFriends((prev) => new Set([...prev, friend.avatarId]));
        showMessage(`🔇 Messages blocked from ${friend.userName}`);
        if (selectedFriend?.avatarId === friend.avatarId) {
          setSelectedFriend(null);
        }
      }
    } catch {
      showMessage("❌ Failed to update block status");
    }
  };

  useEffect(() => {
    if (token) loadFriends();
  }, [token]);

  return (
    <>
      <div 
        className="fixed top-0 right-0 z-50 h-screen"
        style={{
          width: BASE_WIDTH,              // original width
          height: BASE_HEIGHT,
          // transform: `scale(${scale})`,   // scales width proportionally
          transformOrigin: 'top right',
        }}
      >
        {/* {showPanel && ( */}
        <FriendsPanel
          friends={friends}
          requests={requests}
          battleInvites={battleInvites}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          blockedFriends={blockedFriends}
          message={message}
          isSuccessMessage={isSuccessMessage}
          token={token}
          myAvatarId={myAvatarId}
          myAvatarData={myAvatarData}
          onClose={onClosePanel}
          onAddFriendSuccess={handleAddFriendSuccess}
          onAddFriendError={handleAddFriendError}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onAcceptBattleInvite={handleAcceptBattleInvite}
          onDeclineBattleInvite={handleDeclineBattleInvite}
          onChat={setSelectedFriend}
          onSpectate={handleSpectate}
          onViewResults={handleViewResults}
          onChallenge={handleChallengeFriend}
          onBlockToggle={handleBlockToggle}
          onRemove={handleRemove}
        />
        {/* )} */}

        {selectedFriend && myAvatarData && !selectedFriend.currentBattle && (
          <ChatWindow
            token={token}
            myAvatarId={myAvatarId}
            myUserName={myAvatarData.userName}
            myAvatarImage={myAvatarData.avatar}
            friend={selectedFriend}
            onClose={() => setSelectedFriend(null)}
            onChallenge={(avatarId) => {
              const friend = friends.find((f) => f.avatarId === avatarId);
              if (friend) handleChallengeFriend(friend);
            }}
          />
        )}
      </div>
    </>
  );
}