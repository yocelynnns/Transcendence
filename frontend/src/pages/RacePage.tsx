import { useNavigate } from "react-router-dom";
import ButtonMashRace from "../components/race/ButtonMashRace";
import { AvatarData } from "../types/avatarTypes";

interface RacePageProps {
  avatarData: AvatarData | null;
}

export default function RacePage({ avatarData }: RacePageProps) {
  const navigate = useNavigate();

  if (!avatarData) {
    return <div>Loading...</div>;
  }

  return (
    <ButtonMashRace
      avatarId={avatarData._id}
      onExit={() => navigate("/")}
    />
  );
}

