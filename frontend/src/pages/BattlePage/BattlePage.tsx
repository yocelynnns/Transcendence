import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGameSocket } from "../../ws/useGameSocket"; // adjust path
import { useNavigate } from "react-router-dom";
import "./BattlePage.css";
import StatusPanel from "./StatusPanel";
import MenuBar from "./MenuBar";

import { getPokemonGifPath, getPokemonIcon } from "../../utils/pathFetcher";
import { getPlayerOtherPokemons, getAliveCount } from "../../utils/battleUtils";

export default function Battle() {
  const { emitEvent, subscribeEvent } = useGameSocket(() => {}); // empty callback if you don’t need player movement
  const { battleId } = useParams<{ battleId: string }>();
  const [battleData, setBattleData] = useState<any>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activePlayerIsDead, setActivePlayerIsDead] = useState(false);
  const [turn, setTurn] = useState<"player1" | "player2" | null>(null);
  const [myRole, setMyRole] = useState<"player1" | "player2" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = subscribeEvent<"player1" | "player2">("turnUpdate", (t) => {
      setTurn(t);
    });
    return () => cleanup();
  }, [subscribeEvent]);


  // update active Pokémon when I switched
  useEffect(() => {
    const cleanup = subscribeEvent<{ newIndex: number }>("playerSwitchedPokemon", ({ newIndex }) => {
      setActivePlayerIndex(newIndex);
    });

    return () => cleanup();
  }, [subscribeEvent]);

  // update enemy Pokémon when opponent switched
  useEffect(() => {
    const cleanup = subscribeEvent<{ newIndex: number }>("opponentSwitchedPokemon", ({ newIndex }) => {
      setBattleData(prev => ({
        ...prev,
        enemy: {
          ...prev.enemy,
          activeIndex: newIndex,
        },
      }));
    });

    return () => cleanup();
  }, [subscribeEvent]);


  useEffect(() => {
    if (!battleId) return;

    emitEvent("getTurn", { battleId });
  }, [battleId, emitEvent]);

  useEffect(() => {
    console.log("TURN =", turn, "MY ROLE =", myRole);
  }, [turn, myRole]);

  useEffect(() => {
    const activePokemon = battleData?.player.pokemon[activePlayerIndex];
    setActivePlayerIsDead(activePokemon?.isDead ?? false);
  }, [battleData, activePlayerIndex]);

  useEffect(() => {
    if (!battleId) return;

    const myAvatarId = localStorage.getItem("avatarId"); // make sure you save your avatarId somewhere

    fetch(`http://localhost:5001/api/battle/${battleId}`)
      .then(res => res.json())
      .then(data => {
        // Determine which player is "me" and which is "enemy"
        let me, enemy;

        if (String(data.player1.playerId) === String(myAvatarId)) {
          me = data.player1;
          enemy = data.player2;
          setMyRole("player1");   // 👈 ADD
        } else {
          me = data.player2;
          enemy = data.player1;
          setMyRole("player2");   // 👈 ADD
        }

        const transformed = {
          player: {
            pokemon: me.team.map((p: any) => ({
              ...p,
              name: p.name,
              type: p.type,
              attack: p.attack,
              maxHp: p.maxHp,
              currentHp: p.currentHp,
              isDead: p.isDead,
              is_shiny: p.is_shiny,
              pokemonId: p.pokemonId,
              activeIndex: 0,
            })),
          },
          enemy: {
            pokemon: enemy.team.map((p: any) => ({
              ...p,
              name: p.name,
              type: p.type,
              attack: p.attack,
              maxHp: p.maxHp,
              currentHp: p.currentHp,
              isDead: p.isDead,
              is_shiny: p.is_shiny,
              pokemonId: p.pokemonId,
              activeIndex: 0,
            })),
          },
        };

        setBattleData(transformed);
      })
      .catch(console.error);
  }, [battleId]);

  useEffect(() => {
    const cleanup = subscribeEvent<{
      player: any[];
      enemy: any[];
    }>("updateBattleState", ({ player, enemy }) => {
      setBattleData(prev => ({
        ...prev,
        player: { ...prev.player, pokemon: player },
        enemy: { ...prev.enemy, pokemon: enemy },
      }));
    });

    return () => cleanup();
  }, [subscribeEvent]);

  if (!battleData)
    return (
      <p style={{ textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        Loading battle...
      </p>
    );

    const background = "/assets/bg/background.png";
    const enemyPlatform = "/assets/bg/dry_platform_enemy.png";
    const playerPlatform = "/assets/bg/dry_platform_player.png";

    const activeEnemyIndex = battleData.enemy.activeIndex ?? 0;

    const otherPlayerPokemons = getPlayerOtherPokemons(
      battleData.player.pokemon,
      activePlayerIndex
    );

    const activeEnemyPokemon = battleData!.enemy.pokemon[activeEnemyIndex];
    const activePlayerPokemon = battleData!.player.pokemon[activePlayerIndex];

    const playerAlive = getAliveCount(battleData.player.pokemon) > 0;
    const enemyAlive = getAliveCount(battleData.enemy.pokemon) > 0;

    const battleResult = !playerAlive ? "lose" : !enemyAlive ? "win" : null;

    const handleSwitchPlayerPokemon = (index: number, forcedswitch: boolean) => {
      if (!battleId) return;

      setActivePlayerIndex(index);

      var type = "switch";
      if (forcedswitch)
        type = "forcedswitch";

      emitEvent("playerAction", {
        battleId,
        action: { type: type, payload: { newIndex: index } }
      });
    };

  return (
    <div className="battle" style={{ backgroundImage: `url(${background})` }}>
      <div className="enemy-container">
        <img src={enemyPlatform} className="enemy-platform" />
        <img src={getPokemonGifPath(activeEnemyPokemon, false)} className="enemy-pokemon" />
        <StatusPanel pokemon={activeEnemyPokemon} isPlayer={false} aliveCount={getAliveCount(battleData.enemy.pokemon)}/>
      </div>

      <div className="player-container">
        <img src={playerPlatform} className="player-platform" />
        <img src={getPokemonGifPath(activePlayerPokemon, true)} className="player-pokemon" />
        <StatusPanel pokemon={activePlayerPokemon} isPlayer={true} aliveCount={getAliveCount(battleData.player.pokemon)} />
      </div>

      {/* Pokémon faint overlay */}
      {activePlayerIsDead && !battleResult && (
        <div className="faint-overlay">
          <h2>Your Pokémon fainted! <br></br> Choose a new one:</h2>
          <div className="switch-options">
            {battleData.player.pokemon.map((p: any, idx: number) =>
              !p.isDead ? (
                <button key={p.pokemonId} onClick={() => handleSwitchPlayerPokemon(idx, true)}>
                  <img src={getPokemonIcon(p)} alt={p.name} />
                  <span>{p.name}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
      )}

      <MenuBar
        currentPokemon={activePlayerPokemon.name}
        pokemon1={{
          icon: getPokemonIcon(otherPlayerPokemons[0]),
          isDead: otherPlayerPokemons[0].isDead,
          onClick: () => handleSwitchPlayerPokemon(
            battleData.player.pokemon.indexOf(otherPlayerPokemons[0]), false
          ),
        }}
        pokemon2={{
          icon: getPokemonIcon(otherPlayerPokemons[1]),
          isDead: otherPlayerPokemons[1].isDead,
          onClick: () => handleSwitchPlayerPokemon(
            battleData.player.pokemon.indexOf(otherPlayerPokemons[1]), false
          ),
        }}
        onAttack={() => {
          if (!battleId) return;

          emitEvent("playerAction", {
            battleId,
            action: { type: "attack", payload: { from: activePlayerIndex } }
          });
        }}
        disabled={!turn || !myRole || turn !== myRole || !!battleResult || activePlayerIsDead}
      />

        {battleResult && (
          <div className="battle-result-overlay">
            <h1>{battleResult === "win" ? "You Won!" : "You Lost!"}</h1>
            <div className="battle-result-buttons">
              <button onClick={() => navigate("/")}>Return to Home</button>
              <button onClick={() => navigate("/matching")}>Play Again</button>
            </div>
          </div>
        )}

    </div>
  );
}
