import { useEffect, useState, Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";
import StatusPanel from "../components/Battle/StatusPanel";
import { getAliveCount } from "../utils/battleUtils";
import { getPokemonGifPath } from "../assets/helpers";
import { Battle, BattlePokemon } from "../types/battleTypes";

interface SpectatorPageProps {
  spectatingBattle: Battle | null;
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;
}

export default function SpectatorPage({
  spectatingBattle,
  setSpectatingBattle,
}: SpectatorPageProps) {
  const navigate = useNavigate();
  const { battleId } = useParams(); // Get battleId from URL
  const { subscribeEvent, emitEvent } = useGameSocket(() => {});

  const [battleData, setBattleData] = useState<Battle | null>(spectatingBattle);
  const [povPlayer1, setPovPlayer1] = useState(true);
  const [loading, setLoading] = useState(!spectatingBattle);

  // Fetch battle data if not provided
  useEffect(() => {
    if (!battleData && battleId) {
      fetch(`http://localhost:5001/api/battle/${battleId}`)
        .then(res => res.json())
        .then((data: Battle) => {
          setBattleData(data);
          setSpectatingBattle(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch battle:", err);
          navigate("/");
        });
    }
  }, [battleId, battleData, setSpectatingBattle, navigate]);

  useEffect(() => {
    if (!subscribeEvent || !battleId) return;

    const unsubUpdateState = subscribeEvent<Battle>("updateBattleState", (updatedBattle) => {
      if (updatedBattle._id !== battleId) return;

      const safeTeam = (team: BattlePokemon[] = []) =>
        team.map((p) => ({ ...p, isDead: !!p.isDead }));

      setBattleData({
        ...updatedBattle,
        pokemon1: safeTeam(updatedBattle.pokemon1),
        pokemon2: safeTeam(updatedBattle.pokemon2),
        active1: updatedBattle.active1 ?? 0,
        active2: updatedBattle.active2 ?? 0,
        currentTurn: updatedBattle.currentTurn ?? "player1",
        endedAt: updatedBattle.endedAt ?? undefined,
        winner: updatedBattle.winner ?? undefined,
        winnerReason: updatedBattle.winnerReason ?? undefined,
      });
    });

    const unsubBattleError = subscribeEvent<{ battleId: string; message: string }>(
      "battleError",
      (err) => {
        if (err.battleId !== battleId) return;

        alert(`Battle ended due to error: ${err.message}`);
        setSpectatingBattle(null);
        navigate("/");
      }
    );

    return () => {
      unsubUpdateState?.();
      unsubBattleError?.();
    };
  }, [subscribeEvent, battleId, navigate, setSpectatingBattle]);

  if (loading || !battleData) {
    return <p style={{ color: "#fff", textAlign: "center" }}>Loading battle…</p>;
  }

  // POV-based swap
  const playerPokemons = povPlayer1 ? battleData.pokemon1 : battleData.pokemon2;
  const enemyPokemons = povPlayer1 ? battleData.pokemon2 : battleData.pokemon1;

  const activePlayerIndex = Math.min(
    povPlayer1 ? battleData.active1 ?? 0 : battleData.active2 ?? 0,
    playerPokemons.length - 1
  );

  const activeEnemyIndex = Math.min(
    povPlayer1 ? battleData.active2 ?? 0 : battleData.active1 ?? 0,
    enemyPokemons.length - 1
  );

  const activePlayerPokemon = playerPokemons[activePlayerIndex];
  const activeEnemyPokemon = enemyPokemons[activeEnemyIndex];

  const battleResult = battleData.endedAt
    ? battleData.winner === (povPlayer1 ? "player1" : "player2")
      ? "Win"
      : "Lose"
    : null;

  // NEW: Handle going home with acknowledgment
  const handleGoHome = () => {
    // If battle ended, acknowledge it before leaving
    if (battleData.endedAt && battleId) {
      emitEvent("acknowledgeBattleEnd", { battleId });
    }
    
    setSpectatingBattle(null);
    navigate("/");
  };

  return (
    <div className="battle" style={{ backgroundImage: `url(/assets/bg/background.png)` }}>
      {/* Swap POV */}
      <button
        style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}
        onClick={() => setPovPlayer1((prev) => !prev)}
      >
        Swap POV
      </button>

      {/* Enemy Side */}
      <div className="player2-container">
        <img src="/assets/bg/dry_platform_enemy.png" className="player2-platform" />

        {activeEnemyPokemon && (
          <>
            <img
              src={getPokemonGifPath(
                activeEnemyPokemon.name,
                activeEnemyPokemon.type,
                activeEnemyPokemon.is_shiny,
                false
              )}
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

      {/* Player POV Side */}
      <div className="player-container">
        <img src="/assets/bg/dry_platform_player.png" className="player-platform" />

        {activePlayerPokemon && (
          <>
            <img
              src={getPokemonGifPath(
                activePlayerPokemon.name,
                activePlayerPokemon.type,
                activePlayerPokemon.is_shiny,
                true
              )}
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

      {battleResult && (
        <div className="battle-result-overlay">
          <h1>{battleResult}</h1>
          <p>{battleData.winnerReason ?? ""}</p>
          {/* UPDATED: Use handleGoHome instead of inline */}
          <button onClick={handleGoHome}>
            Home
          </button>
        </div>
      )}
    </div>
  );
}