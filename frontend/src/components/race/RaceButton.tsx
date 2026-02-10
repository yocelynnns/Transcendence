import { useState } from "react";
import ButtonMashRace from "../race/ButtonMashRace";
import { AvatarData } from "../../types/avatarTypes";

interface RaceButtonProps {
  avatarData: AvatarData;
}

export default function RaceButton({ avatarData }: RaceButtonProps) {
  const [showRace, setShowRace] = useState(false);

  // You can use an icon/image like EventButton if you have one
  // const raceIcon = ASSETS.RACE.ICON; // If you have a race icon

  return (
    <>
      <div
        onClick={() => setShowRace(true)}
        style={{
          cursor: "pointer",
          zIndex: 100,
          width: 60,
          height: 60,
          background: "rgba(255,255,255,0.9)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
        title="Button Mash Race"
      >
        🏁
      </div>

      {/* Race Component - Full Screen Overlay */}
      {showRace && (
        <ButtonMashRace
          avatarId={avatarData._id}
          onExit={() => setShowRace(false)}
        />
      )}
    </>
  );
}

