import React from "react";

type GamePopupProps = {
  title: string;
  onClose: () => void;

  button1Text?: string;
  onButton1?: () => void;

  button2Text?: string;
  onButton2?: () => void;
};

export default function GamePopup({
  title,
  onClose,
  button1Text,
  onButton1,
  button2Text,
  onButton2,
}: GamePopupProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        border: "2px solid #000",
        padding: 16,
        borderRadius: 8,
        fontFamily: "monospace",
        textAlign: "center",
        minWidth: 220,
        zIndex: 100,
      }}
    >
      {/* ❌ Close Button */}
      <div
        style={{
          position: "absolute",
          top: 6,
          right: 10,
          cursor: "pointer",
          fontWeight: "bold",
        }}
        onClick={onClose}
      >
        ✕
      </div>

      <div style={{ marginBottom: 16 }}>{title}</div>

      <div>
        {/* Button 1 (optional) */}
        {button1Text && onButton1 && (
          <button
            style={{ padding: "6px 12px", marginRight: 8 }}
            onClick={onButton1}
          >
            {button1Text}
          </button>
        )}

        {/* Button 2 (optional) */}
        {button2Text && onButton2 && (
          <button
            style={{ padding: "6px 12px" }}
            onClick={onButton2}
          >
            {button2Text}
          </button>
        )}
      </div>
    </div>
  );
}
