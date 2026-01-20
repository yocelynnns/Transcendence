//IMPORTS
import GameMap from "../components/GameMap";
import AvatarProfile from "../components/AvatarProfile";
import { useAvatar } from "../hooks/useAvatar";

//TYPES
interface HomePageProps {
  setToken: (token: string | null) => void;
  setAvatarId: (id: string | null) => void;
}

//MAIN COMPONENT
export default function HomePage({ setToken, setAvatarId }: HomePageProps) {
  //USE AVATAR HOOK
  const { avatarData, updateAvatar, isLoading } = useAvatar();

  //LOADING CHECK
  if (isLoading || !avatarData) return <div>Loading avatar...</div>;

  //RENDER
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
        {/*RENDER GAME MAP*/}
        <GameMap avatarData={avatarData} />

        {/*RENDER AVATAR PROFILE*/}
        <AvatarProfile
          setToken={setToken}
          setAvatarId={setAvatarId}
          avatarData={avatarData}
          updateAvatar={updateAvatar}
        />
      </div>
    </div>
  );
}
