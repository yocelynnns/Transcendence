import { Server } from "socket.io";
import Avatar from "../db/avatar";
import RaceMatch from "../db/raceMatch";
import { Types } from "mongoose";

interface Player {
  id: string;
  avatarId: string;
  name: string;
  position: number;
  sprite: string; // Add sprite field
}

interface Race {
  players: Player[];
  started: boolean;
  finished: boolean;
  startTime?: number;
}

// Global race state
const races: Record<string, Race> = {};

// This function sets up the /minigame namespace
export const setupRaceHandlers = (io: Server) => {
  // Create the /minigame namespace
  const raceNamespace = io.of("/minigame");

  // Handle connections to the /minigame namespace
  raceNamespace.on("connection", (socket) => {
    console.log("🏁 Player connected to race:", socket.id);

    // Join Race
    socket.on("joinRace", async ({ avatarId }: { avatarId: string }) => {
      try {
        console.log("=== JOIN RACE DEBUG ===");
        console.log("Join race request for avatarId:", avatarId);
        console.log("AvatarId type:", typeof avatarId);
        console.log("AvatarId length:", avatarId?.length);
        console.log("Socket ID:", socket.id);

        // Fetch player data from MongoDB
        const avatar = await Avatar.findById(avatarId);
        
        if (!avatar) {
          console.error("❌ Avatar not found in database:", avatarId);
          socket.emit("raceError", "Avatar not found");
          return;
        }

        console.log("✅ Avatar found:", avatar.userName);

        // Update avatar's current socket
        avatar.currentSocket = socket.id;
        avatar.online = true;
        await avatar.save();

        // Find first available room with less than 2 players
        let roomId = null;
        for (const [id, race] of Object.entries(races)) {
          if (race.players.length < 2 && !race.started) {
            roomId = id;
            console.log("Found existing room:", roomId);
            break;
          }
        }

        // Create new room if no available room found
        if (!roomId) {
          roomId = `room_${Date.now()}`;
          races[roomId] = { players: [], started: false, finished: false };
          console.log("Created new room:", roomId);
        }

        const race = races[roomId];

        // Join room
        socket.join(roomId);
        console.log(`${avatar.userName} joined room ${roomId}`);

        // Assign random sprite to player
        const SPRITE_COUNT = 8;
        const randomSpriteIndex = Math.floor(Math.random() * SPRITE_COUNT) + 1;
        const sprite = `/assets/race/eevee-${randomSpriteIndex}.gif`;

        // Add player
        race.players.push({
          id: socket.id,
          avatarId: avatarId,
          name: avatar.userName,
          position: 0,
          sprite: sprite, // Include sprite
        });

        console.log(`Room ${roomId} now has ${race.players.length} players`);
        console.log(`${avatar.userName} assigned sprite: ${sprite}`);

        // Notify player which room they joined
        socket.emit("raceJoined", race.players, roomId);

        // Sync state
        raceNamespace.to(roomId).emit("raceUpdate", race.players);

        // Start race when 2 players are present
        if (race.players.length === 2) {
          race.started = true;
          race.startTime = Date.now();
          console.log(`🏁 Race starting in room ${roomId}!`);
          raceNamespace.to(roomId).emit("raceStart");
        }
      } catch (error) {
        console.error("Error joining race:", error);
        socket.emit("raceError", "Failed to join race");
      }
    });

    // Press Spacebar
    socket.on("press", async () => {
      try {
        // Find which room this socket is in
        const roomId = Array.from(socket.rooms).find((room) => room !== socket.id);
        if (!roomId) return;

        const race = races[roomId];
        if (!race || !race.started || race.finished) return;

        const player = race.players.find((p) => p.id === socket.id);
        if (!player) return;

        player.position += 5;

        if (player.position >= 100) {
          race.finished = true;
          const timeMs = Date.now() - (race.startTime || 0);

          // Save race result to database
          try {
            await saveRaceResult(race, player, timeMs);
            console.log(`🏆 Race completed! Winner: ${player.name}`);
          } catch (error) {
            console.error("Error saving race result:", error);
          }

          raceNamespace.to(roomId).emit("raceOver", player.name);

          // Clean up room after race ends - kick all players out after 3 seconds
          setTimeout(() => {
            console.log(`Cleaning up room ${roomId} after race completion`);
            
            // Kick all players from room
            race.players.forEach(p => {
              const playerSocket = raceNamespace.sockets.get(p.id);
              if (playerSocket) {
                playerSocket.leave(roomId);
                console.log(`Kicked ${p.name} from room ${roomId}`);
              }
            });

            // Delete the room
            delete races[roomId];
            console.log(`Room ${roomId} deleted after race completion`);
          }, 3000); // 3 second delay to show winner message
        }

        raceNamespace.to(roomId).emit("raceUpdate", race.players);
      } catch (error) {
        console.error("Error processing press:", error);
      }
    });

    // Disconnect
    socket.on("disconnecting", async () => {
      try {
        for (const roomId of socket.rooms) {
          if (roomId === socket.id) continue;

          const race = races[roomId];
          if (!race) continue;

          const disconnectedPlayer = race.players.find((p) => p.id === socket.id);
          
          // Check race state BEFORE removing player
          const wasActiveRace = race.started && !race.finished && race.players.length === 2;

          // Remove disconnected player immediately (so their lane disappears)
          race.players = race.players.filter((p) => p.id !== socket.id);
          
          // Notify remaining players of the update (removes disconnected player's lane)
          raceNamespace.to(roomId).emit("raceUpdate", race.players);

          // If race was active and someone disconnects, remaining player wins
          if (wasActiveRace && disconnectedPlayer && race.players.length === 1) {
            const remainingPlayer = race.players[0];
            if (remainingPlayer) {
              race.finished = true;
              const timeMs = Date.now() - (race.startTime || 0);

              // Save race result with disconnect info
              try {
                // Pass disconnectedPlayer directly instead of looking it up
                await saveRaceResultWithDisconnect(remainingPlayer, disconnectedPlayer, timeMs);
                console.log(
                  `Player ${disconnectedPlayer.name} disconnected. Winner by default: ${remainingPlayer.name}`
                );
              } catch (error) {
                console.error("Error saving race result:", error);
              }

              raceNamespace.to(roomId).emit("raceOver", remainingPlayer.name);

              // Clean up room after disconnect - kick remaining player out after 3 seconds
              setTimeout(() => {
                console.log(`Cleaning up room ${roomId} after disconnect`);
                
                const remainingSocket = raceNamespace.sockets.get(remainingPlayer.id);
                if (remainingSocket) {
                  remainingSocket.leave(roomId);
                  console.log(`Kicked ${remainingPlayer.name} from room ${roomId}`);
                }

                // Delete the room
                delete races[roomId];
                console.log(`Room ${roomId} deleted after disconnect`);
              }, 3000); // 3 second delay to show winner message
            }
          } else {
            // If race hasn't started or is already finished, just clean up normally

            // If only 1 player left in lobby (race not started), reset the room
            if (race.players.length === 1 && !race.started) {
              race.started = false;
              race.finished = false;
              console.log(`Room ${roomId} has 1 player remaining in lobby`);
            }
            
            // If room is empty, delete it
            if (race.players.length === 0) {
              delete races[roomId];
              console.log(`Room ${roomId} deleted (empty)`);
            }
          }

          // Update disconnected player's avatar
          if (disconnectedPlayer) {
            try {
              await Avatar.findByIdAndUpdate(disconnectedPlayer.avatarId, {
                currentSocket: null,
                online: false,
              });
            } catch (error) {
              console.error("Error updating disconnected avatar:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Player disconnected from race:", socket.id);
    });
  });
};

// Helper function to save race results when player disconnects
async function saveRaceResultWithDisconnect(
  winner: Player,
  loser: Player,
  timeMs: number
) {
  console.log("=== SAVING RACE RESULT (DISCONNECT) ===");
  console.log("Winner:", winner.name, "(ID:", winner.avatarId, ")");
  console.log("Loser (disconnected):", loser.name, "(ID:", loser.avatarId, ")");
  console.log("Time:", timeMs, "ms");

  try {
    // Create race match document
    const raceMatch = new RaceMatch({
      players: [new Types.ObjectId(winner.avatarId), new Types.ObjectId(loser.avatarId)],
      results: [
        {
          avatar: new Types.ObjectId(winner.avatarId),
          position: 1,
          timeMs: timeMs,
          disconnected: false,
        },
        {
          avatar: new Types.ObjectId(loser.avatarId),
          position: 2,
          disconnected: true, // Mark as disconnected
        },
      ],
      winner: new Types.ObjectId(winner.avatarId),
      map: "grass_track",
      ranked: true,
    });

    const savedMatch = await raceMatch.save();
    console.log("✅ Race match saved to database:", savedMatch._id);

    // Update winner's stats
    const winnerUpdate = await Avatar.findByIdAndUpdate(
      winner.avatarId,
      {
        $inc: { raceWin: 1 },
        currentSocket: null,
        online: false,
      },
      { new: true }
    );
    console.log("✅ Winner stats updated:", winnerUpdate?.userName, "- Wins:", winnerUpdate?.raceWin);

    // Update loser's stats
    const loserUpdate = await Avatar.findByIdAndUpdate(
      loser.avatarId,
      {
        $inc: { raceLoss: 1 },
        currentSocket: null,
        online: false,
      },
      { new: true }
    );
    console.log("✅ Loser stats updated:", loserUpdate?.userName, "- Losses:", loserUpdate?.raceLoss);
    
    console.log("=== RACE RESULT SAVED SUCCESSFULLY ===");
  } catch (error) {
    console.error("❌ Error saving race result:", error);
    throw error;
  }
}

// Helper function to save race results to database
async function saveRaceResult(
  race: Race,
  winner: Player,
  timeMs: number,
  disconnectedAvatarId?: string
) {
  console.log("=== SAVING RACE RESULT ===");
  
  const loser = race.players.find((p) => p.id !== winner.id);
  if (!loser) {
    console.error("❌ No loser found - cannot save race");
    return;
  }

  console.log("Winner:", winner.name, "(ID:", winner.avatarId, ")");
  console.log("Loser:", loser.name, "(ID:", loser.avatarId, ")");
  console.log("Time:", timeMs, "ms");
  console.log("Disconnected:", disconnectedAvatarId || "none");

  try {
    // Create race match document
    const raceMatch = new RaceMatch({
      players: [new Types.ObjectId(winner.avatarId), new Types.ObjectId(loser.avatarId)],
      results: [
        {
          avatar: new Types.ObjectId(winner.avatarId),
          position: 1,
          timeMs: timeMs,
          disconnected: false,
        },
        {
          avatar: new Types.ObjectId(loser.avatarId),
          position: 2,
          disconnected: disconnectedAvatarId === loser.avatarId,
        },
      ],
      winner: new Types.ObjectId(winner.avatarId),
      map: "grass_track",
      ranked: true,
    });

    const savedMatch = await raceMatch.save();
    console.log("✅ Race match saved to database:", savedMatch._id);

    // Update winner's stats
    const winnerUpdate = await Avatar.findByIdAndUpdate(
      winner.avatarId,
      {
        $inc: { raceWin: 1 },
        currentSocket: null,
        online: false,
      },
      { new: true }
    );
    console.log("✅ Winner stats updated:", winnerUpdate?.userName, "- Wins:", winnerUpdate?.raceWin);

    // Update loser's stats
    const loserUpdate = await Avatar.findByIdAndUpdate(
      loser.avatarId,
      {
        $inc: { raceLoss: 1 },
        currentSocket: null,
        online: false,
      },
      { new: true }
    );
    console.log("✅ Loser stats updated:", loserUpdate?.userName, "- Losses:", loserUpdate?.raceLoss);
    
    console.log("=== RACE RESULT SAVED SUCCESSFULLY ===");
  } catch (error) {
    console.error("❌ Error saving race result:", error);
    throw error;
  }
}