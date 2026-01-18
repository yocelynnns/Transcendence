import { getPokemonIcon } from "../../utils/pathFetcher";
import type { Pokemon } from "./types";

type Props = {
  slots: (Pokemon | null)[];
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
  msg,
}: Props) {
  return (
    <div className="ts-slotBar">
      <div className="ts-slotLabel">Your Team</div>

      <div className="ts-slots">
        {slots.map((p, idx) => {
          const active = idx === activeSlot;
          const icon = p ? getPokemonIcon(p as any) : null;

          return (
            <div
              key={idx}
              className={`ts-slot ${active ? "active" : ""}`}
              onClick={() => setActiveSlot(idx)}
              role="button"
              tabIndex={0}
            >
              {!p ? (
                <div className="ts-emptyBall" />
              ) : (
                <>
                  <img className="ts-slotIcon" src={icon!} alt={p.name} />
                  <button
                    className="ts-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSlot(idx);
                    }}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {msg && <div className="ts-msg">{msg}</div>}
    </div>
  );
}
