import { useState, useEffect, Dispatch, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GameMap from "../components/map/GameMap";
import AvatarProfile from "../components/profile/GameProfile";
import AvatarProfileButton from "../components/profile/GameProfileButton";
import { useAvatar } from "../hooks/useAvatar";
import { ASSETS } from "../assets";
import Guild from "../components/guild/GuildMain";
import { AvatarData } from "../types/avatarTypes";
import { Battle } from "../types/battleTypes";
import FriendsList from "../components/friendlist/FriendsList";

const designWidth = 1512;
const designHeight = 851; // added explicit design height
const maxScale = 1;
const minScale = 0.5;

interface HomePageProps {
  avatarData: AvatarData | null | undefined;
  token: string;
  setSpectatingBattle: Dispatch<React.SetStateAction<Battle | null>>;
  setCurrentBattle: Dispatch<React.SetStateAction<Battle | null>>;
  handleLogOut: () => void;
  battleLatest: (avatarId?: string, battleIdParam?:string) => Promise<void>;
  setBattleId: React.Dispatch<React.SetStateAction<string | null>>;
  currentBattle: Battle | null;
}

// Hook to detect mobile & portrait orientation
function useMobileLandscape() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const portrait = window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setIsPortrait(portrait);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isPortrait };
}

export default function HomePage({
  avatarData,
  token,
  setSpectatingBattle,
  setCurrentBattle,
  handleLogOut,
  battleLatest,
  setBattleId,
  currentBattle,
}: HomePageProps) {
  const navigate = useNavigate();
  const { updateAvatar } = useAvatar(avatarData?._id ?? null);

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showGuildPanel, setShowGuildPanel] = useState(false);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);

  const [bannerScale, setBannerScale] = useState(0); // start with 0 to wait for scale
  const [guildScale, setGuildScale] = useState(0);

  const { isMobile, isPortrait } = useMobileLandscape();

  // Compute scales after mount & resize
  useEffect(() => {
    const handleResize = () => {
      const scaleHeight = window.innerHeight / designHeight;
      const scaleWidth = Math.min(maxScale, Math.max(minScale, window.innerWidth / designWidth));
      const scale = Math.min(scaleHeight, scaleWidth);

      setBannerScale(scale);
      setGuildScale(scale);
    };

    // Ensure calculation after DOM layout
    requestAnimationFrame(handleResize);
    window.addEventListener("resize", () => requestAnimationFrame(handleResize));
    return () => window.removeEventListener("resize", () => requestAnimationFrame(handleResize));
  }, []);

  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!currentBattle) return;
    if (hasNavigatedRef.current) return; // prevent multiple navigations

    hasNavigatedRef.current = true;
    navigate("/matching");
  }, [currentBattle, navigate]);


  if (!avatarData || bannerScale === 0) return null;

  // Mobile portrait: show rotate overlay
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white z-50 p-4 text-center">
        <p className="text-xl font-bold">
          Please rotate your device to landscape mode for the best experience.
        </p>
      </div>
    );
  }

  const finalBannerScale = isMobile ? 0.7 : bannerScale;
  const finalGuildScale = isMobile ? 0.8 : guildScale;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#b3e5fc] pixelify-sans">

      {/* Game Map */}
      <div className="absolute inset-0 z-0">
        <GameMap
          avatarData={avatarData}
          avatarId={avatarData._id}
          freeze={showProfilePanel || showGuildPanel || showFriendsPanel}
          battleLatest={battleLatest}
        />
      </div>

      {/* PROFILE + MENU BAR */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div
          className="relative pointer-events-auto"
          style={{
            // width: `${designWidth}px`,
            // height: `${designHeight}px`,
            transform: `scale(${finalBannerScale})`,
            transformOrigin: "top left",
          }}
        >
          <AvatarProfileButton
            avatarData={avatarData}
            onClick={() => setShowProfilePanel(true)}
          />

          {/* MENU BAR */}
          <div className="absolute top-25 left-46 flex items-center gap-2 z-60">
            {/* FRIENDS BUTTON */}
            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => setShowFriendsPanel(true)}>
                <img
                  src={ASSETS.ICONS.FRIENDLIST}
                  alt="Friends"
                  className={`object-contain image-rendering-pixelated hover:scale-110 ${isMobile ? "w-10 h-10" : "w-14 h-14"}`}
                />
              </button>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => setShowGuildPanel(!showGuildPanel)}>
                <img
                  src={ASSETS.ICONS.GUILD}
                  alt="Guild"
                  className={`object-contain image-rendering-pixelated hover:scale-110 ${isMobile ? "w-10 h-10" : "w-14 h-14"}`}
                />
              </button>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-110">
              <button onClick={() => navigate(`/event`)}>
                <img
                  src={ASSETS.ICONS.EVENT}
                  alt="Event"
                  className={`object-contain image-rendering-pixelated hover:scale-110 ${isMobile ? "w-10 h-10" : "w-14 h-14"}`}
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

      {/* PROFILE PANEL */}
      {showProfilePanel && (
        <AvatarProfile
          handleLogOut={handleLogOut}
          avatarData={avatarData}
          updateAvatar={updateAvatar}
          onClose={() => setShowProfilePanel(false)}
          me={true}
        />
      )}

      {/* FRIENDS PANEL */}
      {showFriendsPanel && avatarData && (
        <FriendsList
          token={token}
          myAvatarId={avatarData._id}
          myAvatarData={avatarData}
          setSpectatingBattle={setSpectatingBattle}
          setCurrentBattle={setCurrentBattle}
          onClosePanel={() => setShowFriendsPanel(false)}
          scale={finalGuildScale}
          battleLatest={battleLatest}
          setBattleId={setBattleId}
          // isOpen={showFriendsPanel}
        />
      )}

      {/* GUILD PANEL */}
      {showGuildPanel && avatarData && (
        <Guild
          avatarData={avatarData}
          token={token}
          onClosePanel={() => setShowGuildPanel(false)}
          scale={finalGuildScale}
        />
      )}

    </div>
  );
}
