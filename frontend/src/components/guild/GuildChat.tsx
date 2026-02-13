import { useState, useRef, useEffect } from "react";
import { useGameSocket } from "../../ws/useGameSocket";
import { GuildMessage } from "../../types/guildTypes";
import PixelButton from "../elements/PixelButton";
import { ASSETS } from "../../assets";

interface GuildChatProps {
  guildId: string | undefined;
  messages: GuildMessage[];
  onBack: () => void;
}

export default function GuildChat({ guildId, messages, onBack }: GuildChatProps) {
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

  if (!guildId) onBack();

  // PixelButton colors for input
  const beigeBtn = { colorA: "#fff1ef", colorB: "#ab7b81", colorText: "#ab7b81" };

  return (
    <div className="flex flex-col gap-3">
      {/* Messages container */}
      <div className="h-140 overflow-y-auto border-2 border-gray-300 rounded-lg p-2.5 bg-[#fff1ef]">
        {messages.length === 0 && (
          <div className="opacity-60 text-center">No messages yet</div>
        )}

        {messages.map((msg) => (
          <div key={msg._id} className="mb-1.5">
            <strong>{msg.senderName}:</strong> {msg.text}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 items-center">
        {/* Pixel input */}
        <div className="relative flex-1">
          <PixelButton {...beigeBtn} height={40} width="100%" textSize="0.8rem" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="absolute inset-0 px-3 py-4 outline-none bg-transparent text-[#ab7b81] font-mono text-sm"
          />
        </div>

        {/* Send button with icon */}
        <div className="relative w-12 h-12 shrink-0">
          <button
            onClick={sendMessage}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={ASSETS.ICONS.SEND}
              alt="Send"
              className="w-12 h-12 object-contain image-rendering-pixelated hover:scale-110"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
