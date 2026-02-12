import PixelButton from "./PixelButton";
import { ASSETS } from "../../assets";

interface CatchDialogProps {
  onYes: () => void;
  onNo: () => void;
  scale: number; // scale from parent (GameMap)
}

export default function CatchDialog({ onYes, onNo, scale }: CatchDialogProps) {
  const BASE_WIDTH = 400; // base width of the banner
  const IMAGE_RATIO = 2221 / 1050; // original image width / height

  const width = BASE_WIDTH * scale;
  const height = width / IMAGE_RATIO;

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{ width, height }}
    >
      {/* BANNER */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          backgroundImage: `url(${ASSETS.ELEMENTS.CATCHDIALOG})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      >
        {/* Overlay text & buttons */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div
            className="text-center text-[#ffffff]"
            style={{ fontSize: `${1.6 * scale}rem` }}
          >
            Catch this Pokemon?
          </div>

          <div className="flex gap-6">
            <PixelButton
              height={45 * scale}
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#677fb4"
              textSize={`${1.2 * scale}rem`}
              onClick={onNo}
              hoverScale={1.1}
              cursorPointer={true}
            >
              No
            </PixelButton>

            <PixelButton
              height={45 * scale}
              colorA="#ffcc00"
              colorB="#d4a500"
              colorText="#333333"
              textSize={`${1.2 * scale}rem`}
              onClick={onYes}
              hoverScale={1.1}
              cursorPointer={true}
            >
              Yes
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
