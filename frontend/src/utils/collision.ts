// TILE SIZE
export const TILE_SIZE = 84;

// PLAYER COLLISION BOX
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
export const PLAYER_OFFSET_X = (TILE_SIZE - PLAYER_WIDTH) / 2;
export const PLAYER_OFFSET_Y = TILE_SIZE - PLAYER_HEIGHT;

// CHECK IF PLAYER CAN MOVE WITHOUT COLLISION
export function canMove(
  px: number,
  py: number,
  mapWidth: number,
  mapHeight: number,
  collision: number[]
) {
  // PLAYER BOUNDING TILES
  const left = Math.floor((px + PLAYER_OFFSET_X) / TILE_SIZE);
  const right = Math.floor((px + PLAYER_OFFSET_X + PLAYER_WIDTH - 1) / TILE_SIZE);
  const top = Math.floor((py + PLAYER_OFFSET_Y) / TILE_SIZE);
  const bottom = Math.floor((py + PLAYER_OFFSET_Y + PLAYER_HEIGHT - 1) / TILE_SIZE);

  // OUT OF MAP CHECK
  if (left < 0 || right >= mapWidth || top < 0 || bottom >= mapHeight) return false;

  // COLLISION CHECK
  if (
    collision[top * mapWidth + left] !== 0 ||
    collision[top * mapWidth + right] !== 0 ||
    collision[bottom * mapWidth + left] !== 0 ||
    collision[bottom * mapWidth + right] !== 0
  ) return false;

  return true;
}
