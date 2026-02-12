import { useEffect, useRef, useState } from "react";
import usePlayer from "../hooks/usePlayer";
import Player, { type Direction } from "../components/map/GamePlayer";
import Pokemon from "../components/map/GamePokemon";
import mapData from "../assets/map/map.json";
import { ASSETS } from "../assets";
import { useGameSocket } from "../ws/useGameSocket";
import { PlayerState } from "../types/avatarTypes";
import { MapPokemon } from "../types/pokemonTypes";
import { AvatarData } from "../types/avatarTypes";
import { useNavigate } from "react-router-dom";

// ASSETS
const mapImage = ASSETS.MAP.DEFAULT;
const playerSprite = ASSETS.PLAYER.DEFAULT;
const mapForeground = ASSETS.MAP.FOREGROUND;

// MAP CONSTANTS
const MAP_WIDTH = 20;
const MAP_HEIGHT = 34;
const TILE_SIZE = 84;

// TYPES
export interface EventPlayer {
  playerId: string;
  playerName: string;
  catchCount: number;
}

interface EventPageProps {
  avatarData: AvatarData | null | undefined;
}

export default function EventPage({ avatarData }: EventPageProps) {
  const navigate = useNavigate();
  const avatarId = avatarData?._id;
  const playerName = avatarData?.userName;

  // -------------------
  // WINDOW SIZE / SCALE
  // -------------------
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const VIEW_WIDTH = windowSize.width / TILE_SIZE;
  // const VIEW_HEIGHT = windowSize.height / TILE_SIZE;
  const viewPixelWidth = windowSize.width;
  const viewPixelHeight = windowSize.height;

  // -------------------
  // PLAYER
  // -------------------
  const player = usePlayer({
    startX: 10,
    startY: 17,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    collision: mapData.map,
    charPref: avatarData?.characterOption ?? 0,
    freeze: false,
  });

  // -------------------
  // SOCKET
  // -------------------
  const [otherPlayers, setOtherPlayers] = useState<PlayerState[]>([]);
  const { emitEvent, subscribeEvent } = useGameSocket(() => {});

  // -------------------
  // EVENT STATE
  // -------------------
  const [eventPokemons, setEventPokemons] = useState<MapPokemon[]>([]);
  const [catchCount, setCatchCount] = useState(0);

  const [eventFinished, setEventFinished] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [finalScores, setFinalScores] = useState<EventPlayer[]>([]);

  const [eventStartAt, setEventStartAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const emittedRef = useRef<Set<string>>(new Set());
  const joinRef = useRef<boolean>(false);

  // -------------------
  // INIT EVENT
  // -------------------
  useEffect(() => {
    const unsubState = subscribeEvent<{ pokemon: MapPokemon[]; players: EventPlayer[]; status: string }>(
      "updateEventState",
      (data) => {
        setEventPokemons(data.pokemon);
        const me = data.players.find((p) => p.playerId === avatarId);
        if (me) setCatchCount(me.catchCount);
      }
    );

    const FIVE_MIN = 5 * 60 * 1000;

    const unsubWaiting = subscribeEvent<{ createdAt: Date }>("eventWaiting", (data) => {
      const createdAtMs = new Date(data.createdAt).getTime();
      const startAt = createdAtMs + FIVE_MIN;
      setEventStartAt(startAt);

      const delay = Math.max(startAt - Date.now(), 0);
      const timeoutId = setTimeout(() => {
        if (avatarId && !joinRef.current) {
          joinRef.current = true;
          emitEvent("joinCatchEvent", { playerName });
        }
      }, delay);

      return () => clearTimeout(timeoutId);
    });

    const unsubFinished = subscribeEvent<{ winnerId: string; scores: EventPlayer[]; lastCheckedAt: Date }>(
      "eventFinished",
      (data) => {
        setEventFinished(true);
        setWinnerId(data.winnerId);
        setFinalScores(data.scores);

        const nextStart = new Date(data.lastCheckedAt).getTime() + 10 * 60 * 1000;
        setEventStartAt(nextStart);
      }
    );

    if (avatarId && !joinRef.current) {
      joinRef.current = true;
      emitEvent("joinCatchEvent", { playerName });
    }

    return () => {
      unsubState();
      unsubFinished();
      unsubWaiting();
    };
  }, [subscribeEvent, emitEvent, avatarId, playerName]);

  // -------------------
  // UPDATE OTHER PLAYERS
  // -------------------
  useEffect(() => {
    const unsubEventPlayers = subscribeEvent<PlayerState[]>("eventPlayersUpdate", (players) => {
      setOtherPlayers(players.filter((p) => p.id !== avatarId));
    });

    return () => unsubEventPlayers();
  }, [subscribeEvent, avatarId]);

  // -------------------
  // EMIT PLAYER MOVEMENT
  // -------------------
  useEffect(() => {
    if (!avatarId) return;
    emitEvent("eventPlayerMove", {
      x: player.x,
      y: player.y,
      direction: player.direction,
      frame: player.frame,
      charIndex: player.charIndex,
    });
  }, [player.x, player.y, player.direction, player.frame, player.charIndex, emitEvent, avatarId]);

  // -------------------
  // EVENT TIMER
  // -------------------
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
        if (emittedRef.current.has(p._id)) return;

        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < TILE_SIZE / 1.5) {
          emittedRef.current.add(p._id);
          emitEvent("attemptCatch", { eventId: "catch_event", pokemonId: p._id });
        }
      });
    });

    return () => cancelAnimationFrame(handle);
  }, [player.x, player.y, avatarId, emitEvent, eventPokemons, eventFinished]);

  // -------------------
  // CAMERA OFFSETS
  // -------------------
  let offsetX = player.x - viewPixelWidth / 2 + TILE_SIZE / 2;
  let offsetY = player.y - viewPixelHeight / 2 + TILE_SIZE / 2;

  offsetX = Math.max(0, Math.min(offsetX, MAP_WIDTH * TILE_SIZE - viewPixelWidth));
  offsetY = Math.max(0, Math.min(offsetY, MAP_HEIGHT * TILE_SIZE - viewPixelHeight));

  // -------------------
  // RENDER
  // -------------------
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* START TIMER */}
      {eventStartAt && timeLeft > 0 && (
        <div className="absolute top-4 left-[60px] bg-white border-[3px] border-black px-3 py-1 font-mono z-50">
          Event starts in: {Math.ceil(timeLeft / 1000)}s
        </div>
      )}

      {/* SCORE */}
      <div className="absolute top-4 right-[60px] bg-white border-[3px] border-black px-4 py-2 font-mono z-50">
        Catch count: {catchCount}
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-[60px] left-[60px] z-110 bg-white border-[3px] border-black px-3 py-1 font-mono cursor-pointer hover:bg-gray-200 active:translate-y-[2px]"
      >
        ← Back
      </button>

      {/* EVENT FINISHED OVERLAY */}
      {eventFinished && (
        <div className="absolute inset-0 bg-black/80 z-100 flex items-center justify-center text-white font-mono">
          <div className="bg-[#111] p-6 border-4 border-white">
            <h2 className="text-xl mb-2">🏆 Event Finished</h2>
            <p>
              Winner: <strong className="text-yellow-400">{winnerId + " 🎉"}</strong>
            </p>
            <div className="mt-3 space-y-1">
              {finalScores
                .sort((a, b) => b.catchCount - a.catchCount)
                .map((p) => (
                  <div key={p.playerId}>{p.playerId === avatarId ? "You" : p.playerName}: {p.catchCount}</div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      <div className="relative overflow-hidden" style={{ width: viewPixelWidth, height: viewPixelHeight }}>
        {/* MAP IMAGE */}
        <div
          className="absolute z-0 bg-cover bg-no-repeat"
          style={{
            left: -offsetX,
            top: -offsetY,
            width: MAP_WIDTH * TILE_SIZE,
            height: MAP_HEIGHT * TILE_SIZE,
            backgroundImage: `url(${mapImage})`,
          }}
        />

        {/* EVENT POKEMON */}
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
            zIndex={3}
          />
        ))}

        {/* LOCAL PLAYER */}
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

        {/* FOREGROUND */}
        <div
          className="absolute pointer-events-none z-10 bg-cover bg-no-repeat"
          style={{
            left: -offsetX,
            top: -offsetY,
            width: MAP_WIDTH * TILE_SIZE,
            height: MAP_HEIGHT * TILE_SIZE,
            backgroundImage: `url(${mapForeground})`,
          }}
        />
      </div>
    </div>
  );
}
