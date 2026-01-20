export const getPlayerOtherPokemons = (
  team: IBattlePokemon[],
  activeIndex: number
): IBattlePokemon[] => {
  const others = team.filter((_, idx) => idx !== activeIndex);

  if (others.length !== 2) return others;

  return [...others].sort((a, b) => {
    if (a.isDead === b.isDead) return 0;
    return a.isDead ? 1 : -1;
  });
};

export const getAliveCount = (team: IBattlePokemon[]): number => {
  return team.filter(p => !p.isDead).length;
};
