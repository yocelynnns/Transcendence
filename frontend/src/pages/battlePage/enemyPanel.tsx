import "./statusPanel.css";
import enemyHpBlock from "../../assets/health_bar/health_block_enemy.png";
import greenHp from "../../assets/health_bar/green_hp.png";
import yellowHp from "../../assets/health_bar/yellow_hp.png";
import redHp from "../../assets/health_bar/red_hp.png";
import pokeballAlive from "../../assets/health_bar/pokeball_alive.png";
import pokeballDead from "../../assets/health_bar/pokeball_dead.png";

export default function EnemyBlock() {
  return (
    <div className="sp enemy-sp">
      <img src={enemyHpBlock} className="sp-bg" />

      <div className="hp-bar">
        <img src={greenHp} />
      </div>

      <div className="sp-name">CLEFFA</div>

      <div className="sp-balls">
        <img src={pokeballAlive} />
        <img src={pokeballAlive} />
        <img src={pokeballDead} />
      </div>

      <div className="sp-atk">ATK <span>5</span>, HP <span>10</span>/<span>10</span></div>
    </div>
  );
}
