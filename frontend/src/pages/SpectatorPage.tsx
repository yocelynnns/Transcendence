// src/pages/SpectatorPage.tsx
import { useEffect, useRef, useState, Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";

import StatusPanel from "../components/Battle/StatusPanel";
import PixelButton from "../components/elements/PixelButton";

import { getPokemonGifPath } from "../assets/helpers";
import { getAliveCount } from "../utils/battleUtils";

import type { Battle, BattlePokemon } from "../types/battleTypes";

interface SpectatorPageProps {
  spectatingBattle: Battle | null;
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;
}

function normalizeTeam(team: BattlePokemon[] = []) {
  return team.map((p) => {
    const hp = Math.max(0, p.currentHp ?? 0);
    return {
      ...p,
      currentHp: hp,
      isDead: !!p.isDead || hp <= 0,
    };
  });
}

function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(orientation: portrait)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(orientation: portrait)");
    const onChange = () => setIsPortrait(mq.matches);

    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return isPortrait;
}

export default function SpectatorPage({
  spectatingBattle,
  setSpectatingBattle,
}: SpectatorPageProps) {
  const navigate = useNavigate();
  const { battleId: battleIdFromUrl } = useParams();
  const { subscribeEvent } = useGameSocket(() => {});

  const [battleData, setBattleData] = useState<Battle | null>(spectatingBattle);
  const [loading, setLoading] = useState<boolean>(!spectatingBattle);
  const [povPlayer1, setPovPlayer1] = useState<boolean>(true);

  const isPortrait = useIsPortrait();

  // Keep a stable battleId (prefer props, fallback to URL)
  const battleId = (battleData?._id || battleIdFromUrl) ?? undefined;

  // Mirror "active battle ref" style (prevents stale state usage patterns later)
  const activeBattleRef = useRef<Battle | null>(spectatingBattle);
  useEffect(() => {
    activeBattleRef.current = spectatingBattle;
    if (spectatingBattle) setBattleData(spectatingBattle);
  }, [spectatingBattle]);

  // Fetch battle if not provided
  useEffect(() => {
    if (battleData || !battleIdFromUrl) return;

    let cancelled = false;
    setLoading(true);

    fetch(`https://localhost/api/battle/${battleIdFromUrl}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Battle) => {
        if (cancelled) return;

        const normalized: Battle = {
          ...data,
          pokemon1: normalizeTeam(data.pokemon1),
          pokemon2: normalizeTeam(data.pokemon2),
          active1: data.active1 ?? 0,
          active2: data.active2 ?? 0,
          currentTurn: data.currentTurn ?? "player1",
        };

        setBattleData(normalized);
        setSpectatingBattle(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Failed to fetch battle:", err);
        if (cancelled) return;
        setLoading(false);
        setSpectatingBattle(null);
        navigate("/");
      });

    return () => {
      cancelled = true;
    };
  }, [battleData, battleIdFromUrl, navigate, setSpectatingBattle]);

  // Socket updates (match BattlePage structure/merge)
  useEffect(() => {
    if (!subscribeEvent || !battleId) return;

    const unsubUpdateState = subscribeEvent<Battle>(
      "updateBattleState",
      (updatedBattle) => {
        if (String(updatedBattle._id) !== String(battleId)) return;

        setBattleData((prev) => {
          if (!prev) {
            return {
              ...updatedBattle,
              pokemon1: normalizeTeam(updatedBattle.pokemon1),
              pokemon2: normalizeTeam(updatedBattle.pokemon2),
              active1: updatedBattle.active1 ?? 0,
              active2: updatedBattle.active2 ?? 0,
              currentTurn: updatedBattle.currentTurn ?? "player1",
            };
          }

          return {
            ...prev,
            ...updatedBattle,
            pokemon1: normalizeTeam(updatedBattle.pokemon1),
            pokemon2: normalizeTeam(updatedBattle.pokemon2),
            active1: updatedBattle.active1 ?? prev.active1 ?? 0,
            active2: updatedBattle.active2 ?? prev.active2 ?? 0,
            currentTurn: updatedBattle.currentTurn ?? prev.currentTurn,
            lastPlayer1Turn: updatedBattle.lastPlayer1Turn
              ? new Date(updatedBattle.lastPlayer1Turn)
              : prev.lastPlayer1Turn,
            lastPlayer2Turn: updatedBattle.lastPlayer2Turn
              ? new Date(updatedBattle.lastPlayer2Turn)
              : prev.lastPlayer2Turn,
            endedAt: updatedBattle.endedAt ?? prev.endedAt,
            winner: updatedBattle.winner ?? prev.winner,
            winnerReason: updatedBattle.winnerReason ?? prev.winnerReason,
          };
        });
      }
    );

    const unsubBattleError = subscribeEvent<{ battleId: string; message: string }>(
      "battleError",
      (err) => {
        if (String(err.battleId) !== String(battleId)) return;
        // spectator: just return home
        setSpectatingBattle(null);
        navigate("/");
      }
    );

    return () => {
      unsubUpdateState?.();
      unsubBattleError?.();
    };
  }, [subscribeEvent, battleId, navigate, setSpectatingBattle]);

  if (!battleId) {
    return <p className="text-center text-white font-pixel">Invalid battle</p>;
  }

  if (loading || !battleData) {
    return <p className="text-center text-white font-pixel">Loading battle…</p>;
  }

  // POV-based swap (same logic as your old spectator, but safer indexes like BattlePage)
  const playerPokemons = povPlayer1 ? battleData.pokemon1 : battleData.pokemon2;
  const enemyPokemons = povPlayer1 ? battleData.pokemon2 : battleData.pokemon1;

  const activePlayerIndex = Math.min(
    povPlayer1 ? battleData.active1 ?? 0 : battleData.active2 ?? 0,
    Math.max(0, playerPokemons.length - 1)
  );

  const activeEnemyIndex = Math.min(
    povPlayer1 ? battleData.active2 ?? 0 : battleData.active1 ?? 0,
    Math.max(0, enemyPokemons.length - 1)
  );

  const activePlayerPokemon = playerPokemons[activePlayerIndex] ?? null;
  const activeEnemyPokemon = enemyPokemons[activeEnemyIndex] ?? null;

  if (!activePlayerPokemon || !activeEnemyPokemon) {
    return <p className="text-center text-white font-pixel">Loading battle…</p>;
  }

  const povRole: "player1" | "player2" = povPlayer1 ? "player1" : "player2";

  const battleResult = battleData.endedAt
    ? battleData.winner === povRole
      ? "win"
      : "lose"
    : null;

  const platformImg = "/assets/bg/dry_platform_enemy.png";

  return (
    <div className="fixed inset-0 bg-black font-pixel overflow-hidden">
      {/* ROTATE WRAPPER (portrait support) */}
      <div
        className={[
          "absolute left-1/2 top-1/2",
          "[-webkit-tap-highlight-color:transparent]",
          isPortrait
            ? "h-[100vw] w-[100vh] -translate-x-1/2 -translate-y-1/2 rotate-90 origin-center"
            : "h-screen w-screen -translate-x-1/2 -translate-y-1/2",
        ].join(" ")}
      >
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/assets/bg/background.png)` }}
        >
          {/* ✅ DO NOT translate this wrapper */}
          <div className="relative h-full w-full [image-rendering:pixelated]">
            {/* Bottom controls (stay anchored correctly) */}
            <div className="absolute left-0 right-0 bottom-[clamp(40px,6vh,90px)] z-50 px-3">
              <div className="mx-auto w-[min(980px,96vw)] flex items-center justify-between gap-3">
                <div className="w-[140px]">
                  <PixelButton
                    height={44}
                    width={"100%"}
                    onClick={() => {
                      setSpectatingBattle(null);
                      navigate("/");
                    }}
                    cursorPointer
                    hoverScale={1.02}
                    colorA="#6B6B6B"
                    colorB="#4F4F4F"
                    colorText="#FFFFFF"
                    textSize="16px"
                  >
                    HOME
                  </PixelButton>
                </div>

                <div className="rounded bg-black/60 px-3 py-1 text-white text-[clamp(12px,1.6vw,18px)]">
                  Spectating • POV: {povPlayer1 ? "Player 1" : "Player 2"}
                </div>

                <div className="w-[160px]">
                  <PixelButton
                    height={44}
                    width={"100%"}
                    onClick={() => setPovPlayer1((p) => !p)}
                    cursorPointer
                    hoverScale={1.02}
                    colorA="#1E63FF"
                    colorB="#164AD0"
                    colorText="#FFFFFF"
                    textSize="16px"
                  >
                    SWAP POV
                  </PixelButton>
                </div>
              </div>
            </div>

            {/* ✅ SHIFT ONLY THE SCENE (HP + sprites) */}
            <div className="absolute inset-0 translate-y-[clamp(20px,4vh,60px)]">
              {/* Enemy HP */}
              <div className="absolute left-[clamp(12px,3vw,48px)] top-[clamp(12px,3vw,48px)] w-[clamp(260px,38vw,520px)] z-20">
                <StatusPanel
                  pokemon={activeEnemyPokemon}
                  isPlayer={false}
                  aliveCount={getAliveCount(enemyPokemons)}
                />
              </div>

              {/* Enemy platform + sprite */}
              <div className="absolute right-[clamp(24px,6vw,100px)] top-[clamp(100px,16vh,170px)] z-40">
                <img
                  src={platformImg}
                  className="w-[clamp(220px,28vw,420px)] [image-rendering:pixelated]"
                  draggable={false}
                />
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[65%] w-[clamp(120px,14vw,190px)] h-[clamp(120px,14vw,190px)] flex items-end justify-center">
                  <img
                    src={getPokemonGifPath(
                      activeEnemyPokemon.name,
                      activeEnemyPokemon.type,
                      activeEnemyPokemon.is_shiny,
                      false
                    )}
                    className="max-h-full max-w-full [image-rendering:pixelated]"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Player platform + sprite */}
              <div className="absolute left-[clamp(16px,5vw,80px)] bottom-[clamp(120px,22vh,210px)] z-10">
                <img
                  src={platformImg}
                  className="w-[clamp(260px,34vw,520px)] [image-rendering:pixelated]"
                  draggable={false}
                />
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[65%] w-[clamp(150px,18vw,240px)] h-[clamp(150px,18vw,240px)] flex items-end justify-center">
                  <img
                    src={getPokemonGifPath(
                      activePlayerPokemon.name,
                      activePlayerPokemon.type,
                      activePlayerPokemon.is_shiny,
                      true
                    )}
                    className="max-h-full max-w-full [image-rendering:pixelated]"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Player HP */}
              <div className="absolute right-[clamp(12px,3vw,48px)] bottom-[clamp(170px,26vh,250px)] w-[clamp(260px,38vw,520px)] z-30">
                <StatusPanel
                  pokemon={activePlayerPokemon}
                  isPlayer={true}
                  aliveCount={getAliveCount(playerPokemons)}
                />
              </div>
            </div>

            {/* Result overlay (NOT shifted now, so it covers perfectly) */}
            {battleResult && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
                <div
                  className={[
                    "relative w-[min(560px,92vw)]",
                    "rounded-[22px] bg-[#f4f1e6] border-[6px] border-[#2b2b2b]",
                    "shadow-[0_18px_0_rgba(0,0,0,0.25)]",
                    "px-6 py-6 sm:px-8 sm:py-7",
                    "select-none",
                  ].join(" ")}
                >
                  <div className="absolute left-4 right-4 top-3 h-1.5 rounded bg-black/10" />

                  <div className="text-center">
                    <h1 className="pixelify-sans font-black leading-none text-[clamp(28px,3.2vw,44px)] text-[#1b1b1b]">
                      {battleResult === "win" ? "PLAYER WON!!!" : "PLAYER LOST!!!"}
                    </h1>

                    <p className="mt-3 pixelify-sans text-[#3b3b3b] text-[clamp(14px,1.6vw,18px)]">
                      {battleData?.winnerReason ? battleData.winnerReason : "Battle finished."}
                    </p>

                    <p className="mt-2 pixelify-sans text-[#3b3b3b] text-[clamp(12px,1.4vw,16px)]">
                      Winner: {battleData.winner}
                    </p>
                  </div>

                  <div className="my-5 h-0.5 w-full bg-black/10" />

                  <div className="flex items-center justify-center">
                    <div className="w-42.5">
                      <PixelButton
                        height={56}
                        width={"100%"}
                        onClick={() => {
                          setSpectatingBattle(null);
                          navigate("/");
                        }}
                        cursorPointer
                        hoverScale={1.03}
                        colorA="#6B6B6B"
                        colorB="#4F4F4F"
                        colorText="#FFFFFF"
                        textSize="18px"
                      >
                        HOME
                      </PixelButton>
                    </div>
                  </div>

                  <div className="mt-5 text-center text-[12px] text-black/45 pixelify-sans">
                    Tip: You can swap POV anytime while spectating
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
