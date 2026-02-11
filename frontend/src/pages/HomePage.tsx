import { useState, Dispatch } from "react";
import GameMap from "../components/map/GameMap";
import AvatarProfile from "../components/profile/GameProfile";
import { useAvatar } from "../hooks/useAvatar";
import Guild from "../components/guild/GuildMain";
import { AvatarData } from "../types/avatarTypes";
import MatchingButton from "../components/matching/matchingButton";
// import SpectatingButton from "../components/matching/spectatingButton";
import { Battle } from "../types/battleTypes";
import HistoryMain from "../components/Battle/historyMain";
import AiButton from "../components/ai/aiButton";
import EventButton from "../components/event/eventButton";
import FriendsList from "../components/friendlist/FriendsList";
import RaceButton from "../components/race/RaceButton";

interface HomePageProps {
  setToken: (token: string | null) => void;
  avatarData: AvatarData | null | undefined;
  token: string;
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;  // <-- ADD THIS
}

export default function HomePage({
  setToken,
  avatarData,
  token,
  setSpectatingBattle,
  setCurrentBattle,
}: HomePageProps) {
  const { updateAvatar } = useAvatar(avatarData?._id ?? null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 

  if (!avatarData) return null;

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        background: "#b3e5fc",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: 32, marginBottom: 20, textAlign: "center" }}>
        Welcome to your POKEMON World!
      </h1>

      {/* GAME CONTAINER */}
      <div style={{ width: 640, height: 640, position: "relative" }}>
        {/* Game Map */}
        <GameMap avatarData={avatarData} avatarId={avatarData._id} />

        {/* Avatar Profile */}
        <AvatarProfile
          setToken={setToken}
          avatarData={avatarData}
          updateAvatar={updateAvatar}
          onOpen={() => setProfileOpen(true)}
          onClose={() => setProfileOpen(false)}
        />

        {/* ✅ ADD FRIENDS LIST HERE */}
        <FriendsList 
          token={token} 
          myAvatarId={avatarData._id} 
          myAvatarData={avatarData}
          setSpectatingBattle={setSpectatingBattle}
          setCurrentBattle={setCurrentBattle} 
        />

        {/* Toggle Menu Button */}
        {!profileOpen && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              position: "absolute",
              top: 80,
              right: 20,
              width: "53.3px",
              height: "53.3px",
              borderRadius: "50%",
              textAlign: "center",
              fontSize: 14,
              cursor: "pointer",
              zIndex: 100,
            }}
          >
            {menuOpen ? "X" : "O"}
          </button>
        )}

        {menuOpen && !profileOpen && (
          <div
            style={{
              position: "absolute",
              top: 140,
              // left: 20,
              right: 20,
              display: "flex",
              flexDirection: "column",  
              gap: "8px",
              justifyContent: "center", 
              alignItems: "center",   
              background: "rgba(255,255,255,0.9)",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0 0 6px rgba(0,0,0,0.3)",
              zIndex: 100,
            }}
          >
            <Guild avatarData={avatarData} token={token} />
            <MatchingButton avatarData={avatarData} />
            {/* <SpectatingButton
              avatarId={"6985698f183c87855c7a8d33"}
              setSpectatingBattle={setSpectatingBattle}
            /> */}
            <HistoryMain avatarData={avatarData} />
            <AiButton />
            <EventButton />
            <RaceButton avatarData={avatarData} />
          </div>
        )}
      </div>
    </div>
  );
}
