//IMPORTS
import { useState, useEffect, useRef } from "react";
import type { Direction } from "../components/map/GamePlayer";
import useKeyboard from "./useKeyboard";
import { canMove, PLAYER_OFFSET_X, PLAYER_OFFSET_Y } from "../utils/collision";

import { PlayerState } from "../types/avatarTypes";

//CONSTANTS
const MOVE_SPEED = 1.5;  
const FRAME_INTERVAL = 180;   
const TILE_SIZE = 84;

//TYPES

type UsePlayerProps = {
  startX: number;
  startY: number;
  mapWidth: number;
  mapHeight: number;
  collision: number[];
  stopMovement?: boolean;
  charPref?: number;
  freeze: boolean; 
};

//MAIN HOOK
export default function usePlayer({
  startX,
  startY,
  mapWidth,
  mapHeight,
  collision,
  stopMovement = false,
  charPref,
  freeze,
}: UsePlayerProps) {

  //PLAYER STATE
  const [player, setPlayer] = useState<PlayerState>({
    x: startX * TILE_SIZE,
    y: startY * TILE_SIZE,
    direction: "down",
    frame: 1,
    charIndex: charPref ?? 0,
    moving: false,
  });

  //KEYBOARD HOOK
  const keysPressed = useKeyboard();

  //REFS
  const frameTimer = useRef<number>(0);
  const stopMovementRef = useRef<boolean>(stopMovement);

  //SYNC STOP MOVEMENT PROP
  useEffect(() => {
    stopMovementRef.current = stopMovement || freeze;
  }, [stopMovement, freeze]);

  //SYNC CHARACTER PREFERENCE
  useEffect(() => {
    if (charPref !== undefined && charPref !== null) {
      const id = setTimeout(() => {
        setPlayer((prev) => {
          if (prev.charIndex === charPref) return prev;
          return { ...prev, charIndex: charPref };
        });
      }, 0);

      return () => clearTimeout(id); 
    }
  }, [charPref]);

  //GET DIRECTION
  function getDirection(dx: number, dy: number): Direction | null {
    if (dx === 0 && dy < 0) return "up";
    if (dx > 0 && dy < 0) return "up-right";
    if (dx > 0 && dy === 0) return "right";
    if (dx > 0 && dy > 0) return "down-right";
    if (dx === 0 && dy > 0) return "down";
    if (dx < 0 && dy > 0) return "down-left";
    if (dx < 0 && dy === 0) return "left";
    if (dx < 0 && dy < 0) return "up-left";
    return null;
  }

  //MAIN EFFECT: PLAYER MOVEMENT
  useEffect(() => {
    let lastTime = performance.now();

    function update(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      let dx = 0;
      let dy = 0;

      // KEY INPUT
      if (!stopMovementRef.current) {
        const keys = keysPressed.current;

        if (keys.has("w") || keys.has("W")) dy -= MOVE_SPEED;
        if (keys.has("s") || keys.has("S")) dy += MOVE_SPEED;
        if (keys.has("a") || keys.has("A")) dx -= MOVE_SPEED;
        if (keys.has("d") || keys.has("D")) dx += MOVE_SPEED;

        if (dx !== 0 && dy !== 0) {
          dx /= Math.sqrt(2);
          dy /= Math.sqrt(2);
        }
      }

      const isMoving = dx !== 0 || dy !== 0;
      const newDir = getDirection(dx, dy);

      //UPDATE PLAYER STATE
      setPlayer((p) => {
        let newPx = p.x + dx;
        let newPy = p.y + dy;

        if (!canMove(newPx, p.y, mapWidth, mapHeight, collision)) newPx = p.x;
        if (!canMove(p.x, newPy, mapWidth, mapHeight, collision)) newPy = p.y;

        const nextTileX = Math.floor((p.x + dx + PLAYER_OFFSET_X) / TILE_SIZE);
        const nextTileY = Math.floor((p.y + dy + PLAYER_OFFSET_Y) / TILE_SIZE);

        // Compute 1D index
        const index = (nextTileY) * mapWidth + nextTileX;

        p.currentTiles = collision[index];
        // console.log(p.currentTiles);

        let newFrame = p.frame;
        if (isMoving) {
          frameTimer.current += dt;
          newFrame = Math.floor(frameTimer.current / FRAME_INTERVAL) % 3;

          if (frameTimer.current >= FRAME_INTERVAL * 3) {
            frameTimer.current -= FRAME_INTERVAL * 3;
          }
        } else {
          newFrame = 1;
          frameTimer.current = 0;
        }

        return {
          ...p,
          x: newPx,
          y: newPy,
          direction: newDir || p.direction,
          frame: newFrame,
          moving: isMoving,
        };
      });

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [keysPressed, mapWidth, mapHeight, collision]);

  //RETURN PLAYER STATE
  return player;
}
