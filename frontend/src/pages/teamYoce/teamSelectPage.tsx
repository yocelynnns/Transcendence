import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeamSelectLayout from "./teamSelectLayout";
import type { PlayerPokemon } from "../../types/pokemonTypes";
import type { AvatarData } from "../../types/avatarTypes";
import { useGameSocket } from "../../ws/useGameSocket";

interface TeamSelectPageProps {
  avatarData?: AvatarData | null;
}

const TEAM_SIZE = 3;
const START_TIME = 30;

type RouteState = { battleId?: string; avatarData?: AvatarData } | undefined;

export default function TeamSelectPage({ avatarData: propAvatarData }: TeamSelectPageProps) {
  const navigate = useNavigate();
  const { battleId: paramBattleId } = useParams<{ battleId: string }>();
  const location = useLocation();

  const state = location.state as RouteState;
  const battleId = state?.battleId ?? paramBattleId ?? null;
  const avatarData = state?.avatarData ?? propAvatarData ?? null;

  const [slots, setSlots] = useState<(PlayerPokemon | null)[]>(() =>
    Array.from({ length: TEAM_SIZE }, () => null)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [msg, setMsg] = useState<string | null>(null);

  const [battleReady, setBattleReady] = useState(false);
  const [enemyReady, setEnemyReady] = useState(false);
  const [waitingForEnemy, setWaitingForEnemy] = useState(false);

  const { emitEvent, subscribeEvent } = useGameSocket(() => {});

  // guards to avoid double-fire
  const readySentRef = useRef(false);
  const autoPickRef = useRef(false);

  const flashMsg = useCallback((text: string, ms = 1200) => {
    setMsg(text);
    window.setTimeout(() => setMsg(null), ms);
  }, []);

  const usedIds = useMemo(() => {
    return new Set(slots.filter(Boolean).map((p) => (p as PlayerPokemon)._id));
  }, [slots]);

  const canReady = useMemo(() => slots.every(Boolean) && timeLeft > 0, [slots, timeLeft]);

  const pickPokemon = useCallback(
    (p: PlayerPokemon) => {
      if (waitingForEnemy) return;
      if (timeLeft === 0) return flashMsg("Time's up!");
      if (usedIds.has(p._id)) return flashMsg("Already selected");

      setSlots((prev) => {
        const next = [...prev];
        next[activeSlot] = p;

        const nextEmpty = next.findIndex((x) => x === null);
        if (nextEmpty !== -1) setActiveSlot(nextEmpty);

        return next;
      });
    },
    [activeSlot, flashMsg, timeLeft, usedIds, waitingForEnemy]
  );

  const removeSlot = useCallback((idx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  }, []);

  const sendReady = useCallback(
    (selected: PlayerPokemon[]) => {
      if (!battleId || !avatarData) return;
      if (readySentRef.current) return;

      readySentRef.current = true;

      emitEvent("playerReady", {
        currentBattleId: battleId,
        selectedPokemon: selected.map((p) => p._id),
      });

      setWaitingForEnemy(true);
    },
    [avatarData, battleId, emitEvent]
  );

  const handleReady = useCallback(() => {
    if (!canReady) return flashMsg("Pick 3 Pokémon first!");
    const selected = slots.map((p) => p!) as PlayerPokemon[];
    sendReady(selected);
  }, [canReady, flashMsg, sendReady, slots]);

  const autoPickTeam = useCallback((): PlayerPokemon[] | null => {
    if (!avatarData) return null;

    const inventory = avatarData.pokemonInventory ?? [];
    if (inventory.length === 0) {
      flashMsg("No Pokémon in inventory!");
      return null;
    }

    // keep already selected
    const chosen = slots.filter(Boolean) as PlayerPokemon[];
    const chosenIds = new Set(chosen.map((p) => p._id));

    // candidates not chosen
    const pool = inventory.filter((p) => !chosenIds.has(p._id));

    // shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // fill missing
    const result: PlayerPokemon[] = [...chosen];
    while (result.length < TEAM_SIZE) {
      const next = pool.shift() ?? inventory[Math.floor(Math.random() * inventory.length)];
      // avoid duplicates if inventory small
      if (!result.some((p) => p._id === next._id)) result.push(next);
      if (inventory.length === 1) break;
    }

    return result.slice(0, TEAM_SIZE);
  }, [avatarData, flashMsg, slots]);

  // --- Listen for battle events ---
  useEffect(() => {
    if (!battleId) return;

    const cleanupEnemyReady = subscribeEvent("enemyIsReady", () => {
      setEnemyReady(true);
      setWaitingForEnemy(false);
    });

    const cleanupWaiting = subscribeEvent("waitingForEnemy", () => {
      setWaitingForEnemy(true);
    });

    const cleanupBattleReady = subscribeEvent("battleReady", (data: { battleId: string }) => {
      if (data.battleId === battleId) setBattleReady(true);
    });

    return () => {
      cleanupEnemyReady();
      cleanupWaiting();
      cleanupBattleReady();
    };
  }, [battleId, subscribeEvent]);

  // --- Navigate when battle starts ---
  useEffect(() => {
    if (!battleReady || !battleId) return;

    navigate(`/battle/${battleId}`, {
      state: { battleId, avatarData },
    });
  }, [battleReady, battleId, navigate, avatarData]);

  // --- Countdown timer ---
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // --- Auto pick + auto ready when timer ends ---
  useEffect(() => {
    if (!battleId || !avatarData) return;
    if (timeLeft !== 0) return;
    if (autoPickRef.current) return;
    if (waitingForEnemy || battleReady) return;

    autoPickRef.current = true;

    const team = autoPickTeam();
    if (!team || team.length !== TEAM_SIZE) return;

    setSlots(team);
    setActiveSlot(0);
    flashMsg("Time's up! Auto-selecting team...");

    sendReady(team);
  }, [
    autoPickTeam,
    avatarData,
    battleId,
    battleReady,
    flashMsg,
    sendReady,
    timeLeft,
    waitingForEnemy,
  ]);

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
