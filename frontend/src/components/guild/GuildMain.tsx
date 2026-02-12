import { useEffect, useState } from "react";
import GuildList from "./GuildList";
import GuildCreate from "./GuildCreate";
import GuildProfile from "./GuildProfile";
import GuildChat from "./GuildChat";
import { Guild, GuildMessage } from "../../types/guildTypes";
import type { AvatarData } from "../../types/avatarTypes";
import { fetchAllGuilds } from "../../hooks/useGuildData";
import { fetchGuildMessages } from "../../hooks/useGuildChat";
import { useFullGuildUpdates, useGuildChatSocket } from "../../hooks/useGuildSubcribe";
import PixelButton from "../elements/PixelButton";
import { ASSETS } from "../../assets";

type View = "list" | "create" | "profile" | "chat";

interface GuildMainProps {
  avatarData: AvatarData;
  token: string | null;
  onClosePanel: () => void;
  scale: number;
}

export default function GuildMain({ avatarData, token, onClosePanel, scale }: GuildMainProps) {
  const [view, setView] = useState<View>("list");
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<GuildMessage[]>([]);

  // Base dimensions (design at scale 1)
  const BASE_WIDTH = 520;
  const BASE_HEIGHT = 860;

  // Update selected guild if it changes in guild list
  useEffect(() => {
    if (!selectedGuild) return;
    const updated = guilds.find(g => g._id === selectedGuild._id);
    if (updated) setSelectedGuild(updated);
  }, [guilds, selectedGuild]);

  // Load guild messages for your guild
  useEffect(() => {
    if (!avatarData.guild?._id) return;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await fetchGuildMessages(avatarData.guild?._id, token);
        setMessages(data);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [avatarData.guild?._id, token]);

  // Load all guilds
  useEffect(() => {
    const loadGuilds = async () => {
      setLoading(true);
      try {
        const data = await fetchAllGuilds();
        setGuilds(data);
      } finally {
        setLoading(false);
      }
    };
    loadGuilds();
  }, []);

  // Real-time updates
  useFullGuildUpdates({ setGuilds, avatarId: avatarData._id });
  useGuildChatSocket({ guildId: avatarData.guild?._id, setMessages });

  const getTitle = () => {
    if (view === "create") return "Create Guild";
    if (view === "profile") return "Guild Profile";
    if (view === "chat") return "Guild Chat";
    return "Guilds";
  };
  const showBack = view !== "list";

  return (
    <div 
      className="fixed top-0 right-0 z-50 h-screen"
      style={{
        width: BASE_WIDTH,              // original width
        height: BASE_HEIGHT,
        transform: `scale(${scale})`,   // scales width proportionally
        transformOrigin: 'top right',
      }}
    >
      <div className="flex flex-col h-full">
        <div className="border-12 h-full" style={{ borderColor: "#ab7b81" }}>
          {/* Inner border with background */}
          <div className="border-12 flex flex-col h-full" style={{ borderColor: "#dea8a3", backgroundColor: "#ecc2be" }}>
            {/* HEADER */}
            <div className="relative top-6 w-7/8 left-1/16">
              <PixelButton
                colorA="#dea8a3"   
                colorB="#c58882"  
                colorText="#ab7b81"  
                textSize="16px"
                height={80}
                width={413}
                cursorPointer={false}
              />

              <div className="absolute inset-0 flex items-center px-4">
                {/* Back button */}
                {showBack && (
                  <div>
                    <button
                      onClick={() => setView("list")}
                      style={headerButton}
                    >
                      <img
                        src={ASSETS.ICONS.BACK}
                        alt="Back"
                        className="w-8 h-8 object-contain image-rendering-pixelated hover:scale-110"
                      />
                    </button>
                  </div>
                )}

                {view !== "create" && view !== "profile" && view !== "chat" && token && (
                  <img
                    src={ASSETS.ICONS.GUILD}
                    alt="Guild"
                    className="w-12 h-12 object-contain image-rendering-pixelated mb-1"
                  />
                )}
                
                {view === "list" ? (
                  <div className="flex-1 text-left text-3xl text-[#fff1ef] p-3">
                    {getTitle()}
                  </div>
                ) : (
                    <div className="flex-1 text-center text-3xl right-30 text-[#fff1ef] p-3">
                      {getTitle()}
                    </div>
                  )
                }

                {/* Close button */}
                <div className="text-right">
                  <button
                    onClick={onClosePanel}
                    style={headerButton}
                  >
                    <img
                      src={ASSETS.ICONS.X}
                      alt="X"
                      className="w-10 h-10 object-contain image-rendering-pixelated hover:scale-110"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-visible">
              <div className="relative h-18/20 w-7/8 left-1/16 top-10">
                {/* Content banner background */}
                <PixelButton
                  colorA="#dea8a3"   
                  colorB="#c58882"  
                  colorText="#ab7b81"  
                  textSize="16px"
                  height="100%"
                  width="100%"
                  cursorPointer={false}
                />
                
                {/* Content overlay */}
                <div className="absolute inset-0 p-4 overflow-y-auto overscroll-contain">
                  {view === "list" && token && !loading && (
                    <GuildList
                      token={token}
                      avatarData={avatarData}
                      onCreateGuild={() => setView("create")}
                      onSelectGuild={g => { setSelectedGuild(g); setView("profile"); }}
                      onGoToMyGuildChat={() => setView("chat")}
                      guilds={guilds}
                      setGuilds={setGuilds}
                    />
                  )}

                  {view === "create" && token && (
                    <GuildCreate token={token} avatarData={avatarData} onBack={() => setView("list")} />
                  )}

                  {view === "profile" && selectedGuild && (
                    <GuildProfile
                      token={token}
                      avatarData={avatarData}
                      selectedGuild={selectedGuild}
                      onBack={() => setView("list")}
                    />
                  )}

                  {view === "chat" && avatarData.guild?._id && (
                    <GuildChat guildId={avatarData.guild._id} messages={messages} onBack={() => setView("list")} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const headerButton: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  padding: 4,
};