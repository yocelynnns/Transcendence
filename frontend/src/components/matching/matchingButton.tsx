import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";
import { AvatarData } from "../../types/avatarTypes";

interface MatchingButtonProps {
  avatarData: AvatarData | null;
}

export default function MatchingButton({ avatarData }: MatchingButtonProps) {
  const navigate = useNavigate();

  if (!avatarData) return null;

  const swordButton = ASSETS.HEALTH.SWORD.CROSS;

  const handleClick = () => {
    const pokemonInventory = avatarData.pokemonInventory ?? [];

    if (pokemonInventory.length < 3) {
      alert("You need at least 3 Pokemon to enter matchmaking!");
      return;
    }

    navigate("/matching");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        // position: "absolute",
        // top: 100,
        // right: 8,
        cursor: "pointer",
        zIndex: 100,
        width: 70,
        height: 70,
      }}
    >
      <img
        src={swordButton}
        alt="Go to Matching"
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
