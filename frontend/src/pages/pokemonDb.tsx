import { useEffect, useState } from "react";

export default function PokemonDb() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/pokemonDb")
      .then(res => res.json())
      .then(setPokemons)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Pokémon...</p>;

  return (
    <div>
      <h1>Pokémon Database</h1>
      <ul>
        {pokemons.map(p => (
          <li key={p._id}>
            {p.name} | {p.type} | HP: {p.hp} | ATK: {p.attack} | {p.is_shiny ? "Shiny" : "Normal"}
          </li>
        ))}
      </ul>
    </div>
  );
}
