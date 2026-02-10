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
  frame: number;
  charIndex: number;
  tileSize: number;
  spriteSheet: string;
  zIndex?: number;
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
  zIndex = 10,
}: PlayerProps) {
  const spriteWidth = 16;
  const spriteHeight = 24;

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
      className={`absolute overflow-hidden pointer-events-none`}
      style={{
        left: x,
        top: y,
        width: tileSize,
        height: tileSize,
        zIndex,
      }}
    >
      <div
        className="bg-no-repeat bg-auto"
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
