export const getPlayerOtherPokemons = (team: IBattlePokemon[], activeIndex: number): IBattlePokemon[] => {
    const others = team.filter((_, idx) => idx !== activeIndex);

    for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
    }

    return others.slice(0, 2);
};

export const getAliveCount = (team: IBattlePokemon[]): number => {
  return team.filter(p => !p.isDead).length;
};