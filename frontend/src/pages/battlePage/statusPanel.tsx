import "./statusPanel.css";
import enemyHpBlock from "../../assets/health_bar/health_block_enemy.png";
import playerHpBlock from "../../assets/health_bar/health_block_player.png";
import greenHp from "../../assets/health_bar/green_hp.png";
import yellowHp from "../../assets/health_bar/yellow_hp.png";
import redHp from "../../assets/health_bar/red_hp.png";
import pokeballAlive from "../../assets/health_bar/pokeball_alive.png";
import pokeballDead from "../../assets/health_bar/pokeball_dead.png";

interface StatusPanelProps {
  pokemon: IBattlePokemon;
  isPlayer?: boolean;
}

export default function StatusPanel({ pokemon, isPlayer = false }: StatusPanelProps) {
  const { name, attack, maxHp, currentHp, isDead } = pokemon;

  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  // choose hp color based on percentage
  let hpImg = greenHp;
  if (hpPercent <= 30) hpImg = redHp;
  else if (hpPercent <= 60) hpImg = yellowHp;

  const hpBlockImg = isPlayer ? playerHpBlock : enemyHpBlock;

  // create an array of pokeball statuses, for simplicity 3 balls
  const pokeballs = [true, true, !isDead];

  return (
    <div className={`sp ${isPlayer ? "player-sp" : "enemy-sp"}`}>
      <img src={hpBlockImg} className="sp-bg" />

      <div className={`hp-bar ${isPlayer ? "player" : ""}`}>
        <img src={hpImg} style={{ width: `${hpPercent}%`, height: "100%" }} />
      </div>

      <div className={`sp-name ${isPlayer ? "player" : ""}`}>{name}</div>

      <div className={`sp-balls ${isPlayer ? "player" : ""}`}>
        {pokeballs.map((alive, i) => (
          <img
            key={i}
            src={alive ? pokeballAlive : pokeballDead}
            alt={`ball ${i + 1}`}
          />
        ))}
      </div>

      <div className={`sp-atk ${isPlayer ? "player" : ""}`}>
        ATK {attack}, HP {currentHp}/{maxHp}
      </div>
    </div>
  );
}