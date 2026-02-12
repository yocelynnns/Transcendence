// src/components/teamSelect/inventoryGrid.tsx
import type { PlayerPokemon } from "../../types/pokemonTypes";
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
    <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
      {tiles.map((p, idx) => {
        if (!p) {
          return (
            <div
              key={`empty-${idx}`}
              className={[
                "rounded-lg border-4 border-black/10 bg-[#d9d9d9] opacity-70",
                "shadow-[inset_0_-3px_0_rgba(0,0,0,.10)]",
                "h-16 sm:h-21",
              ].join(" ")}
            />
          );
        }

        const used = usedIds.has(p._id);
        const icon = getPokemonIcon(p.name, p.type, p.is_shiny);

        return (
          <button
            key={p._id}
            type="button"
            onClick={() => onPick(p)}
            disabled={disabled || used}
            title={used ? "Already selected" : "Select"}
            className={[
              "relative rounded-lg border-4 border-black/10 bg-[#d9d9d9]",
              "grid place-items-center overflow-hidden shadow-[inset_0_-3px_0_rgba(0,0,0,.10)]",
              "transition-[filter] hover:brightness-[1.03]",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7db6d6]/70",
              "h-16 sm:h-21",
              used || disabled ? "opacity-45 cursor-not-allowed grayscale-[.4]" : "cursor-pointer",
              "group",
            ].join(" ")}
          >
            <img
              className="w-10 h-10 sm:w-14 sm:h-14 [image-rendering:pixelated]"
              src={icon}
              alt={p.name}
            />

            {p.is_shiny && (
              <span
                className="absolute top-1 right-1.5 text-[22px] sm:top-1.25 sm:right-1.75 sm:text-[30px] opacity-95"
                title="Shiny"
              >
                ✦
              </span>
            )}

            {/* hover/focus info overlay */}
            <div
              aria-hidden="true"
              className={[
                "absolute left-1 right-1 bottom-1 rounded-[7px]",
                "px-1.5 py-1 bg-white/80 border-2 border-black/20",
                "translate-y-2 opacity-0 pointer-events-none",
                "transition-[opacity,transform] duration-150 ease-out",
                "group-hover:opacity-100 group-hover:translate-y-0",
                "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
                used ? "hidden" : "",
              ].join(" ")}
            >
              <div className="text-[9px] sm:text-[10px] leading-[1.15] text-black/80 capitalize truncate">
                {p.name}
              </div>

              <div className="mt-0.5 sm:mt-0.75 text-[8px] sm:text-[9px] leading-[1.1] text-black/60 flex items-center justify-center gap-1.5">
                <span>HP {p.hp}</span>
                <span className="opacity-55">•</span>
                <span>ATK {p.attack}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
