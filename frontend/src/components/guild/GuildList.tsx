import { useState } from "react";
import Shield from "./GuildShield";
import { ASSETS } from "../../assets";
import { Guild } from "../../types/guildTypes";
import { useGameSocket } from "../../ws/useGameSocket";
import { Dispatch, SetStateAction } from "react";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";

const logo = ASSETS.GUILD.LOGO;

interface GuildListProps {
  token: string | null;
  avatarData: AvatarData;
  onSelectGuild: (guild: Guild) => void;
  onCreateGuild: () => void;
  onGoToMyGuildChat: () => void;
  guilds: Guild[];
  setGuilds: Dispatch<SetStateAction<Guild[]>>;
}

export default function GuildList({
  token,
  avatarData,
  onCreateGuild,
  onGoToMyGuildChat,
  onSelectGuild,
  guilds,
  setGuilds,
}: GuildListProps) {
  const queryClient = useQueryClient();
  const [joining, setJoining] = useState<string | null>(null);
  const { emitEvent } = useGameSocket(() => {});

  const handleJoinGuild = async (guildId: string) => {
    if (!token || joining) return;
    setJoining(guildId);

    try {
      const res = await fetch(`http://localhost:25001/api/guild/${guildId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join guild");

      const updatedGuild = data.guild;

      setGuilds((prev) =>
        prev.map((g) =>
          g._id === guildId ? { ...updatedGuild, members: updatedGuild.members || [] } : g
        )
      );
      
      emitEvent("guildUpdate", {
        guildId: updatedGuild._id,
        token: token,
        action: "update",
      });
    } catch (err: unknown) {
      console.error("[JOIN GUILD]", err);
    } finally {
      setJoining(null);
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {avatarData?.guild == null && (
          <button onClick={onCreateGuild} style={bolderButtonStyle}>
            + Create Guild
          </button>
        )}
        {avatarData?.guild && (
          <button onClick={onGoToMyGuildChat} style={bolderButtonStyle}>
            💬 Your Guild Chat
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {guilds.map((guild) => {
          const members = guild.members || [];
          const isJoining = joining === guild._id;
          const canJoin = avatarData?.guild == null && !isJoining;

          return (
            <div
              key={guild._id}
              style={{
                display: "flex",
                alignItems: "center",
                border: "2px solid #bbb",
                borderRadius: 10,
                padding: 12,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div style={{ marginRight: 12, flexShrink: 0 }}>
                <Shield width={50} fillImage={guild.image || logo} />
              </div>

              <div style={{ flex: 1, overflow: "hidden" }} onClick={() => onSelectGuild(guild)}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {guild.name}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    marginTop: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {guild.description || "No description"}
                </div>
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
                  Members: {members.length}
                </div>
              </div>

              <button
                onClick={() => handleJoinGuild(guild._id)}
                disabled={!canJoin}
                style={{
                  marginLeft: 12,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "2px solid #888",
                  background: canJoin ? "#cce5ff" : "#ddd",
                  color: canJoin ? "#0056b3" : "#888",
                  cursor: canJoin ? "pointer" : "not-allowed",
                  fontWeight: 600,
                }}
              >
                {avatarData?.guild ? "Joined" : isJoining ? "Joining..." : "Join"}
              </button>
            </div>
          );
        })}

        {guilds.length === 0 && !guilds && (
          <div style={{ opacity: 0.6 }}>No guilds available.</div>
        )}
      </div>
    </div>
  );
}

const bolderButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "2px solid #bbb",
  background: "#fafafa",
  cursor: "pointer",
  fontWeight: 600,
};
