import React from "react";
import { useEffect } from "react";
import { useFriends, getFriendlyErrorMessage } from "../../hooks/useFriends";
import { FriendsPanel } from "./FriendsPanel";
import ChatWindow from "../chat/ChatWindow";
import { Battle } from "../../types/battleTypes";
import { acceptFriendRequest, rejectFriendRequest, removeFriend, blockMessages, unblockMessages } from "../../services/friendsApi";
import { Friend, FriendRequestResult } from "../../types/friends.types";

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
  scale: number;
  battleLatest: (avatarId?: string,battleIdParam?:string ) => Promise<void>;
  setBattleId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FriendsList(props: FriendsListProps) {
  const {
    token,
    myAvatarId,
    myAvatarData,
    onClosePanel, 
    scale,
  } = props;

  const BASE_WIDTH = 520;
  const BASE_HEIGHT = 860;

  const {
    friends,
    requests,
    battleInvites,
    activeTab,
    setActiveTab,
    blockedFriends,
    setBlockedFriends,
    message,
    selectedFriend,
    setSelectedFriend,
    loadFriends,
    showMessage,
    handleSpectate,
    handleViewResults,
    handleChallengeFriend,
    handleAcceptBattleInvite,
    handleDeclineBattleInvite,
    isSuccessMessage,
    setRequests,
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

  const handleAddFriendError = (err: unknown) => {
    let errorMessage: string;

    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "object" && err !== null) {
      errorMessage = (err as { message?: string; error?: string }).message
        || (err as { message?: string; error?: string }).error
        || "Failed to send request";
    } else {
      errorMessage = String(err) || "Failed to send request";
    }

    const friendlyMessage = getFriendlyErrorMessage(errorMessage);
    showMessage(`❌ ${friendlyMessage}`);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      loadFriends();
      showMessage("✅ Friend request accepted!");
    } catch (err: unknown) {
      console.log("Failed to accept request:", err);

      let errorMessage: string;

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message?: string }).message || "Failed to accept request";
      } else {
        errorMessage = String(err) || "Failed to accept request";
      }

      const friendlyMessage = getFriendlyErrorMessage(errorMessage);
      showMessage(`❌ ${friendlyMessage}`);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(token, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      showMessage("✅ Request rejected");
    } catch (err: unknown) {
      console.log("Failed to reject request:", err);

      let errorMessage: string;

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message?: string }).message || "Failed to reject request";
      } else {
        errorMessage = String(err) || "Failed to reject request";
      }

      const friendlyMessage = getFriendlyErrorMessage(errorMessage);
      showMessage(`❌ ${friendlyMessage}`);
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
      showMessage("✅ Friend removed");
    } catch (err: unknown) {
      console.log("Failed to remove friend:", err);

      let errorMessage: string;

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message?: string }).message || "Failed to remove friend";
      } else {
        errorMessage = String(err) || "Failed to remove friend";
      }

      const friendlyMessage = getFriendlyErrorMessage(errorMessage);
      showMessage(`❌ ${friendlyMessage}`);
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
    } catch (err: unknown) {
      console.log("Failed to toggle block:", err);

      let errorMessage: string;

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message?: string }).message || "Failed to toggle block";
      } else {
        errorMessage = String(err) || "Failed to toggle block";
      }

      const friendlyMessage = getFriendlyErrorMessage(errorMessage);
      showMessage(`❌ ${friendlyMessage}`);
    }
  };

  useEffect(() => {
    if (token) loadFriends();
  }, [token, loadFriends]);

  return (
    <>
      <div 
        className="fixed top-0 right-0 z-50 h-screen"
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top right',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="border-12 h-full" style={{ borderColor: "#384071" }}>
            <div className="border-12 flex flex-col h-full" style={{ borderColor: "#677fb4", backgroundColor: "#a5b6dd" }}>
              {(selectedFriend && myAvatarData && !selectedFriend.currentBattle) ? (
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}