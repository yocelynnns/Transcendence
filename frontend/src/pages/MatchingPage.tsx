// src/pages/matchingpage.tsx
import { useEffect, useState, useMemo, Dispatch, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { AvatarData } from "../types/avatarTypes";
import { ASSETS } from "../assets";
import { useGameSocket } from "../ws/useGameSocket";
import type { Battle } from "../types/battleTypes";

interface MatchMakingProps {
  avatarData: AvatarData | null | undefined;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
}

export default function Matching({
  avatarData,
  currentBattle,
  setCurrentBattle,
}: MatchMakingProps) {
  const navigate = useNavigate();
  const defaultAvatar = ASSETS.AVATAR.CLEFFA;
  const { joinMatching, subscribeEvent, emitEvent } = useGameSocket(() => {});
  const currentId = avatarData?._id;

  const [countdown, setCountdown] = useState(5);
  const joinRef = useRef<boolean>(false);

  useEffect(() => {
    if (!avatarData) return;
    const inventory = avatarData.pokemonInventory ?? [];
    if (inventory.length < 3) {
      alert("You need at least 3 Pokemon to enter matchmaking.");
      navigate("/", { replace: true });
    }
  }, [avatarData, navigate]);

  const opponentAvatar = useMemo(() => {
    if (!currentBattle || !currentId) return null;
    return currentBattle.player1._id === currentId
      ? currentBattle.player2
      : currentBattle.player1;
  }, [currentBattle, currentId]);

  const matchStarted = Boolean(currentBattle && opponentAvatar);
  const waiting = !matchStarted;

  useEffect(() => {
    if (!currentBattle || !opponentAvatar) return;

    const endTime =
      new Date(currentBattle.createdAt ?? Date.now()).getTime() + 5_000;

    const updateCountdown = () => {
      const secondsLeft = Math.max(Math.ceil((endTime - Date.now()) / 1000), 0);
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        navigate(`/teamSelect/${currentBattle._id}`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 200);
    return () => clearInterval(timer);
  }, [currentBattle, opponentAvatar, navigate]);

  useEffect(() => {
    if (!currentId || currentBattle) return;

    if (!joinRef.current) {
      joinMatching();
      joinRef.current = true;
    }

    const cleanupFound = subscribeEvent(
      "opponentFound",
      ({ battle }: { battle: Battle }) => {
        setCurrentBattle(battle);
        setCountdown(5);
      }
    );

    const cleanupError = subscribeEvent(
      "matchError",
      (data: { message: string }) => alert(data.message)
    );

    return () => {
      cleanupFound();
      cleanupError();
    };
  }, [currentId, currentBattle, joinMatching, subscribeEvent, setCurrentBattle]);

  const handleReturn = () => {
    if (currentId) emitEvent("leaveMatching", currentId);
    navigate("/", { replace: true });
  };

  if (!avatarData) {
    return (
      <div className="w-screen h-screen grid place-items-center bg-black text-white pixelify-sans text-lg">
        Loading player data...
      </div>
    );
  }

  const title = matchStarted ? "MATCH FOUND!" : "WAITING FOR OPPONENT...";

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center text-center px-4 pixelify-sans"
      style={{
        background: "linear-gradient(to bottom, #a9c0dc 0%, #7fa3c7 100%)",
      }}
    >
      {/* TITLE PANEL */}
      <div className="mb-6 px-8 py-4 bg-[#5f78a8] border-4 border-black shadow-[6px_6px_0px_#2b3d55]">
        <h1 className="text-[24px] sm:text-[28px] text-white tracking-wide">
          {title}
        </h1>
      </div>

      {/* COUNTDOWN */}
      {matchStarted && (
        <div className="mb-6 px-6 py-3 bg-[#5f78a8] border-4 border-black shadow-[6px_6px_0px_#2b3d55] text-[16px] text-white">
          Match starts in {countdown} second{countdown !== 1 ? "s" : ""}
        </div>
      )}

      {/* AVATARS */}
      <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14">
        <AvatarCard
          avatar={avatarData.avatar || defaultAvatar}
          name={avatarData.userName}
        />

        <div className="hidden sm:block text-[28px] font-bold text-white drop-shadow-[2px_2px_0_#2b3d55]">
          VS
        </div>

        <AvatarCard
          avatar={opponentAvatar?.avatar}
          name={waiting ? "Searching..." : opponentAvatar?.userName || ""}
          loading={waiting}
        />
      </div>

      {/* RETURN BUTTON */}
      <button
        onClick={handleReturn}
        className="
          mt-10
          px-8 py-3
          bg-[#5f78a8]
          border-4 border-black
          text-white
          text-[16px]
          shadow-[6px_6px_0px_#2b3d55]
          active:translate-x-0.5
          active:translate-y-0.5
          active:shadow-[3px_3px_0px_#2b3d55]
        "
      >
        ← Return
      </button>
    </div>
  );
}

function AvatarCard({
  avatar,
  name,
  loading = false,
}: {
  avatar?: string;
  name: string;
  loading?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className="
          w-30 h-30
          sm:w-35 sm:h-35
          border-4 border-black
          bg-[#5f78a8]
          shadow-[6px_6px_0px_#2b3d55]
          flex items-center justify-center
          overflow-hidden
        "
        style={{
          backgroundImage: !loading && avatar ? `url(${avatar})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      >
        {loading && (
          <img
            src="/assets/matching/loading.gif"
            alt="Searching..."
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
        )}
      </div>

      <div className="mt-3 text-white text-[15px] tracking-wide drop-shadow-[2px_2px_0_#2b3d55]">
        {name}
      </div>
    </div>
  );
}
