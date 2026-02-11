import { Server, Socket } from "socket.io";
import * as AvatarService from "../services/avatar.service";
import * as PokemonService from "../services/pokemon.service";

export const setupPokemonHandlers = (io: Server, socket: Socket) => {
  // Catch Pokemon
  socket.on("catchPokemon", async ({ mapPokemonId }: { mapPokemonId: string }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) return;

      console.log("Catching Pokemon:", mapPokemonId);

      const result = await AvatarService.catchPokemon({
        mapPokemonId,
        userId,
      });

      const remainingPokemons = await PokemonService.fetchAvailablePokemon({ limit: 50 });

      io.emit("pokemonUpdate", remainingPokemons);

      socket.emit("catchPokemonSuccess", result);
    } catch (err) {
      console.log("ERROR CATCHING Pokemon:", err);
      socket.emit("catchPokemonError", { message: "Catch failed" });
    }
  });
};
