// src/components/teamSelect/teamSelectLayout.tsx
import { useEffect, useMemo, useState } from "react";
import InventoryGrid from "./inventoryGrid";
import TeamSlots from "./teamSlots";
import PlayerCard from "./playerCard";
import type { PlayerPokemon } from "../../types/pokemonTypes";

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

  waitingForEnemy?: boolean;
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
  waitingForEnemy,
}: Props) {
  const statusText = waitingForEnemy
    ? "Waiting for opponent..."
    : "Select your team before battle.";

  const urgent = timeLeft <= 10;

  // Designed desktop canvas size
  const BASE_WIDTH = 1100;
  const BASE_HEIGHT = 620;

  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scale down only (never scale up)
  const scale = useMemo(() => {
    const pad = 24;
    const sx = (viewport.w - pad) / BASE_WIDTH;
    const sy = (viewport.h - pad) / BASE_HEIGHT;
    return Math.max(0.45, Math.min(1, sx, sy));
  }, [viewport.w, viewport.h]);

  return (
    <div
      className={[
        "fixed inset-0 overflow-hidden",
        "font-[PokemonGB]",
        "bg-[#cfcfcf]",
        "bg-[linear-gradient(rgba(255,255,255,.10),rgba(255,255,255,.10)),repeating-linear-gradient(0deg,rgba(0,0,0,.08)_0,rgba(0,0,0,.08)_1px,transparent_1px,transparent_26px),repeating-linear-gradient(90deg,rgba(0,0,0,.08)_0,rgba(0,0,0,.08)_1px,transparent_1px,transparent_26px)]",
      ].join(" ")}
    >
      {/* Center the whole canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Scaled canvas */}
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `translate(-10px, 80px) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <div className="w-full h-full grid grid-cols-[1fr_320px] gap-7 items-start">
            {/* LEFT WHITE BOARD */}
            <section
              className="relative rounded-[10px] border-4 border-black/10 bg-[#f7f7f7] px-4.5 pt-4.5 pb-4 shadow-[0_18px_40px_rgba(0,0,0,.25)]"
              aria-label="Choose your team"
            >
              {/* Banner */}
              <header className="flex items-center justify-between gap-3.5 mb-3.5">
                <div className="rounded-lg bg-[#7db6d6] px-4.5 py-3.5 text-white uppercase tracking-[2px] text-[20px] shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]">
                  CHOOSE YOUR TEAM!
                </div>

                <div
                  className={[
                    "rounded-full border-3 px-3.5 py-2.5 flex items-baseline gap-1.5",
                    urgent
                      ? "bg-[rgba(215,90,90,.18)] border-[rgba(215,90,90,.55)] animate-[pulse_1s_infinite]"
                      : "bg-black/10 border-black/20",
                  ].join(" ")}
                >
                  <span className={urgent ? "text-[#b02222]" : "text-black/80"}>
                    {timeLeft}
                  </span>
                  <span className={urgent ? "text-[#b02222]/80" : "text-black/60"}>
                    s
                  </span>
                </div>
              </header>

              {/* Inventory */}
              <div className="rounded-lg border-4 border-black/10 bg-[#eaeaea] p-3.5">
                <InventoryGrid
                  inventory={inventory}
                  usedIds={usedIds}
                  onPick={onPick}
                  disabled={timeLeft === 0 || saving || waitingForEnemy}
                />
              </div>

              {/* Team row */}
              <footer className="mt-3.5 rounded-lg border-4 border-black/10 bg-[#efefef] px-3.5 py-3 flex items-center gap-3.5">
                <div className="text-[#4f6f7f] text-[20px] tracking-[2px] capitalize">
                  Team:
                </div>

                <TeamSlots
                  slots={slots}
                  activeSlot={activeSlot}
                  setActiveSlot={setActiveSlot}
                  onRemoveSlot={onRemoveSlot}
                  msg={msg}
                />
              </footer>

              {msg && (
                <div className="absolute left-4.5 -bottom-10.5 rounded-[10px] bg-black/70 px-3 py-2.5 text-white text-[12px] max-w-[280px]">
                  {msg}
                </div>
              )}
            </section>

            {/* RIGHT CARD */}
            <aside className="rounded-[10px] border-4 border-black/10 bg-[#79aecd] px-4 py-4.5 shadow-[0_18px_40px_rgba(0,0,0,.25)]">
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
      </div>
    </div>
  );
}
