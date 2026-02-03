import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";
// interface EventButtonProps {
// }

export default function EventButton() {
  const navigate = useNavigate();

  const eventButton = ASSETS.HEALTH.EVENT.EVENT;

  const handleClick = async () => {
    navigate(`/event`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        // position: "absolute",
        // top: 320,
        // right: 13,
        cursor: "pointer",
        zIndex: 100,
        width: 60,
        height: 60,
      }}
    >
      <img
        src={eventButton}
        alt="Play Event"
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
