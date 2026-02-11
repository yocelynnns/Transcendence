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

  // inventory guard
  useEffect(() => {
    if (!avatarData) return;
    const inventory = avatarData.pokemonInventory ?? [];
    if (inventory.length < 3) {
      alert("You need at least 3 Pokemon to enter matchmaking.");
      navigate("/", { replace: true });
    }
  }, [avatarData, navigate]);

  // opponent logic
  const opponentAvatar = useMemo(() => {
    if (!currentBattle || !currentId) return null;
    return currentBattle.player1._id === currentId
      ? currentBattle.player2
      : currentBattle.player1;
  }, [currentBattle, currentId]);

  const matchStarted = Boolean(currentBattle && opponentAvatar);
  const waiting = !matchStarted;

  // countdown -> team select
  useEffect(() => {
    if (!currentBattle || !opponentAvatar) return;

    const endTime =
      new Date(currentBattle.createdAt ?? Date.now()).getTime() + 5_000;

    const updateCountdown = () => {
      const secondsLeft = Math.max(
        Math.ceil((endTime - Date.now()) / 1000),
        0
      );

      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        navigate(`/teamSelect/${currentBattle._id}`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 200);

    return () => clearInterval(timer);
  }, [currentBattle, opponentAvatar, navigate]);

  // join + events
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
      (data: { message: string }) => {
        alert(data.message);
      }
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
      <div className="w-screen h-screen grid place-items-center bg-[#1e1e2f] text-white font-mono text-lg">
        Loading player data...
      </div>
    );
  }

  const title = matchStarted ? "Match Found!" : "Waiting for Opponent...";

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#1e1e2f] to-[#2a2a3f] text-center font-mono text-[#999] px-4">
      <h1 className="text-[28px] sm:text-[32px] mb-3 text-white drop-shadow-[0_0_10px_#888]">
        {title}
      </h1>

      {matchStarted && (
        <div className="text-[16px] sm:text-[18px] mb-7 text-[#a2d5f2] drop-shadow-[0_0_6px_#000]">
          Match starts in {countdown} second{countdown !== 1 ? "s" : ""}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <AvatarCard
          avatar={avatarData.avatar || defaultAvatar}
          name={avatarData.userName}
          color="border-[#a2d5f2] shadow-[0_0_15px_#a2d5f2]"
        />

        <div className="hidden sm:block text-[34px] font-bold text-[#888] drop-shadow-[0_0_15px_#666]">
          VS
        </div>

        <AvatarCard
          avatar={opponentAvatar?.avatar}
          name={waiting ? "Searching..." : opponentAvatar?.userName || ""}
          color="border-[#ff5555] shadow-[0_0_15px_#ff5555]"
          loading={waiting}
        />
      </div>

      <button
        onClick={handleReturn}
        className="mt-10 px-5 py-3 rounded-[10px] border-2 border-black bg-white text-black font-semibold hover:brightness-105 active:scale-[0.99]"
      >
        Return
      </button>
    </div>
  );
}

function AvatarCard({
  avatar,
  name,
  color,
  loading = false,
}: {
  avatar?: string;
  name: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={[
          "w-32.5 h-32.5 sm:w-37.5 sm:h-37.5",
          "rounded-2xl border-4 bg-[#444] overflow-hidden",
          "grid place-items-center",
          color,
        ].join(" ")}
        style={{
          backgroundImage: !loading && avatar ? `url(${avatar})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {loading && (
          <img
            src="/assets/matching/loading.gif"
            alt="Searching..."
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="mt-3 text-white">{name}</div>
    </div>
  );
}
