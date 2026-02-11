// src/components/teamSelect/playerCard.tsx
type Props = {
  avatarSrc: string;
  playerName: string;
  canReady: boolean;
  saving: boolean;
  onReady: () => void;

  // new (tailwind + ts2 design)
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
    <div className="flex flex-col items-center gap-3.5">
      <div className="w-full grid place-items-center pt-1.5">
        <div className="w-32.5 h-32.5 rounded-full bg-white/25 border-6 border-black/10 grid place-items-center">
          <img
            className="w-27.5 h-27.5 rounded-full object-cover"
            src={avatarSrc}
            alt="avatar"
          />
        </div>
      </div>

      <div className="rounded-lg bg-[#bfe3ff] px-3.5 py-2.5 tracking-[2px] lowercase text-black/70 border-3 border-black/10">
        {playerName}
      </div>

      <div className="text-center text-[11px] leading-[1.35] text-black/65 px-2">
        {statusText}
      </div>

      <button
        type="button"
        onClick={onReady}
        disabled={!canReady || saving}
        className={[
          "w-[85%] rounded-[10px] border-3 border-black/10 px-2.5 py-3",
          "tracking-[2px] lowercase shadow-[inset_0_-3px_0_rgba(0,0,0,.12)]",
          "transition-[filter] hover:brightness-[1.03]",
          canReady && !saving ? "bg-[#bfeab9] text-black/70 cursor-pointer" : "bg-[#bfeab9] text-black/70 opacity-55 cursor-not-allowed",
        ].join(" ")}
      >
        {saving ? "saving..." : "ready"}
      </button>
    </div>
  );
}
