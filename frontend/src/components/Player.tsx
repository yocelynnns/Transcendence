// PLAYER DIRECTION TYPE
export type Direction =
  | "up"
  | "up-right"
  | "right"
  | "down-right"
  | "down"
  | "down-left"
  | "left"
  | "up-left";

// PLAYER COMPONENT PROPS
export type PlayerProps = {
  x: number;
  y: number;
  direction: Direction;
  frame: number;       // 0-2 WALKING FRAMES
  charIndex: number;   // 0-2 CHARACTER INDEX
  tileSize: number;    // 32, 64, ETC.
  spriteSheet: string;
  zIndex?: number;     // OPTIONAL ZINDEX
};

// PLAYER COMPONENT
export default function Player({
  x,
  y,
  direction,
  frame,
  charIndex,
  tileSize,
  spriteSheet,
  zIndex = 10, // DEFAULT VALUE
}: PlayerProps) {
  const spriteWidth = 16;  // ORIGINAL SPRITE WIDTH
  const spriteHeight = 24; // ORIGINAL SPRITE HEIGHT

  // SPRITE SHEET LAYOUT
  const charBaseRows = [1, 5, 9];
  const row = charBaseRows[charIndex] + frame;

  const directions: Direction[] = [
    "up",
    "up-right",
    "right",
    "down-right",
    "down",
    "down-left",
    "left",
    "up-left",
  ];
  const col = directions.indexOf(direction);

  // SCALE PROPORTIONALLY
  const scale = tileSize / spriteHeight;
  const scaledWidth = spriteWidth * scale;
  const offsetX = (tileSize - scaledWidth) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: tileSize,
        height: tileSize,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: zIndex,
      }}
    >
      <div
        style={{
          width: spriteWidth,
          height: spriteHeight,
          backgroundImage: `url(${spriteSheet})`,
          backgroundPosition: `-${col * spriteWidth}px -${row * spriteHeight}px`,
          imageRendering: "pixelated",
          transform: `scale(${scale}) translateX(${offsetX / scale}px)`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
