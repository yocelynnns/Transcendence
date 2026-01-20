import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AvatarData } from "../components/AvatarProfile";
import { ASSETS } from "../assets";
import { getPokemonIcon } from "../utils/pathFetcher";
import { useGameSocket } from "../ws/useGameSocket";

interface PreBattleProps {
  avatarData: AvatarData | null;
}

export default function PreBattle({ avatarData }: PreBattleProps) {
  const navigate = useNavigate();
  const { battleId } = useParams<{ battleId: string }>();
  const defaultAvatar = ASSETS.AVATAR.CLEFFA;

  const [selectedPokemon, setSelectedPokemon] = useState<string[]>([]);
  const { emitEvent, battleReady, enemyReady, waitingForEnemy } = useGameSocket(() => {});

  if (!avatarData) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e2f",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 20,
        }}
      >
        Loading player data...
      </div>
    );
  }

  const toggleSelect = (pokemonId: string) => {
    setSelectedPokemon(prev => {
      if (prev.includes(pokemonId)) {
        // unselect
        return prev.filter(id => id !== pokemonId);
      }

      if (prev.length >= 3) {
        // already have 3 → don't allow more
        return prev;
      }

      return [...prev, pokemonId];
    });
  };

  const canConfirm = selectedPokemon.length === 3;

  const handleConfirm = () => {
    if (!battleId) return;
    if (!canConfirm) return;

    // Send selected Pokémon to backend via socket
    // new
    emitEvent("playerReady", {
      battleId,
      playerId: avatarData.avatarId,
      selectedPokemon: selectedPokemon,
    });
  };

  useEffect(() => {
    if (battleReady && battleId) {
      navigate(`/battle/${battleId}`);
    }
  }, [battleReady, battleId, navigate]);


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",   // 👈 THIS centers vertically
        background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 100%)",
        fontFamily: "monospace",
        color: "#fff",
        overflowY: "auto",        // 👈 page scrolls only if needed
      }}
    >

      {/* TITLE */}
      <h1
        style={{
          marginTop: "5%",
          fontSize: 32,
          marginBottom: "4%",
          textShadow: "0 0 10px #888",
        }}
      >
        Choose Your Pokémon!
      </h1>

      {/* PLAYER AVATAR */}
      <div style={{ textAlign: "center", marginBottom: "1%" }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            border: "4px solid #a2d5f2",
            background: `url(${avatarData.avatar || defaultAvatar}) center/cover`,
            boxShadow: "0 0 15px #a2d5f2",
            margin: "0 auto",
          }}
        />
        <div style={{ marginTop: 8, fontSize: 16, textShadow: "0 0 6px #a2d5f2" }}>
          {avatarData.userName}
        </div>
      </div>

      {/* POKÉMON INVENTORY */}
      <div style={{ width: "80%", maxWidth: 600 }}>
        <h3 style={{ textAlign: "center", marginBottom: 12 }}>--- Your Pokémons ---</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            padding: "8px 0",
            maxHeight: 320,
            overflowY: "auto",
            justifyItems: "center",
          }}
        >
          {avatarData.pokemonInventory.map((p, i) => {
            const isSelected = selectedPokemon.includes(p._id);

            return (
              <div
                key={i}
                onClick={() => toggleSelect(p._id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  width: 72,
                }}
              >
                {/* 🔹 ICON BOX (SQUARE) */}
                <div
                  style={{
                    border: isSelected ? "2px solid #00ff00" : "2px solid #a2d5f2",
                    borderRadius: 10,
                    background: "#f9f9f9",
                    width: 72,
                    height: 72,                 // 👈 square
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected ? "0 0 10px #00ff00" : "0 0 8px #a2d5f2",
                    transition: "all 0.2s ease",
                    marginTop: "1%"
                  }}
                >
                  <img
                    src={getPokemonIcon(p)}
                    alt={p.name ?? "unknown"}
                    style={{
                      marginTop: 17,
                      width: 55,
                      height: 55,
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* 🔹 NAME BELOW ICON */}
                <div
                  title={p.name}
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    textAlign: "center",
                    width: "100%",
                    lineHeight: "1.2em",
                    height: "2.4em",          // 👈 exactly 2 lines
                    overflow: "hidden",
                    wordBreak: "break-word", // 👈 allow long names to wrap
                    whiteSpace: "normal",
                    color: "#fff",
                    
                  }}
                >
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM / STATUS */}
      {battleReady ? (
        <div style={{ marginTop: 16, fontSize: 18, color: "#00ff88" }}>
          Both players are ready! Starting battle...
        </div>
      ) : waitingForEnemy ? (
        <div style={{ marginTop: 16, fontSize: 16, color: "#ff8a8a" }}> 
          {/* <-- pastel red */}
          Waiting for enemy to finish...
        </div>
      ) : enemyReady ? (
        <div style={{ marginTop: 16, fontSize: 16, color: "#a2f2ff" }}>
          Enemy is ready...
        </div>
      ) : null}



      {/* CONFIRM BUTTON */}
      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        style={{
          height: "5%",
          marginTop: "2%",
          fontSize: 16,
          fontWeight: "bold",
          padding: "12px 20px",
          borderRadius: 8,
          border: "none",
          background: canConfirm
            ? "linear-gradient(135deg, #00ff88 0%, #00cc55 100%)"
            : "#555",
          color: canConfirm ? "#000" : "#999",
          cursor: canConfirm ? "pointer" : "not-allowed",
          boxShadow: canConfirm ? "0 0 12px #00ff88" : "none",
          transition: "all 0.3s ease",
          marginBottom: "5%",
          opacity: canConfirm ? 1 : 0.6,
        }}
      >
        Confirm Selection ({selectedPokemon.length}/3)
    </button>
    </div>
  );
}
