// src/components/Battle/StatusPanel.tsx
import { ASSETS } from "../../assets";
import { BattlePokemon } from "../../types/battleTypes";

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

export default function StatusPanel({
  pokemon,
  isPlayer = false,
  aliveCount = 3,
}: StatusPanelProps) {
  const { name, attack, maxHp, currentHp } = pokemon;
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  let hpImg = greenHp;
  if (hpPercent <= 30) hpImg = redHp;
  else if (hpPercent <= 60) hpImg = yellowHp;

  const hpBlockImg = isPlayer ? playerHpBlock : enemyHpBlock;
  const pokeballs = [0, 1, 2].map((i) => i < aliveCount);

  return (
    <div className="relative w-full max-w-115 select-none">
      <img
        src={hpBlockImg}
        className="w-full [image-rendering:pixelated]"
        draggable={false}
      />

      {/* Name */}
      <div
        className={[
          "absolute top-[18%] text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-[#222] pixelify-sans font-bold",
          isPlayer ? "left-[15%]" : "left-[8%]",
        ].join(" ")}
      >
        {name}
      </div>

      {/* ATK/HP */}
      <div
        className={[
          "absolute top-[30%] text-[11px] sm:text-[13px] md:text-[15px] lg:text-[17px] text-[#666] text-right pixelify-sans font-semibold",
          isPlayer ? "right-[8%]" : "right-[16%]",
        ].join(" ")}
      >
        ATK <span className="text-[#999] mono-font">{attack}</span>, HP{" "}
        <span className="text-[#999] mono-font">{currentHp}</span>/
        <span className="text-[#999] mono-font">{maxHp}</span>
      </div>

      {/* Balls */}
      <div
        className={[
          "absolute top-[42%] flex items-center gap-0.5",
          isPlayer ? "left-[15%]" : "left-[8%]",
        ].join(" ")}
      >
        {pokeballs.map((alive, i) => (
          <img
            key={i}
            src={alive ? pokeballAlive : pokeballDead}
            className="w-[14px] sm:w-[16px] md:w-[18px] lg:w-[22px] [image-rendering:pixelated]"
            draggable={false}
          />
        ))}
      </div>

      {/* HP bar */}
      <div
        className={[
          "absolute top-[58%] h-[8%] sm:h-[9%] md:h-[10%] overflow-hidden",
          isPlayer ? "left-[47%] w-[46.5%]" : "left-[39%] w-[46.5%]",
        ].join(" ")}
      >
        <img
          src={hpImg}
          className="h-full [image-rendering:pixelated]"
          style={{ width: `${hpPercent}%` }}
          draggable={false}
        />
      </div>
    </div>
  );
}
