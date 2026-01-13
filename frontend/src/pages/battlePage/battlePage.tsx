import React from "react";
import "./battlePage.css";
import EnemyBlock from "./enemyPanel";
import PlayerBlock from "./playerPanel";
import StatusPanel from "./statusPanel";
import MenuBar from "./menuBar";

import background from "../../assets/bg/background.png";
import enemyPlatform from "../../assets/bg/pink_platform_enemy.png";
import playerPlatform from "../../assets/bg/pink_platform_player.png";
import cleffa from "../../assets/pokemon/normal/cleffa/front_cleffa.gif";
import togepi from "../../assets/pokemon/normal/togepi/back_togepi.gif";

export default function Battle() {
  return (
    <div className="battle" style={{ backgroundImage: `url(${background})` }}>
      <div className="enemy-container">
        <img src={enemyPlatform} className="enemy-platform" />
        <img src={cleffa} className="enemy-pokemon" />
        <EnemyBlock />
        {/* <StatusPanel pokemon={enemy.team[0]} isPlayer={false} /> */}
      </div>

      <div className="player-container">
        <img src={playerPlatform} className="player-platform" />
        <img src={togepi} className="player-pokemon" />
        <PlayerBlock />
        {/* <StatusPanel pokemon={player.team[0]} isPlayer={true} /> */}
      </div>

      <MenuBar />
    </div>
  );
}
