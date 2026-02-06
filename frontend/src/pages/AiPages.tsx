import "./../styles/BattlePage.css";

import StatusPanel from "../components/Battle/StatusPanel";
import MenuBar from "../components/Battle/MenuBar";

import { getPokemonIcon, getPokemonGifPath } from "../assets/helpers";
import { BattlePokemon } from "../types/battleTypes";

import { useBattleLogic } from "../components/ai/aiBattleLogic";
import { AiPokemon } from "../components/ai/aiTypes";
import { useNavigate } from "react-router-dom";


const toBattlePokemon = (p: AiPokemon): BattlePokemon => ({
  pokemonId: p.name,
  name: p.name,
  type: p.type as "grass" | "water" | "normal" | "fire",
  is_shiny: false,
  maxHp: p.stats.maxHp,
  currentHp: p.stats.hp,
  attack: p.stats.atk,
  isDead: p.stats.hp <= 0,
});

export default function AiPages() {
  const navigate = useNavigate();

  const {
    turn,
    playerTeam,
    enemyTeam,
    playerActive,
    enemyActive,
    playerAttack,
    playerSwap,
    isAlive,
    battleResult,
    battleData,  
    activePlayerIsDead,
  } = useBattleLogic();

  const playerPokemon = toBattlePokemon(playerActive);
  const enemyPokemon = toBattlePokemon(enemyActive);

  const otherPokemons = playerTeam
    .map(toBattlePokemon)
    .filter(p => p.pokemonId !== playerPokemon.pokemonId);

  return (
    <div
      className="battle"
      style={{ backgroundImage: `url(/assets/bg/background.png)` }}
    >
      {/* Enemy */}
      <div className="player2-container">
        <img src="/assets/bg/dry_platform_enemy.png" className="player2-platform" />

        <img
          src={getPokemonGifPath(
            enemyPokemon.name,
            enemyPokemon.type,
            enemyPokemon.is_shiny,
            false
          )}
          className="player2-pokemon"
        />

        <StatusPanel
          pokemon={enemyPokemon}
          isPlayer={false}
          aliveCount={enemyTeam.filter(isAlive).length}
        />
      </div>

      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "8px", zIndex: 10 }}>
        {enemyTeam.map((p) => {
          const pokemon = toBattlePokemon(p);
          const disabled = !isAlive(p);
          return (
            <div key={pokemon.pokemonId} style={{ width: "60px", height: "60px", position: "relative", border: "2px solid black", borderRadius: "6px", overflow: "hidden", opacity: disabled ? 0.5 : 1 }}>
              <img src={getPokemonIcon(pokemon.name, pokemon.type, pokemon.is_shiny)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              {disabled && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)" }} />}
            </div>
          );
        })}
      </div>

      {/* Player */}
      <div className="player-container">
        <img src="/assets/bg/dry_platform_player.png" className="player-platform" />

        <img
          src={getPokemonGifPath(
            playerPokemon.name,
            playerPokemon.type,
            playerPokemon.is_shiny,
            true
          )}
          className="player-pokemon"
        />

        <StatusPanel
          pokemon={playerPokemon}
          isPlayer={true}
          aliveCount={playerTeam.filter(isAlive).length}
        />
      </div>

      {/* Timer */}
      <div className="move-timer">
        <span>{turn === "p1" ? "Your turn" : "Enemy thinking..."}</span>
      </div>

      {/* Menu */}
      <MenuBar
        currentPokemon={playerPokemon.name}
        pokemon1={{
          icon: getPokemonIcon(
            otherPokemons[0]?.name,
            otherPokemons[0]?.type,
            otherPokemons[0]?.is_shiny
          ),
          isDead: otherPokemons[0]?.isDead ?? true,
          onClick: () =>
            playerSwap(
              playerTeam.findIndex(p => p.name === otherPokemons[0]?.name), false
            ),
        }}
        pokemon2={{
          icon: getPokemonIcon(
            otherPokemons[1]?.name,
            otherPokemons[1]?.type,
            otherPokemons[1]?.is_shiny
          ),
          isDead: otherPokemons[1]?.isDead ?? true,
          onClick: () =>
            playerSwap(
              playerTeam.findIndex(p => p.name === otherPokemons[1]?.name), false
            ),
        }}
        onAttack={playerAttack}
        disabled={turn !== "p1"}
      />

      {activePlayerIsDead && !battleResult && (
        <div className="faint-overlay">
          <h2>Your Pokemon fainted! Choose a new one:</h2>
          <div className="switch-options">
            {playerTeam.map((p, idx) =>
              isAlive(p) ? (
                <button
                  key={p.name}
                  onClick={() => playerSwap(idx, true)}
                >
                  <img src={getPokemonIcon(p.name, p.type, false)} />
                  <span>{p.name}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
)}


      {/* ---------------- Battle Result Overlay ---------------- */}
      {battleResult && (
        <div className="battle-result-overlay">
          <h1>{battleResult === "win" ? "You Won!" : "You Lost!"}</h1>
          <p>{battleData?.winnerReason ?? ""}</p>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>
          <button
            onClick={() => {
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
