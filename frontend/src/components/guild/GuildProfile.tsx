import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Shield from "./GuildShield";
import { Guild } from "../../types/guildTypes";
import { ASSETS } from "../../assets";
import { useGameSocket } from "../../ws/useGameSocket";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";
import PixelButton from "../elements/PixelButton";

const logo = ASSETS.GUILD.LOGO;

interface GuildProfileProps {
  token: string | null;
  avatarData: AvatarData;
  selectedGuild: Guild | undefined;
  onBack: () => void;
}

export default function GuildProfile({
  avatarData,
  selectedGuild,
  token,
  onBack,
}: GuildProfileProps) {
  const [leaving, setLeaving] = useState(false);
  const [disbanding, setDisbanding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [guild, setGuild] = useState<Guild | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageBase64, setEditImageBase64] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const { emitEvent } = useGameSocket(() => {});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selectedGuild) {
      setGuild(selectedGuild);
      setEditName(selectedGuild.name);
      setEditDescription(selectedGuild.description || "");
      setEditImageBase64("");
      setPreviewImage(selectedGuild.image || "");
    }
  }, [selectedGuild]);

  const isMember = guild?.members.some((m) => {
    if (!avatarData._id) return false;
    if (typeof m.avatar === "string") return m.avatar === avatarData._id;
    if (m.avatar && typeof m.avatar === "object" && "_id" in m.avatar)
      return m.avatar._id === avatarData._id;
    return false;
  });

  const isLeader = guild?.members.some((m) => {
    if (!avatarData._id) return false;
    if (typeof m.avatar === "object" && "_id" in m.avatar) {
      return m.avatar._id === avatarData._id && m.role === "leader";
    }
    return false;
  });

  const isCoLeader = guild?.members.some((m) => {
    if (!avatarData._id) return false;
    if (typeof m.avatar === "object" && "_id" in m.avatar) {
      return m.avatar._id === avatarData._id && m.role === "co-leader";
    }
    return false;
  });

  const handleLeaveGuild = async () => {
    if (!guild || !token) return;
    try {
      setLeaving(true);
      const res = await fetch(
        `https://localhost/api/guild/${guild._id}/leave`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to leave guild");
      const data = await res.json();
      setGuild(data.guild);

      emitEvent("guildUpdate", { guildId: data.guild._id, action: "update" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to leave guild");
    } finally {
      setLeaving(false);
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });
      onBack();
    }
  };

  const handleDisbandGuild = async () => {
    if (!guild || !token) return;
    if (!window.confirm("Are you sure you want to disband this guild? This cannot be undone.")) return;

    try {
      setDisbanding(true);
      const res = await fetch(`https://localhost/api/guild/${guild._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to disband guild");

      emitEvent("guildUpdate", { guildId: guild._id, action: "delete" });
      setGuild(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to disband guild");
    } finally {
      setDisbanding(false);
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });
      onBack();
    }
  };

  const handleUpdateGuild = async (e: FormEvent) => {
    e.preventDefault();
    if (!guild || !token) return;

    try {
      setUpdating(true);
      const res = await fetch(`https://localhost/api/guild/${guild._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          image: editImageBase64 || guild.image,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to update guild");
      const data = await res.json();
      setGuild(data.guild);

      emitEvent("guildUpdate", { guildId: data.guild._id, action: "update" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update guild");
    } finally {
      setUpdating(false);
      onBack();
    }
  };

  const handleKickMember = async (targetAvatarId: string) => {
    if (!guild || !token) return;
    if (!window.confirm("Are you sure you want to kick this member?")) return;

    try {
      const res = await fetch(
        `https://localhost/api/guild/${guild._id}/kick/${targetAvatarId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message || "Failed to kick member");

      emitEvent("guildUpdate", { guildId: guild._id, targetAvatarId, action: "kick" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to kick member");
    }
  };

  const handlePromoteMember = async (targetAvatarId: string) => {
    if (!guild || !token) return;
    try {
      const res = await fetch(
        `https://localhost/api/guild/${guild._id}/promote/${targetAvatarId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message || "Failed to promote member");

      emitEvent("guildUpdate", { guildId: guild._id, action: "promote" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to promote member");
    }
  };

  const handleDemoteMember = async (targetAvatarId: string) => {
    if (!guild || !token) return;
    try {
      const res = await fetch(
        `https://localhost/api/guild/${guild._id}/demote/${targetAvatarId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message || "Failed to demote co-leader");

      emitEvent("guildUpdate", { guildId: guild._id, action: "update" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to demote co-leader");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setEditImageBase64(result);
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarId = (avatar: string | AvatarData | null | undefined): string | null => {
    if (!avatar) return null;
    if (typeof avatar === "string") return avatar;
    return avatar._id;
  };

  if (!guild) return <p>Guild not found</p>;

  // BUTTON COLORS
  const greenBtn = { colorA: "#6f8f63", colorB: "#4f6b4a", colorText: "#ffffff" };
  const redBtn = { colorA: "#de4040", colorB: "#9d2f2f", colorText: "#ffffff" };
  const beigeBtn = { colorA: "#fff1ef", colorB: "#ab7b81", colorText: "#ab7b81" };
  const grayBtn = { colorA: "#a3a3a3", colorB: "#737373", colorText: "#ffffff" };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <Shield width={80} fillImage={previewImage || logo} borderColor="black" />
      </div>

      {isLeader && (
        <form onSubmit={handleUpdateGuild} className="flex flex-col gap-2">
          <div className="relative w-full h-13">
            <PixelButton {...beigeBtn} height={52} width="100%" textSize="1rem" />
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Guild Name"
              className="absolute inset-0 bg-transparent px-4 py-2 text-sm font-bold outline-none text-[#909090] font-mono"
            />
          </div>

          <div className="relative w-full h-30">
            <PixelButton {...beigeBtn} height={120} width="100%" textSize="1rem" />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Guild Description"
              className="absolute inset-0 bg-transparent px-4 py-3 text-sm resize-none outline-none font-mono text-[#ab7b81]"
            />
          </div>

          <div className="relative w-full h-13">
            <PixelButton {...grayBtn} height={52} width="100%" textSize="1rem" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none text-[#ffffff]">
              Browse Image
            </div>
          </div>

          <div className="relative w-full h-13 text-white">
            <PixelButton {...greenBtn} height={52} width="100%" textSize="1rem" />
            <button
              type="submit"
              disabled={updating}
              className="absolute inset-0 text-lg"
            >
              {updating ? "Updating..." : "Update Guild"}
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {guild.members.map((m, index) => {
          const avatarId = getAvatarId(m.avatar);
          const memberName =
            typeof m.avatar === "object" && m.avatar && "userName" in m.avatar
              ? m.avatar.userName
              : "Unknown";
          const isSelf = avatarId === avatarData._id;

          const canKick = !isSelf && ((isLeader && m.role !== "leader") || (isCoLeader && m.role === "member"));
          const canPromote = isLeader && !isSelf && m.role === "member";
          const canDemote = isLeader && !isSelf && m.role === "co-leader";

          // row background color
          const memberRowBtn = { colorA: "#fff1ef", colorB: "#ab7b81", colorText: "#000000" }; // pixel gray

          return (
            <li key={index} className="relative">
              <PixelButton {...memberRowBtn} height={60} width="100%" textSize="0.9rem" />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-[#ab7b81]">{memberName} <strong>({m.role})</strong></span>

                <div className="flex gap-1.5 pb-1">
                  {canPromote && avatarId && (
                    <div className="relative">
                      <PixelButton {...greenBtn} height={36} width={80} textSize="0.8rem" />
                      <button
                        onClick={() => handlePromoteMember(avatarId)}
                        className="absolute inset-0 text-xs font-bold text-white"
                      >
                        Promote
                      </button>
                    </div>
                  )}

                  {canDemote && avatarId && (
                    <div className="relative">
                      <PixelButton {...grayBtn} height={36} width={80} textSize="0.8rem" />
                      <button
                        onClick={() => handleDemoteMember(avatarId)}
                        className="absolute inset-0 text-xs font-bold text-white"
                      >
                        Demote
                      </button>
                    </div>
                  )}

                  {canKick && avatarId && (
                    <div className="relative">
                      <PixelButton {...redBtn} height={36} width={80} textSize="0.8rem" />
                      <button
                        onClick={() => handleKickMember(avatarId)}
                        className="absolute inset-0 text-xs font-bold text-white"
                      >
                        Kick
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* {isMember && (
        <div className="relative w-full h-[52px]">
          <PixelButton {...greenBtn} height={52} width="100%" textSize="1rem" />
          <button onClick={onOpenChat} className="absolute inset-0 text-sm font-bold uppercase">
            Open Guild Chat
          </button>
        </div>
      )} */}

      {isMember && !isLeader && (
        <div className="relative w-full h-13">
          <PixelButton {...redBtn} height={52} width="100%" textSize="1rem" />
          <button onClick={handleLeaveGuild} disabled={leaving} className="absolute inset-0 text-lg text-[#ffffff]">
            {leaving ? "Leaving..." : "Leave Guild"}
          </button>
        </div>
      )}

      {isLeader && (
        <div className="relative w-full h-13">
          <PixelButton {...redBtn} height={52} width="100%" textSize="1rem" />
          <button onClick={handleDisbandGuild} disabled={disbanding} className="absolute inset-0 text-lg text-[#ffffff]">
            {disbanding ? "Disbanding..." : "Disband Guild"}
          </button>
        </div>
      )}
    </div>
  );
}
