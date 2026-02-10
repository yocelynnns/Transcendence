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
      const res = await fetch(`http://localhost:5001/api/guild/${guildId}/join`, {
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
      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mb-5">
        {avatarData?.guild == null ? (
          <button
            onClick={onCreateGuild}
            className="flex-1 py-2 rounded-lg border-2 border-gray-400 bg-gray-100 font-semibold hover:bg-gray-200 transition"
          >
            + Create Guild
          </button>
        ) : (
          <button
            onClick={onGoToMyGuildChat}
            className="flex-1 py-2 rounded-lg border-2 border-blue-400 bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
          >
            💬 Your Guild Chat
          </button>
        )}
      </div>

      {/* GUILD LIST */}
      {guilds.length > 0 ? (
        <div className="flex flex-col gap-3">
          {guilds.map((guild) => {
            const members = guild.members || [];
            const isJoining = joining === guild._id;
            const canJoin = avatarData?.guild == null && !isJoining;

            return (
              <div
                key={guild._id}
                className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="mr-3 flex-shrink-0">
                  <Shield width={50} fillImage={guild.image || logo} />
                </div>

                <div className="flex-1 overflow-hidden" onClick={() => onSelectGuild(guild)}>
                  <div className="text-md font-semibold truncate">{guild.name}</div>
                  <div className="text-sm text-gray-600 mt-1 truncate">
                    {guild.description || "No description"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Members: {members.length}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGuild(guild._id)}
                  disabled={!canJoin}
                  className={`ml-3 px-3 py-1 rounded-md border-2 font-semibold transition
                    ${canJoin ? "bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200" : "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  {avatarData?.guild ? "Joined" : isJoining ? "Joining..." : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-10 font-medium">
          No Guild Available To Join
        </div>
      )}
    </div>
  );
}
