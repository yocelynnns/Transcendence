export type AiPokemon = {
  name: string;
  type: string;
  
  stats: { atk: number; hp: number; maxAtk:number; maxHp:number};
};

export const aiPokemons: Record<string, AiPokemon> = {
  // Grass
  bulbasaur: {
    name: "bulbasaur",
    type: "grass",
    stats: { atk: 6, maxAtk: 6, hp: 8, maxHp: 8 },
  },
  oddish: {
    name: "oddish",
    type: "grass",
    stats: { atk: 5, maxAtk: 5, hp: 10, maxHp: 10 },
  },
  bellsprout: {
    name: "bellsprout",
    type: "grass",
    stats: { atk: 4, maxAtk: 4, hp: 12, maxHp: 12 },
  },

  // Water
  squirtle: {
    name: "squirtle",
    type: "water",
    stats: { atk: 6, maxAtk: 6, hp: 8, maxHp: 8 },
  },
  psyduck: {
    name: "psyduck",
    type: "water",
    stats: { atk: 5, maxAtk: 5, hp: 10, maxHp: 10 },
  },
  slowpoke: {
    name: "slowpoke",
    type: "water",
    stats: { atk: 4, maxAtk: 4, hp: 12, maxHp: 12 },
  },

  // Fire
  charmander: {
    name: "charmander",
    type: "fire",
    stats: { atk: 6, maxAtk: 6, hp: 8, maxHp: 8 },
  },
  vulpix: {
    name: "vulpix",
    type: "fire",
    stats: { atk: 5, maxAtk: 5, hp: 10, maxHp: 10 },
  },
  ponyta: {
    name: "ponyta",
    type: "fire",
    stats: { atk: 4, maxAtk: 4, hp: 12, maxHp: 12 },
  },

  // Normal
  cleffa: {
    name: "cleffa",
    type: "normal",
    stats: { atk: 6, maxAtk: 6, hp: 8, maxHp: 8 },
  },
  togepi: {
    name: "togepi",
    type: "normal",
    stats: { atk: 5, maxAtk: 5, hp: 10, maxHp: 10 },
  },
  pikachu: {
    name: "pikachu",
    type: "normal",
    stats: { atk: 4, maxAtk: 4, hp: 12, maxHp: 12 },
  },
};

export const typeAdvantage: Record<string, string> = {
  fire: "grass",
  grass: "water",
  water: "fire",
  normal: "",
};

export const typeMultiplier = (attacker: string, defender: string) => {
  if (typeAdvantage[attacker] === defender) return 1.5;
  if (typeAdvantage[defender] === attacker) return 0.75;
  return 1;
};

export type AiGameState = {
  playerTeam: AiPokemon[];
  opponentTeam: AiPokemon[];
  playerActive: AiPokemon;
  opponentActive: AiPokemon;
  playerTurn: boolean;
  playerAlive: AiPokemon[];
  opponentAlive: AiPokemon[];
};

export type AiDecision = {
  action: 'attack' | 'swap';
  target?: AiPokemon;
  reason: string;
  score: number;
};
