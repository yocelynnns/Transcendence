import { useEffect, useState } from "react";
import "./battlePage.css";
import StatusPanel from "./statusPanel";
import MenuBar from "./menuBar";

import { getPokemonGifPath, getPokemonIcon } from "../../utils/pathFetcher";
import { getPlayerOtherPokemons, getAliveCount } from "../../utils/battleUtils";

export default function Battle() {
  const [battleData, setBattleData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:3001/battleDummy")
      .then(res => res.json())
      .then(setBattleData)
      .catch(console.error);
  }, []);

  if (!battleData)
    return (
      <p style={{ textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        Loading battle...
      </p>
    );

    const background = "/assets/bg/background.png";
    const enemyPlatform = "/assets/bg/pink_platform_enemy.png";
    const playerPlatform = "/assets/bg/pink_platform_player.png";

    const activePlayerIndex = 0;
    const activeEnemyIndex = 1;
    const PlayerOtherPokemons = getPlayerOtherPokemons(battleData!.player.pokemon, activePlayerIndex);

    const activeEnemyPokemon = battleData!.enemy.pokemon[activeEnemyIndex];
    const activePlayerPokemon = battleData!.player.pokemon[activePlayerIndex]

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

      <MenuBar currentPokemon={activePlayerPokemon.name} pokemonIcon1={getPokemonIcon(PlayerOtherPokemons[0])} pokemonIcon2={getPokemonIcon(PlayerOtherPokemons[1])}/>
    </div>
  );
}
