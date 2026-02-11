import { useEffect, useState, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";
import "./../styles/BattlePage.css";

import StatusPanel from "../components/Battle/StatusPanel";
import MenuBar from "../components/Battle/MenuBar";

import { getPokemonIcon, getPokemonGifPath } from "../assets/helpers";
import { getPlayerOtherPokemons, getAliveCount } from "../utils/battleUtils";

import { Battle, BattlePokemon } from "../types/battleTypes";
import { AvatarData } from "../types/avatarTypes";

interface BattlePageProps {
  avatarData: AvatarData | null | undefined;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
  refetchBattle: () => Promise<Battle | undefined>;
}

const MOVE_TIMEOUT = 30_000;

export default function BattlePage({ avatarData, currentBattle, setCurrentBattle, refetchBattle }: BattlePageProps) {
  const navigate = useNavigate();
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  const myAvatarId = avatarData?._id || sessionStorage.getItem("avatarId");

  const [battleId, setBattleId] = useState(currentBattle?._id ?? null);
  const [battleData, setBattleData] = useState<Battle | null>(null);
  const [moveTimeLeft, setMoveTimeLeft] = useState<number>(MOVE_TIMEOUT);

  const myRole: "player1" | "player2" | null =
    battleData && myAvatarId
      ? String(battleData.player1._id) === String(myAvatarId)
        ? "player1"
        : String(battleData.player2._id) === String(myAvatarId)
        ? "player2"
        : null
      : null;

  useEffect(() => {
    const fetchAndCheck = async () => {
     const updatedBattle = await refetchBattle();
      if (updatedBattle?.endedAt) navigate(`/matching`);
    };
    fetchAndCheck();
  }, [refetchBattle, navigate]);

  useEffect(() => {
    if (!battleId) return;

    async function fetchBattle() {
      try {
        const res = await fetch(`http://localhost:5001/api/battle/${battleId}`);
        if (!res.ok) throw new Error("Failed to fetch battle");
        const fetchedBattle: Battle = await res.json();

        const safeTeam = (team: BattlePokemon[] = []) =>
          team.map((p) => ({ ...p, isDead: !!p.isDead }));

        setBattleData({
          ...fetchedBattle,
          pokemon1: safeTeam(fetchedBattle.pokemon1),
          pokemon2: safeTeam(fetchedBattle.pokemon2),
          active1: fetchedBattle.active1 ?? 0,
          active2: fetchedBattle.active2 ?? 0,
          currentTurn: fetchedBattle.currentTurn ?? "player1",
          lastPlayer1Turn: fetchedBattle.lastPlayer1Turn ? new Date(fetchedBattle.lastPlayer1Turn) : undefined,
          lastPlayer2Turn: fetchedBattle.lastPlayer2Turn ? new Date(fetchedBattle.lastPlayer2Turn) : undefined,
          endedAt: fetchedBattle.endedAt ?? undefined,
          winner: fetchedBattle.winner ?? undefined,
          winnerReason: fetchedBattle.winnerReason ?? undefined,
        });
      } catch (err) {
        console.log("Failed to fetch battle:", err);
        setBattleData(null);
        setBattleId(null);
      }
    }

    fetchBattle();
  }, [battleId]);

  useEffect(() => {
    if (!subscribeEvent || !battleId) return;

    const unsubUpdateState = subscribeEvent<Battle>("updateBattleState", (updatedBattle) => {
      if (updatedBattle._id !== battleId) return;

      const safeTeam = (team: BattlePokemon[] = []) =>
        team.map((p) => ({ ...p, isDead: !!p.isDead }));

      setBattleData((prev) => {
        const newState = {
          ...prev,
          ...updatedBattle,
          currentTurn: updatedBattle.currentTurn ?? prev?.currentTurn,
          pokemon1: safeTeam(updatedBattle.pokemon1),
          pokemon2: safeTeam(updatedBattle.pokemon2),
          active1: updatedBattle.active1 ?? prev?.active1 ?? 0,
          active2: updatedBattle.active2 ?? prev?.active2 ?? 0,
          lastPlayer1Turn: updatedBattle.lastPlayer1Turn
            ? new Date(updatedBattle.lastPlayer1Turn)
            : prev?.lastPlayer1Turn,
          lastPlayer2Turn: updatedBattle.lastPlayer2Turn
            ? new Date(updatedBattle.lastPlayer2Turn)
            : prev?.lastPlayer2Turn,
          endedAt: updatedBattle.endedAt ?? prev?.endedAt,
          winner: updatedBattle.winner ?? prev?.winner,
          winnerReason: updatedBattle.winnerReason ?? prev?.winnerReason,
        };
        return newState;
      });
    });

    const unsubBattleError = subscribeEvent<{ battleId: string; message: string }>(
      "battleError",
      (err) => {
        alert(err.message);
        setCurrentBattle(null);
        navigate("/");
      }
    );

    return () => {
      unsubUpdateState?.();
      unsubBattleError?.();
    };
  }, [subscribeEvent, battleId, myRole, navigate, setCurrentBattle, emitEvent]);

  useEffect(() => {
    if (!battleData || !myRole || battleData.endedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const lastTurnTime =
        battleData.currentTurn === "player1"
          ? battleData.lastPlayer1Turn?.getTime()
          : battleData.lastPlayer2Turn?.getTime();

      if (!lastTurnTime) return;

      const timeLeft = MOVE_TIMEOUT - (now - lastTurnTime);
      setMoveTimeLeft(timeLeft > 0 ? timeLeft : 0);
    }, 250);

    return () => clearInterval(interval);
  }, [battleData, myRole, emitEvent, battleId]);

  if (!battleId) return <p style={{ color: "#fff", textAlign: "center" }}>Invalid battle</p>;
  if (!battleData || !myRole) return <p style={{ color: "#fff", textAlign: "center" }}>Loading battle…</p>;

  const playerPokemons = myRole === "player1" ? battleData.pokemon1 : battleData.pokemon2;
  const enemyPokemons = myRole === "player1" ? battleData.pokemon2 : battleData.pokemon1;

  const activePlayerIndex = Math.min(
    myRole === "player1" ? battleData.active1 ?? 0 : battleData.active2 ?? 0,
    playerPokemons.length - 1
  );
  const activeEnemyIndex = Math.min(
    myRole === "player1" ? battleData.active2 ?? 0 : battleData.active1 ?? 0,
    enemyPokemons.length - 1
  );

  const activePlayerPokemon = playerPokemons[activePlayerIndex] || playerPokemons[0] || null;
  const activeEnemyPokemon = enemyPokemons[activeEnemyIndex] || enemyPokemons[0] || null;
  const otherPlayerPokemons = getPlayerOtherPokemons(playerPokemons, activePlayerIndex);

  const activePlayerIsDead = activePlayerPokemon?.isDead ?? false;
  const isMyTurn = battleData.currentTurn === myRole;

  const battleResult = battleData.endedAt
    ? battleData.winner === myRole
      ? "win"
      : "lose"
    : null;

  const handleSwitchPlayerPokemon = (index: number, forced: boolean) => {
    if (!isMyTurn) return;
    emitEvent("playerAction", {
      battleId,
      action: { type: forced ? "forcedswitch" : "switch", payload: { newIndex: index } },
      isPlayer1: myRole === "player1",
    });
  };

  const handleAttack = () => {
    if (!isMyTurn) return;
    emitEvent("playerAction", {
      battleId,
      action: { type: "attack" },
      isPlayer1: myRole === "player1",
      attackerActiveIndex: activePlayerIndex,
      defenderActiveIndex: activeEnemyIndex,
    });
  };

  const handleSurrender = () => {
    if (!isMyTurn) return;
    emitEvent("playerAction", {
      battleId,
      action: { type: "surrender" },
      isPlayer1: myRole === "player1",
      attackerActiveIndex: activePlayerIndex,
      defenderActiveIndex: activeEnemyIndex,
    });
  };

  return (
    <div className="battle" style={{ backgroundImage: `url(/assets/bg/background.png)` }}>
      {/* Enemy Pokemon */}
      <div className="player2-container">
        <img src="/assets/bg/dry_platform_enemy.png" className="player2-platform" />
        {activeEnemyPokemon && (
          <>
            <img
              src={getPokemonGifPath(activeEnemyPokemon.name, activeEnemyPokemon.type, activeEnemyPokemon.is_shiny, false)}
              className="player2-pokemon"
            />
            <StatusPanel
              pokemon={activeEnemyPokemon}
              isPlayer={false}
              aliveCount={getAliveCount(enemyPokemons)}
            />
          </>
        )}
      </div>

      {/* Player Pokemon */}
      <div className="player-container">
        <img src="/assets/bg/dry_platform_player.png" className="player-platform" />
        {activePlayerPokemon && (
          <>
            <img
              src={getPokemonGifPath(activePlayerPokemon.name, activePlayerPokemon.type, activePlayerPokemon.is_shiny, true)}
              className="player-pokemon"
            />
            <StatusPanel
              pokemon={activePlayerPokemon}
              isPlayer={true}
              aliveCount={getAliveCount(playerPokemons)}
            />
          </>
        )}
      </div>

      {/* Move timer display */}
      {isMyTurn && !battleResult && (
        <div className="move-timer">
          <span>Time left: {Math.ceil(moveTimeLeft / 1000)}s</span>
        </div>
      )}

      {/* Forced switch overlay */}
      {activePlayerIsDead && !battleResult && (
        <div className="faint-overlay">
          <h2>Your Pokemon fainted! Choose a new one:</h2>
          <div className="switch-options">
            {playerPokemons.map((p, idx) =>
              !p.isDead ? (
                <button key={p.pokemonId} onClick={() => handleSwitchPlayerPokemon(idx, true)}>
                  <img src={getPokemonIcon(p.name, p.type, p.is_shiny)} />
                  <span>{p.name}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* MenuBar */}
      <MenuBar
        currentPokemon={activePlayerPokemon?.name ?? ""}
        pokemon1={otherPlayerPokemons[0] && {
          icon: getPokemonIcon(otherPlayerPokemons[0].name, otherPlayerPokemons[0].type, otherPlayerPokemons[0].is_shiny),
          isDead: otherPlayerPokemons[0].isDead,
          onClick: () => handleSwitchPlayerPokemon(playerPokemons.indexOf(otherPlayerPokemons[0]), false),
        }}
        pokemon2={otherPlayerPokemons[1] && {
          icon: getPokemonIcon(otherPlayerPokemons[1].name, otherPlayerPokemons[1].type, otherPlayerPokemons[1].is_shiny),
          isDead: otherPlayerPokemons[1].isDead,
          onClick: () => handleSwitchPlayerPokemon(playerPokemons.indexOf(otherPlayerPokemons[1]), false),
        }}
        onAttack={handleAttack}
        onSurrender={handleSurrender}
        disabled={!isMyTurn || !!battleResult || activePlayerIsDead}
      />

      {/* Battle result overlay */}
      {battleResult && (
        <div className="battle-result-overlay">
          <h1>{battleResult === "win" ? "You Won!" : "You Lost!"}</h1>
          <p>{battleData.winnerReason ?? ""}</p>
          <button
            onClick={() => {
              setCurrentBattle(null);
              navigate("/");
            }}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentBattle(null);
              navigate("/matching");
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
