import { useEffect, useState } from "react";

interface IBattlePokemon {
  pokemonId: string;
  name: string;
  type: string;
  attack: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  is_shiny: boolean;
}

export default function BattleDummy() {
  const [battleData, setBattleData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5001/battleDummy")
      .then(res => res.json())
      .then(setBattleData)
      .catch(console.error);
  }, []);

  if (!battleData)
    return (
      <p style={{ textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        Loading battle...
      </p>
    );

  const cell = { padding: "0.75rem 1.25rem", whiteSpace: "nowrap" };

  const renderTeamTable = (team: IBattlePokemon[], title: string) => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        marginBottom: "2rem",
        marginLeft: "auto",
        marginRight: "auto",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "1rem" }}>
        {title}
      </h2>

      <div>
        <table
          style={{
            borderCollapse: "collapse",
            color: "#ddd",
            margin: "0 auto",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #555", textAlign: "left" }}>
              <th style={cell}>#</th>
              <th style={cell}>Name</th>
              <th style={cell}>Type</th>
              <th style={cell}>Shiny</th>
              <th style={cell}>HP</th>
              <th style={cell}>HP %</th>
              <th style={cell}>ATK</th>
              <th style={cell}>Status</th>
            </tr>
          </thead>

          <tbody>
            {team.map((p, i) => {
              const hpPercent = Math.round(
                (p.currentHp / p.maxHp) * 100
              );

              return (
                <tr
                  key={p.pokemonId}
                  style={{
                    transition: "background-color 0.3s, color 0.3s",
                    cursor: "pointer",
                    opacity: p.isDead ? 0.4 : 1,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#ffc0cb";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#ddd";
                  }}
                >
                  <td style={cell}>{i + 1}</td>
                  <td style={cell}>{p.name}</td>
                  <td style={cell}>{p.type}</td>
                  <td style={cell}>{p.is_shiny ? "Yes" : "No"}</td>
                  <td style={cell}>
                    {p.currentHp} / {p.maxHp}
                  </td>
                  <td style={cell}>{hpPercent}%</td>
                  <td style={cell}>{p.attack}</td>
                  <td style={cell}>
                    {p.isDead ? "💀 Dead" : "🟢 Alive"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {renderTeamTable(battleData.player.pokemon, "Player")}
      {renderTeamTable(battleData.enemy.pokemon, "Enemy")}
    </div>
  );
}
