import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Shield from "./GuildShield";
import { Guild } from "../../types/guildTypes";
import { ASSETS } from "../../assets";
import { useGameSocket } from "../../ws/useGameSocket";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";

const logo = ASSETS.GUILD.LOGO;

interface GuildProfileProps {
  token: string | null;
  avatarData: AvatarData;
  selectedGuild: Guild | undefined;
  onOpenChat: () => void;
  onBack: () => void;
}

export default function GuildProfile({
  avatarData,
  selectedGuild,
  onOpenChat,
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

  const handleLeaveGuild = async () => {
    if (!guild || !token) return;
    try {
      setLeaving(true);
      const res = await fetch(
        `http://localhost:25001/api/guild/${guild._id}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to leave guild");
      const data = await res.json();
      setGuild(data.guild);

      emitEvent("guildUpdate", {
        guildId: data.guild._id,
        token: token,
        action: "update",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to leave guild");
    } finally {
      setLeaving(false);
      queryClient.invalidateQueries({
        queryKey: ["avatar", avatarData._id],
        exact: true,
      });
      onBack();
    }
  };

  const handleDisbandGuild = async () => {
    if (!guild || !token) return;
    if (
      !window.confirm(
        "Are you sure you want to disband this guild? This cannot be undone."
      )
    )
      return;

    try {
      setDisbanding(true);
      const res = await fetch(
        `http://localhost:25001/api/guild/${guild._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to disband guild");

      emitEvent("guildUpdate", {
        guildId: guild._id,
        token: token,
        action: "delete",
      });
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
      const res = await fetch(
        `http://localhost:25001/api/guild/${guild._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            image: editImageBase64 || guild.image,
          }),
        }
      );
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to update guild");
      const data = await res.json();
      setGuild(data.guild);

      emitEvent("guildUpdate", {
        guildId: data.guild._id,
        token: token,
        action: "update",
      });
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
        `http://localhost:25001/api/guild/${guild._id}/kick/${targetAvatarId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to kick member");
      }

      emitEvent("guildUpdate", {
        guildId: guild._id,
        token: token,
        targetAvatarId: targetAvatarId,
        action: "kick",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to kick member");
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

  const getAvatarId = (
    avatar: string | AvatarData | null | undefined
  ): string | null => {
    if (!avatar) return null;
    if (typeof avatar === "string") return avatar;
    return avatar._id;
  };

  if (!guild) return <p>Guild not found</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center" }}>
        <Shield width={80} fillImage={previewImage || logo} borderColor="black" />
      </div>

      {isLeader && (
        <form
          onSubmit={handleUpdateGuild}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Guild Name"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Guild Description"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button
            type="submit"
            disabled={updating}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "2px solid #bbb",
              background: "#cce5ff",
              cursor: updating ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {updating ? "Updating..." : "Update Guild"}
          </button>
        </form>
      )}

      {guild.members.map((m, index) => {
        const avatarId = getAvatarId(m.avatar);
        const memberName =
          typeof m.avatar === "object" && m.avatar && "userName" in m.avatar
            ? m.avatar.userName
            : "Unknown";

        const canKick =
          isLeader && m.role !== "leader" && avatarId !== avatarData._id;

        return (
          <li
            key={index}
            style={{
              fontSize: 14,
              padding: "6px 0",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {memberName} <strong>({m.role})</strong>
            </span>

            {canKick && avatarId && (
              <button
                onClick={() => handleKickMember(avatarId)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid #d33",
                  background: "#ffe5e5",
                  color: "#a00",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Kick
              </button>
            )}
          </li>
        );
      })}

      {isMember && (
        <button
          onClick={onOpenChat}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "2px solid #bbb",
            background: "#fafafa",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Open Guild Chat
        </button>
      )}

      {isMember && !isLeader && (
        <button
          onClick={handleLeaveGuild}
          disabled={leaving}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "2px solid #bbb",
            background: "#ffe5e5",
            cursor: leaving ? "not-allowed" : "pointer",
            fontWeight: 600,
            color: "#a00",
          }}
        >
          {leaving ? "Leaving..." : "Leave Guild"}
        </button>
      )}

      {isLeader && (
        <button
          onClick={handleDisbandGuild}
          disabled={disbanding}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "2px solid #bbb",
            background: "#ffcccc",
            cursor: disbanding ? "not-allowed" : "pointer",
            fontWeight: 600,
            color: "#900",
          }}
        >
          {disbanding ? "Disbanding..." : "Disband Guild"}
        </button>
      )}
    </div>
  );
}
