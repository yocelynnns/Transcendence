import InventoryGrid from "./inventoryGrid";
import TeamSlots from "./teamSlots";
import PlayerCard from "./playerCard";
import type { Pokemon } from "./types";
import "./teamSelect.css";

type Props = {
  inventory: Pokemon[];
  usedIds: Set<string>;
  onPick: (p: Pokemon) => void;

  slots: (Pokemon | null)[];
  activeSlot: number;
  setActiveSlot: (i: number) => void;
  onRemoveSlot: (idx: number) => void;

  timeLeft: number;
  msg: string | null;

  playerName: string;
  avatarSrc: string;

  canReady: boolean;
  saving: boolean;
  onReady: () => void;
};

export default function TeamSelectLayout({
  inventory,
  usedIds,
  onPick,
  slots,
  activeSlot,
  setActiveSlot,
  onRemoveSlot,
  timeLeft,
  msg,
  playerName,
  avatarSrc,
  canReady,
  saving,
  onReady,
}: Props) {
  return (
    <div className="ts-page">
      <div className="ts-shell">
        <div className="ts-invFrame">
          <div className="ts-invHeader">
            <div>
              <div className="ts-title">Choose Your Team</div>
              <div className="ts-sub">Pick 3 Pokémon from your inventory.</div>
            </div>

            <div className={`ts-timer ${timeLeft <= 10 ? "danger" : ""}`}>
              <span className="ts-timerLabel">TIME</span>
              <span className="ts-timerNum">{timeLeft}s</span>
            </div>
          </div>

          <InventoryGrid
            inventory={inventory}
            usedIds={usedIds}
            onPick={onPick}
            disabled={timeLeft === 0}
          />

          <TeamSlots
            slots={slots}
            activeSlot={activeSlot}
            setActiveSlot={setActiveSlot}
            onRemoveSlot={onRemoveSlot}
            msg={msg}
          />
        </div>

        <div className="ts-right">
          <PlayerCard
            avatarSrc={avatarSrc}
            playerName={playerName}
            canReady={canReady}
            saving={saving}
            onReady={onReady}
          />
        </div>
      </div>
    </div>
  );
}
