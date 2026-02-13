import { useState, useRef } from "react";
import Shield from "./GuildShield";
import { useGameSocket } from "../../ws/useGameSocket";
import type { AvatarData } from "../../types/avatarTypes";
import { useQueryClient } from "@tanstack/react-query";
import PixelButton from "../elements/PixelButton";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch("https://localhost/api/guild", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create guild");

      emitEvent("guildUpdate", { guildId: data._id, action: "update" });
      queryClient.invalidateQueries({
        queryKey: ["avatar", avatarData._id],
        exact: true,
      });

      onBack();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create guild");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Shield preview */}
      <div className="flex justify-center">
        <Shield width={130} fillImage={image || ""} borderColor="black" />
      </div>

      {/* Browse image (pixel button) */}
      <div className="relative w-full h-[52px]">
        <PixelButton
          colorA="#fff1ef"
          colorB="#ab7b81"
          colorText="#000"
          textSize="1rem"
          height={52}
          width="100%"
        />
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 text-sm font-semibold"
        >
          Browse
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Guild name */}
      <div className="relative w-full h-[52px]">
        <PixelButton
          colorA="#fff1ef"
          colorB="#ab7b81"
          height={52}
          colorText="#000"
          textSize="1rem"
          width="100%"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guild Name"
          disabled={isDisabled}
          className="
            absolute inset-0
            bg-transparent
            px-4
            text-sm
            outline-none
            font-mono
            font-semibold
          "
        />
      </div>

      {/* Guild description */}
      <div className="relative w-full h-[120px]">
        <PixelButton
          colorA="#fff1ef"
          colorB="#ab7b81"
          height={120}
          colorText="#000"
          textSize="1rem"
          width="100%"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Guild Description"
          disabled={isDisabled}
          className="
            absolute inset-0
            bg-transparent
            px-4 py-3
            text-sm
            resize-none
            outline-none
            font-mono
          "
        />
      </div>

      {/* Error */}
      {error && <div className="text-red-600 font-bold">{error}</div>}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">

        {/* Create */}
        <div className="relative flex-1 h-[52px]">
          <PixelButton
            colorA="#6f8f63"
            colorB="#4f6b4a"
            height={52}
            colorText="#000"
            textSize="1rem"
            width="100%"
          />
          <button
            onClick={handleCreate}
            disabled={isDisabled || !!avatarData.guild}
            className="absolute inset-0 text-xl text-[#ffffff]"
          >
            {avatarData.guild
              ? "Already in Guild"
              : loading
              ? "Creating..."
              : "Create"}
          </button>
        </div>

        {/* Cancel */}
        <div className="relative flex-1 h-[52px]">
          <PixelButton
            colorA="#de4040"
            colorB="#9d2f2f"
            height={52}
            colorText="#000"
            textSize="1rem"
            width="100%"
          />
          <button
            onClick={onBack}
            className="absolute inset-0 text-xl text-[#ffffff]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
