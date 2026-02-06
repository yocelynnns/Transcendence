import { useState, useRef, useEffect } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { GuildMessage } from "../../types/guildTypes";

interface GuildChatProps {
  guildId: string | undefined;
  token: string | null;// CAN DELETE
  messages: GuildMessage[];
  onBack: () => void;
}

export default function GuildChat({ guildId, messages, onBack}: GuildChatProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { emitEvent } = useGameSocket(() => {});

  const sendMessage = () => {
    if (!text.trim() || !guildId) return;

    emitEvent("sendGuildMessage", {
      guildId,
      message: { text },
    });

    setText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!guildId) onBack() ;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          height: 340,
          overflowY: "auto",
          border: "2px solid #bbb",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        {messages.length === 0 && (
          <div style={{ opacity: 0.6, textAlign: "center" }}>
            No messages yet
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: 6 }}>
            <strong>{msg.senderName}:</strong> {msg.text}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "2px solid #bbb",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "2px solid #bbb",
            background: "#fafafa",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
