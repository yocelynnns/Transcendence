import { InputHTMLAttributes } from "react";
import { ASSETS } from "../../assets";
import { Slice, SliceMid } from "./PixelSlices";

interface PixelButtonInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  height?: number;
  className?: string;
  colorA: string;
  colorB: string;
  colorText: string;
  textSize?: string;
  width?: number;
}

export default function PixelButtonInput({
  height = 36,
  className = "",
  colorA,
  colorB,
  colorText,
  textSize = "14px",
  width,
  ...props
}: PixelButtonInputProps) {
  const LEFT_RATIO = 50 / 309;
  const RIGHT_RATIO = 50 / 309;

  const leftWidth = height * LEFT_RATIO;
  const rightWidth = height * RIGHT_RATIO;

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      style={{ height, width: width ?? "100%" }}
    >
      {/* LAYER B (BACK / SHADOW) */}
      <div className="absolute inset-0 flex pointer-events-none">
        <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.B} color={colorB} width={leftWidth} height={height} />
        <SliceMid
          img={ASSETS.ELEMENTS.BUTTON.MID.B}
          color={colorB}
          height={height}
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          totalWidth={width}
        />
        <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.B} color={colorB} width={rightWidth} height={height} />
      </div>

      {/* LAYER A (FRONT) */}
      <div className="relative flex">
        <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.A} color={colorA} width={leftWidth} height={height} />
        <SliceMid
          img={ASSETS.ELEMENTS.BUTTON.MID.A}
          color={colorA}
          height={height}
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          totalWidth={width}
        />
        <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.A} color={colorA} width={rightWidth} height={height} />
      </div>

      {/* REAL INPUT */}
      <input
        {...props}
        className="
          absolute inset-0 z-10
          w-full h-full
          bg-transparent
          outline-none
          px-4
          pixelify-sans
        "
        style={{
          color: colorText,
          fontSize: textSize,
          lineHeight: `${height}px`,
          transform: "translateY(-0.2rem)",
        }}
      />
    </div>
  );
}
