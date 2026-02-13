// frontend/src/components/race/RaceTrack.tsx
import React from "react";

interface Player {
  id: string;
  name: string;
  position: number;
  sprite: string;
}

interface RaceTrackProps {
  players: Player[];
  started: boolean;
  winner: string | null;
  compact: boolean;
  onClose: () => void; // <-- new prop for X button
}

const RaceTrack: React.FC<RaceTrackProps> = ({ players, started, winner, compact, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#677fb4] p-15">
        {/* Close button */}
        <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-black bg-[#e9e6d7] border-2 border-black font-black px-2 py-1 hover:bg-[#d6d0b7] transition-colors"
        >
        ✕
        </button>

        {/* Messages (closer to top, no border) */}
        <div className="w-full max-w-350 mb-2 text-center">
        {!started && !winner && (
            <div className="bg-[#e9e6d7] p-2 text-lg text-black mx-auto rounded">
            ⏳ WAITING FOR ANOTHER PLAYER...
            </div>
        )}

        {winner && (
            <div className="bg-[#d6f5df] p-3 text-2xl sm:text-3xl font-black text-black mx-auto rounded">
            🎉 {winner} WINS! 🏆
            </div>
        )}

        {started && !winner && (
            <div className="bg-[#e9e6d7] p-2 text-lg text-black font-black mx-auto rounded">
            GOO!! MASH <span className="font-black">SPACE</span> TO MOVE! 🚀
            </div>
        )}
        </div>

        {/* Fullscreen Track */}
        <div className="flex-1 w-full overflow-y-auto mt-1 px-2">
        {players.map((p) => (
            <div
            key={p.id}
            className={`relative overflow-hidden border-4 border-black bg-[#7fa3c7] mb-3 ${
                compact ? "h-16.5" : "h-24"
            }`}
            >
            {/* Track pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25) 2px, transparent 2px, transparent 24px)",
                }}
            />

            {/* Finish line */}
            {p.position < 100 && (
                <div className="absolute left-[95%] top-1/2 -translate-y-1/2 z-15">
                <img
                    src="/assets/race/finish-line.png"
                    alt="finish"
                    className={`${compact ? "w-7 h-7" : "w-10 h-10"} object-contain`}
                    style={{ imageRendering: "pixelated" }}
                    draggable={false}
                />
                </div>
            )}

            {/* Player name & % */}
            <div
                className={`absolute left-2 top-2 z-5 border-2 border-black bg-[#e9e6d7] px-2 py-0.5 text-black font-black ${
                compact ? "text-[11px]" : "text-[12px] sm:text-[14px]"
                }`}
            >
                {p.name}
            </div>

            <div
                className={`absolute right-2 top-2 z-5 border-2 border-black bg-[#e9e6d7] px-2 py-0.5 text-black font-black ${
                compact ? "text-[11px]" : "text-[12px] sm:text-[14px]"
                }`}
            >
                {Math.floor(p.position)}%
            </div>

            {/* Progress bar */}
            <div className="absolute left-2 right-2 bottom-2 z-6">
                <div className="h-2.5 border-2 border-black bg-white overflow-hidden">
                <div
                    className="h-full bg-[#2ecc71]"
                    style={{ width: `${Math.max(0, Math.min(100, p.position))}%` }}
                />
                </div>
            </div>

            {/* Player sprite */}
            <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-out z-10"
                style={{ left: `${p.position * 0.92}%` }}
            >
                <img
                src={p.sprite}
                alt={p.name}
                className={`object-contain block ${compact ? "w-12 h-12" : "w-20 h-20"}`}
                style={{ imageRendering: "pixelated" }}
                draggable={false}
                />
            </div>
            </div>
        ))}
        </div>

        {/* Footer: controls */}
        <div className="w-full text-center mt-3 text-black/75 text-[11px] sm:text-xs">
        Controls: <span className="font-black">SPACE</span>
        </div>
    </div>
    );


};

export default RaceTrack;