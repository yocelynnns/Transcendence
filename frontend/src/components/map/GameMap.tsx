//IMPORTS
import { useState, useEffect } from "react";
import usePlayer from "../../hooks/usePlayer";
import { useEncounter } from "../../hooks/useEncounter";
import Player, { type Direction } from "./GamePlayer";
import Pokemon from "./GamePokemon";
import mapData from "../../assets/map/map.json";
import { useGameSocket } from "../../ws/useGameSocket";
import { usePokemonSpawner } from "../../hooks/usePokemonSpawner";
import { MapPokemon, PlayerPokemon } from "../../types/pokemonTypes";
import axios from "axios";
import type { AvatarData } from "../../types/avatarTypes";
import { ASSETS } from "../../assets";
import { useQueryClient } from "@tanstack/react-query";
import { PlayerState } from "../../types/avatarTypes";
import CatchDialog from "../elements/CatchDialog";
import GamePopup from "./GamePopup";
import { useNavigate } from "react-router-dom";

//ASSETS
const mapImage = ASSETS.MAP.DEFAULT;
const playerSprite = ASSETS.PLAYER.DEFAULT;
const mapForeground = ASSETS.MAP.FOREGROUND;

//MAP CONSTANTS
const MAP_WIDTH = 20;
const MAP_HEIGHT = 34;
const TILE_SIZE = 84;
// const VIEW_WIDTH = 10;
// const VIEW_HEIGHT = 10;

// DESIGN CONSTANTS
const DESIGN_WIDTH = 2856 / 2;
const DESIGN_HEIGHT = 1680 / 2;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1;

//TYPES
interface GameMapProps {
  avatarData: AvatarData | null;
  avatarId: string | null;
  freeze: boolean; /* ADD */
  battleLatest: (avatarId?: string, battleIdParam?:string) => Promise<void>;
}

//MAIN COMPONENT
export default function GameMap({ avatarData, avatarId, freeze, battleLatest }: GameMapProps) {
  const navigate = useNavigate();
  
  //POKEMON HOOK
  const { pokemonList, setPokemonList } = usePokemonSpawner();
  const safePokemonList: MapPokemon[] = Array.isArray(pokemonList) ? pokemonList : [];

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
    freeze: freeze, /* ADD */
  });

  //ENCOUNTER HOOK
  const { encounterPokemon, showDialog, stopMovement: encounterStop, handleCatchNo } =
    useEncounter({ x: player.x, y: player.y }, safePokemonList, TILE_SIZE);

  useEffect(() => {
    setStopMovement(encounterStop);
  }, [encounterStop]);

  //SOCKET HOOK
  const [otherPlayers, setOtherPlayers] = useState<PlayerState[]>([]);
  const { sendPlayerMove, emitEvent, subscribeEvent } = useGameSocket((players) => {
    const others = players.filter((p) => p.id !== avatarId);
    setOtherPlayers(others);
  });

  const [showPopupOne, setShowPopUpOne] = useState(false);
  const [showPopupTwo, setShowPopUpTwo] = useState(false);

  // Inside a component
  const handleBattleLatestAndNavigate = async () => {
    if (!avatarData?._id) return;

    try {
      await battleLatest(avatarData._id);
      navigate("/matching");
    } catch (err) {
      console.error("Failed to update battle and navigate:", err);
    }
  };

  // Show popup when player.currentTiles === 2
  useEffect(() => {
    if (player.currentTiles === 2) {
      setShowPopUpOne(true);
      setShowPopUpTwo(false);
    } else if (player.currentTiles === 3) {
      setShowPopUpTwo(true);
      setShowPopUpOne(false);
    }
  }, [player.currentTiles]);
  
  // DESIGN HOOK
  const [uiScale, setUiScale] = useState(1);

  //FETCH INITIAL POKEMON
  useEffect(() => {
    axios
      .get<MapPokemon[]>("https://localhost/api/pokemon")
      .then((res) => setPokemonList(res.data))
      .catch((err) => console.error("Failed to fetch initial Pokemon:", err));
  }, [setPokemonList]);

  //SUBSCRIBE POKEMON UPDATES
  useEffect(() => {
    const unsubscribe = subscribeEvent<MapPokemon[]>("pokemonUpdate", (updated) => {
      setPokemonList(updated);
    });
    return unsubscribe;
  }, [subscribeEvent, setPokemonList]);

  //SEND PLAYER MOVE CONTINUOUSLY
  useEffect(() => {
    sendPlayerMove(player.x, player.y, player.direction, player.frame, player.charIndex);
  }, [player.x, player.y, player.direction, player.frame, player.charIndex, sendPlayerMove]);
  
  //HANDLE CATCH
  const queryClient = useQueryClient();

  const handleCatchPokemon = (p: MapPokemon) => {
    if (!avatarId || !avatarData) {
      console.error("No avatar ID found or avatarData missing");
      handleCatchNo();
      return;
    }

    const existing = pokemonList.find((poke) => poke._id === p._id);

    if (!existing) {
      console.log("Pokemon not found in list, skipping catch")
      handleCatchNo();
      return; // exit early
    }     

    const tempId = `temp-${p._id}-${Date.now()}`;
    queryClient.setQueryData<AvatarData>(["avatar", avatarId], (old) => {
      if (!old) return old;

      const newPokemon: PlayerPokemon = {
        _id: tempId,
        name: p.name ?? "Unknown",
        type: p.type ?? "Unknown",

        is_shiny: p.is_shiny,
        hp: p.hp, 
        attack: p.attack
      };

      return {
        ...old,
        pokemonInventory: [...old.pokemonInventory, newPokemon],
      };
    });

    emitEvent("catchPokemon", {mapPokemonId: p._id});

    handleCatchNo();

    const unsubscribe = subscribeEvent<{ avatar: AvatarData; playerPokemon: PlayerPokemon }>(
      "catchPokemonResult",
      (data) => {
        queryClient.setQueryData<AvatarData>(["avatar", data.avatar._id], data.avatar);
        unsubscribe();
      }
    );
  };

  useEffect(() => {
    if (showDialog) {
      setShowPopUpOne(false);
      setShowPopUpTwo(false);
    }
  }, [showDialog]);

  useEffect(() => {
    const handleResize = () => {
      const scaleWidth = window.innerWidth / DESIGN_WIDTH;
      const scaleHeight = window.innerHeight / DESIGN_HEIGHT;

      const scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, Math.min(scaleWidth, scaleHeight))
      );

      setUiScale(scale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //CAMERA
  const VIEW_WIDTH = window.innerWidth / TILE_SIZE;
  const VIEW_HEIGHT = window.innerHeight / TILE_SIZE;
  const viewPixelWidth = VIEW_WIDTH * TILE_SIZE;
  const viewPixelHeight = VIEW_HEIGHT * TILE_SIZE;

  let offsetX = player.x - viewPixelWidth / 2 + TILE_SIZE / 2;
  let offsetY = player.y - viewPixelHeight / 2 + TILE_SIZE / 2;

  offsetX = Math.max(0, Math.min(offsetX, MAP_WIDTH * TILE_SIZE - viewPixelWidth));
  offsetY = Math.max(0, Math.min(offsetY, MAP_HEIGHT * TILE_SIZE - viewPixelHeight));

  //RENDER
  return (
    <div className="relative overflow-hidden" style={{ width: viewPixelWidth, height: viewPixelHeight }}>
      {/* MAP */}
      <div
        className="absolute z-0 bg-cover bg-no-repeat"
        style={{ left: -offsetX, top: -offsetY, width: MAP_WIDTH * TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE, backgroundImage: `url(${mapImage})` }}
      />

      {/* POKEMON */}
      {safePokemonList.map((p) => (
        <Pokemon key={p._id} x={p.x - offsetX} y={p.y - offsetY} name={p.name ?? "Unknown"} tileSize={TILE_SIZE} zIndex={2} />
      ))}

      {/* OTHER PLAYERS */}
      {otherPlayers.map((p) => (
        <Player key={p.id} x={p.x - offsetX} y={p.y - offsetY} direction={p.direction as Direction} frame={p.frame} charIndex={p.charIndex} tileSize={TILE_SIZE} spriteSheet={playerSprite} zIndex={4} />
      ))}

      {/* LOCAL PLAYER */}
      <Player x={player.x - offsetX} y={player.y - offsetY} direction={player.direction as Direction} frame={player.frame} charIndex={player.charIndex} tileSize={TILE_SIZE} spriteSheet={playerSprite} zIndex={5} />

      {/* FOREGROUND */}
      <div className="absolute pointer-events-none z-10 bg-cover bg-no-repeat" style={{ left: -offsetX, top: -offsetY, width: MAP_WIDTH * TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE, backgroundImage: `url(${mapForeground})` }} />

      {showPopupOne && (
        <GamePopup
          title="Choose Mode"
          onClose={() => setShowPopUpOne(false)}
          button1Text="Trainer Battle"
          onButton1={() => {
            setShowPopUpOne(false);
            handleBattleLatestAndNavigate();
          }}
          button2Text="Training Ground"
          onButton2={() => {
            setShowPopUpOne(false);
            navigate(`/aibattle`);
          }}
          scale={uiScale}
        />
      )}

      {showPopupTwo && (
        <GamePopup
          title="Mini Game"
          onClose={() => setShowPopUpTwo(false)}
          button1Text="Eevee Race"
          onButton1={() => {
            console.log("Eeveed Race clicked");
            setShowPopUpTwo(false);
            navigate("/race");
          }}
          scale={uiScale}
        />
      )}

      {/* ENCOUNTER DIALOG */}
      {showDialog && encounterPokemon && (
        <CatchDialog
          scale={uiScale}
          onYes={() => handleCatchPokemon(encounterPokemon)}
          onNo={handleCatchNo}
        />
      )}
    </div>
  );
}
