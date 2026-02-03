type Props = {
  avatarSrc: string;
  playerName: string;
  canReady: boolean;
  saving: boolean;
  onReady: () => void;
  statusText: string;
};

export default function PlayerCard({
  avatarSrc,
  playerName,
  canReady,
  saving,
  onReady,
  statusText,
}: Props) {
  return (
    <div className="ts2-player">
      <div className="ts2-avatarWrap">
        <div className="ts2-avatarCircle">
          <img className="ts2-avatarImg" src={avatarSrc} alt="avatar" />
        </div>
      </div>

      <div className="ts2-nameRibbon">{playerName}</div>

      <div className="ts2-status">{statusText}</div>

      <button
        className={`ts2-readyBtn ${canReady ? "" : "is-disabled"}`}
        onClick={onReady}
        disabled={!canReady || saving}
        type="button"
      >
        {saving ? "saving..." : "ready"}
      </button>
    </div>
  );
}
