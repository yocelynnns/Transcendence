import { useEffect, useState, Dispatch, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../ws/useGameSocket";

import StatusPanel from "../components/Battle/StatusPanel";
import MenuBar from "../components/Battle/MenuBar";
import PixelButton from "../components/elements/PixelButton";

import { getPokemonIcon, getPokemonGifPath } from "../assets/helpers";
import { getPlayerOtherPokemons, getAliveCount } from "../utils/battleUtils";

import type { Battle, BattlePokemon } from "../types/battleTypes";
import type { AvatarData } from "../types/avatarTypes";
import EnemyDontMoveOverlay from "../components/Battle/enemyDontMove";

interface BattlePageProps {
  avatarData: AvatarData | null | undefined;
  currentBattle: Battle | null;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
}

const MOVE_TIMEOUT = 30_000;

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

    // init + listen
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

export default function BattlePage({
  avatarData,
  currentBattle,
  setCurrentBattle,
}: BattlePageProps) {
  const navigate = useNavigate();
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});
  const myAvatarId = avatarData?._id;
  const [battleData, setBattleData] = useState<Battle | null>(null);
  const [moveTimeLeft, setMoveTimeLeft] = useState<number>(MOVE_TIMEOUT);
  const [enemyDontMove, setenemyDontMove] = useState(false);
  const [battleId, setBattleId] = useState<string | undefined>(undefined);

  const activeBattleRef = useRef(currentBattle);

  useEffect(() => {
    if (!currentBattle) return ;
    activeBattleRef.current = currentBattle;
    setBattleData(activeBattleRef.current);
    setBattleId(currentBattle?._id);
  }, [currentBattle]);

  const isPortrait = useIsPortrait();

  const myRole: "player1" | "player2" | null =
    battleData && myAvatarId
      ? String(battleData.player1._id) === String(myAvatarId)
        ? "player1"
        : String(battleData.player2._id) === String(myAvatarId)
        ? "player2"
        : null
      : null;

  // socket updates
  useEffect(() => {
    if (!subscribeEvent || !battleId) return;

    const unsubUpdateState = subscribeEvent<Battle>(
      "updateBattleState",
      (updatedBattle) => {
        if (updatedBattle._id !== battleId) return;

        setBattleData((prev) => {
          if (!prev) return prev;
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
      () => {
        setenemyDontMove(true);
        setCurrentBattle(null);
      }
    );

    return () => {
      unsubUpdateState?.();
      unsubBattleError?.();
    };
  }, [subscribeEvent, battleId, navigate, setCurrentBattle]);

  // timer
  useEffect(() => {
    if (!battleData || !myRole || battleData.endedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const lastTurnString =
        battleData.currentTurn === "player1"
          ? battleData.lastPlayer1Turn
          : battleData.lastPlayer2Turn;

      if (!lastTurnString) return;

      const lastTurnTime = new Date(lastTurnString).getTime(); // convert string to Date

      const timeLeft = MOVE_TIMEOUT - (now - lastTurnTime);
      setMoveTimeLeft(timeLeft > 0 ? timeLeft : 0);
    }, 250);

    return () => clearInterval(interval);
  }, [battleData, myRole]);

  if (!battleId)
    return <p className="text-center text-white font-pixel">Invalid battle</p>;
  if (!battleData || !myRole)
    return <p className="text-center text-white font-pixel">Loading battle…</p>;

  const playerPokemons =
    myRole === "player1" ? battleData.pokemon1 : battleData.pokemon2;
  const enemyPokemons =
    myRole === "player1" ? battleData.pokemon2 : battleData.pokemon1;

  const activePlayerIndex = Math.min(
    myRole === "player1" ? battleData.active1 ?? 0 : battleData.active2 ?? 0,
    Math.max(0, playerPokemons.length - 1)
  );

  const activeEnemyIndex = Math.min(
    myRole === "player1" ? battleData.active2 ?? 0 : battleData.active1 ?? 0,
    Math.max(0, enemyPokemons.length - 1)
  );

  const activePlayerPokemon = playerPokemons[activePlayerIndex] ?? null;
  const activeEnemyPokemon = enemyPokemons[activeEnemyIndex] ?? null;

  if (!activePlayerPokemon || !activeEnemyPokemon) {
    return <p className="text-center text-white font-pixel">Loading battle…</p>;
  }

  const otherPlayerPokemons = getPlayerOtherPokemons(
    playerPokemons,
    activePlayerIndex
  );

  const activePlayerIsDead =
    activePlayerPokemon.isDead || (activePlayerPokemon.currentHp ?? 0) <= 0;

  const isMyTurn = battleData.currentTurn === myRole;

  const battleResult = battleData.endedAt
    ? battleData.winner === myRole
      ? "win"
      : "lose"
    : null;

  // forceSwitch overrides "waiting"
  const aliveMine = getAliveCount(playerPokemons);
  const forceSwitch = !battleResult && activePlayerIsDead && aliveMine > 0;
  const waiting = (!isMyTurn || !!battleResult) && !forceSwitch;

  const handleSwitchPlayerPokemon = (index: number, forced: boolean) => {
    if (!isMyTurn && !forced) return;

    const chosen = playerPokemons[index];
    if (!chosen) return;
    if (chosen.isDead || (chosen.currentHp ?? 0) <= 0) return;

    emitEvent("playerAction", {
      battleId,
      action: {
        type: forced ? "forcedswitch" : "switch",
        payload: { newIndex: index },
      },
      isPlayer1: myRole === "player1",
    });
  };

  const handleAttack = () => {
    if (!isMyTurn) return;
    if (forceSwitch) return;
    if (activePlayerIsDead) return;

    emitEvent("playerAction", {
      battleId,
      action: { type: "attack" },
      isPlayer1: myRole === "player1",
      attackerActiveIndex: activePlayerIndex,
      defenderActiveIndex: activeEnemyIndex,
    });
  };

  const handleSurrender = () => {
    emitEvent("playerAction", {
      battleId,
      action: { type: "surrender" },
      isPlayer1: myRole === "player1",
    });
  };

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
          <div className="relative h-full w-full [image-rendering:pixelated]">
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

            {/* Timer / waiting */}
            {!battleResult && (
              <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-white text-[clamp(12px,1.6vw,18px)]">
                {isMyTurn
                  ? `Time left: ${Math.ceil(moveTimeLeft / 1000)}s`
                  : "Waiting for opponent..."}
              </div>
            )}

            {/* Force switch overlay */}
            {forceSwitch && (
              <div className="absolute inset-0 z-50">
                <div className="absolute inset-0 bg-black/60" />

                <div className="absolute bottom-0 left-0 w-full pb-[clamp(14px,2vh,24px)]">
                  <div
                    className={[
                      "mx-auto w-[min(980px,96vw)]",
                      "rounded-[28px] border-[6px] border-[#2f2f2f]",
                      "bg-[#e9e6d7] shadow-[0_14px_0_0_rgba(0,0,0,0.35)]",
                      "overflow-hidden",
                    ].join(" ")}
                  >
                    <div className="px-[clamp(14px,2.4vw,28px)] py-[clamp(10px,2vh,18px)] border-b-4 border-[#2f2f2f] bg-[#d9d4c2]">
                      <div className="pixelify-sans text-[#1f1f1f] font-bold text-[clamp(18px,2.2vw,28px)]">
                        Your Pokémon fainted! Choose a new one
                      </div>
                      <div className="pixelify-sans text-[#3a3a3a] text-[clamp(12px,1.4vw,16px)]">
                        Tap a living Pokémon to continue the battle.
                      </div>
                    </div>

                    <div className="px-[clamp(14px,2.4vw,28px)] py-[clamp(12px,2.2vh,22px)]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[clamp(10px,1.6vw,16px)]">
                        {playerPokemons.map((p, idx) => {
                          const alive =
                            !p.isDead && (p.currentHp ?? 0) > 0;
                          if (!alive) return null;

                          const hpPct =
                            p.maxHp > 0
                              ? Math.round(
                                  ((p.currentHp ?? 0) / p.maxHp) * 100
                                )
                              : 0;

                          return (
                            <button
                              key={p.pokemonId || idx}
                              onClick={() =>
                                handleSwitchPlayerPokemon(idx, true)
                              }
                              className={[
                                "relative text-left select-none",
                                "rounded-[18px] border-4 border-[#2f2f2f]",
                                "bg-[#f6f3e6]",
                                "px-4 py-3",
                                "hover:brightness-95 active:translate-y-px",
                                "transition",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-[clamp(52px,6vw,76px)] h-[clamp(52px,6vw,76px)] rounded-[14px] border-[3px] border-[#2f2f2f] bg-white flex items-center justify-center">
                                  <img
                                    src={getPokemonIcon(
                                      p.name,
                                      p.type,
                                      p.is_shiny
                                    )}
                                    className="w-[85%] h-[85%] [image-rendering:pixelated]"
                                    draggable={false}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="pixelify-sans font-bold text-[#1f1f1f] text-[clamp(14px,1.6vw,20px)] truncate">
                                    {p.name}
                                    {p.is_shiny ? " ✨" : ""}
                                  </div>

                                  <div className="mono-font text-[#2f2f2f] text-[clamp(12px,1.3vw,16px)]">
                                    HP {p.currentHp}/{p.maxHp}
                                  </div>

                                  <div className="mt-2 h-2.5 rounded-full border-2 border-[#2f2f2f] bg-white overflow-hidden">
                                    <div
                                      className="h-full bg-[#3fbf5a]"
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(100, hpPct)
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="pixelify-sans font-bold text-[#2f2f2f] text-[clamp(16px,1.8vw,22px)]">
                                  ▶
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {enemyDontMove && (
              <EnemyDontMoveOverlay
                result={isMyTurn ? "lose" : "win"}
                onHome={() => {
                  emitEvent("playerReturnedHome", { avatarId: myAvatarId }); 
                  setCurrentBattle(null);
                  navigate("/");
                }}
                onMatching={() => {
                  emitEvent("playerReturnedHome", { avatarId: myAvatarId }); 
                  setCurrentBattle(null);
                  navigate("/matching");
                }}
              />
            )}


            {/* Result overlay */}
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
                      {battleResult === "win" ? "YOU WON!!!" : "YOU LOST!!!"}
                    </h1>

                    <p className="mt-3 pixelify-sans text-[#3b3b3b] text-[clamp(14px,1.6vw,18px)]">
                      {battleData?.winnerReason
                        ? battleData.winnerReason
                        : "Battle finished."}
                    </p>
                  </div>

                  <div className="my-5 h-0.5 w-full bg-black/10" />

                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div className="w-37.5">
                    <PixelButton
                      height={56}
                      width={"100%"}
                      onClick={() => {
                        emitEvent("playerReturnedHome", { avatarId: myAvatarId }); 
                        setCurrentBattle(null);
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

                    <div className="w-42.5">
                      <PixelButton
                        height={56}
                        width={"100%"}
                        onClick={() => {
                          emitEvent("playerReturnedHome", { avatarId: myAvatarId }); 
                          setCurrentBattle(null);

                          emitEvent("requestRematch", {
                            battleId,
                            requesterId: myAvatarId,
                          });

                          navigate("/matching");
                        }}
                        cursorPointer
                        hoverScale={1.03}
                        colorA={battleResult === "win" ? "#2E8B57" : "#1E63FF"}
                        colorB={battleResult === "win" ? "#1F6A40" : "#164AD0"}
                        colorText="#FFFFFF"
                        textSize="18px"
                      >
                        REMATCH
                      </PixelButton>
                    </div>
                  </div>

                  <div className="mt-5 text-center text-[12px] text-black/45 pixelify-sans">
                    Tip: Rematch sends you back to matchmaking
                  </div>
                </div>
              </div>
            )}

            {/* MenuBar */}
            <div className="absolute bottom-0 left-0 w-full z-40">
              <MenuBar
                currentPokemon={activePlayerPokemon?.name ?? ""}
                pokemon1={otherPlayerPokemons[0] && {
                  icon: getPokemonIcon(
                    otherPlayerPokemons[0].name,
                    otherPlayerPokemons[0].type,
                    otherPlayerPokemons[0].is_shiny
                  ),
                  isDead:
                    otherPlayerPokemons[0].isDead ||
                    (otherPlayerPokemons[0].currentHp ?? 0) <= 0,
                  onClick: () =>
                    handleSwitchPlayerPokemon(
                      playerPokemons.indexOf(otherPlayerPokemons[0]),
                      forceSwitch
                    ),
                }}
                pokemon2={otherPlayerPokemons[1] && {
                  icon: getPokemonIcon(
                    otherPlayerPokemons[1].name,
                    otherPlayerPokemons[1].type,
                    otherPlayerPokemons[1].is_shiny
                  ),
                  isDead:
                    otherPlayerPokemons[1].isDead ||
                    (otherPlayerPokemons[1].currentHp ?? 0) <= 0,
                  onClick: () =>
                    handleSwitchPlayerPokemon(
                      playerPokemons.indexOf(otherPlayerPokemons[1]),
                      forceSwitch
                    ),
                }}
                onAttack={handleAttack}
                onSurrender={handleSurrender}
                waiting={waiting}
                forceSwitch={forceSwitch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
