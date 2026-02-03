import InventoryGrid from "./inventoryGrid";
import TeamSlots from "./teamSlots";
import PlayerCard from "./playerCard";
import "./styles/index.css";
import { PlayerPokemon } from "../../types/pokemonTypes";

type Props = {
  inventory: PlayerPokemon[];
  usedIds: Set<string>;
  onPick: (p: PlayerPokemon) => void;

  slots: (PlayerPokemon | null)[];
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

  enemyReady: boolean;
  waitingForEnemy: boolean;
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
  enemyReady,
  waitingForEnemy,
}: Props) {
  const statusText =
    waitingForEnemy ? "Waiting for opponent..." : enemyReady ? "Enemy is ready!" : "Select your team before battle.";

  return (
    <div className="ts2-page">
      <div className="ts2-stage">
        {/* LEFT WHITE BOARD */}
        <section className="ts2-board" aria-label="Choose your team">
          <header className="ts2-banner">
            <div className="ts2-bannerText">CHOOSE YOUR TEAM!</div>
            <div className={`ts2-timerPill ${timeLeft <= 10 ? "is-danger" : ""}`}>
              <span className="ts2-timerNum">{timeLeft}</span>
              <span className="ts2-timerUnit">s</span>
            </div>
          </header>

          <div className="ts2-invArea">
            <InventoryGrid
              inventory={inventory}
              usedIds={usedIds}
              onPick={onPick}
              disabled={timeLeft === 0 || waitingForEnemy || saving}
            />
          </div>

          <footer className="ts2-teamRow">
            <div className="ts2-teamLabel">Team:</div>
            <TeamSlots
              slots={slots}
              activeSlot={activeSlot}
              setActiveSlot={setActiveSlot}
              onRemoveSlot={onRemoveSlot}
              msg={msg}
            />
          </footer>

          {/* small toast message */}
          {msg && <div className="ts2-toast">{msg}</div>}
        </section>

        {/* RIGHT BLUE CARD */}
        <aside className="ts2-rightCard" aria-label="Player panel">
          <PlayerCard
            avatarSrc={avatarSrc}
            playerName={playerName}
            canReady={canReady}
            saving={saving}
            onReady={onReady}
            statusText={statusText}
          />
        </aside>
      </div>
    </div>
  );
}
