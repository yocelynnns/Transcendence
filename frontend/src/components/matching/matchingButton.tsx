import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";
import { AvatarData } from "../../types/avatarTypes";

interface MatchingButtonProps {
  avatarData: AvatarData | null;
}

export default function MatchingButton({ avatarData }: MatchingButtonProps) {
  const navigate = useNavigate();

  if (!avatarData) return null;

  const swordButton = ASSETS.ICONS.BATTLE;

  const handleClick = () => {
    const pokemonInventory = avatarData.pokemonInventory ?? [];

    if (pokemonInventory.length < 3) {
      alert("You need at least 3 Pokemon to enter matchmaking!");
      return;
    }

    navigate("/matching");
  };

  return (
    <button
      onClick={handleClick}
      className="transform transition-transform duration-200 hover:scale-110"
    >
      <img
        src={swordButton}
        alt="Go to Matching"
        className="object-contain image-rendering-pixelated w-12 h-12"
      />
    </button>
  );
}
