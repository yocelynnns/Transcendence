import { useState, useEffect, useCallback } from "react";
import {
  decideNextAction,
} from "./aiDecision";

import {
  aiPokemons,
  AiPokemon,
  typeMultiplier,
} from "./aiTypes";


const isAlive = (p: AiPokemon) => p.stats.hp > 0;

const getRandomTeam = (): AiPokemon[] => {
  const keys = Object.keys(aiPokemons);

  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }

  return keys.slice(0, 3).map((key) => ({
    ...aiPokemons[key],
    stats: { ...aiPokemons[key].stats },
    maxHp: aiPokemons[key].stats.hp,
    maxAtk: aiPokemons[key].stats.atk,
  }));
};

type Turn = "p1" | "p2";
type BattleResult = "win" | "lose" | null;


export function useBattleLogic() {
  const [turn, setTurn] = useState<Turn>("p1");

  const [playerTeam, setPlayerTeam] = useState<AiPokemon[]>(getRandomTeam);
  const [enemyTeam, setEnemyTeam] = useState<AiPokemon[]>(getRandomTeam);

  const [playerIndex, setPlayerIndex] = useState(0);
  const [enemyIndex, setEnemyIndex] = useState(0);

  const [battleResult, setBattleResult] = useState<BattleResult>(null);
  const [battleData, setBattleData] = useState<{ winnerReason?: string }>({});

  const [activePlayerIsDead, setActivePlayerIsDead] = useState<boolean>(false);


  const playerActive = playerTeam[playerIndex];
  const enemyActive = enemyTeam[enemyIndex];


  const attack = useCallback((attacker: AiPokemon, defender: AiPokemon) => {
    const dmg = Math.ceil(
      attacker.stats.atk * typeMultiplier(attacker.type, defender.type)
    );

    return {
      ...defender,
      stats: {
        ...defender.stats,
        hp: Math.max(defender.stats.hp - dmg, 0),
      },
    };
  }, []);

  const resetBattle = () => {
    setPlayerTeam(getRandomTeam());
    setEnemyTeam(getRandomTeam());
    setTurn("p1");
    setBattleResult(null);
  };

  const checkBattleEnd = (
    playerTeam: AiPokemon[],
    enemyTeam: AiPokemon[]
  ) => {
    const playerAlive = playerTeam.some(isAlive);
    const enemyAlive = enemyTeam.some(isAlive);

    if (!playerAlive) {
      setBattleResult("lose");
      setBattleData({ winnerReason: "All your Pokemon fainted!" });
    } else if (!enemyAlive) {
      setBattleResult("win");
      setBattleData({ winnerReason: "All enemy Pokemon fainted!" });
    }
  };

  const playerAttack = () => {
    if (turn !== "p1" || battleResult) return;

    const updatedEnemy = attack(playerActive, enemyActive);
    const team = [...enemyTeam];
    team[enemyIndex] = updatedEnemy;
    setEnemyTeam(team);

    if (!isAlive(updatedEnemy)) {
      const state = {
        playerTeam: enemyTeam,
        opponentTeam: playerTeam,
        playerActive: enemyActive,
        opponentActive: playerActive,
        playerTurn: true,
        playerAlive: enemyTeam.filter(isAlive),
        opponentAlive: playerTeam.filter(isAlive),
      };

      const decision = decideNextAction(state, true);

      if (decision?.action === "swap" && decision.target) {
        const idx = enemyTeam.findIndex(p => p.name === decision.target!.name);
        if (idx !== -1) setEnemyIndex(idx);
      } else {
        const next = team.findIndex(isAlive);
        if (next !== -1) setEnemyIndex(next);
      }
    }

    checkBattleEnd(playerTeam, team);
    setTurn("p2");
  };

  const playerSwap = (index: number, forced:boolean) => {
    if (turn !== "p1" || battleResult) return;
    if (!isAlive(playerTeam[index])) return;

    setPlayerIndex(index);
    if (forced)
    {
      setActivePlayerIsDead(false);
      return;
    } 
    setTurn("p2");
  };


  useEffect(() => {
    if (turn !== "p2" || battleResult) return;
    if (!playerActive || !enemyActive) return;

    const state = {
      playerTeam: enemyTeam,
      opponentTeam: playerTeam,
      playerActive: enemyActive,
      opponentActive: playerActive,
      playerTurn: true,
      playerAlive: enemyTeam.filter(isAlive),
      opponentAlive: playerTeam.filter(isAlive),
    };

    const decision = decideNextAction(state, false);

    setTimeout(() => {
      if (decision.action === "attack") {
        const updatedPlayer = attack(enemyActive, playerActive);
        const team = [...playerTeam];
        team[playerIndex] = updatedPlayer;
        setPlayerTeam(team);

        if (!isAlive(updatedPlayer)) {
          setActivePlayerIsDead(true);
        }

        checkBattleEnd(team, enemyTeam);
      }

      if (decision.action === "swap" && decision.target) {
        const idx = enemyTeam.findIndex(
          (p) => p.name === decision.target!.name
        );
        if (idx !== -1) setEnemyIndex(idx);
      }

      setTurn("p1");
    }, 600);
  }, [
    turn,
    enemyActive,
    playerActive,
    enemyTeam,
    playerTeam,
    playerIndex,
    attack,
    battleResult,
    activePlayerIsDead,
  ]);

  return {
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
  };
}
