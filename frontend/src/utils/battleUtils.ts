import { BattlePokemon } from "../types/battleTypes";


export const getPlayerOtherPokemons = (
  team: BattlePokemon[],
  activeIndex: number
): BattlePokemon[] => {
  const others = team.filter((_, idx) => idx !== activeIndex);

  if (others.length !== 2) return others;

  return [...others].sort((a, b) => {
    if (a.isDead === b.isDead) return 0;
    return a.isDead ? 1 : -1;
  });
};

export const getAliveCount = (team: BattlePokemon[]): number => {
  return team.filter(p => !p.isDead).length;
};
