import { getPokemonIcon } from "../../utils/pathFetcher";
import type { Pokemon } from "./types";

type Props = {
  inventory: Pokemon[];
  usedIds: Set<string>;
  onPick: (p: Pokemon) => void;
  disabled?: boolean;
};

export default function InventoryGrid({ inventory, usedIds, onPick, disabled }: Props) {
  return (
    <div className="ts-invGrid">
      {inventory.map((p) => {
        const used = usedIds.has(p._id);
        const icon = getPokemonIcon(p as any);

        return (
          <button
            key={p._id}
            className={`ts-pokeCard ${used ? "used" : ""}`}
            onClick={() => onPick(p)}
            disabled={disabled || used}
            title={used ? "Already selected" : "Select"}
          >
            <div className="ts-pokeIconWrap">
              <img className="ts-pokeIcon" src={icon} alt={p.name} />
              {p.is_shiny && <div className="ts-shiny">✨</div>}
            </div>

            <div className="ts-pokeInfo">
              <div className="ts-pokeName">{p.name}</div>
              <div className="ts-pokeMeta">
                <span className={`ts-badge ${p.type.toLowerCase()}`}>{p.type}</span>
                <span className="ts-stat">HP {p.hp}</span>
                <span className="ts-stat">ATK {p.attack}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
