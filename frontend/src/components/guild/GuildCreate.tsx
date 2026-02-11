import { useState } from "react";
import Shield from "./GuildShield";
import { useGameSocket } from "../../ws/useGameSocket";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";

interface GuildCreateProps {
  token: string | null; 
  avatarData: AvatarData;
  onBack: () => void;
}

export default function GuildCreate({
  token,
  avatarData,
  onBack,
}: GuildCreateProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { emitEvent } = useGameSocket(() => {});

  const queryClient = useQueryClient();

  const isDisabled = loading;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (isDisabled) return;
    if (!name.trim()) {
      setError("Guild name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5001/api/guild", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create guild");

      emitEvent("guildUpdate", { guildId: data._id, action:"update" });

      queryClient.invalidateQueries({ queryKey: ["avatar", avatarData._id], exact: true });
      onBack();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.log("Guild creation error:", err);
      } else {
        setError("Failed to create guild");
        console.log("Guild creation unknown error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Guild image preview */}
      <div style={{ textAlign: "center" }}>
        <Shield width={130} fillImage={image || ""} borderColor="black" />
      </div>

      {/* Upload button */}
      <div style={{ textAlign: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ cursor: "pointer" }}
          disabled={isDisabled}
        />
      </div>

      {/* Guild name */}
      <input
        placeholder="Guild Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 10, borderRadius: 8, border: "2px solid #bbb", fontSize: 16 }}
        disabled={isDisabled}
      />

      {/* Guild description */}
      <textarea
        placeholder="Guild Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        style={{ padding: 10, borderRadius: 8, border: "2px solid #bbb", fontSize: 14, resize: "vertical" }}
        disabled={isDisabled}
      />

      {/* Error message */}
      {error && <div style={{ color: "red", fontWeight: 600 }}>{error}</div>}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleCreate}
          disabled={isDisabled}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "2px solid #bbb",
            background: isDisabled ? "#eee" : "#fafafa",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {
            avatarData.guild
            ? "Already in a Guild"
            : loading
            ? "Creating..."
            : "Create"}
        </button>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "2px solid #bbb",
            background: "#fafafa",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
