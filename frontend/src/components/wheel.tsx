import { useState, useRef, useEffect, useCallback } from "react";

const sections = [5, 6, 5, 3, 3, 4, 3, 3, 4, 3, 3, 4]; // 12 sections

const numberColors: Record<number, string> = {
  3: "#FF6B6B",
  4: "#4ECDC4",
  5: "#45B7D1",
  6: "#FFD700",
};

export default function SpinningWheel() {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const requestRef = useRef<number>(0);
  const speedRef = useRef(0);

  // Bigger wheel
  const radius = 200;
  const center = 250; // SVG center

  // ---------------- SPIN LOGIC ----------------
  const spin = useCallback(() => {
    setAngle((prev) => (prev + speedRef.current) % 360);
  }, []); // just updates the angle

  const startSpin = useCallback(() => {
    const step = () => {
      spin(); // call spin to update angle
      requestRef.current = requestAnimationFrame(step);
    };
    requestRef.current = requestAnimationFrame(step);
  }, [spin]);

  const handleStart = useCallback(() => {
    if (!spinning) {
      setSpinning(true);
      speedRef.current = 5;
      startSpin();
      setResult(null);
    }
  }, [spinning, startSpin]);

  const handleStop = useCallback(() => {
    if (spinning) {
      cancelAnimationFrame(requestRef.current!);
      setSpinning(false);

      const sectionAngle = 360 / sections.length;
      const normalizedAngle = (angle % 360 + 360) % 360;
      const index =
        Math.floor((360 - normalizedAngle) / sectionAngle) % sections.length;

      setResult(sections[index]);
    }
  }, [spinning, angle]);

  const handleCenterClick = () => {
    if (spinning) handleStop();
    else handleStart();
  };

  // ---------------- KEYBOARD CONTROLS ----------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent space/enter from scrolling page
      if (e.code === "Space") e.preventDefault();

      if (!spinning && (e.code === "Space")) {
        handleStart();
      } else if (spinning && (e.code === "Space")) {
        handleStop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spinning, handleStart, handleStop]);

  const createArc = (startAngle: number, endAngle: number) => {
    const rad = Math.PI / 180;
    const x1 = center + radius * Math.cos(startAngle * rad);
    const y1 = center + radius * Math.sin(startAngle * rad);
    const x2 = center + radius * Math.cos(endAngle * rad);
    const y2 = center + radius * Math.sin(endAngle * rad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "175.8vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <h2>Spinning Wheel Skill</h2>

      <div
        style={{
          position: "relative",
          width: 2 * center,
          height: 2 * center,
        }}
      >
        {/* Wheel */}
        <svg
          width={2 * center}
          height={2 * center}
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {sections.map((num, i) => {
            const start = (i * 360) / sections.length;
            const end = ((i + 1) * 360) / sections.length;
            const midAngle = (start + end) / 2;

            return (
              <g key={i}>
                <path
                  d={createArc(start, end)}
                  fill={numberColors[num]}
                  stroke="#000"
                  strokeWidth={3}
                />
                <text
                  x={center + (radius / 2) * Math.cos(midAngle * (Math.PI / 180))}
                  y={center + (radius / 2) * Math.sin(midAngle * (Math.PI / 180))}
                  fontSize="24"
                  fontWeight="bold"
                  fill={num === 6 ? "#000" : "#FFF"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Center Circle Control */}
          <circle
            cx={center}
            cy={center}
            r={60}
            fill={spinning ? "#f44336" : "#4CAF50"}
            stroke="#333"
            strokeWidth={4}
            style={{ cursor: "pointer" }}
            onClick={handleCenterClick}
          />
          <text
            x={center}
            y={center}
            fontSize="20"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {spinning ? "STOP" : "START"}
          </text>
        </svg>

        {/* Needle pointing RIGHT */}
        <div
          style={{
            position: "absolute",
            top: center - 15,
            left: center + radius,
            width: 0,
            height: 0,
            borderTop: "15px solid transparent",
            borderBottom: "15px solid transparent",
            borderRight: "25px solid red",
            zIndex: 10,
          }}
        />
      </div>

      <div style={{ marginTop: 30, textAlign: "center" }}>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}>
          Click the center circle or use Space:
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 15px",
                backgroundColor: "#4CAF50",
                color: "white",
                borderRadius: "4px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              SPACE
            </div>
            <div>Start Spinning</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 15px",
                backgroundColor: "#f44336",
                color: "white",
                borderRadius: "4px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              SPACE
            </div>
            <div>Stop Spinning</div>
          </div>
        </div>
      </div>

      {result !== null && (
        <h3 style={{ marginTop: 20, fontSize: "28px" }}>Damage: {result}</h3>
      )}


      {result === null && (
        <h3 style={{ marginTop: 20, fontSize: "28px" }}>Damage: {0}</h3>
      )}
    </div>
  );
}
