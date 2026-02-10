import React from "react";

interface SliceProps {
  img: string;
  color: string;
  width: number;
  height: number;
}

export function Slice({ img, color, width, height }: SliceProps) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: color,
        WebkitMaskImage: `url(${img})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url(${img})`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
      }}
    />
  );
}

interface SliceMidProps {
  img: string;
  color: string;
  height: number;
  leftWidth: number;
  rightWidth: number;
  totalWidth?: number;
}

export function SliceMid({
  img,
  color,
  height,
  leftWidth,
  rightWidth,
  totalWidth,
}: SliceMidProps) {
  let width = totalWidth ? totalWidth - leftWidth - rightWidth : undefined;
  const overlap = 1;
  if (width) width += overlap * 2;

  return (
    <div
      style={{
        height,
        width,
        minWidth: height * 1.5,
        marginLeft: -overlap,
        marginRight: -overlap,
        backgroundColor: color,
        WebkitMaskImage: `url(${img})`,
        WebkitMaskRepeat: "repeat-x",
        WebkitMaskSize: "auto 100%",
        maskImage: `url(${img})`,
        maskRepeat: "repeat-x",
        maskSize: "auto 100%",
      }}
    />
  );
}
