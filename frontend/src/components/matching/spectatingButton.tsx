import { useNavigate } from "react-router-dom";
import { ASSETS } from "../../assets";
import { useState, useEffect,Dispatch } from "react";
import axios from "axios";
import { AvatarData } from "../../types/avatarTypes";
import { useGameSocket } from "../../ws/useGameSocket";
import { Battle } from "../../types/battleTypes";

interface SpectatingButtonProps {
  avatarId: string; // only avatarId
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;

}

export default function SpectatingButton({ avatarId, setSpectatingBattle }: SpectatingButtonProps) {
  const navigate = useNavigate();
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const { emitEvent } = useGameSocket(() => {});

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await axios.get(`/api/avatar/${avatarId}`);
        setAvatarData(res.data);
      } catch (err) {
        console.log("Failed to fetch avatar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [avatarId]);

  if (loading) return null;

  const swordButton = ASSETS.HEALTH.SPEC.SPEC;

  const handleClick = async () => {
    if (!avatarData) return;

    if (!avatarData.currentBattle) {
      alert("This player is not in a battle currently!");
      return;
    }

    const battleId = avatarData.currentBattle;

    // emit join as spectator
    emitEvent("joinAsSpectator", { battleId });


    const res = await fetch(`/api/battle/${battleId}`);
    const currentBattle = await res.json();
    setSpectatingBattle(currentBattle as Battle);

    // navigate to battle page as spectator
    navigate(`/spectating/${battleId}`, {});
  };

  return (
    <div
      onClick={handleClick}
      style={{
        // position: "absolute",
        // top: 120,
        // right: 13,
        cursor: "pointer",
        zIndex: 100,
        width: 60,
        height: 60,
      }}
    >
      <img
        src={swordButton}
        alt="Go to Spectate"
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
