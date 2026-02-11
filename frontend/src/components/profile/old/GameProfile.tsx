// IMPORTS
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../../ws/useGameSocket";
import { getPokemonFrontSprite } from "../../assets/helpers";
import { ASSETS } from "../../assets";
import {AvatarData} from "../../types/avatarTypes"

// DEFAULT ASSETS
const defaultAvatar = ASSETS.AVATAR.CLEFFA;
const playerSprite = ASSETS.PLAYER.DEFAULT;

// PROPS
interface AvatarProfileProps {
  setToken: (token: string | null) => void;
  avatarData: AvatarData | null;
  updateAvatar: (updatedFields: Partial<AvatarData>) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

// MAIN COMPONENT
export default function AvatarProfile({
  setToken,
  avatarData,
  updateAvatar,
  onOpen,
  onClose,
}: AvatarProfileProps) {
  // NAVIGATION
  const navigate = useNavigate();

  // LOCAL STATE
  const [profileOpen, setProfileOpen] = useState(false);
  const [tempName, setTempName] = useState(() => avatarData?.userName ?? "");
  const [selectedIndex, setSelectedIndex] = useState(
    () => avatarData?.characterOption ?? 0
  );

  // SOCKET - ADD emitEvent
  const { signOut, emitEvent } = useGameSocket(() => undefined);

  // CHARACTER OPTIONS
  const options = [
    { x: 64, y: 72 },
    { x: 64, y: 168 },
    { x: 64, y: 264 },
  ];

  // FUNCTIONS
  const handleOpenProfile = () => {
    if (avatarData) {
      setTempName(avatarData.userName);
      setSelectedIndex(avatarData.characterOption);
    }
    setProfileOpen(true);
    onOpen?.();
  };

  const handleCloseProfile = () => {
    if (avatarData) {
      setTempName(avatarData.userName);
      setSelectedIndex(avatarData.characterOption);
    }
    setProfileOpen(false);
    onClose?.();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!avatarData || !e.target.files?.[0]) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAvatar = ev.target?.result as string;
      updateAvatar({ avatar: newAvatar });
      
      // BROADCAST TO FRIENDS
      emitEvent("avatarUpdated", {
        avatarId: avatarData._id,
        avatarImage: newAvatar,
        userName: avatarData.userName,
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleNameSubmit = () => {
    if (!avatarData) return;
    updateAvatar({ userName: tempName });
    
    // BROADCAST TO FRIENDS
    emitEvent("avatarUpdated", {
      avatarId: avatarData._id,
      avatarImage: avatarData.avatar,
      userName: tempName,
    });
  };

  const handleCharacterChange = (index: number) => {
    if (!avatarData) return;
    setSelectedIndex(index);
    updateAvatar({ characterOption: index });
  };

  const handleSignOut = () => {
    signOut();
    sessionStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  // LOADING STATE
  if (!avatarData) return <div>Loading...</div>;

  // RENDER
  return (
    <>
      {/* AVATAR BUTTON */}
      {!profileOpen && (
        <div
        className="m-4"
          style={{
            transformOrigin: "top left",
            width: "400px",
            height: "160px",
          }}
        >
          <div
            onClick={handleOpenProfile}
            className="relative cursor-pointer w-100 h-40 z-50"
          >
            {/* NAME (on right of banner) */}
            <div className="absolute left-52 top-1/4 -translate-y-1/5 text-[#a7767c] font-bold text-3xl drop-shadow-lg pointer-events-none z-30 pixelify-sans">
              PROFILE
            </div>

            {/* BANNER */}
            <div
              className="absolute inset-0 bg-center bg-cover rounded-lg z-20"
              style={{ backgroundImage: `url(${ASSETS.ELEMENTS.PROFILEBANNER})` }}
            />

            {/* AVATAR */}
            <div
              className="absolute left-5 top-1/2 -translate-y-1/2 w-30 h-30 border-2 border-white bg-center bg-cover shadow-md z-10"
              style={{
                backgroundImage: `url(${avatarData.avatar || defaultAvatar})`,
              }}
            />

          </div>
        </div>
      )}

      {/* PROFILE PANEL */}
      {profileOpen && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 300,
            padding: 20,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={handleCloseProfile}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {/* AVATAR UPLOAD */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                margin: "0 auto",
                border: "2px solid #333",
                background: `url(${avatarData.avatar || defaultAvatar}) center/cover`,
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "block", margin: "10px auto" }}
            />
          </div>

          {/* USERNAME */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 10,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              style={{
                fontSize: 16,
                textAlign: "center",
                padding: 4,
                width: "60%",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleNameSubmit}
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #333",
                cursor: "pointer",
                background: "#f0f0f0",
              }}
            >
              Change
            </button>
          </div>

          {/* CHARACTER SELECTION */}
          <div style={{ marginBottom: 10 }}>
            <h3>Preferences</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleCharacterChange(i)}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 24,
                      border: "1px solid #ccc",
                      background: `url(${playerSprite}) -${opt.x}px -${opt.y}px/auto`,
                    }}
                  />
                  <span>Character {i + 1}</span>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "1px solid black",
                      background: "white",
                      marginLeft: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedIndex === i && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "blue",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pokemon INVENTORY */}
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ textAlign: "center" }}>Inventory / Pokemon</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                justifyContent: "center",
                gap: 6,
                padding: "4px 0",
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {avatarData.pokemonInventory.map((p, i) => {
                const sprite = getPokemonFrontSprite(p.name);
                return (
                  <div
                    key={i}
                    style={{
                      border: "2px solid #333",
                      borderRadius: 8,
                      padding: 0,
                      textAlign: "center",
                      background: "#f9f9f9",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 64,
                      height: 80,
                    }}
                  >
                    <img src={sprite} alt={p.name ?? "unknown"} width={40} height={40} />
                    <div
                      title={p.name}
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIGN OUT */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 16,
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #333",
                cursor: "pointer",
                background: "#ff5555",
                color: "white",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}