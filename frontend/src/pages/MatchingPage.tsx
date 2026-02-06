import { useEffect, useState, useMemo, Dispatch, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarData } from "../types/avatarTypes";
import { ASSETS } from "../assets";
import { useGameSocket } from "../ws/useGameSocket";
import { Battle } from "../types/battleTypes";

interface MatchMakingProps {
  avatarData: AvatarData | null;
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
  const { joinMatching, subscribeEvent } = useGameSocket(() => {});
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

  useEffect(() => {
    if (!currentId || currentBattle) return;

    if (joinRef.current == false)
    {
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

  if (!avatarData) {
    return (
      <div className="fullscreen-center" style={{ color: "#fff" }}>
        Loading player data...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 100%)",
        fontFamily: "monospace",
        color: "#999",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 12,
          color: "#fff",
          textShadow: "0 0 10px #888",
        }}
      >
        {matchStarted ? "Match Found!" : "Waiting for Opponent..."}
      </h1>

      {matchStarted && (
        <div
          style={{
            fontSize: 18,
            marginBottom: 30,
            color: "#a2d5f2",
            textShadow: "0 0 6px #000",
          }}
        >
          Match starts in {countdown} second{countdown !== 1 ? "s" : ""}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <AvatarCard
          avatar={avatarData.avatar || defaultAvatar}
          name={avatarData.userName}
          color="#a2d5f2"
        />

        <div
          style={{
            fontSize: 36,
            fontWeight: "bold",
            color: "#888",
            textShadow: "0 0 15px #666",
          }}
        >
          VS
        </div>

        <AvatarCard
          avatar={opponentAvatar?.avatar}
          name={waiting ? "Searching..." : opponentAvatar?.userName || ""}
          color="#ff5555"
          loading={waiting}
        />
      </div>
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
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: 16,
          border: `4px solid ${color}`,
          boxShadow: `0 0 15px ${color}`,
          background: avatar ? `url(${avatar}) center/cover` : "#444",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading && (
          <img
            src="/assets/matching/loading.gif"
            alt="Searching..."
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
      <div style={{ marginTop: 12, color: "#fff" }}>{name}</div>
    </div>
  );
}
