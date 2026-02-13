import { useEffect, useState } from "react";
import { ASSETS } from "../../assets";
import type { AvatarData } from "../../types/avatarTypes";
import { getPokemonGifPath } from "../../assets/helpers";

const logo = ASSETS.HEALTH.HISTORY.HISTORY;

interface BattlePokemon {
  name: string;
  type: string;
  is_shiny: boolean;
}

interface BattleHistory {
  _id: string;
  player1: { userName: string; _id: string };
  player2: { userName: string; _id: string };
  pokemon1: BattlePokemon[];
  pokemon2: BattlePokemon[];
  winner?: "player1" | "player2" | "draw";
  winnerReason?: string;
  createdAt: Date;
  endedAt?: Date;
}

interface HistoryMainProps {
  avatarData: AvatarData;
}

export default function HistoryMain({ avatarData }: HistoryMainProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [battles, setBattles] = useState<BattleHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!avatarData?.battleHistory?.length) return;

    const fetchBattles = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(
          avatarData.battleHistory.map(async (battleId) => {
            const res = await fetch(
              `/api/battle/${battleId.toString()}`
            );
            const data = await res.json();
            return {
              ...data,
              createdAt: new Date(data.createdAt),
              endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
            };
          })
        );

        setBattles(results.reverse());
        if (results.length > 0) console.log("Latest battle:", results[0]);
      } catch {
        setBattles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, [avatarData]);

  const totalGames = battles.length;

  const isPlayer1 = (b: BattleHistory) =>
    avatarData._id.toString() === b.player1._id;

  const wins = battles.filter((b) => b.winner === (isPlayer1(b) ? "player1" : "player2")).length;
  const losses = battles.filter((b) => b.winner === (isPlayer1(b) ? "player2" : "player1")).length;
  const draws = battles.filter((b) => b.winner === "draw").length;

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return "-";
    const diff = end.getTime() - start.getTime();
    return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
  };

  const getBattleBg = (battle: BattleHistory) => {
    if (battle.winner === "draw") return "#fff9e6";
    return isPlayer1(battle)
      ? battle.winner === "player1"
        ? "#ecfdf3" // green → you won
        : "#fdecec" // red → you lost
      : battle.winner === "player2"
      ? "#ecfdf3"
      : "#fdecec";
  };

  const getResultText = (battle: BattleHistory) => {
    if (battle.winner === "draw") return "Draw";
    if (isPlayer1(battle)) return battle.winner === "player1" ? "Win" : "Loss";
    return battle.winner === "player2" ? "Win" : "Loss";
  };

  return (
    <>
      <div
        onClick={() => setPanelOpen(!panelOpen)}
        style={{ cursor: "pointer", zIndex: 100, width: 48, height: 48 }}
      >
        <img src={logo} style={{ width: "100%" }} />
      </div>

      {panelOpen && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 100,
            width: 480,
            minHeight: 500,
            background: "#f5f5f8",
            borderRadius: 16,
            border: "2px solid #ddd",
            boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 16px",
              background: "#4a90e2",
              color: "#fff",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              fontWeight: 600,
            }}
          >
            <span>Battle History</span>
            <button
              onClick={() => setPanelOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 18,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <h4 style={{ textAlign: "center", margin: "8px 0" }}>
            Games Statistic
          </h4>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <StatBox title="Games" value={totalGames} color="#3498db" />
            <StatBox title="Wins" value={wins} color="#2ecc71" />
            <StatBox title="Losses" value={losses} color="#e74c3c" />
            <StatBox title="Draws" value={draws} color="#f1c40f" />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

            {!loading && battles.length === 0 && (
              <p style={{ textAlign: "center", color: "#777" }}>No battles yet</p>
            )}

            {battles.map((b) => (
              <div
                key={b._id}
                style={{
                  background: getBattleBg(b),
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 14,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-start" }}>
                    {b.pokemon1.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonGifPath(p.name, p.type, p.is_shiny, false)}
                        width={40}
                      />
                    ))}
                  </div>

                  <span style={{ fontWeight: 700 }}>VS</span>

                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {b.pokemon2.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonGifPath(p.name, p.type, p.is_shiny, false)}
                        width={40}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ textAlign: "center", fontWeight: 600 }}>
                  {b.player1.userName} vs {b.player2.userName}
                </p>

                <p style={{ textAlign: "center", fontWeight: 600 }}>
                  Result: {getResultText(b)}
                </p>

                <p style={{ fontSize: 12, textAlign: "center" }}>
                  {b.winnerReason ?? "—"}
                </p>

                <p style={{ fontSize: 12, textAlign: "center" }}>
                  Duration: {formatDuration(b.createdAt, b.endedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const StatBox = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <div
    style={{
      background: color,
      borderRadius: 10,
      padding: "8px 12px",
      textAlign: "center",
      color: "#fff",
      minWidth: 60,
    }}
  >
    <div style={{ fontSize: 10 }}>{title}</div>
    <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
  </div>
);
