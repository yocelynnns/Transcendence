import { useEffect, useMemo, useState, useCallback, Dispatch, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeamSelectLayout from "../components/teamSelect/teamSelectLayout";
import { AvatarData } from "../types/avatarTypes";
import { useGameSocket } from "../ws/useGameSocket";
import { Battle, BattlePokemon } from "../types/battleTypes";
import { PlayerPokemon } from "../types/pokemonTypes";
import "./../styles/teamSelect.css";
import EnemyDisconnectedOverlay from "../components/Battle/enemyDisconnect";

interface TeamSelectPageProps {
  avatarData?: AvatarData | null;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
  refetchBattle: (avatarIdParam?: string, battleIdParam?: string) => Promise<Battle | undefined>;
}

const TEAM_SIZE = 3;

type PlayerRef =
  | string
  | {
      _id: string | { toString(): string };
    };

// Helper to get player ID from either string or populated object
const getPlayerId = (player: PlayerRef): string => {
  if (typeof player === 'string') return player;
  if (player?._id) return player._id.toString();
  return '';
};

export default function TeamSelectPage({
  avatarData,
  currentBattle,
  setCurrentBattle,
  refetchBattle,
}: TeamSelectPageProps) {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<(PlayerPokemon | null)[]>(
    Array.from({ length: TEAM_SIZE }, () => null)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [saving, setSaving] = useState(false);
  const [enemyDisconnected, setEnemyDisconnected] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const { emitEvent, subscribeEvent, playerReadyMatch } = useGameSocket(() => {});

  const usedIds = useMemo(
    () => new Set(slots.filter(Boolean).map((p) => p!._id)),
    [slots]
  );

  const activeBattleRef = useRef(currentBattle);
  const avatarInventoryRef = useRef(avatarData?.pokemonInventory);

  const battleId = currentBattle?._id;
  const avatarId = avatarData?._id;

  useEffect(() => {
    if (!activeBattleRef.current || !avatarInventoryRef.current) return;

    const updatedBattle = activeBattleRef.current;
    const avatarInventory = avatarInventoryRef.current;

    if (updatedBattle.endedAt) {
        setCurrentBattle(null);
        navigate("/matching", { replace: true });
        return;
    }

    if (updatedBattle.pokemon1.length > 0 && updatedBattle.pokemon2.length > 0)
    {
      navigate(`/battle/${battleId}`);
      return;
    }

    const myTeam =
      getPlayerId(updatedBattle.player1) === avatarId
        ? updatedBattle.pokemon1
        : updatedBattle.pokemon2;

    if (myTeam && myTeam.length > 0) {
      const mappedSlots: (PlayerPokemon | null)[] = Array.from(
        { length: TEAM_SIZE },
        (_, i) => {
          const battlePokemon = myTeam[i];
          if (!battlePokemon) return null;

          return avatarInventory.find(
            (p) => p._id === battlePokemon.pokemonId
          ) ?? null;
        }
      );
      setSlots(mappedSlots);
      setSaving(true);
    }
  }, [
    activeBattleRef,
    avatarInventoryRef,
    avatarId,
    battleId,
    navigate,
    setCurrentBattle,
  ]);

  const handleReady = useCallback(() => {
    if (!slots.every(Boolean)) return;
    if (!activeBattleRef.current) return;

    const updatedBattle = activeBattleRef.current;
    
    const selectedBattlePokemon: BattlePokemon[] = slots.map((p) => ({
      pokemonId: p!._id,
      name: p!.name,
      type: p!.type as "grass" | "water" | "fire" | "normal",
      attack: p!.attack,
      maxHp: p!.hp,
      currentHp: p!.hp,
      isDead: false,
      is_shiny: p!.is_shiny ?? false,
    }));
    
    playerReadyMatch(updatedBattle, selectedBattlePokemon);
    setSaving(true);
  }, [slots, playerReadyMatch]);

  useEffect(() => {
    if (!activeBattleRef.current || !avatarInventoryRef.current) return;

    const avatarInventory = avatarInventoryRef.current;
    const updatedBattle = activeBattleRef.current;

    const deadline = new Date(updatedBattle.createdAt).getTime() + 35_000;
    let filled = false;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
      setTimeLeft(secondsLeft);

      if (secondsLeft === 0 && !filled) {
        filled = true;
        setSlots((prevSlots) => {
          const nextSlots = [...prevSlots];
          const available = avatarInventory.filter(
            (p) => !nextSlots.some((s) => s?._id === p._id)
          );

          for (let i = 0; i < nextSlots.length; i++) {
            if (!nextSlots[i] && available.length > 0) {
              const idx = Math.floor(Math.random() * available.length);
              nextSlots[i] = available.splice(idx, 1)[0];
            }
          }

          return nextSlots;
        });
        handleReady();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [handleReady]);

  const pickPokemon = (p: PlayerPokemon) => {
    if (saving || battleEnded) return;
    if (timeLeft === 0) return;
    if (usedIds.has(p._id)) return;

    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = p;
      const nextEmpty = next.findIndex((x) => x === null);
      if (nextEmpty !== -1) setActiveSlot(nextEmpty);
      return next;
    });
  };

  const removeSlot = (idx: number) => {
    if (saving || battleEnded) return;
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  };

  useEffect(() => {
    if (!battleId || !avatarId) return;

    const handleBattleLatestAndNavigate = async () => {
      try {
        await refetchBattle(avatarId, battleId);
        navigate(`/battle/${battleId}`);
      } catch (err) {
        console.error("Failed to update battle and navigate:", err);
      }
    };

    const offBattleReady = subscribeEvent(
      "battleReady",
      (data: { battleId: string }) => {
        if (data.battleId === battleId) {
          handleBattleLatestAndNavigate();
        }
      }
    );

    const offBattleError = subscribeEvent(
      "TeamUpError",
      (data: { message: string }) => {
        console.log("Battle error:", data.message);
        setEnemyDisconnected(true);
        setBattleEnded(true);
        setCurrentBattle(null);
        setTimeLeft(0);
      }
    );

    return () => {
      offBattleReady();
      offBattleError();
    };
  }, [battleId, subscribeEvent, navigate, setCurrentBattle, refetchBattle, avatarId]);


  if (!avatarData) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#1e1e2f] text-white font-mono text-[20px]">
        Loading player data...
      </div>
    );
  }

  // waiting for enemy check
 return (
    <div className="relative w-screen h-screen">
      {/* Fullscreen Enemy Disconnected Overlay */}
        {enemyDisconnected && (
          <EnemyDisconnectedOverlay
            onHome={() => {
              emitEvent("playerReturnedHome", { avatarId: avatarId }); 
              setCurrentBattle(null);
              navigate("/");
            }}
            onMatching={() => {
              emitEvent("playerReturnedHome", { avatarId: avatarId }); 
              setCurrentBattle(null);
              navigate("/matching");
            }}
          />
        )}

      {/* Team Select Layout */}
      <TeamSelectLayout
        inventory={avatarData.pokemonInventory}
        usedIds={usedIds}
        onPick={pickPokemon}
        slots={slots}
        activeSlot={activeSlot}
        setActiveSlot={setActiveSlot}
        onRemoveSlot={removeSlot}
        timeLeft={timeLeft}
        playerName={avatarData.userName}
        avatarSrc={avatarData.avatar}
        canReady={slots.every(Boolean) && timeLeft > 0 && !battleEnded}
        onReady={handleReady}
        msg={null}
        saving={saving}
      />
    </div>
  );
}