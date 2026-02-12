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

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 200,
  },
  chatContainer: {
    width: 400, height: 600, background: "white",
    borderRadius: 12, boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    display: "flex", flexDirection: "column" as const,
    fontFamily: "monospace", border: "4px solid #333",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: 16, background: "#ffcc00", borderBottom: "2px solid #333",
  },
  avatar: {
    width: 48, height: 48, borderRadius: "50%",
    border: "2px solid #333", position: "relative" as const,
    backgroundSize: "cover", backgroundPosition: "center",
    cursor: "pointer",
  },
  onlineIndicator: (online: boolean) => ({
    position: "absolute" as const, bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "2px solid white",
  }),
  headerInfo: { flex: 1 },
  friendName: { 
    fontSize: 16, 
    fontWeight: "bold" as const, 
    color: "#333", 
    margin: 0,
    cursor: "pointer",
  },
  status: { fontSize: 12, color: "#666" },
  typing: { fontSize: 12, color: "#4CAF50", fontStyle: "italic" as const },
  closeBtn: {
    background: "transparent", border: "none", fontSize: 20,
    cursor: "pointer", color: "#333", width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  messagesContainer: {
    flex: 1, overflowY: "auto" as const, padding: 16,
    background: "#f5f5f5", display: "flex", flexDirection: "column" as const, gap: 12,
  },
  messageRow: (isMe: boolean, isRejected?: boolean) => ({
    display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
    alignItems: "flex-end", gap: 8,
    opacity: isRejected ? 0.7 : 1,
  }),
  messageBubble: (isMe: boolean, isRejected?: boolean) => ({
    maxWidth: "70%", padding: "10px 14px",
    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: isRejected ? "#ff5555" : isMe ? "#4CAF50" : "white", 
    color: isRejected ? "white" : isMe ? "white" : "#333",
    border: `2px solid ${isRejected ? "#cc0000" : "#333"}`, 
    fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" as const,
  }),
  rejectedText: {
    fontSize: 11, 
    marginTop: 4, 
    fontStyle: "italic" as const,
    opacity: 0.9,
  },
  messageAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    border: "2px solid #333", backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0,
  },
  timestamp: { fontSize: 10, color: "#999", marginTop: 4, textAlign: "right" as const },
  inputContainer: { display: "flex", gap: 8, padding: 12, background: "white", borderTop: "2px solid #333" },
  input: {
    flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: "monospace",
    border: "2px solid #333", borderRadius: 20, outline: "none", background: "#f9f9f9",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: "50%", background: "#ffcc00",
    border: "2px solid #333", cursor: "pointer", fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyState: { textAlign: "center" as const, color: "#999", padding: 40, fontSize: 14 },
  dateDivider: { textAlign: "center" as const, fontSize: 11, color: "#999", margin: "8px 0" },
  loadingIndicator: { textAlign: "center" as const, padding: 10, color: "#666", fontSize: 12 },
  loadMoreBtn: { textAlign: "center", padding: 10, cursor: "pointer", color: "#666", fontSize: 12 },
  errorBanner: {
    background: "#ff5555",
    color: "white",
    padding: "8px 12px",
    fontSize: 12,
    textAlign: "center" as const,
    borderBottom: "2px solid #cc0000",
  },
};

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
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.chatContainer} onClick={e => e.stopPropagation()}>
          {errorMessage && (
            <div style={styles.errorBanner}>
              ❌ {errorMessage}
            </div>
          )}
          
          <div style={styles.header}>
            <div 
              style={{...styles.avatar, backgroundImage: `url(${friend.avatarImage || defaultAvatar})`}}
              onClick={() => setShowProfile(true)}
            >
              <div style={styles.onlineIndicator(!!friend.online)} />
            </div>
            <div style={styles.headerInfo}>
              <h3 
                style={styles.friendName}
                onClick={() => setShowProfile(true)}
              >
                {friend.userName}
              </h3>
              {isTyping ? <span style={styles.typing}>typing...</span> : 
               <span style={styles.status}>{friend.online ? "🟢 Online" : "⚫ Offline"}</span>}
            </div>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>

          <div ref={messagesContainerRef} style={styles.messagesContainer}>
            {hasMore && !loading && (
              <div
                style={styles.loadMoreBtn as React.CSSProperties}
                onClick={() => fetchMessages(page + 1)}
              >
                Load older messages ↑
              </div>
            )}
            {loading && <div style={styles.loadingIndicator}>Loading...</div>}
            
            {messages.length === 0 && !loading ? (
              <div style={styles.emptyState}>No messages yet.<br/>Say hello to {friend.userName}! 👋</div>
            ) : (
              Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  <div style={styles.dateDivider}>{date}</div>
                  {msgs.map((msg, idx) => {
                    const isMe = msg.senderId === myAvatarId;
                    const showAvatar = !isMe && (idx === msgs.length - 1 || msgs[idx + 1]?.senderId !== msg.senderId);
                    
                    return (
                      <div key={msg._id} style={styles.messageRow(isMe, msg.rejected)}>
                        {!isMe && showAvatar && (
                          <div style={{...styles.messageAvatar, backgroundImage: `url(${friend.avatarImage || defaultAvatar})`}} />
                        )}
                        {!isMe && !showAvatar && <div style={{width: 32}} />}
                        
                        <div>
                          <div style={styles.messageBubble(isMe, msg.rejected)}>
                            {msg.content}
                            {msg.rejected && (
                              <div style={styles.rejectedText}>
                                Blocked: {msg.rejectedReason || "Message could not be delivered"}
                              </div>
                            )}
                          </div>
                          <div style={styles.timestamp}>
                            {formatTime(msg.createdAt)}
                            {isMe && (
                              <span style={{marginLeft: 4}}>
                                {msg.rejected ? "❌" : msg.read ? "✓✓" : msg.isOptimistic ? "⏳" : "✓"}
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

          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={styles.input}
              maxLength={1000}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{...styles.sendBtn, opacity: inputValue.trim() ? 1 : 0.5, cursor: inputValue.trim() ? "pointer" : "not-allowed"}}
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