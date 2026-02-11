// src/components/teamSelect/teamSlots.tsx
import { getPokemonIcon } from "../../assets/helpers";
import type { PlayerPokemon } from "../../types/pokemonTypes";

type Props = {
  slots: (PlayerPokemon | null)[];
  activeSlot: number;
  setActiveSlot: (i: number) => void;
  onRemoveSlot: (idx: number) => void;
  msg: string | null;
};

export default function TeamSlots({
  slots,
  activeSlot,
  setActiveSlot,
  onRemoveSlot,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {slots.map((p, idx) => {
        const active = idx === activeSlot;
        const icon = p ? getPokemonIcon(p.name, p.type, p.is_shiny) : null;

        return (
          <div
            key={idx}
            className={[
              "relative w-17.5 h-13.5 rounded-lg bg-[#d9d9d9] border-4 border-black/10",
              "shadow-[inset_0_-3px_0_rgba(0,0,0,.10)] grid place-items-center cursor-pointer",
              active ? "outline-4 outline-[#7db6d6]/70 outline-offset-2" : "",
            ].join(" ")}
            onClick={() => setActiveSlot(idx)}
            role="button"
            tabIndex={0}
          >
            {p ? (
              <>
                <img
                  className="w-11 h-11 [image-rendering:pixelated]"
                  src={icon!}
                  alt={p.name}
                />
                <button
                  type="button"
                  className={[
                    "absolute -top-2.5 -right-2.5 w-5.5 h-5.5 rounded-full",
                    "grid place-items-center bg-[#d77d9a] text-white",
                    "text-[16px] leading-none shadow-[0_8px_18px_rgba(0,0,0,.25)]",
                    "hover:brightness-110",
                    "font-sans"
                  ].join(" ")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSlot(idx);
                  }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        );
      })}
    </div>
  );
}
