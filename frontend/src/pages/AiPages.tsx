// src/pages/AiPages.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatusPanel from "../components/Battle/StatusPanel";
import MenuBar from "../components/Battle/MenuBar";
import PixelButton from "../components/elements/PixelButton";

import { getPokemonIcon, getPokemonGifPath } from "../assets/helpers";
import { BattlePokemon } from "../types/battleTypes";

import { useBattleLogic } from "../components/ai/aiBattleLogic";
import { AiPokemon } from "../components/ai/aiTypes";

const toBattlePokemon = (p: AiPokemon): BattlePokemon => ({
  pokemonId: p.name,
  name: p.name,
  type: p.type as "grass" | "water" | "normal" | "fire",
  is_shiny: false,
  maxHp: p.stats.maxHp,
  currentHp: p.stats.hp,
  attack: p.stats.atk,
  isDead: p.stats.hp <= 0,
});

export default function AiPages() {
  const navigate = useNavigate();

  const {
    turn,
    playerTeam,
    enemyTeam,
    playerActive,
    enemyActive,
    playerAttack,
    playerSwap,
    isAlive,
    battleResult,
    battleData,
    activePlayerIsDead,
    resetBattle,
  } = useBattleLogic();

  const [surrender, setSurrender] = useState(false);

  const playerPokemon = toBattlePokemon(playerActive);
  const enemyPokemon = toBattlePokemon(enemyActive);

  const aliveMine = useMemo(
    () => playerTeam.filter(isAlive).length,
    [playerTeam, isAlive]
  );

  const aliveEnemy = useMemo(
    () => enemyTeam.filter(isAlive).length,
    [enemyTeam, isAlive]
  );

  const otherPokemons = useMemo(() => {
    return playerTeam
      .map(toBattlePokemon)
      .filter((p) => p.pokemonId !== playerPokemon.pokemonId);
  }, [playerTeam, playerPokemon.pokemonId]);

  const p1 = otherPokemons[0];
  const p2 = otherPokemons[1];

  const forceSwitch = !battleResult && activePlayerIsDead && aliveMine > 0;
  const waiting = turn !== "p1" && !forceSwitch && !battleResult;

  const platformImg = "/assets/bg/dry_platform_enemy.png";

  const handleSurrender = () => setSurrender(true);

  return (
    <div className="fixed inset-0 bg-black font-pixel overflow-hidden">
      {/* background */}
      <div
        className="absolute inset-0 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(/assets/bg/background.png)` }}
      >
        <div className="relative h-full w-full [image-rendering:pixelated]">
          {/* Enemy HP */}
          <div className="absolute left-[clamp(12px,3vw,48px)] top-[clamp(12px,3vw,48px)] w-[clamp(260px,38vw,520px)] z-30">
            <StatusPanel pokemon={enemyPokemon} isPlayer={false} aliveCount={aliveEnemy} />
          </div>

          {/* Enemy team indicators (top-right) */}
          <div className="absolute top-[clamp(12px,3vw,48px)] right-[clamp(12px,3vw,48px)] flex gap-2 z-20">
            {enemyTeam.map((p, idx) => {
              const bp = toBattlePokemon(p);
              const dead = !isAlive(p);
              return (
                <div
                  key={bp.pokemonId || idx}
                  className="relative w-[clamp(40px,5vw,60px)] h-[clamp(40px,5vw,60px)] border-2 border-black rounded-md overflow-hidden bg-[#eaeaea]"
                  style={{ opacity: dead ? 0.4 : 1 }}
                >
                  <img
                    src={getPokemonIcon(bp.name, bp.type, bp.is_shiny)}
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                    draggable={false}
                  />
                  {dead && <div className="absolute inset-0 bg-black/45" />}
                </div>
              );
            })}
          </div>

          {/* Enemy platform + sprite */}
          <div className="absolute right-[clamp(24px,6vw,100px)] top-[clamp(90px,16vh,170px)] z-10">
            <img
              src={platformImg}
              className="w-[clamp(220px,28vw,420px)] [image-rendering:pixelated]"
              draggable={false}
            />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[75%] w-[clamp(140px,16vw,220px)] h-[clamp(140px,16vw,220px)] flex items-end justify-center">
              <img
                src={getPokemonGifPath(enemyPokemon.name, enemyPokemon.type, enemyPokemon.is_shiny, false)}
                className="max-h-full max-w-full [image-rendering:pixelated]"
                draggable={false}
              />
            </div>
          </div>

          {/* Player platform + sprite */}
          <div className="absolute left-[clamp(16px,5vw,80px)] bottom-[clamp(140px,22vh,210px)] z-10">
            <img
              src={platformImg}
              className="w-[clamp(260px,34vw,520px)] [image-rendering:pixelated]"
              draggable={false}
            />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[75%] w-[clamp(180px,20vw,280px)] h-[clamp(180px,20vw,280px)] flex items-end justify-center">
              <img
                src={getPokemonGifPath(playerPokemon.name, playerPokemon.type, playerPokemon.is_shiny, true)}
                className="max-h-full max-w-full [image-rendering:pixelated]"
                draggable={false}
              />
            </div>
          </div>

          {/* Player HP */}
          <div className="absolute right-[clamp(12px,3vw,48px)] bottom-[clamp(170px,26vh,250px)] w-[clamp(260px,38vw,520px)] z-30">
            <StatusPanel pokemon={playerPokemon} isPlayer={true} aliveCount={aliveMine} />
          </div>

          {/* Turn banner */}
          {!battleResult && !surrender && (
            <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-white text-[clamp(12px,1.6vw,18px)]">
              {forceSwitch ? "Choose a new Pokémon!" : turn === "p1" ? "Your turn" : "Enemy thinking..."}
            </div>
          )}

          {/* Forced switch overlay */}
          {forceSwitch && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="w-[min(640px,92vw)] rounded-[22px] bg-[#f4f1e6] border-[6px] border-[#2b2b2b] shadow-[0_18px_0_rgba(0,0,0,0.25)] px-6 py-6 sm:px-8 sm:py-7 select-none">
                <div className="text-center">
                  <div className="pixelify-sans font-black text-[clamp(22px,2.6vw,32px)] text-[#1b1b1b]">
                    YOUR POKÉMON FAINTED!
                  </div>
                  <div className="mt-2 pixelify-sans text-[clamp(14px,1.6vw,18px)] text-black/70">
                    Choose a new one to continue.
                  </div>
                </div>

                <div className="my-5 h-0.5 w-full bg-black/10" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {playerTeam.map((p, idx) => {
                    if (!isAlive(p)) return null;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => playerSwap(idx, true)}
                        className="group relative rounded-2xl border-4 border-[#2b2b2b] bg-white px-4 py-4 flex flex-col items-center gap-2 hover:brightness-95 active:scale-[0.99] transition"
                      >
                        <img
                          src={getPokemonIcon(p.name, p.type, false)}
                          className="w-16 h-16 [image-rendering:pixelated]"
                          draggable={false}
                        />
                        <div className="pixelify-sans font-bold text-[#1b1b1b]">
                          {p.name.toUpperCase()}
                        </div>
                        <div className="pixelify-sans text-sm text-black/60">
                          HP {p.stats.hp}/{p.stats.maxHp}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Result overlay */}
          {(battleResult || surrender) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="w-[min(560px,92vw)] rounded-[22px] bg-[#f4f1e6] border-[6px] border-[#2b2b2b] shadow-[0_18px_0_rgba(0,0,0,0.25)] px-6 py-6 sm:px-8 sm:py-7 select-none">
                <div className="text-center">
                  <div className="pixelify-sans font-black text-[clamp(28px,3.2vw,44px)] text-[#1b1b1b]">
                    {battleResult === "win" ? (
                      <>
                        YOU WON!!!
                      </>
                    ) : (
                      <>
                        YOU LOST!!!
                      </>
                    )}
                  </div>

                  <div className="mt-3 pixelify-sans text-[clamp(14px,1.6vw,18px)] text-black/70">
                    {surrender ? "Surrender" : battleData?.winnerReason ?? ""}
                  </div>
                </div>

                <div className="my-5 h-0.5 w-full bg-black/10" />

                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div className="w-37.5">
                    <PixelButton
                      height={56}
                      width={"100%"}
                      onClick={() => navigate("/")}
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
                        resetBattle();
                        setSurrender(false);
                      }}
                      cursorPointer
                      hoverScale={1.03}
                      colorA="#1E63FF"
                      colorB="#164AD0"
                      colorText="#FFFFFF"
                      textSize="18px"
                    >
                      PLAY AGAIN
                    </PixelButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MenuBar */}
          <div className="absolute bottom-0 left-0 w-full z-40">
            <MenuBar
              currentPokemon={playerPokemon.name}
              pokemon1={
                p1
                  ? {
                      icon: getPokemonIcon(p1.name, p1.type, p1.is_shiny),
                      isDead: p1.isDead || p1.currentHp <= 0,
                      onClick: () => {
                        const idx = playerTeam.findIndex((x) => x.name === p1.name);
                        if (idx >= 0) playerSwap(idx, forceSwitch);
                      },
                    }
                  : undefined
              }
              pokemon2={
                p2
                  ? {
                      icon: getPokemonIcon(p2.name, p2.type, p2.is_shiny),
                      isDead: p2.isDead || p2.currentHp <= 0,
                      onClick: () => {
                        const idx = playerTeam.findIndex((x) => x.name === p2.name);
                        if (idx >= 0) playerSwap(idx, forceSwitch);
                      },
                    }
                  : undefined
              }
              onAttack={() => {
                if (waiting) return;
                if (forceSwitch) return;
                playerAttack();
              }}
              onSurrender={handleSurrender}
              waiting={waiting}
              forceSwitch={forceSwitch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
