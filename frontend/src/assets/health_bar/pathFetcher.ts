export const getPokemonGifPath = (p: IBattlePokemon, isPlayer: boolean,) => {
  const cleanName = p.name.toLowerCase().replace(/^shiny\s+/i, "").replace(/\s+/g, "_");
  const lowerType = p.type.toLowerCase().replace(/\s+/g, "_");
  const prefix = p.is_shiny ? "shiny_" : "";
  const position = isPlayer ? "back" : "front";
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${position}_${cleanName}.gif`;
};

export const getPokemonIcon = (p: IBattlePokemon) => {
  const cleanName = p.name.toLowerCase().replace(/^shiny\s+/i, "").replace(/\s+/g, "_");
  const lowerType = p.type.toLowerCase().replace(/\s+/g, "_");
  const prefix = p.is_shiny ? "shiny_" : "";
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${cleanName}_icon.png`;
};
