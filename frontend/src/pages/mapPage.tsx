// src/pages/GamePage.tsx
import { useEffect, useState } from "react";
import { socket } from "../socket"; // adjust path if needed
import type { Player, Pokemon } from "../types";

export default function GamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [playerId, setPlayerId] = useState<string>("");

  // Handle key presses for movement
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      let { x, y } = player;

      switch (e.key) {
        case "ArrowUp": y -= 10; break;
        case "ArrowDown": y += 10; break;
        case "ArrowLeft": x -= 10; break;
        case "ArrowRight": x += 10; break;
      }

      socket.emit("move", { x, y });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [players, playerId]);

  // Socket.IO listeners
  useEffect(() => {
    socket.on("gameState", (state: { players: Player[]; pokemons: Pokemon[] }) => {
      setPlayers(state.players);
      setPokemons(state.pokemons);
      if (socket.id) setPlayerId(socket.id);
    });

    socket.on("playerJoined", (player: Player) => setPlayers(prev => [...prev, player]));
    socket.on("playerMoved", (player: Player) =>
      setPlayers(prev => prev.map(p => (p.id === player.id ? player : p)))
    );
    socket.on("playerLeft", (id: string) =>
      setPlayers(prev => prev.filter(p => p.id !== id))
    );
    socket.on("pokemonCaught", (pokemon: Pokemon) =>
      setPokemons(prev => prev.map(p => (p.id === pokemon.id ? pokemon : p)))
    );

    return () => {
      socket.off("gameState");
      socket.off("playerJoined");
      socket.off("playerMoved");
      socket.off("playerLeft");
      socket.off("pokemonCaught");
    };
  }, []);

  const catchPokemon = (id: string) => {
    socket.emit("catchPokemon", id);
  };

  return (
    <div>
      <h2>Use arrow keys to move. Click Pokémon to catch!</h2>
      <div
        style={{
          position: "relative",
          width: 600,
          height: 600,
          border: "2px solid black",
          margin: "20px auto",
        }}
      >
        {/* Players */}
        {players.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: p.y,
              left: p.x,
              width: 20,
              height: 20,
              backgroundColor: p.id === playerId ? "blue" : "green",
              borderRadius: "50%",
              textAlign: "center",
              color: "white",
              lineHeight: "20px",
            }}
          >
            P
          </div>
        ))}

        {/* Pokémons */}
        {pokemons.map((poke) => (
          <div
            key={poke.id}
            style={{
              position: "absolute",
              top: poke.y,
              left: poke.x,
              width: 20,
              height: 20,
              backgroundColor: poke.caughtBy ? "gray" : "red",
              borderRadius: "50%",
              textAlign: "center",
              color: "white",
              cursor: poke.caughtBy ? "not-allowed" : "pointer",
              lineHeight: "20px",
            }}
            onClick={() => !poke.caughtBy && catchPokemon(poke.id)}
          >
            🟢
          </div>
        ))}
      </div>
    </div>
  );
}
