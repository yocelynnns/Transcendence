//IMPORTS
import { useState, useEffect } from "react";
import usePlayer from "../hooks/usePlayer";
import { useEncounter } from "../hooks/useEncounter";
import Player, { type Direction } from "./Player";
import Pokemon from "./Pokemon";
import mapData from "../assets/map/map.json";
import { useGameSocket, type PlayerData } from "../ws/useGameSocket";
import { usePokemonSpawner, type SpawnedPokemon } from "../hooks/usePokemonSpawner";
import axios from "axios";
import type { AvatarData } from "./AvatarProfile";
import { ASSETS } from "../assets";

import { useQueryClient } from "@tanstack/react-query";

import type { PlayerPokemon } from "../components/AvatarProfile";

//ASSETS
const mapImage = ASSETS.MAP.DEFAULT;
const playerSprite = ASSETS.PLAYER.DEFAULT;
const mapForeground = ASSETS.MAP.FOREGROUND;

//MAP CONSTANTS
const MAP_WIDTH = 20;
const MAP_HEIGHT = 34;
const TILE_SIZE = 64;
const VIEW_WIDTH = 10;
const VIEW_HEIGHT = 10;

//PLAYER CONSTANTS
const PLAYER_ID = crypto.randomUUID();

//TYPES
interface GameMapProps {
  avatarData: AvatarData | null;
}

//MAIN COMPONENT
export default function GameMap({ avatarData }: GameMapProps) {

  //POKEMON HOOK
  const { pokemonList, setPokemonList } = usePokemonSpawner();
  const safePokemonList: SpawnedPokemon[] = Array.isArray(pokemonList) ? pokemonList : [];

  //PLAYER HOOK
  const [stopMovement, setStopMovement] = useState(false);
  const player = usePlayer({
    startX: 10,
    startY: 17,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    collision: mapData.map,
    stopMovement,
    charPref: avatarData?.characterOption ?? 0,
  });

  //ENCOUNTER HOOK
  const { encounterPokemon, showDialog, stopMovement: encounterStop, handleCatchNo } =
    useEncounter({ px: player.px, py: player.py }, safePokemonList, TILE_SIZE);

  useEffect(() => {
    setStopMovement(encounterStop);
  }, [encounterStop]);

  //SOCKET HOOK
  const [otherPlayers, setOtherPlayers] = useState<PlayerData[]>([]);
  const { sendPlayerMove, emitEvent, subscribeEvent } = useGameSocket((players) => {
    const others = players.filter((p) => p.id !== PLAYER_ID);
    setOtherPlayers(others);
  });

  //FETCH INITIAL POKEMON
  useEffect(() => {
    axios
      .get<SpawnedPokemon[]>("http://localhost:5001/api/pokemon")
      .then((res) => setPokemonList(res.data))
      .catch((err) => console.error("Failed to fetch initial Pokémon:", err));
  }, [setPokemonList]);

  //SUBSCRIBE POKEMON UPDATES
  useEffect(() => {
    const unsubscribe = subscribeEvent<SpawnedPokemon[]>("pokemonUpdate", (updated) => {
      setPokemonList(updated);
    });
    return unsubscribe;
  }, [subscribeEvent, setPokemonList]);

  //SEND PLAYER MOVE
  useEffect(() => {
    sendPlayerMove(player.px, player.py, player.direction, player.frame, player.charIndex);
  }, [player.px, player.py, player.direction, player.frame, player.charIndex, sendPlayerMove]);

  //HANDLE CATCH
  const queryClient = useQueryClient();

  const handleCatchPokemon = (p: SpawnedPokemon) => {
    const avatarId = localStorage.getItem("avatarId");
    if (!avatarId || !avatarData) {
      console.error("No avatar ID found or avatarData missing");
      handleCatchNo();
      return;
    }

    const tempId = `temp-${p._id}-${Date.now()}`;
    queryClient.setQueryData<AvatarData>(["avatar", avatarId], (old) => {
      if (!old) return old;

      const newPokemon: PlayerPokemon = {
        _id: tempId,
        name: p.name ?? "Unknown",
        type: p.type ?? "Unknown",
      };

      return {
        ...old,
        pokemonInventory: [...old.pokemonInventory, newPokemon],
      };
    });

    emitEvent("catchPokemon", { playerId: avatarId, pokemonId: p._id });

    handleCatchNo();

    const unsubscribe = subscribeEvent<{ avatar: AvatarData; playerPokemon: PlayerPokemon }>(
      "catchPokemonResult",
      (data) => {
        queryClient.setQueryData<AvatarData>(["avatar", data.avatar.avatarId], data.avatar);
        unsubscribe();
      }
    );
  };

  //CAMERA
  const viewPixelWidth = VIEW_WIDTH * TILE_SIZE;
  const viewPixelHeight = VIEW_HEIGHT * TILE_SIZE;

  let offsetX = player.px - viewPixelWidth / 2 + TILE_SIZE / 2;
  let offsetY = player.py - viewPixelHeight / 2 + TILE_SIZE / 2;

  offsetX = Math.max(0, Math.min(offsetX, MAP_WIDTH * TILE_SIZE - viewPixelWidth));
  offsetY = Math.max(0, Math.min(offsetY, MAP_HEIGHT * TILE_SIZE - viewPixelHeight));

  //RENDER
  return (
    <div style={{ width: viewPixelWidth, height: viewPixelHeight, overflow: "hidden", position: "relative" }}>

      {/* MAP */}
      <img
        src={mapImage}
        alt="map"
        style={{
          position: "absolute",
          left: -offsetX,
          top: -offsetY,
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          zIndex: 0,
        }}
      />

      {/* POKEMON */}
      {safePokemonList.map((p) => (
        <Pokemon key={p._id} x={p.x - offsetX} y={p.y - offsetY} name={p.name ?? "Unknown"} is_shiny={p.is_shiny} tileSize={TILE_SIZE} zIndex={2} />
      ))}

      {/* OTHER PLAYERS */}
      {otherPlayers.map((p) => (
        <Player
          key={p.id}
          x={p.x - offsetX}
          y={p.y - offsetY}
          direction={p.direction as Direction}
          frame={p.frame}
          charIndex={p.charIndex}
          tileSize={TILE_SIZE}
          spriteSheet={playerSprite}
          zIndex={4}
        />
      ))}

      {/* LOCAL PLAYER */}
      <Player
        x={player.px - offsetX}
        y={player.py - offsetY}
        direction={player.direction}
        frame={player.frame}
        charIndex={player.charIndex}
        tileSize={TILE_SIZE}
        spriteSheet={playerSprite}
        zIndex={5}
      />

      {/* FOREGROUND */}
      <img
        src={mapForeground}
        alt="foreground"
        style={{
          position: "absolute",
          left: -offsetX,
          top: -offsetY,
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* ENCOUNTER DIALOG */}
      {showDialog && encounterPokemon && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "4px solid #000",
            padding: 12,
            zIndex: 20,
            fontFamily: "monospace",
          }}
        >
          <div style={{ marginBottom: 8 }}>Catch this Pokémon?</div>
          <button onClick={() => handleCatchPokemon(encounterPokemon)}>Yes</button>
          <button onClick={handleCatchNo} style={{ marginLeft: 8 }}>
            No
          </button>
        </div>
      )}
    </div>
  );
}
