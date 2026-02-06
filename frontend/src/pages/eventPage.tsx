import { useEffect, useState } from "react";
import usePlayer from "../hooks/usePlayer";
import Player, { type Direction } from "../components/map/GamePlayer";
import mapData from "../assets/map/map.json";
import type { AvatarData, PlayerState } from "../types/avatarTypes";
import { ASSETS } from "../assets";
import { useGameSocket } from "../ws/useGameSocket";
import Pokemon from "../components/map/GamePokemon";
import { MapPokemon } from "../types/pokemonTypes";

export interface EventPlayer {
  playerId: string;
  playerName: string;
  catchCount: number;
}

// ASSETS
const mapImage = ASSETS.MAP.DEFAULT;
const playerSprite = ASSETS.PLAYER.DEFAULT;
const mapForeground = ASSETS.MAP.FOREGROUND;

// MAP CONSTANTS
const MAP_WIDTH = 20;
const MAP_HEIGHT = 34;
const TILE_SIZE = 64;
const VIEW_WIDTH = 10;
const VIEW_HEIGHT = 10;

// PROPS
interface EventPageProps {
  avatarData: AvatarData | null | undefined;
}

export default function EventPage({ avatarData }: EventPageProps) {

  const avatarId = avatarData?._id;
  const playerName = avatarData?.userName;

  // PLAYER
  const player = usePlayer({
    startX: 10,
    startY: 17,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    collision: mapData.map,
    charPref: avatarData?.characterOption ?? 0,
  });

  // SOCKET
  const [otherPlayers, setOtherPlayers] = useState<PlayerState[]>([]);
  const { sendPlayerMove, emitEvent, subscribeEvent } = useGameSocket((players) => {
    setOtherPlayers(players.filter((p) => p.id !== avatarId));
  });

  // EVENT STATE
  const [eventPokemons, setEventPokemons] = useState<MapPokemon[]>([]);
  const [catchCount, setCatchCount] = useState(0);

  // FINISH STATE
  const [eventFinished, setEventFinished] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [finalScores, setFinalScores] = useState<EventPlayer[]>([]);

  const [eventStartAt, setEventStartAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // INIT EVENT
  useEffect(() => {
    const unsubState = subscribeEvent<{
      pokemon: MapPokemon[];
      players: EventPlayer[];
      status: string;
    }>("updateEventState", (data) => {
      setEventPokemons(data.pokemon);
      const me = data.players.find((p) => p.playerId === avatarId);
      if (me) setCatchCount(me.catchCount);
    });


    const FIVE_MIN = 5 * 60 * 1000;

    const unsubWaiting = subscribeEvent<{ createdAt: Date }>(
      "eventWaiting",
      (data) => {
        const createdAtMs = new Date(data.createdAt).getTime();
        const startAt = createdAtMs + FIVE_MIN;

        setEventStartAt(startAt);

        const delay = Math.max(startAt - Date.now(), 0);

        const timeoutId = setTimeout(() => {
          console.log("🚀 Event started!");

          if (avatarId) {
            emitEvent("joinCatchEvent", { playerName });
          }
        }, delay);

        return () => clearTimeout(timeoutId);
      }
    );


    const unsubFinished = subscribeEvent<{
      winnerId: string;
      scores: EventPlayer[];
    }>("eventFinished", (data) => {
      setEventFinished(true);
      setWinnerId(data.winnerId);
      setFinalScores(data.scores);
    });

    if (avatarId) emitEvent("joinCatchEvent", { playerName });

    return () => {
      unsubState();
      unsubFinished();
      unsubWaiting();
    };
  }, [subscribeEvent, emitEvent, avatarId, playerName]);

  // -------------------
  // SEND MOVE
  // -------------------
  useEffect(() => {
    sendPlayerMove(player.x, player.y, player.direction, player.frame, player.charIndex);
  }, [player.x, player.y, player.direction, player.frame, player.charIndex, sendPlayerMove]);

  useEffect(() => {
  if (!eventStartAt) return;

  const interval = setInterval(() => {
    const remaining = eventStartAt - Date.now();
    setTimeLeft(Math.max(remaining, 0));
  }, 1000);

  return () => clearInterval(interval);
}, [eventStartAt]);


  // -------------------
  // ATTEMPT CATCH
  // -------------------
  useEffect(() => {
    if (!avatarId || eventFinished) return;

    const handle = requestAnimationFrame(() => {
      eventPokemons.forEach((p) => {
        if (p.caught) return;

        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < TILE_SIZE / 1.5) {
          emitEvent("attemptCatch", {
            eventId: "catch_event",
            pokemonId: p._id,
          });
        }
      });
    });

    return () => cancelAnimationFrame(handle);
  }, [player.x, player.y, avatarId, emitEvent, eventPokemons, eventFinished]);

  // -------------------
  // CAMERA
  // -------------------
  const viewPixelWidth = VIEW_WIDTH * TILE_SIZE;
  const viewPixelHeight = VIEW_HEIGHT * TILE_SIZE;

  let offsetX = player.x - viewPixelWidth / 2 + TILE_SIZE / 2;
  let offsetY = player.y - viewPixelHeight / 2 + TILE_SIZE / 2;

  offsetX = Math.max(0, Math.min(offsetX, MAP_WIDTH * TILE_SIZE - viewPixelWidth));
  offsetY = Math.max(0, Math.min(offsetY, MAP_HEIGHT * TILE_SIZE - viewPixelHeight));

  // -------------------
  // RENDER
  // -------------------
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >

      {eventStartAt && timeLeft > 0 && (
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 60,
          background: "#fff",
          border: "3px solid #000",
          padding: "6px 10px",
          fontFamily: "monospace",
          zIndex: 50,
        }}
      >
        Event starts in: {Math.ceil(timeLeft / 1000)}s
      </div>
    )}

      {/* SCORE */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 60,
          background: "#fff",
          border: "3px solid #000",
          padding: "8px 12px",
          fontFamily: "monospace",
          zIndex: 50,
        }}
      >
        Catch count: {catchCount}
      </div>

      {/* EVENT FINISHED OVERLAY */}
      {eventFinished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontFamily: "monospace",
          }}
        >
          <div style={{ background: "#111", padding: 24, border: "4px solid #fff" }}>
            <h2>🏆 Event Finished</h2>
            <p>
              Winner:{" "}
              <strong style={{ color: "#ffd700" }}>
                {winnerId + " 🎉"}
              </strong>
            </p>

            <div style={{ marginTop: 12 }}>
              {finalScores
                .sort((a, b) => b.catchCount - a.catchCount)
                .map((p) => (
                  <div key={p.playerId}>
                    {p.playerId === avatarId ? "You" : p.playerName}: {p.catchCount}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      <div style={{ width: viewPixelWidth, height: viewPixelHeight, overflow: "hidden", position: "relative" }}>
        <img
          src={mapImage}
          alt="map"
          style={{
            position: "absolute",
            left: -offsetX,
            top: -offsetY,
            width: MAP_WIDTH * TILE_SIZE,
            height: MAP_HEIGHT * TILE_SIZE,
          }}
        />

        {eventPokemons.map(
          (p) =>
            !p.caught && (
              <Pokemon
                key={p._id}
                x={p.x - offsetX}
                y={p.y - offsetY}
                name={p.name}
                tileSize={TILE_SIZE}
                zIndex={2}
              />
            )
        )}

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
            zIndex={3}
          />
        ))}

        <Player
          x={player.x - offsetX}
          y={player.y - offsetY}
          direction={player.direction as Direction}
          frame={player.frame}
          charIndex={player.charIndex}
          tileSize={TILE_SIZE}
          spriteSheet={playerSprite}
          zIndex={5}
        />

        <img
          src={mapForeground}
          alt="foreground"
          style={{
            position: "absolute",
            left: -offsetX,
            top: -offsetY,
            width: MAP_WIDTH * TILE_SIZE,
            height: MAP_HEIGHT * TILE_SIZE,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}
