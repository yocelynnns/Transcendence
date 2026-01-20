type Props = {
  avatarSrc: string;
  playerName: string;
  canReady: boolean;
  saving: boolean;
  onReady: () => void;
};

export default function PlayerCard({
  avatarSrc,
  playerName,
  canReady,
  saving,
  onReady,
}: Props) {
  return (
    <div className="ts-playerCard">
      <div className="ts-avatarRing">
        <img className="ts-avatar" src={avatarSrc} alt="avatar" />
      </div>

      <div className="ts-playerName">{playerName}</div>
      <div className="ts-playerHint">Select your team before battle.</div>

      <button
        className={`ts-ready ${canReady ? "" : "disabled"}`}
        onClick={onReady}
        disabled={!canReady || saving}
      >
        {saving ? "SAVING..." : "READY!"}
      </button>

      <div className="ts-note">Tip: click a slot, then click a Pokémon to fill it.</div>
    </div>
  );
}
