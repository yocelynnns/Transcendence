import { useState, useEffect, useRef, useCallback } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { ASSETS } from "../../assets";
import PublicProfilePopup from "../profile/PublicProfilePopup";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderName?: string;
  senderAvatar?: string;
  isOptimistic?: boolean;
  rejected?: boolean;
  rejectedReason?: string;
}

interface Friend {
  avatarId: string;
  email: string;
  userName: string;
  avatarImage: string;
  characterOption: number;
  online?: boolean;
}

interface ChatWindowProps {
  token: string;
  myAvatarId: string;
  myUserName: string;
  myAvatarImage: string;
  friend: Friend;
  onClose: () => void;
  onChallenge?: (avatarId: string) => void; 
}

interface PartnerTypingEvent {
  avatarId: string;
  isTyping: boolean;
}

interface MessagesReadEvent {
  byAvatarId: string;
}

interface MessageRejectedEvent {
  receiverId: string;
  reason: string;
  blockedBy: string;
  timestamp: string;
}

const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");

export default function ChatWindow({
  token, myAvatarId, friend, onClose, onChallenge
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  
  const roomId = getRoomId(myAvatarId, friend.avatarId);
  const friendId = friend.avatarId;

  const fetchMessages = async (pageNum: number = 1) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/chat/${friendId}?page=${pageNum}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!res.ok) {
        console.log("Failed to fetch messages:", res.status);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log("📚 Fetched", data.messages.length, "messages");
      
      if (pageNum === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.log("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };


  // const fetchMessages = useCallback(
  //   async (pageNum: number = 1) => {
  //     if (loading) return;
  //     setLoading(true);

  //     try {
  //       const res = await fetch(
  //         `http://localhost:5001/api/chat/${friendId}?page=${pageNum}&limit=50`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       if (!res.ok) {
  //         console.log("Failed to fetch messages:", res.status);
  //         setLoading(false);
  //         return;
  //       }

  //       const data = await res.json();
  //       console.log("📚 Fetched", data.messages.length, "messages");

  //       if (pageNum === 1) {
  //         setMessages(data.messages);
  //       } else {
  //         setMessages(prev => [...data.messages, ...prev]);
  //       }

  //       setHasMore(data.pagination.hasMore);
  //       setPage(pageNum);
  //     } catch (err) {
  //       console.log("Failed to fetch messages:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [friendId, token, loading] // dependencies used inside the function
  // );
        

  useEffect(() => {
    console.log("🔵 ChatWindow mounted for:", friendId);
    
    emitEvent("joinChat", { friendAvatarId: friendId });
    fetchMessages(1);// here
    emitEvent("markAsRead", { senderId: friendId });

    const cleanupReceive = subscribeEvent<Message>("receiveMessage", (msg) => {
      console.log("📨 Received:", msg.content?.substring(0, 20));
      
      const msgRoomId = getRoomId(msg.senderId, msg.receiverId);
      if (msgRoomId !== roomId) return;

      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        
        const filtered = prev.filter(m => 
          !(m.isOptimistic && m.content === msg.content && m.senderId === msg.senderId)
        );
        
        return [...filtered, { ...msg, isOptimistic: false }];
      });
      
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    const cleanupTyping = subscribeEvent<PartnerTypingEvent>("partnerTyping", ({ avatarId, isTyping }) => {
      if (avatarId === friendId) setIsTyping(isTyping);
    });

    const cleanupRead = subscribeEvent<MessagesReadEvent>("messagesRead", ({ byAvatarId }) => {
      if (byAvatarId === friendId) {
        setMessages(prev => prev.map(m => 
          m.senderId === myAvatarId ? { ...m, read: true } : m
        ));
      }
    });

    const cleanupRejected = subscribeEvent<MessageRejectedEvent>("messageRejected", (data) => {
      console.log("❌ Message rejected:", data);
      
      if (data.receiverId === friendId) {
        setMessages(prev => {
          const lastOptimisticIndex = [...prev].reverse().findIndex(m => 
            m.isOptimistic && m.senderId === myAvatarId && !m.rejected
          );
          
          if (lastOptimisticIndex !== -1) {
            const actualIndex = prev.length - 1 - lastOptimisticIndex;
            const newMessages = [...prev];
            newMessages[actualIndex] = {
              ...newMessages[actualIndex],
              rejected: true,
              rejectedReason: data.reason || "Message blocked"
            };
            return newMessages;
          }
          return prev;
        });
        
        setErrorMessage(data.reason || "Message could not be delivered");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    });

    return () => {
      console.log("🔴 ChatWindow unmounting for:", friendId);
      cleanupReceive();
      cleanupTyping();
      cleanupRead();
      cleanupRejected();
      emitEvent("leaveChat", { friendAvatarId: friendId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [friendId, emitEvent, subscribeEvent ]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      senderId: myAvatarId,
      receiverId: friendId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
      isOptimistic: true,
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setInputValue("");
    setIsTyping(false);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    console.log("📤 Sending:", content.substring(0, 20));
    emitEvent("sendPrivateMessage", {
      receiverId: friendId,
      content,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    emitEvent("typing", {receiverId: friendId, isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitEvent("typing", {receiverId: friendId, isTyping: false });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const grouped = messages.reduce((acc: Record<string, Message[]>, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Chat Container */}
        <div
          className="w-100 h-150 bg-white rounded-xl shadow-2xl flex flex-col border-4 border-[#333] overflow-hidden font-mono"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-500 text-white text-center text-xs px-3 py-2 border-b-2 border-red-700">
              ❌ {errorMessage}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-yellow-400 border-b-2 border-[#333]">
            {/* Avatar */}
            <div
              className="relative w-12 h-12 rounded-full border-2 border-[#333] bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${friend.avatarImage || defaultAvatar})`,
              }}
              onClick={() => setShowProfile(true)}
            >
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  friend.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {/* Name + Status */}
            <div className="flex-1">
              <h3
                className="text-sm font-bold text-[#333] cursor-pointer"
                onClick={() => setShowProfile(true)}
              >
                {friend.userName}
              </h3>

              {isTyping ? (
                <span className="text-xs text-green-500 italic">
                  typing...
                </span>
              ) : (
                <span className="text-xs text-gray-500">
                  {friend.online ? "🟢 Online" : "⚫ Offline"}
                </span>
              )}
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-black/10 rounded"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-3"
          >
            {hasMore && !loading && (
              <div
                onClick={() => fetchMessages(page + 1)}
                className="text-center text-xs text-gray-600 cursor-pointer hover:underline"
              >
                Load older messages ↑
              </div>
            )}

            {loading && (
              <div className="text-center text-xs text-gray-500">
                Loading...
              </div>
            )}

            {messages.length === 0 && !loading ? (
              <div className="text-center text-gray-400 text-sm py-10">
                No messages yet.
                <br />
                Say hello to {friend.userName}! 👋
              </div>
            ) : (
              Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  <div className="text-center text-xs text-gray-400 my-2">
                    {date}
                  </div>

                  {msgs.map((msg, idx) => {
                    const isMe = msg.senderId === myAvatarId;
                    const showAvatar =
                      !isMe &&
                      (idx === msgs.length - 1 ||
                        msgs[idx + 1]?.senderId !== msg.senderId);

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${
                          isMe ? "justify-end" : "justify-start"
                        } ${msg.rejected ? "opacity-70" : ""}`}
                      >
                        {/* Avatar */}
                        {!isMe && showAvatar && (
                          <div
                            className="w-8 h-8 rounded-full border-2 border-[#333] bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${friend.avatarImage || defaultAvatar})`,
                            }}
                          />
                        )}
                        {!isMe && !showAvatar && <div className="w-8" />}

                        <div>
                          <div
                            className={`max-w-[70%] px-4 py-2 text-sm leading-snug wrap-break-word border-2 ${
                              msg.rejected
                                ? "bg-red-500 text-white border-red-700"
                                : isMe
                                ? "bg-green-500 text-white border-[#333] rounded-t-2xl rounded-bl-2xl"
                                : "bg-white text-[#333] border-[#333] rounded-t-2xl rounded-br-2xl"
                            }`}
                          >
                            {msg.content}

                            {msg.rejected && (
                              <div className="text-[11px] mt-1 italic opacity-90">
                                Blocked:{" "}
                                {msg.rejectedReason ||
                                  "Message could not be delivered"}
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-gray-400 mt-1 text-right">
                            {formatTime(msg.createdAt)}
                            {isMe && (
                              <span className="ml-1">
                                {msg.rejected
                                  ? "❌"
                                  : msg.read
                                  ? "✓✓"
                                  : msg.isOptimistic
                                  ? "⏳"
                                  : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 bg-white border-t-2 border-[#333]">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              maxLength={1000}
              className="flex-1 px-4 py-2 text-sm bg-gray-50 border-2 border-[#333] rounded-full outline-none"
            />

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`w-11 h-11 rounded-full border-2 border-[#333] flex items-center justify-center text-lg transition ${
                inputValue.trim()
                  ? "bg-yellow-400 hover:scale-105"
                  : "bg-yellow-400 opacity-50 cursor-not-allowed"
              }`}
            >
              📨
            </button>
          </div>
        </div>
      </div>

      {showProfile && (
        <PublicProfilePopup
          token={token}
          myAvatarId={myAvatarId}
          targetAvatarId={friend.avatarId}
          onClose={() => setShowProfile(false)}
          onChallenge={onChallenge}
        />
      )}
    </>
  );

}