import { useState } from "react";
import Shield from "./GuildShield";
import { ASSETS } from "../../assets";
import { Guild } from "../../types/guildTypes";
import { useGameSocket } from "../../ws/useGameSocket";
import { Dispatch, SetStateAction } from "react";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";
import PixelButton from "../elements/PixelButton";

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
  const [hoveredGuildId, setHoveredGuildId] = useState<string | null>(null);
  const { emitEvent } = useGameSocket(() => {});

  const handleJoinGuild = async (guildId: string) => {
    if (!token || joining) return;
    setJoining(guildId);

    try {
      const res = await fetch(`/api/guild/${guildId}/join`, {
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
      console.log("[JOIN GUILD]", err);
    } finally {
      setJoining(null);
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-5">
        {avatarData?.guild == null && (
          <div onClick={onCreateGuild} className="flex-1 cursor-pointer">
            <PixelButton
              colorA="#fff1ef"
              colorB="#ab7b81"
              colorText="#ab7b81"
              textSize="1.3rem"
              height={50}
              width="100%"
              cursorPointer={true}
            >
              + Create New Guild
            </PixelButton>
          </div>
        )}
        {avatarData?.guild && (
          <div onClick={onGoToMyGuildChat} className="flex-1 cursor-pointer">
            <PixelButton
              colorA="#fff1ef"
              colorB="#ab7b81"
              colorText="#ab7b81"
              textSize="1.3rem"
              height={50}
              width="100%"
              cursorPointer={true}
            >
              Guild Chat
            </PixelButton>
          </div>
        )}
      </div>

      {guilds.length > 0 ? (
        <div className="flex flex-col gap-3">
          {guilds.map((guild) => {
            const members = guild.members || [];
            const isJoining = joining === guild._id;
            const isHovered = hoveredGuildId === guild._id; // hover check

            return (
              <div key={guild._id} className="relative w-full h-25 hover:scale-102 mb-3" 
                onMouseEnter={() => setHoveredGuildId(guild._id)}
                onMouseLeave={() => setHoveredGuildId(null)}
              >
                <PixelButton
                  colorA={!isHovered ? "#fed4cf" : "#fff1ef"}
                  colorB={!isHovered ? "#ab7b81" : "#ab7b81"}
                  colorText={!isHovered ? "#ab7b81" : "#fed4cf"}
                  textSize="1rem"
                  height={110}
                  width="100%"
                  cursorPointer={false}
                />

                <div className="absolute inset-0 z-10 flex items-center w-full px-4 gap-3">
                  <div className="shrink-0">
                    <Shield width={50} fillImage={guild.image || logo} />
                  </div>

                  <div
                    className="flex-1 overflow-hidden flex flex-col justify-center text-left"
                    onClick={() => onSelectGuild(guild)}
                  >
                    <div className="text-[1.2rem] font-semibold truncate text-[#6f4f52]"
                    //   className={`text-[1.2rem] font-semibold truncate ${
                    //   !isHovered ? "text-[#ab7b81]" : "text-[#ab7b81]"
                    // }`}
                    >
                      {guild.name}
                    </div>

                    <div className="text-[0.95rem] truncate text-[#6f4f52]"
                      // className={`text-[0.95rem] truncate ${
                      //   !isHovered ? "text-[#6f4f52]" : "text-[#6f4f52]"
                      // }`}
                    >
                      {guild.description || "No description"}
                    </div>

                    <div className="text-[0.8rem] mt-0.5 text-[#7a5a5e]"
                      // className={`text-[0.8rem] mt-[2px] ${
                      //   !isHovered ? "text-[#7a5a5e]" : "text-[#7a5a5e]"
                      // }`}
                    >
                      Members: {members.length}
                    </div>
                  </div>

                  {!avatarData?.guild && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGuild(guild._id);
                      }}
                      disabled={isJoining}
                      className={`px-3 py-1 rounded-md border-2 font-semibold transition hover:scale-110
                        ${
                          isJoining
                            ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#fff1ef] border-[#ab7b81] text-[#ab7b81] hover:text-[#fff1ef] hover:bg-[#ab7b81]"
                        }`}
                    >
                      {isJoining ? "Joining..." : "Join"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-[#ab7b81] text-[1.3rem]">
          No Guild Available To Join
        </div>
      )}
    </div>
  );
}
