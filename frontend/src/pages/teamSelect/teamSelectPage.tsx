import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelectLayout from "./teamSelectLayout";
import type { Pokemon } from "./types";
import { AvatarData } from "../../components/AvatarProfile";
import { useGameSocket } from "../../ws/useGameSocket";

interface TeamSelectPageProps {
  avatarData: AvatarData | null;
}

const TEAM_SIZE = 3;
const PICK_TIME_SECONDS = 30;

export default function TeamSelectPage({ avatarData }: TeamSelectPageProps) {
  const navigate = useNavigate();

  const [slots, setSlots] = useState<(Pokemon | null)[]>(Array.from({ length: TEAM_SIZE }, () => null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [msg, setMsg] = useState<string | null>(null);
  const { battleId } = useParams<{ battleId: string }>();

  const { emitEvent, battleReady, enemyReady, waitingForEnemy } = useGameSocket(() => {});

  const usedIds = useMemo(
    () => new Set(slots.filter(Boolean).map((p) => (p as Pokemon)._id)),
    [slots]
  );

  const pickPokemon = (p: Pokemon) => {
    if (timeLeft === 0) return flashMsg("Time's up!");
    if (usedIds.has(p._id)) return flashMsg("Already selected");

    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = p;

      const nextEmpty = next.findIndex((x) => x === null);
      if (nextEmpty !== -1) setActiveSlot(nextEmpty);

      return next;
    });
  };

  const removeSlot = (idx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  };

  const canReady = slots.every(Boolean) && timeLeft > 0;

  const handleReady = () => {
    if (!canReady) return flashMsg("Pick 3 Pokémon first!");

    const selectedIds = slots.map((p) => p!._id);
    emitEvent("playerReady", {
      battleId,
      playerId: avatarData.avatarId,
      selectedPokemon: selectedIds,
    });
  };

  useEffect(() => {
    if (battleReady && battleId) {
      navigate(`/battle/${battleId}`);
    }
  }, [battleReady, battleId, navigate]);

  useEffect(() => {
    setTimeLeft(PICK_TIME_SECONDS);
    const t = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  function flashMsg(text: string, ms = 1200) {
    setMsg(text);
    window.setTimeout(() => setMsg(null), ms);
  }

  if (!avatarData) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e2f",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 20,
        }}
      >
        Loading player data...
      </div>
    );
  }

  return (
    <TeamSelectLayout
      inventory={avatarData.pokemonInventory}
      usedIds={usedIds}
      onPick={pickPokemon}
      slots={slots}
      activeSlot={activeSlot}
      setActiveSlot={setActiveSlot}
      onRemoveSlot={removeSlot}
      timeLeft={timeLeft}
      msg={msg}
      playerName={avatarData.userName}
      avatarSrc={avatarData.avatar}
      canReady={canReady}
      saving={false}
      onReady={handleReady}
      enemyReady={enemyReady}
      waitingForEnemy={waitingForEnemy}
    />
  );
}
