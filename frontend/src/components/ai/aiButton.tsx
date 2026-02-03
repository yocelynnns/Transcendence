import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";
// interface AiButtonProps {
// }

export default function AiButton() {
  const navigate = useNavigate();

  const aiButton = ASSETS.HEALTH.AI.AI;

  const handleClick = async () => {
    navigate(`/aibattle`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        // position: "absolute",
        // top: 250,
        // right: 13,
        cursor: "pointer",
        zIndex: 100,
        width: 60,
        height: 60,
      }}
    >
      <img
        src={aiButton}
        alt="Fight AI"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
