import { useEffect, useMemo, useState, useCallback, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import TeamSelectLayout from "../components/teamSelect/teamSelectLayout";
import { AvatarData } from "../types/avatarTypes";
import { useGameSocket } from "../ws/useGameSocket";
import { Battle, BattlePokemon } from "../types/battleTypes";
import { PlayerPokemon } from "../types/pokemonTypes";
import "./../styles/teamSelect.css";

interface TeamSelectPageProps {
  avatarData?: AvatarData | null;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
  refetchBattle: () => Promise<Battle | undefined>;
}

const TEAM_SIZE = 3;

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

  const [battleReady, setBattleReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const { subscribeEvent, playerReadyMatch } = useGameSocket(() => {});

  const usedIds = useMemo(
    () => new Set(slots.filter(Boolean).map((p) => p!._id)),
    [slots]
  );

  const battleId = currentBattle?._id;

  const avatarId = avatarData?._id;

  useEffect(() => {
    const fetchAndCheck = async () => {
     const updatedBattle = await refetchBattle();
      if (updatedBattle?.endedAt) navigate(`/matching`);
      if (!updatedBattle) return;
      const createdAt = new Date(updatedBattle.createdAt).getTime();
        const endTime = createdAt + 35_000;
        const now = Date.now();
        setTimeout(
          () =>
            setTimeLeft(
              Math.max(Math.ceil((endTime - now) / 1000), 0)
            ),
          0
        );
    };

    fetchAndCheck();
  }, [refetchBattle, navigate]);

  useEffect(() => {
    if (!currentBattle || !avatarId) return;

    const isPlayer1 =
      currentBattle.player1._id.toString() === avatarId;

    const me = isPlayer1
      ? currentBattle.pokemon1
      : currentBattle.pokemon2;

    const enemy = isPlayer1
      ? currentBattle.pokemon2
      : currentBattle.pokemon1;

    if (me.length > 0 && enemy.length > 0) {
      navigate(`/battle/${currentBattle._id}`);
      return;
    }

    const myPicked = isPlayer1 ? currentBattle.pokemon1 : currentBattle.pokemon2;

    if (myPicked.length > 0) {
      const mySlots: (PlayerPokemon | null)[] = myPicked.map((b) => ({
          _id: b.pokemonId,
          name: b.name,
          type: b.type,
          attack: b.attack,
          hp: b.maxHp,
          is_shiny: b.is_shiny,
        }));

      while (mySlots.length < TEAM_SIZE) mySlots.push(null);

      setTimeout(() => {
        setSlots(mySlots);
        setSaving(true);
      }, 0);
    }

    if (currentBattle.createdAt) {
      const createdAt = new Date(currentBattle.createdAt).getTime();
      const endTime = createdAt + 35_000;
      const now = Date.now();
      setTimeout(
        () =>
          setTimeLeft(
            Math.max(Math.ceil((endTime - now) / 1000), 0)
          ),
        0
      );
    }
  }, [currentBattle, avatarId, navigate, playerReadyMatch]);

  const handleReady = useCallback(
    (currentSlots = slots) => {
      if (!currentSlots.every(Boolean)) return;
      if (!currentBattle || !avatarData) return;

      const selectedBattlePokemon: BattlePokemon[] =
        currentSlots.map((p) => ({
          pokemonId: p!._id,
          name: p!.name,
          type: p!.type as "grass" | "water" | "fire" | "normal",
          attack: p!.attack,
          maxHp: p!.hp,
          currentHp: p!.hp,
          isDead: false,
          is_shiny: p!.is_shiny ?? false,
        }));

      playerReadyMatch(
        currentBattle,
        selectedBattlePokemon,
      );
      setSaving(true);
    },
    [avatarData, slots, playerReadyMatch, currentBattle]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s > 1) return s - 1;

        if (s === 1 && avatarData) {
          const available =
            avatarData.pokemonInventory.filter(
              (p) => !slots.some((s) => s?._id === p._id)
            );

          const nextSlots = [...slots];

          for (let i = 0; i < nextSlots.length; i++) {
            if (!nextSlots[i] && available.length > 0) {
              const idx = Math.floor(
                Math.random() * available.length
              );
              nextSlots[i] = available.splice(idx, 1)[0];
            }
          }
          setSlots(nextSlots);

          if (nextSlots.every(Boolean)) {
            handleReady(nextSlots);
          }
        }
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [avatarData, slots, handleReady]);

  const pickPokemon = (p: PlayerPokemon) => {
    if (saving) return;
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
    if (saving) return;
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  };

  useEffect(() => {
    if (!battleId) return;

    const offBattleReady = subscribeEvent(
      "battleReady",
      (data: { battleId: string }) => {
        if (data.battleId === battleId) {
          setBattleReady(true);
        }
      }
    );

    const offBattleError = subscribeEvent(
      "TeamUpError",
      (data: { message: string }) => {
        console.error("Battle error:", data.message);
        alert(`enemy has disconnected from the battle!`);
        setCurrentBattle(null);
        navigate("/", { replace: true });
      }
    );

    return () => {
      offBattleReady();
      offBattleError();
    };
  }, [battleId, subscribeEvent, navigate, setCurrentBattle]);

  useEffect(() => {
    if (battleReady && battleId) {
      navigate(`/battle/${battleId}`);
    }
  }, [battleReady, battleId, navigate, avatarData]);

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
      playerName={avatarData.userName}
      avatarSrc={avatarData.avatar}
      canReady={slots.every(Boolean) && timeLeft > 0}
      onReady={() => handleReady()}
      msg={null}
      saving={saving}
    />
  );
}
