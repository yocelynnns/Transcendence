import { AiDecision, AiGameState, AiPokemon, typeMultiplier } from "./aiTypes";


export function decideNextAction(state: AiGameState, forced : boolean): AiDecision {
  const calculateDamage = (attacker: AiPokemon, defender: AiPokemon) => {
    const multiplier = typeMultiplier(attacker.type, defender.type);
    return Math.floor(attacker.stats.atk * multiplier);
  };

  const evaluateMatchup = (attacker: AiPokemon, defender: AiPokemon) => {
    let score = 0;

    const multiplier = typeMultiplier(attacker.type, defender.type);
    score += (multiplier - 1) * 50;

    const damage = calculateDamage(attacker, defender);
    score += damage * 2;

    const opponentDamage = calculateDamage(defender, attacker);
    const turnsToKO = Math.ceil(attacker.stats.hp / opponentDamage);
    score += turnsToKO * 10;

    score += 5;
    return score;
  };

  const getBestSwapOption = (
    currentActive: AiPokemon,
    opponentActive: AiPokemon,
    availableTeam: AiPokemon[]
  ): { pokemon: AiPokemon; score: number } | null => {
    if (availableTeam.length === 0) return null;

    let bestOption: AiPokemon | null = null;
    let bestScore = -Infinity;

    for (const pokemon of availableTeam) {
      if (pokemon.name === currentActive.name) continue;
      const score = evaluateMatchup(pokemon, opponentActive);
      const currentScore = evaluateMatchup(currentActive, opponentActive);
      if (score > currentScore + 15 && score > bestScore) {
        bestScore = score;
        bestOption = pokemon;
      }
    }

    return bestOption ? { pokemon: bestOption, score: bestScore } : null;
  };

  const decisions: AiDecision[] = [];
  const playerActive = state.playerActive;
  const opponentActive = state.opponentActive;

  if (forced) {
    const bestSwap = getBestSwapOption(
      playerActive,
      opponentActive,
      state.playerAlive.filter(p => p.name !== playerActive.name)
    );

    if (bestSwap) {
      return {
        action: "swap",
        target: bestSwap.pokemon,
        reason: `Critical health: ${playerActive.name} will faint next turn. Swapping to ${bestSwap.pokemon.name}.`,
        score: 100 + bestSwap.score,
      };
    }
  }


  // Critical Health
  const opponentDamage = calculateDamage(opponentActive, playerActive);
  const turnsUntilFaint = Math.ceil(playerActive.stats.hp / opponentDamage);
  if (turnsUntilFaint === 1) {
    const ourDamage = calculateDamage(playerActive, opponentActive);
    const opponentTurnsUntilFaint = Math.ceil(opponentActive.stats.hp / ourDamage);
    if (opponentTurnsUntilFaint > 1) {
      const bestSwap = getBestSwapOption(
        playerActive,
        opponentActive,
        state.playerAlive.filter(p => p.name !== playerActive.name)
      );
      if (bestSwap) {
        decisions.push({
          action: 'swap',
          target: bestSwap.pokemon,
          reason: `Critical health: ${playerActive.name} will faint next turn. Swapping to ${bestSwap.pokemon.name}.`,
          score: 100 + bestSwap.score
        });
      }
    }
  }

  // Kill opportunity
  const damage = calculateDamage(playerActive, opponentActive);
  if (damage >= opponentActive.stats.hp) {
    decisions.push({
      action: 'attack',
      reason: `Guaranteed KO: ${playerActive.name} can faint ${opponentActive.name} with ${damage} damage`,
      score: 95
    });
  } else if (damage >= opponentActive.stats.hp * 0.75) {
    decisions.push({
      action: 'attack',
      reason: `High damage (${damage}): ${opponentActive.name} will be in KO range next turn`,
      score: 70
    });
  }

  // Strategic swap for type advantage
  for (const pokemon of state.playerAlive) {
    if (pokemon.name === playerActive.name) continue;
    if (typeMultiplier(pokemon.type, opponentActive.type) === 1.5) {
      const benchScore = evaluateMatchup(pokemon, opponentActive);
      const currentScore = evaluateMatchup(playerActive, opponentActive);
      if (benchScore > currentScore + 30) {
        decisions.push({
          action: 'swap',
          target: pokemon,
          reason: `Strategic swap: ${pokemon.name} has type advantage over ${opponentActive.name}`,
          score: 85
        });
      }
    }
  }

  // Type advantage strategy
  const multiplier = typeMultiplier(playerActive.type, opponentActive.type);
  if (multiplier === 1.5) {
    decisions.push({
      action: 'attack',
      reason: `Type advantage: ${playerActive.type} > ${opponentActive.type}`,
      score: 80
    });
  } else if (multiplier === 0.75) {
    const bestSwap = getBestSwapOption(
      playerActive,
      opponentActive,
      state.playerAlive.filter(p => p.name !== playerActive.name)
    );
    if (bestSwap) {
      decisions.push({
        action: 'swap',
        target: bestSwap.pokemon,
        reason: `Type disadvantage: ${playerActive.type} < ${opponentActive.type}. Swapping to ${bestSwap.pokemon.name}`,
        score: 75
      });
    }
  }

  // Neutral matchup fallback
  if (decisions.length === 0) {
    decisions.push({
      action: 'attack',
      reason: `Neutral matchup with ${opponentActive.name}`,
      score: 40
    });
  }

  // Choose highest scoring decision
  decisions.sort((a, b) => b.score - a.score);
  return decisions[0];
}
