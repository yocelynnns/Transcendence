import { useNavigate } from "react-router-dom";

export default function RaceButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/race");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: "pointer",
        zIndex: 100,
        width: 60,
        height: 60,
      }}
      title="Button Mash Race"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#4CAF50",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          border: "2px solid #2E7D32",
        }}
      >
        🏁
      </div>
    </div>
  );
}

