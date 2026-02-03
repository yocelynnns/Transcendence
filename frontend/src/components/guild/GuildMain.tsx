import { useEffect, useState } from "react";
import GuildList from "./GuildList";
import GuildCreate from "./GuildCreate";
import GuildProfile from "./GuildProfile";
import GuildChat from "./GuildChat";
import { Guild, GuildMessage } from "../../types/guildTypes";
import Shield from "./GuildShield";
import { ASSETS } from "../../assets";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";
import { fetchAllGuilds } from "../../hooks/useGuildData";
import { fetchGuildMessages } from "../../hooks/useGuildChat";
import { useFullGuildUpdates, useGuildChatSocket } from "../../hooks/useGuildSubcribe";

const logo = ASSETS.GUILD.LOGO;

type View = "list" | "create" | "profile" | "chat";

interface GuildMainProps {
  avatarData: AvatarData;
  token: string | null;
}

export default function GuildMain({ avatarData, token }: GuildMainProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(logo);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<GuildMessage[]>([]);

  useEffect(() => {
    if (!selectedGuild) return;

    const updated = guilds.find((g) => g._id === selectedGuild._id);
    if (updated) {
      setSelectedGuild(updated);
    }
  }, [guilds, selectedGuild]);


  useEffect(() => {
    if (!avatarData.guild?._id) return;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await fetchGuildMessages(avatarData.guild?._id, token);
        setMessages(data);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [avatarData.guild?._id, token]);

  useEffect(() => {
    const loadGuilds = async () => {
      setLoading(true);
      try {
        const data = await fetchAllGuilds();
        setGuilds(data);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    loadGuilds();
  }, []);

  useFullGuildUpdates({ setGuilds:setGuilds, avatarId:avatarData._id });
  useGuildChatSocket({ guildId: avatarData.guild?._id, setMessages });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!avatarData) return;

    queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });

    Promise.resolve().then(() => {
      setSelectedImage(avatarData.guild?.image || logo);
    });
  }, [avatarData, queryClient, panelOpen, setView]);

  const getTitle = () => {
    if (view === "create") return "Create Guild";
    if (view === "profile") return "Guild Profile";
    if (view === "chat") return "Guild Chat";
    return "Guilds";
  };

  const showBack = view !== "list";

  return (
    <>
      { (
        <div
          onClick={() => setPanelOpen(!panelOpen)}
          style={{
            // position: "absolute",
            // top: 68,
            // right: 8,
            cursor: "pointer",
            zIndex: 100,
            width: 50,
            height: 50,
          }}
        >
          <Shield width={50} fillImage={selectedImage} />
        </div>
      )}

      {panelOpen && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right:100,
            width: 420,
            minHeight: 520,
            maxHeight: 600,
            background: "white",
            borderRadius: 16,
            border: "2px solid #ddd",
            boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              borderBottom: "2px solid #bbb",
            }}
          >
            <div style={{ width: 60 }}>
              {showBack && (
                <button onClick={() => setView("list")} style={headerButton}>
                  ← Back
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {getTitle()}
            </div>

            <div style={{ width: 60, textAlign: "right" }}>
              <button
                onClick={() => {
                  setPanelOpen(false);
                  setView("list");
                }}
                style={headerButton}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              flex: 1,
              overflowY: view === "list" ? "auto" : "visible",
            }}
          >
            {view === "list" && token && !loading && (
              <GuildList
                token={token}
                avatarData={avatarData}
                onCreateGuild={() => setView("create")}
                onSelectGuild={(g) => {
                  setSelectedGuild(g);
                  setView("profile");
                }}
                onGoToMyGuildChat={() => setView("chat")}
                guilds={guilds}
                setGuilds={setGuilds}
              />
            )}

            {view === "create" && token && (
              <GuildCreate
                token={token}
                avatarData={avatarData}
                onBack={() => setView("list")}
              />
            )}

            {view === "profile" && selectedGuild && (
              <GuildProfile
                token={token}
                avatarData={avatarData}
                selectedGuild={selectedGuild}
                onOpenChat={() => setView("chat")}
                onBack={() => setView("list")}
              />
            )}

            {view === "chat" && <GuildChat guildId={avatarData.guild?._id} token={token} messages={messages} onBack={() => setView("list")}  />}
          </div>
        </div>
      )}
    </>
  );
}

const headerButton: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  padding: 4,
};
