import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";

export default function EventButton() {
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(`/event`);
  };

  return (
    <div
      onClick={handleClick}
    >
      <img
        src={ASSETS.ICONS.EVENT}
        alt="Event"
        className="w-14 h-14 object-contain image-rendering-pixelated hover:scale-110"
      />
    </div>
  );
}
