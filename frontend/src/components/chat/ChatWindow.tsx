import { useState, useEffect, useRef, useCallback } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { ASSETS } from "../../assets";
import { AvatarData } from "../../types/avatarTypes";
import PixelButton from "../elements/PixelButton";
import AvatarProfile from "../profile/GameProfile";

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
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  
  const roomId = getRoomId(myAvatarId, friend.avatarId);
  const friendId = friend.avatarId;

  // const fetchMessages = async (pageNum: number = 1) => {
  //   if (loading) return;
  //   setLoading(true);
    
  //   try {
  //     const res = await fetch(
  //       `/api/chat/${friendId}?page=${pageNum}&limit=50`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
      
  //     if (!res.ok) {
  //       console.log("Failed to fetch messages:", res.status);
  //       setLoading(false);
  //       return;
  //     }
      
  //     const data = await res.json();
  //     console.log("📚 Fetched", data.messages.length, "messages");
      
  //     if (pageNum === 1) {
  //       setMessages(data.messages);
  //     } else {
  //       setMessages(prev => [...data.messages, ...prev]);
  //     }
      
  //     setHasMore(data.pagination.hasMore);
  //     setPage(pageNum);
  //   } catch (err) {
  //     console.log("Failed to fetch messages:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchMessages = useCallback(
    async (pageNum: number = 1) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/chat/${friendId}?page=${pageNum}&limit=50`,
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
    },
    [friendId, token] // dependencies used inside the function
  );

  useEffect(() => {
    if (!showProfile) return; // only fetch when profile opens
    setLoadingAvatar(true);

    const fetchAvatar = async () => {
      try {
        const res = await fetch(`/api/avatar/${friend.avatarId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: AvatarData = await res.json(); // make sure backend returns AvatarData
        setAvatarData(data);
      } catch (err) {
        console.log("Failed to fetch avatar:", err);
      } finally {
        setLoadingAvatar(false);
      }
    };

    fetchAvatar();
  }, [friend.avatarId, showProfile, token]);


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
  }, [friendId, emitEvent, fetchMessages, myAvatarId,roomId, subscribeEvent ]);

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
        {/* Chat Container */}
        <div className="flex flex-col h-full">
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

              {/* Header */}
              <div className="absolute inset-0 flex items-center justify-between px-6">
                {/* Avatar */}
                <div
                  className="relative w-12 h-12 shrink-0 rounded-full border-2 border-gray-800 bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${friend.avatarImage || defaultAvatar})`,
                  }}
                  onClick={() => setShowProfile(true)}
                >
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      friend.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* Name + Status */}
                <div className="flex-1 min-w-0 px-2 ml-2">
                  <div
                    className="flex items-center text-[1rem] font-bold text-[#ffffff] mb-0.5 overflow-hidden whitespace-nowrap"
                    onClick={() => setShowProfile(true)}
                  >
                    {friend.userName}
                  </div>

                  {isTyping ? (
                  <div className="text-[0.8rem] text-[#384071]">
                    typing...
                  </div>
                  ) : (
                    <div className="text-[0.8rem] text-[#384071]">
                      {friend.online ? "🟢 Online" : "⚫ Offline"}
                    </div>
                  )}
                </div>

                {/* Close */}
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
            <div className="relative h-[92%] w-7/8 left-1/16 top-6">
              <PixelButton
                colorA="#677fb4"   
                colorB="#384071"  
                colorText="#ab7b81"  
                textSize="16px"
                height="100%"
                width="100%"
                cursorPointer={false}
              />
              <div className="absolute inset-0 p-4 overflow-y-auto overscroll-contain font-mono">
                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="h-140 overflow-y-auto border-2 border-gray-300 rounded-lg p-2.5 bg-[#ffffff]"
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

                              <div className="max-w-[70%]">
                                <div
                                  className={`px-4 py-2 text-sm leading-snug wrap-break-word border-2 ${
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

                <div className="flex gap-2 items-center mt-3">
                  <div className="relative flex-1">
                     <PixelButton
                      colorA="#a5b6dd"   
                      colorB="#384071"  
                      colorText="#ab7b81"  
                      textSize="16px"
                      height="100%"
                      width="100%"
                    />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      maxLength={1000}
                      className={`absolute inset-0 px-3 py-4 outline-none bg-transparent font-mono text-sm
                        ${inputValue ? "text-[#384071]" : "text-[#ffffff]"}`}
                    />
                  </div>
                  <div className="relative w-12 h-12 shrink-0">
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <img
                        src={ASSETS.FRIENDICON.SEND}
                        alt="Send"
                        className={`w-10 h-10 object-contain image-rendering-pixelated ${
                          inputValue.trim()
                            ? "hover:scale-110"
                            : "opacity-20 cursor-not-allowed"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showProfile && avatarData && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-auto p-4">
            <AvatarProfile
              avatarData={avatarData}
              onClose={() => setShowProfile(false)}
              me={false}
            />
          </div>
        )}
    </>
  );

}