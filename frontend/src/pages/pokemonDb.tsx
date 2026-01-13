import { useEffect, useState } from "react";

interface Pokemon {
  _id: string;
  name: string;
  type: string;
  hp: number;
  attack: number;
  is_shiny: boolean;
}

// Map Pokémon type to pastel highlight colors
const hoverColors: Record<string, string> = {
  Water: "#A8DADC", // pastel blue
  Grass: "#B9FBC0", // pastel green
  Fire: "#FFB3AB",  // pastel red/orange
  Electric: "#FFFACD", // pastel yellow
  // add more types as needed
};

export default function PokemonDb() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/pokemonDb")
      .then(res => res.json())
      .then(setPokemons)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        Loading Pokémon...
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: "#fff", textAlign: "center", marginBottom: "2rem" }}>
        Pokémon Database
      </h1>

      <div style={{ maxWidth: "800px", width: "90%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#ddd" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #555", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>#</th>
              <th style={{ padding: "0.5rem" }}>Name</th>
              <th style={{ padding: "0.5rem" }}>Type</th>
              <th style={{ padding: "0.5rem" }}>HP</th>
              <th style={{ padding: "0.5rem" }}>Attack</th>
              <th style={{ padding: "0.5rem" }}>Shiny</th>
            </tr>
          </thead>
          <tbody>
            {pokemons.map((p, i) => (
              <tr
                key={i}
                style={{
                  transition: "background-color 0.3s, color 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  const color = hoverColors[p.type] || "#ffc0cb"; // fallback pink
                  e.currentTarget.style.backgroundColor = color;
                  e.currentTarget.style.color = "#000"; // ensure text is readable
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#ddd";
                }}
              >
                <td style={{ padding: "0.5rem" }}>{i + 1}</td>
                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                <td style={{ padding: "0.5rem" }}>{p.type}</td>
                <td style={{ padding: "0.5rem" }}>{p.hp}</td>
                <td style={{ padding: "0.5rem" }}>{p.attack}</td>
                <td style={{ padding: "0.5rem" }}>{p.is_shiny ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
