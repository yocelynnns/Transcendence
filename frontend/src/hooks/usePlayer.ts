//IMPORTS
import { useState, useEffect, useRef } from "react";
import type { Direction } from "../components/Player";
import useKeyboard from "./useKeyboard";
import { canMove } from "../utils/collision";

//CONSTANTS
const MOVE_SPEED = 1.5;  
const FRAME_INTERVAL = 180;   
const TILE_SIZE = 64;

//TYPES
export type PlayerState = {
  px: number;
  py: number;
  direction: Direction;
  frame: number;
  charIndex: number;
  moving: boolean;
};

type UsePlayerProps = {
  startX: number;
  startY: number;
  mapWidth: number;
  mapHeight: number;
  collision: number[];
  stopMovement?: boolean;
  charPref?: number; 
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
}: UsePlayerProps) {

  //PLAYER STATE
  const [player, setPlayer] = useState<PlayerState>({
    px: startX * TILE_SIZE,
    py: startY * TILE_SIZE,
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
    stopMovementRef.current = stopMovement;
  }, [stopMovement]);

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

      //KEY INPUT
      if (!stopMovementRef.current) {
        if (keysPressed.current.has("w")) dy -= MOVE_SPEED;
        if (keysPressed.current.has("s")) dy += MOVE_SPEED;
        if (keysPressed.current.has("a")) dx -= MOVE_SPEED;
        if (keysPressed.current.has("d")) dx += MOVE_SPEED;

        if (dx !== 0 && dy !== 0) {
          dx /= Math.sqrt(2);
          dy /= Math.sqrt(2);
        }
      }

      const isMoving = dx !== 0 || dy !== 0;
      const newDir = getDirection(dx, dy);

      //UPDATE PLAYER STATE
      setPlayer((p) => {
        let newPx = p.px + dx;
        let newPy = p.py + dy;

        if (!canMove(newPx, p.py, mapWidth, mapHeight, collision)) newPx = p.px;
        if (!canMove(p.px, newPy, mapWidth, mapHeight, collision)) newPy = p.py;

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
          px: newPx,
          py: newPy,
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
