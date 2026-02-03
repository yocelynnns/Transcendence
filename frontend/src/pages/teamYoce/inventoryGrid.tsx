import { PlayerPokemon } from "../../types/pokemonTypes";
import { getPokemonIcon } from "../../assets/helpers";

type Props = {
  inventory: PlayerPokemon[];
  usedIds: Set<string>;
  onPick: (p: PlayerPokemon) => void;
  disabled?: boolean;
};

const MIN_TILES = 3;
const MAX_TILES = 9;

export default function InventoryGrid({ inventory, usedIds, onPick, disabled }: Props) {
  const tileCount = Math.min(MAX_TILES, Math.max(MIN_TILES, inventory.length));
  const tiles = Array.from({ length: tileCount }, (_, i) => inventory[i] ?? null);

  return (
    <div className="ts2-grid">
      {tiles.map((p, idx) => {
        if (!p) {
          return <div key={`empty-${idx}`} className="ts2-tile ts2-tileEmpty" />;
        }

        const used = usedIds.has(p._id);
        const icon = getPokemonIcon(p.name, p.type, p.is_shiny);

        return (
          <button
            key={p._id}
            className={`ts2-tile ${used ? "is-used" : ""}`}
            onClick={() => onPick(p)}
            disabled={disabled || used}
            title={used ? "Already selected" : "Select"}
            type="button"
          >
            <img className="ts2-tileIcon" src={icon} alt={p.name} />

            {p.is_shiny && (
              <span className="ts2-shinyDot" title="Shiny">
                ✦
              </span>
            )}

            {/* Hover/focus info */}
            <div className="ts2-tileInfo" aria-hidden="true">
              <div className="ts2-tileName">{p.name}</div>

              <div className="ts2-tileStats">
                <span>HP {p.hp}</span>
                <span className="ts2-dotSep">•</span>
                <span>ATK {p.attack}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
