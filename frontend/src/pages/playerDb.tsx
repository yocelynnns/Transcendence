import { useEffect, useState } from "react";

interface Player {
  _id: string;
  username: string;
  avatarUrl?: string;
  battleWin?: number;
  battleLoss?: number;
  raceWin?: number;
  raceLoss?: number;
  createdAt?: string;
}

interface PlayerTeamSlot {
  _id: string;
  playerId: string;
  slot: number;
  pokemonId: {
    _id: string;
    name: string;
    type: string;
    hp: number;
    attack: number;
    is_shiny: boolean;
  };
}

export default function PlayerDb() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // selected player + team view
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<PlayerTeamSlot[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/players");
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async (playerId: string) => {
    setTeamLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/players/${playerId}/team`);
      const data = await res.json();
      setTeam(data);
    } catch (e) {
      console.error(e);
      setTeam([]);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const onCreatePlayer = async () => {
    if (!username.trim() || !password.trim()) {
      alert("username + password required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, avatarUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Failed to create player");
        return;
      }

      setUsername("");
      setPassword("");
      setAvatarUrl("");
      await fetchPlayers();
    } catch (e) {
      console.error(e);
      alert("Failed to create player");
    }
  };

  if (loading) {
    return (
      <p style={{ textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        Loading players...
      </p>
    );
  }

  const cell = { padding: "0.5rem", whiteSpace: "nowrap" as const };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        boxSizing: "border-box",
        color: "#ddd",
      }}
    >
      <h1 style={{ color: "#fff", textAlign: "center", marginBottom: "3rem" }}>
        Player Database
      </h1>

      {/* Create Player */}
      <div
        style={{
          width: "90%",
          maxWidth: "800px",
          border: "1px solid #333",
          borderRadius: "10px",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "0.75rem" }}>Create Player</h2>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            style={{
              flex: "1 1 180px",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#111",
              color: "#fff",
            }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            style={{
              flex: "1 1 180px",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#111",
              color: "#fff",
            }}
          />
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="avatarUrl (optional)"
            style={{
              flex: "2 1 260px",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#111",
              color: "#fff",
            }}
          />

          <button
            onClick={onCreatePlayer}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "1px solid #555",
              background: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Create
          </button>

          <button
            onClick={fetchPlayers}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "1px solid #555",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div style={{ maxWidth: "800px", width: "90%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#ddd" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #555", textAlign: "left" }}>
              <th style={cell}>#</th>
              <th style={cell}>Username</th>
              <th style={cell}>Battle W/L</th>
              <th style={cell}>Race W/L</th>
              <th style={cell}>Created</th>
            </tr>
          </thead>

          <tbody>
            {players.map((p, i) => (
              <tr
                key={p._id}
                style={{
                  transition: "background-color 0.3s, color 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedPlayer(p);
                  fetchTeam(p._id);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffc0cb";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#ddd";
                }}
              >
                <td style={cell}>{i + 1}</td>
                <td style={cell}>{p.username}</td>
                <td style={cell}>
                  {(p.battleWin ?? 0)} / {(p.battleLoss ?? 0)}
                </td>
                <td style={cell}>
                  {(p.raceWin ?? 0)} / {(p.raceLoss ?? 0)}
                </td>
                <td style={cell}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Player Team */}
      <div style={{ width: "90%", maxWidth: "800px", marginTop: "2rem" }}>
        <h2 style={{ color: "#fff", marginBottom: "0.75rem" }}>
          {selectedPlayer ? `Team: ${selectedPlayer.username}` : "Team"}
        </h2>

        {selectedPlayer && teamLoading && (
          <p style={{ color: "#fff" }}>Loading team...</p>
        )}

        {selectedPlayer && !teamLoading && (
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#ddd" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #555", textAlign: "left" }}>
                <th style={cell}>Slot</th>
                <th style={cell}>Pokemon</th>
                <th style={cell}>Type</th>
                <th style={cell}>HP</th>
                <th style={cell}>ATK</th>
                <th style={cell}>Shiny</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td style={cell} colSpan={6}>
                    (no team data yet)
                  </td>
                </tr>
              ) : (
                team.map((t) => (
                  <tr key={`${t._id}`}>
                    <td style={cell}>{t.slot}</td>
                    <td style={cell}>{t.pokemonId?.name ?? "-"}</td>
                    <td style={cell}>{t.pokemonId?.type ?? "-"}</td>
                    <td style={cell}>{t.pokemonId?.hp ?? "-"}</td>
                    <td style={cell}>{t.pokemonId?.attack ?? "-"}</td>
                    <td style={cell}>{t.pokemonId?.is_shiny ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
