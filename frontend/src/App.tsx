// import { useEffect, useState } from "react";
// import { socket } from "./socket";
// import type { Player, Pokemon } from "./types.js";

// function App() {
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [pokemons, setPokemons] = useState<Pokemon[]>([]);
//   const [playerId, setPlayerId] = useState<string>("");

//   // Handle key presses for movement
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       const player = players.find((p) => p.id === playerId);
//       if (!player) return;
//       let { x, y } = player;

//       switch (e.key) {
//         case "ArrowUp": y -= 10; break;
//         case "ArrowDown": y += 10; break;
//         case "ArrowLeft": x -= 10; break;
//         case "ArrowRight": x += 10; break;
//       }

//       socket.emit("move", { x, y });
//     };

//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [players, playerId]);

//   // Socket.IO listeners
//   useEffect(() => {
//     socket.on("gameState", (state: { players: Player[]; pokemons: Pokemon[] }) => {
//       setPlayers(state.players);
//       setPokemons(state.pokemons);
//       if (socket.id) {
//         setPlayerId(socket.id);
//       }
//     });

//     socket.on("playerJoined", (player: Player) => setPlayers((prev) => [...prev, player]));
//     socket.on("playerMoved", (player: Player) =>
//       setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)))
//     );
//     socket.on("playerLeft", (id: string) => setPlayers((prev) => prev.filter((p) => p.id !== id)));
//     socket.on("pokemonCaught", (pokemon: Pokemon) =>
//       setPokemons((prev) => prev.map((p) => (p.id === pokemon.id ? pokemon : p)))
//     );

//     return () => { socket.off(); };
//   }, []);

//   const catchPokemon = (id: string) => {
//     socket.emit("catchPokemon", id);
//   };

//   return (
//     <div style={{ position: "relative", width: 600, height: 600, border: "1px solid black" }}>
//       <h2>Use arrow keys to move. Click Pokémon to catch!</h2>

//       {/* Players */}
//       {players.map((p) => (
//         <div
//           key={p.id}
//           style={{
//             position: "absolute",
//             top: p.y,
//             left: p.x,
//             width: 20,
//             height: 20,
//             backgroundColor: p.id === playerId ? "blue" : "green",
//             borderRadius: "50%",
//             textAlign: "center",
//             color: "white",
//           }}
//         >
//           P
//         </div>
//       ))}

//       {/* Pokémons */}
//       {pokemons.map((poke) => (
//         <div
//           key={poke.id}
//           style={{
//             position: "absolute",
//             top: poke.y,
//             left: poke.x,
//             width: 20,
//             height: 20,
//             backgroundColor: poke.caughtBy ? "gray" : "red",
//             borderRadius: "50%",
//             textAlign: "center",
//             color: "white",
//             cursor: poke.caughtBy ? "not-allowed" : "pointer",
//           }}
//           onClick={() => !poke.caughtBy && catchPokemon(poke.id)}
//         >
//           🟢
//         </div>
//       ))}
//     </div>
//   );
// }

// export default App;
import { Routes, Route } from "react-router-dom";
import { socket } from "./socket";
import MapPage from "./pages/mapPage";      // PascalCase variable
import PokemonDb from "./pages/pokemonDb";
import BattlePage from "./pages/battlePage/battlePage";
import BattleDummy from "./pages/battlePage/battleDummy";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />{}
      <Route path="/pokemonDb" element={<PokemonDb />} />{}
      <Route path="/battles" element={<BattlePage />} />{}
      <Route path="/battleDummy" element={<BattleDummy />} />{}
    </Routes>
  );
}