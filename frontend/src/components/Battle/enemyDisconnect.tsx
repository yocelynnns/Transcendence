import { useNavigate } from "react-router-dom";
import PixelButton from "../elements/PixelButton";

interface EnemyDisconnectedOverlayProps {
  onHome?: () => void;
  onMatching?: () => void;
}

export default function EnemyDisconnectedOverlay({
  onHome,
  onMatching,
}: EnemyDisconnectedOverlayProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className={[
          "relative w-[min(560px,92vw)]",
          "rounded-[22px] bg-[#f4f1e6] border-[6px] border-[#2b2b2b]",
          "shadow-[0_18px_0_rgba(0,0,0,0.25)]",
          "px-6 py-6 sm:px-8 sm:py-7",
          "select-none",
        ].join(" ")}
      >
        <div className="absolute left-4 right-4 top-3 h-1.5 rounded bg-black/10" />

        <div className="text-center">
          <h1 className="pixelify-sans font-black leading-none text-[clamp(28px,3.2vw,44px)] text-[#1b1b1b]">
            YOU WIN!
          </h1>

          <p className="mt-3 pixelify-sans text-[#3b3b3b] text-[clamp(14px,1.6vw,18px)]">
            Your enemy has disconnected.
          </p>
        </div>

        <div className="my-5 h-0.5 w-full bg-black/10" />

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="w-37.5">
            <PixelButton
              height={56}
              width={"100%"}
              onClick={onHome ?? (() => navigate("/"))}
              cursorPointer
              hoverScale={1.03}
              colorA="#6B6B6B"
              colorB="#4F4F4F"
              colorText="#FFFFFF"
              textSize="18px"
            >
              HOME
            </PixelButton>
          </div>

          <div className="w-42.5">
            <PixelButton
              height={56}
              width={"100%"}
              onClick={onMatching ?? (() => navigate("/matching"))}
              cursorPointer
              hoverScale={1.03}
              colorA="#2E8B57"
              colorB="#1F6A40"
              colorText="#FFFFFF"
              textSize="18px"
            >
              MATCHING
            </PixelButton>
          </div>
        </div>

        <div className="mt-5 text-center text-[12px] text-black/45 pixelify-sans">
          Tip: Match sends you back to matchmaking
        </div>
      </div>
    </div>
  );
}
