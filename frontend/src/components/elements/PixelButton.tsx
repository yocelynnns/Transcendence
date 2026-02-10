import { ReactNode, useRef, useEffect, useState } from "react";
import { ASSETS } from "../../assets";
import { Slice, SliceMid } from "./PixelSlices";

interface PixelButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  height?: number | string;
  colorA: string;
  colorB: string;
  colorText: string;
  textSize: string;
  width?: number | string;
  hoverScale?: number;
  cursorPointer?: boolean;
}

export default function PixelButton({
  children,
  onClick,
  height = 36,
  colorA,
  colorB,
  colorText,
  textSize,
  width,
  hoverScale = 1,
  cursorPointer = false,
}: PixelButtonProps) {
  const MAX_BUTTON_HEIGHT = 80; // Max height for each button section
  const OVERLAP = 30; // Overlap amount in pixels
  const HORIZONTAL_RATIO = 50 / 309;
  
  const ref = useRef<HTMLButtonElement>(null);
  const [realWidth, setRealWidth] = useState<number | undefined>(
    typeof width === "number" ? width : undefined
  );
  const [realHeight, setRealHeight] = useState<number | undefined>(
    typeof height === "number" ? height : undefined
  );

  useEffect(() => {
    if (ref.current) {
      if (width === "100%") {
        setRealWidth(ref.current.offsetWidth);
      }
      if (height === "100%" || typeof height === "string") {
        setRealHeight(ref.current.offsetHeight);
      }
    }
  }, [width, height]);

  const effectiveHeight = realHeight || (typeof height === "number" ? height : 36);
  const useVerticalSlicing = effectiveHeight > MAX_BUTTON_HEIGHT;

  // Calculate dimensions based on button height (capped at MAX_BUTTON_HEIGHT)
  const buttonHeight = useVerticalSlicing ? MAX_BUTTON_HEIGHT : effectiveHeight;
  const leftWidth = buttonHeight * HORIZONTAL_RATIO;
  const rightWidth = buttonHeight * HORIZONTAL_RATIO;
  
  // For vertical slicing
  const topHeight = useVerticalSlicing ? MAX_BUTTON_HEIGHT : effectiveHeight;
  const bottomHeight = useVerticalSlicing ? MAX_BUTTON_HEIGHT : 0;
  const middleHeight = useVerticalSlicing ? effectiveHeight - (topHeight + bottomHeight) + (OVERLAP * 2) : 0;

  if (useVerticalSlicing) {
    // Vertical 9-slice: top button + middle stretch + bottom button
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`relative flex flex-col select-none transition-transform duration-150 ${
          cursorPointer ? "cursor-pointer" : ""
        }`}
        style={{
          height,
          width: width ?? "100%",
          transform: "scale(1)",
        }}
        onMouseEnter={(e) => {
          if (hoverScale !== 1) (e.currentTarget as HTMLButtonElement).style.transform = `scale(${hoverScale})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {/* TOP BUTTON */}
        <div className="relative flex" style={{ height: topHeight, zIndex: 1 }}>
          {/* LAYER B */}
          <div className="absolute inset-0 flex pointer-events-none">
            <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.B} color={colorB} width={leftWidth} height={topHeight} />
            <SliceMid
              img={ASSETS.ELEMENTS.BUTTON.MID.B}
              color={colorB}
              height={topHeight}
              leftWidth={leftWidth}
              rightWidth={rightWidth}
              totalWidth={realWidth}
            />
            <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.B} color={colorB} width={rightWidth} height={topHeight} />
          </div>
          {/* LAYER A */}
          <div className="relative flex">
            <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.A} color={colorA} width={leftWidth} height={topHeight} />
            <SliceMid
              img={ASSETS.ELEMENTS.BUTTON.MID.A}
              color={colorA}
              height={topHeight}
              leftWidth={leftWidth}
              rightWidth={rightWidth}
              totalWidth={realWidth}
            />
            <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.A} color={colorA} width={rightWidth} height={topHeight} />
          </div>
        </div>

        {/* MIDDLE RECTANGLE (stretches and overlaps both buttons by 30px) */}
        <div 
          style={{ 
            backgroundColor: colorA,
            height: middleHeight,
            marginTop: -OVERLAP,
            marginBottom: -OVERLAP,
            zIndex: 2,
          }}
        />

        {/* BOTTOM BUTTON (flipped upside down) */}
        <div className="relative flex" style={{ height: bottomHeight, zIndex: 1 }}>
          {/* LAYER B */}
          <div className="absolute inset-0 flex pointer-events-none">
            <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.B} color={colorB} width={leftWidth} height={bottomHeight} />
            <SliceMid
              img={ASSETS.ELEMENTS.BUTTON.MID.B}
              color={colorB}
              height={bottomHeight}
              leftWidth={leftWidth}
              rightWidth={rightWidth}
              totalWidth={realWidth}
            />
            <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.B} color={colorB} width={rightWidth} height={bottomHeight} />
          </div>
          {/* LAYER A */}
          <div className="relative flex">
            <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.A} color={colorA} width={leftWidth} height={bottomHeight} />
            <SliceMid
              img={ASSETS.ELEMENTS.BUTTON.MID.A}
              color={colorA}
              height={bottomHeight}
              leftWidth={leftWidth}
              rightWidth={rightWidth}
              totalWidth={realWidth}
            />
            <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.A} color={colorA} width={rightWidth} height={bottomHeight} />
          </div>
        </div>

        {/* TEXT */}
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: "translateY(-0.2rem)", color: colorText, fontSize: textSize, zIndex: 3 }}
        >
          {children}
        </span>
      </button>
    );
  }

  // Original horizontal slicing for height <= 80
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`relative flex select-none transition-transform duration-150 ${
        cursorPointer ? "cursor-pointer" : ""
      }`}
      style={{
        height,
        width: width ?? "100%",
        transform: "scale(1)",
        display: "flex",
      }}
      onMouseEnter={(e) => {
        if (hoverScale !== 1) (e.currentTarget as HTMLButtonElement).style.transform = `scale(${hoverScale})`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      {/* LAYER B */}
      <div className="absolute inset-0 flex pointer-events-none">
        <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.B} color={colorB} width={leftWidth} height={effectiveHeight} />
        <SliceMid
          img={ASSETS.ELEMENTS.BUTTON.MID.B}
          color={colorB}
          height={effectiveHeight}
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          totalWidth={realWidth}
        />
        <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.B} color={colorB} width={rightWidth} height={effectiveHeight} />
      </div>
      {/* LAYER A */}
      <div className="relative flex">
        <Slice img={ASSETS.ELEMENTS.BUTTON.LEFT.A} color={colorA} width={leftWidth} height={effectiveHeight} />
        <SliceMid
          img={ASSETS.ELEMENTS.BUTTON.MID.A}
          color={colorA}
          height={effectiveHeight}
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          totalWidth={realWidth}
        />
        <Slice img={ASSETS.ELEMENTS.BUTTON.RIGHT.A} color={colorA} width={rightWidth} height={effectiveHeight} />
      </div>
      {/* TEXT */}
      <span
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: "translateY(-0.2rem)", color: colorText, fontSize: textSize }}
      >
        {children}
      </span>
    </button>
  );
}