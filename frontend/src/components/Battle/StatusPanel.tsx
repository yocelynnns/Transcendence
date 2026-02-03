import "../../styles/StatusPanel.css";

import { ASSETS } from "../../assets";

import {BattlePokemon} from "../../types/battleTypes"

const enemyHpBlock = ASSETS.HEALTH.BLOCK.ENEMY;
const playerHpBlock = ASSETS.HEALTH.BLOCK.PLAYER;

const greenHp = ASSETS.HEALTH.HP.GREEN;
const yellowHp = ASSETS.HEALTH.HP.YELLOW;
const redHp = ASSETS.HEALTH.HP.RED;

const pokeballAlive = ASSETS.HEALTH.POKEBALL.ALIVE;
const pokeballDead = ASSETS.HEALTH.POKEBALL.DEAD;


interface StatusPanelProps {
  pokemon: BattlePokemon;
  isPlayer?: boolean;
  aliveCount?: number;
}

export default function StatusPanel({ pokemon, isPlayer = false, aliveCount = 3}: StatusPanelProps) {
  const { name, attack, maxHp, currentHp } = pokemon;

  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  // choose hp color based on percentage
  let hpImg = greenHp;
  if (hpPercent <= 30) hpImg = redHp;
  else if (hpPercent <= 60) hpImg = yellowHp;

  const hpBlockImg = isPlayer ? playerHpBlock : enemyHpBlock;

  // create an array of pokeball statuses, for simplicity 3 balls
  const pokeballs = [0, 1, 2].map(i => i < aliveCount);
  
  return (
    <div className={`sp ${isPlayer ? "player-sp" : "player2-sp"}`}>
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
        ATK <span>{attack}</span>, HP <span>{currentHp}</span>/<span>{maxHp}</span>
      </div>
    </div>
  );
}