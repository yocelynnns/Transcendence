import { useState, useEffect, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import GameMap from "../components/map/GameMap";
import AvatarProfile from "../components/profile/GameProfile";
import { useAvatar } from "../hooks/useAvatar";
import { ASSETS } from "../assets";
import Guild from "../components/guild/GuildMain";
import { AvatarData } from "../types/avatarTypes";
import { Battle } from "../types/battleTypes";
import FriendsList from "../components/friendlist/FriendsList";
import RaceButton from "../components/race/RaceButton";

const designWidth = 1512; 
const maxScale = 1;   
const minScale = 0.5;    

interface HomePageProps {
  setToken: (token: string | null) => void;
  avatarData: AvatarData | null | undefined;
  token: string;
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
}

export default function HomePage({
  setToken,
  avatarData,
  token,
  setSpectatingBattle,
  setCurrentBattle,
}: HomePageProps) {

  const navigate = useNavigate();
  const { updateAvatar } = useAvatar(avatarData?._id ?? null);

  const [showGuildPanel, setShowGuildPanel] = useState(false);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);

  const [bannerScale, setBannerScale] = useState(1);
  const [guildScale, setGuildScale] = useState(1); // Add guild scale

  useEffect(() => {
    const handleResize = () => {
      const designHeight = 851; // your design height
      const scaleHeight = window.innerHeight / designHeight;

      const scaleWidth = Math.min(maxScale, Math.max(minScale, window.innerWidth / designWidth));
      
      // pick the smaller scale to keep aspect ratio without overflowing
      const scale = Math.min(scaleHeight, scaleWidth);

      setBannerScale(scale);  // still scale the banner if needed
      setGuildScale(scale);   // width scales proportionally, height is full
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!avatarData) return null;

  return (
    <div className="relative w-screen h-screen bg-[#b3e5fc] pixelify-sans">

      {/* Game Map */}
      <div className="absolute inset-0 z-0">
        <GameMap
          avatarData={avatarData}
          avatarId={avatarData._id}
          freeze={showGuildPanel || showFriendsPanel}
        />
      </div>

      {/* PROFILE + MENU BAR */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div
          className="relative pointer-events-auto"
          style={{ transform: `scale(${bannerScale})`, transformOrigin: "top left" }}
        >
          <AvatarProfile
            setToken={setToken}
            avatarData={avatarData}
            updateAvatar={updateAvatar}
          />

          {/* MENU BAR */}
          <div className="absolute top-25 left-46 flex items-center gap-2 z-60">
            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => setShowFriendsPanel(true)}>
                <img
                  src={ASSETS.ICONS.FRIENDLIST}
                  alt="Friends"
                  className="w-14 h-14 object-contain image-rendering-pixelated hover:scale-110"
                />
              </button>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => setShowGuildPanel(!showGuildPanel)}>
                <img
                  src={ASSETS.ICONS.GUILD}
                  alt="Guild"
                  className="w-14 h-14 object-contain image-rendering-pixelated hover:scale-110"
                />
              </button>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => navigate(`/event`)}>
                <img
                  src={ASSETS.ICONS.EVENT}
                  alt="Event"
                  className="w-14 h-14 object-contain image-rendering-pixelated hover:scale-110"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {showGuildPanel && (
        <div
          className="fixed inset-0 bg-[#222222]/40 z-40"
          onClick={() => setShowGuildPanel(false)}
        />
      )}

      {showFriendsPanel && (
        <div
          className="fixed inset-0 bg-[#222222]/40 z-40"
          onClick={() => setShowFriendsPanel(false)}
        />
      )}

      {/* FRIENDS PANEL */}
      {showFriendsPanel && avatarData && (
        <div className="fixed top-0 right-0 h-screen w-1/3 min-w-[360px] max-w-[520px] border-l-2 border-gray-300 z-50">
          <FriendsList
            token={token}
            myAvatarId={avatarData._id}
            myAvatarData={avatarData}
            setSpectatingBattle={setSpectatingBattle}
            setCurrentBattle={setCurrentBattle}
            isOpen={showFriendsPanel}
            onClosePanel={() => setShowFriendsPanel(false)}
          />
        </div>
      )}

      {/* GUILD PANEL */}
      {showGuildPanel && avatarData && (
        <Guild
          avatarData={avatarData}
          token={token}
          onClosePanel={() => setShowGuildPanel(false)}
          scale={guildScale} // Pass scale to Guild
        />
      )}

    </div>
  );
}