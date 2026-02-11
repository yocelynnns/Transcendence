import { useState, useEffect, useRef } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { ASSETS } from "../../assets";

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
  },
  onlineIndicator: (online: boolean) => ({
    position: "absolute" as const, bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "2px solid white",
  }),
  headerInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: "bold" as const, color: "#333", margin: 0 },
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
  messageRow: (isMe: boolean) => ({
    display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
    alignItems: "flex-end", gap: 8,
  }),
  messageBubble: (isMe: boolean) => ({
    maxWidth: "70%", padding: "10px 14px",
    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: isMe ? "#4CAF50" : "white", color: isMe ? "white" : "#333",
    border: "2px solid #333", fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" as const,
  }),
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
};

// Generate stable room ID
const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join("_");

export default function ChatWindow({
  token, myAvatarId, myUserName, myAvatarImage, friend, onClose
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  
  const roomId = getRoomId(myAvatarId, friend.avatarId);
  const friendId = friend.avatarId;

  // Fetch messages function
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

  // Setup effect - runs once when friend changes
  useEffect(() => {
    console.log("🔵 ChatWindow mounted for:", friendId);
    
    // Join room
    emitEvent("joinChat", { friendAvatarId: friendId });
    
    // Fetch messages
    fetchMessages(1);
    
    // Mark as read
    emitEvent("markAsRead", { senderId: friendId });

    // Setup listeners
    const cleanupReceive = subscribeEvent<any>("receiveMessage", (msg) => {
      console.log("📨 Received:", msg.content?.substring(0, 20));
      
      // Only handle messages for this room
      const msgRoomId = getRoomId(msg.senderId, msg.receiverId);
      if (msgRoomId !== roomId) return;

      setMessages(prev => {
        // Skip if already exists
        if (prev.some(m => m._id === msg._id)) return prev;
        
        // Remove optimistic version if exists
        const filtered = prev.filter(m => 
          !(m.isOptimistic && m.content === msg.content && m.senderId === msg.senderId)
        );
        
        return [...filtered, { ...msg, isOptimistic: false }];
      });
      
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    const cleanupTyping = subscribeEvent<any>("partnerTyping", ({ avatarId, isTyping }) => {
      if (avatarId === friendId) setIsTyping(isTyping);
    });

    const cleanupRead = subscribeEvent<any>("messagesRead", ({ byAvatarId }) => {
      if (byAvatarId === friendId) {
        setMessages(prev => prev.map(m => 
          m.senderId === myAvatarId ? { ...m, read: true } : m
        ));
      }
    });

    // Cleanup
    return () => {
      console.log("🔴 ChatWindow unmounting for:", friendId);
      cleanupReceive();
      cleanupTyping();
      cleanupRead();
      emitEvent("leaveChat", { friendAvatarId: friendId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [friendId]); // Only re-run when friend changes

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();

    // Optimistic message
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

    // Send
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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.chatContainer} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{...styles.avatar, backgroundImage: `url(${friend.avatarImage || defaultAvatar})`}}>
            <div style={styles.onlineIndicator(!!friend.online)} />
          </div>
          <div style={styles.headerInfo}>
            <h3 style={styles.friendName}>{friend.userName}</h3>
            {isTyping ? <span style={styles.typing}>typing...</span> : 
             <span style={styles.status}>{friend.online ? "🟢 Online" : "⚫ Offline"}</span>}
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div ref={messagesContainerRef} style={styles.messagesContainer}>
          {hasMore && !loading && (
            <div style={styles.loadMoreBtn} onClick={() => fetchMessages(page + 1)}>
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
                    <div key={msg._id} style={styles.messageRow(isMe)}>
                      {!isMe && showAvatar && (
                        <div style={{...styles.messageAvatar, backgroundImage: `url(${friend.avatarImage || defaultAvatar})`}} />
                      )}
                      {!isMe && !showAvatar && <div style={{width: 32}} />}
                      
                      <div>
                        <div style={styles.messageBubble(isMe)}>{msg.content}</div>
                        <div style={styles.timestamp}>
                          {formatTime(msg.createdAt)}
                          {isMe && <span style={{marginLeft: 4}}>{msg.read ? "✓✓" : msg.isOptimistic ? "⏳" : "✓"}</span>}
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
  );
}