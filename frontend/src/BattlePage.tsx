import { useEffect, useState } from "react";

interface Pokemon {
  _id: string;
  name: string;
  type: string;
  is_shiny: boolean;
  hp: number;
  attack: number;
}

export default function PokemonDb() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch from backend
    fetch("http://localhost:5731/pokemonDb")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch Pokémon");
        return res.json();
      })
      .then((data) => setPokemons(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Pokémon...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Pokémon Database</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Shiny?</th>
            <th>HP</th>
            <th>Attack</th>
          </tr>
        </thead>
        <tbody>
          {pokemons.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.type}</td>
              <td>{p.is_shiny ? "Yes" : "No"}</td>
              <td>{p.hp}</td>
              <td>{p.attack}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
