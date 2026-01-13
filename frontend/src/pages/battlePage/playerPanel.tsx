import "./statusPanel.css";
import playerHpBlock from "../../assets/health_bar/health_block_player.png";
import greenHp from "../../assets/health_bar/green_hp.png";
import yellowHp from "../../assets/health_bar/yellow_hp.png";
import redHp from "../../assets/health_bar/red_hp.png";
import pokeballAlive from "../../assets/health_bar/pokeball_alive.png";
import pokeballDead from "../../assets/health_bar/pokeball_dead.png";

export default function EnemyBlock() {
  return (
    <div className="sp player-sp">
      <img src={playerHpBlock} className="sp-bg" />

      <div className="hp-bar player">
        <img src={greenHp} />
      </div>

      <div className="sp-name player">TOGEPI</div>

      <div className="sp-balls player">
        <img src={pokeballAlive} />
        <img src={pokeballAlive} />
        <img src={pokeballDead} />
      </div>

      <div className="sp-atk player">ATK <span>8</span>, HP <span>5</span>/<span>6</span></div>
    </div>
  );
}
