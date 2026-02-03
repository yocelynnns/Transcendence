import { getPokemonIcon } from "../../assets/helpers";
import type { PlayerPokemon } from "../../types/pokemonTypes";

type Props = {
  slots: (PlayerPokemon | null)[];
  activeSlot: number;
  setActiveSlot: (i: number) => void;
  onRemoveSlot: (idx: number) => void;
  msg: string | null;
};

export default function TeamSlots({ slots, activeSlot, setActiveSlot, onRemoveSlot }: Props) {
  return (
    <div className="ts2-slots">
      {slots.map((p, idx) => {
        const active = idx === activeSlot;
        const icon = p ? getPokemonIcon(p.name, p.type, p.is_shiny) : null;

        return (
          <div
            key={idx}
            className={`ts2-slot ${active ? "is-active" : ""}`}
            onClick={() => setActiveSlot(idx)}
            role="button"
            tabIndex={0}
          >
            {p ? (
              <>
                <img className="ts2-slotIcon" src={icon!} alt={p.name} />
                <button
                  className="ts2-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSlot(idx);
                  }}
                  aria-label="Remove"
                  type="button"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="ts2-slotEmpty" />
            )}
          </div>
        );
      })}
    </div>
  );
}
