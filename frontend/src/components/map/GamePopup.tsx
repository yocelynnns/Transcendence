import React from "react";
import PixelButton from "../elements/PixelButton";
import { ASSETS } from "../../assets";

type GamePopupProps = {
  title: string;
  onClose: () => void;

  button1Text?: string;
  onButton1?: () => void;

  button2Text?: string;
  onButton2?: () => void;

  scale: number;
};

export default function GamePopup({
  title,
  onClose,
  button1Text,
  onButton1,
  button2Text,
  onButton2,
  scale,
}: GamePopupProps) {
  const BASE_WIDTH = 400;
  const BASE_HEIGHT = 200;

  const buttonWidth = Math.floor(BASE_WIDTH / 3);
  const buttonHeight = 65;

  return (
    <div
      className="absolute left-1/2 bottom-6 z-50"
      style={{
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "bottom center",
        fontFamily: "monospace",
      }}
    >
      <div className="relative w-full h-full">

        {/* ✅ Background (non-interactive) */}
        <PixelButton
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          colorA="#677fb4"
          colorB="#384071"
          colorText="#000"
          textSize="10px"
          cursorPointer={false}
        />

        {/* ✅ Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">

          {/* Close */}
          <div
            className="absolute top-2 right-3 text-white font-bold cursor-pointer hover:scale-110"
            onClick={onClose}
          >
            <button
              onClick={onClose}
            >
              <img
                src={ASSETS.ICONS.BLUEX}
                alt="X"
                className="w-8 h-8 object-contain image-rendering-pixelated hover:scale-102"
              />
            </button>
          </div>

          {/* Title */}
          <div
            className="text-white text-center"
            style={{ fontSize: "1.4rem" }}
          >
            {title}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-8 px-4">
            {button1Text && onButton1 && (
              <PixelButton
                width={buttonWidth}
                height={buttonHeight}
                colorA="#ffcc00"
                colorB="#d4a500"
                colorText="#000"
                textSize="1rem"
                onClick={onButton1}
                cursorPointer={true}
                hoverScale={1.1}
              >
                {button1Text}
              </PixelButton>
            )}

            {button2Text && onButton2 && (
              <PixelButton
                width={buttonWidth}
                height={buttonHeight}
                colorA="#ffcc00"
                colorB="#d4a500"
                colorText="#000"
                textSize="1rem"
                onClick={onButton2}
                cursorPointer={true}
                hoverScale={1.1}
              >
                {button2Text}
              </PixelButton>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
