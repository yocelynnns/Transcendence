import { useEffect, useMemo, useState, useCallback, Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelectLayout from "../components/teamSelect/teamSelectLayout";
import { AvatarData } from "../types/avatarTypes";
import { useGameSocket } from "../ws/useGameSocket";
import { Battle, BattlePokemon } from "../types/battleTypes";
import { PlayerPokemon } from "../types/pokemonTypes";
import { useLocation } from "react-router-dom";
import "./../styles/teamSelect.css";

interface TeamSelectPageProps {
  avatarData?: AvatarData | null;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
  refetchBattle: () => Promise<Battle | undefined>;
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
  const location = useLocation();
  const { battleId: urlBattleId } = useParams(); // Get battleId from URL
  
  // Get battle from navigation state or props
  const navBattle = location.state?.battle;
  
  // CRITICAL: Only use navBattle if its _id matches the URL battleId
  // This prevents using stale battle data from navigation state
  const activeBattle = useMemo(() => {
    if (navBattle && navBattle._id === urlBattleId) {
      return navBattle as Battle;
    }
    if (currentBattle && currentBattle._id === urlBattleId) {
      return currentBattle as Battle;
    }
    return null;
  }, [navBattle, currentBattle, urlBattleId]);

  // Sync to parent state if we have nav state but no currentBattle
  useEffect(() => {
    if (navBattle && navBattle._id === urlBattleId && !currentBattle) {
      setCurrentBattle(navBattle);
    }
  }, [navBattle, currentBattle, setCurrentBattle, urlBattleId]);

  // State declarations
  const [slots, setSlots] = useState<(PlayerPokemon | null)[]>(
    Array.from({ length: TEAM_SIZE }, () => null)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [battleReady, setBattleReady] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for battle result acknowledgment
  const [battleEnded, setBattleEnded] = useState(false);
  const [playerWon, setPlayerWon] = useState<boolean | null>(null);
  const [endReason, setEndReason] = useState<string>("");

  const { subscribeEvent, playerReadyMatch, emitEvent } = useGameSocket(() => {});

  const avatarId = avatarData?._id ?? null;

  const battleId = activeBattle?._id || urlBattleId;
  const avatarId = avatarData?._id;

  // CRITICAL FIX: Reset all states immediately when URL battleId changes
  useEffect(() => {
    if (!urlBattleId) return;
    
    console.log(`🔄 New battle URL detected: ${urlBattleId}, resetting all states`);
    
    // Reset all states immediately
    setSlots(Array.from({ length: TEAM_SIZE }, () => null));
    setActiveSlot(0);
    setTimeLeft(30);
    setBattleReady(false);
    setSaving(false);
    setBattleEnded(false);
    setPlayerWon(null);
    setEndReason("");
  }, [urlBattleId]);

  // Listen for battleEnded event (from timeout resolution)
  useEffect(() => {
    if (!battleId || !avatarId) return;

    const offBattleEnded = subscribeEvent(
      "battleEnded",
      (data: { 
        battleId: string; 
        silent?: boolean; 
        winner?: string; 
        isPlayer1?: boolean;
        reason?: string;
      }) => {
        // Only process if this event is for our current battle
        if (data.battleId !== battleId) {
          console.log(`Ignoring battleEnded for ${data.battleId}, current is ${battleId}`);
          return;
        }
        
        // If silent mode (loser disconnected), immediately go home without UI
        if (data.silent) {
          console.log("Silent battle end - redirecting home");
          setCurrentBattle(null);
          navigate("/", { replace: true });
          return;
        }
        
        // Normal battle end - show result UI
        console.log("Normal battle end - showing result UI");
        setBattleEnded(true);
        setSaving(false);
        
        // Determine if current player won
        const isPlayer1 = data.isPlayer1 ?? (activeBattle ? getPlayerId(activeBattle.player1) === avatarId : false);
        
        let won: boolean | null = null;
        if (data.winner === "player1") {
          won = isPlayer1;
        } else if (data.winner === "player2") {
          won = !isPlayer1;
        } else {
          won = null; // draw
        }
        
        setPlayerWon(won);
        setEndReason(data.reason || "Battle ended");
        
        // Clear local timer since battle is over
        setTimeLeft(0);
      }
    );

    return () => {
      offBattleEnded();
    };
  }, [battleId, subscribeEvent, avatarId, setCurrentBattle, navigate, activeBattle]);

  // Listen for battle state updates via updateBattleState
  useEffect(() => {
    if (!battleId) return;

    const offBattleState = subscribeEvent(
      "updateBattleState",
      (data: Battle) => {
        // Only process if this update is for our current battle
        if (data._id !== battleId) {
          console.log(`Ignoring updateBattleState for ${data._id}, current is ${battleId}`);
          return;
        }
        
        console.log(`Received updateBattleState for battle ${data._id}, endedAt: ${data.endedAt}`);
        
        // Update current battle state
        setCurrentBattle(data);
        
        // Check if battle just ended
        if (data.endedAt && !battleEnded) {
          console.log(`Battle ${data._id} has ended, showing result`);
          setBattleEnded(true);
          setSaving(false);
          
          // Determine if current player won
          const player1Id = getPlayerId(data.player1);
          const isPlayer1 = player1Id === avatarId;
          
          let won: boolean | null = null;
          if (data.winner === "player1") {
            won = isPlayer1;
          } else if (data.winner === "player2") {
            won = !isPlayer1;
          } else {
            won = null; // draw
          }
          
          setPlayerWon(won);
          setEndReason(data.winnerReason || "Battle ended");
          
          // Clear local timer since battle is over
          setTimeLeft(0);
        }
      }
    );

    return () => {
      offBattleState();
    };
  }, [battleId, subscribeEvent, avatarId, setCurrentBattle, battleEnded]);

  // Fetch battle data on mount and check if already ended
  useEffect(() => {
    if (!urlBattleId) return;
    
    const fetchAndCheck = async () => {
      console.log(`Fetching battle data for ${urlBattleId}`);
      const updatedBattle = await refetchBattle();
      
      if (!updatedBattle) {
        console.log(`No battle found for ${urlBattleId}`);
        return;
      }
      
      console.log(`Fetched battle ${updatedBattle._id}, endedAt: ${updatedBattle.endedAt}`);
      
      // Only process if this is the battle we're currently viewing
      if (updatedBattle._id !== urlBattleId) {
        console.log(`Battle ID mismatch: fetched ${updatedBattle._id}, expected ${urlBattleId}`);
        return;
      }
      
      if (updatedBattle.endedAt) {
        // Battle already ended - show result
        console.log(`Battle ${urlBattleId} already ended, showing result`);
        setCurrentBattle(updatedBattle);
        setBattleEnded(true);
        
        const player1Id = getPlayerId(updatedBattle.player1);
        const isPlayer1 = player1Id === avatarId;
        
        if (updatedBattle.winner === "player1") {
          setPlayerWon(isPlayer1);
        } else if (updatedBattle.winner === "player2") {
          setPlayerWon(!isPlayer1);
        } else {
          setPlayerWon(null);
        }
        setEndReason(updatedBattle.winnerReason || "Battle ended");
        return;
      }
      
      // Battle is active, set timer
      const createdAt = new Date(updatedBattle.createdAt).getTime();
      const endTime = createdAt + 35_000;
      const now = Date.now();
      const remainingTime = Math.max(Math.ceil((endTime - now) / 1000), 0);
      console.log(`Setting timer to ${remainingTime}s`);
      setTimeLeft(remainingTime);
    };

    fetchAndCheck();
  }, [refetchBattle, urlBattleId, setCurrentBattle, avatarId]);

  // Check activeBattle data and initialize slots if needed
  useEffect(() => {
    if (!activeBattle || !avatarId) return;

    console.log(`Processing activeBattle ${activeBattle._id}, endedAt: ${activeBattle.endedAt}`);

    // Handle both populated objects and string IDs
    const player1Id = getPlayerId(activeBattle.player1);
    const isPlayer1 = player1Id === avatarId;

    // If battle ended, show result (should be caught by fetch effect, but double-check)
    if (activeBattle.endedAt) {
      console.log(`Active battle ${activeBattle._id} has endedAt set`);
      // Only set if not already set to avoid loops
      if (!battleEnded) {
        setBattleEnded(true);
      }
      return;
    }

    const me = isPlayer1 ? activeBattle.pokemon1 : activeBattle.pokemon2;
    const enemy = isPlayer1 ? activeBattle.pokemon2 : activeBattle.pokemon1;

    // If both have picked, go to battle page
    if (me.length > 0 && enemy.length > 0) {
      console.log(`Both players ready, navigating to battle`);
      navigate(`/battle/${activeBattle._id}`);
      return;
    }

    // If I already picked, restore my slots
    if (me.length > 0) {
      console.log(`Restoring my picked pokemon`);
      const mySlots: (PlayerPokemon | null)[] = me.map((b) => ({
          _id: b.pokemonId,
          name: b.name,
          type: b.type,
          attack: b.attack,
          hp: b.maxHp,
          is_shiny: b.is_shiny,
        }));

      while (mySlots.length < TEAM_SIZE) mySlots.push(null);
      setSlots(mySlots);
      setSaving(true);
    }

    // Set timer from battle data
    if (activeBattle.createdAt) {
      const createdAt = new Date(activeBattle.createdAt).getTime();
      const endTime = createdAt + 35_000;
      const now = Date.now();
      const remainingTime = Math.max(Math.ceil((endTime - now) / 1000), 0);
      setTimeLeft(remainingTime);
    }
  }, [activeBattle, avatarId, navigate, battleEnded]);

  const handleReady = useCallback(
    (currentSlots = slots) => {
      if (!currentSlots.every(Boolean)) return;
      if (!activeBattle || !avatarData) return;

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
        activeBattle,
        selectedBattlePokemon,
      );
      setSaving(true);
    },
    [avatarData, slots, playerReadyMatch, activeBattle]
  );

  // Countdown timer
  useEffect(() => {
    if (battleEnded) return;
    
    const timer = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s > 1) return s - 1;

        if (s === 1 && avatarData && !battleEnded) {
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
  }, [avatarData, slots, handleReady, battleEnded]);

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

  // Listen for battleReady and errors
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
        console.log("Battle error:", data.message);
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

  // Navigate when battle is ready
  useEffect(() => {
    if (battleReady && battleId && !battleEnded) {
      navigate(`/battle/${battleId}`);
    }
  }, [battleReady, battleId, navigate, battleEnded]);

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

  // Render battle ended UI
  if (battleEnded) {
    const isWin = playerWon === true;
    const isDraw = playerWon === null;
    
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isWin ? "#1e3a1e" : isDraw ? "#3a3a1e" : "#3a1e1e",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 20 }}>
          {isWin ? "🎉" : isDraw ? "🤝" : "😞"}
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>
          {isWin ? "Victory!" : isDraw ? "Draw" : "Defeat"}
        </h1>
        <p style={{ fontSize: 16, marginBottom: 32, opacity: 0.8 }}>
          {endReason}
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            fontFamily: "monospace",
            background: "#ffcc00",
            border: "2px solid #333",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Return Home
        </button>
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
      canReady={slots.every(Boolean) && timeLeft > 0 && !battleEnded}
      onReady={() => handleReady()}
      msg={null}
      saving={saving}
    />
  );
}