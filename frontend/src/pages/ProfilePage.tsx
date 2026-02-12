import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ASSETS } from "../assets";
import { createAvatar } from "../services/avatarService";
import PixelButton from "../components/elements/PixelButton";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;
const playerSprite = ASSETS.PLAYER.DEFAULT;

interface ProfilePageProps {
  setAvatarId: (id: string) => void;
}

// DESIGN SIZE
const designWidth = 450;
const designHeight = 550;
const padding = 32; // space around the “screenshot”
const maxScale = 1;
const minScale = 0.5;

export default function ProfilePage({ setAvatarId }: ProfilePageProps) {
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [userName, setUserName] = useState("Cookiee");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);

  const options = [
    { x: 64, y: 72 },
    { x: 64, y: 168 },
    { x: 64, y: 264 },
  ];

  // Scale the outer block only
  useEffect(() => {
    const handleResize = () => {
      const scaleX = (window.innerWidth - padding * 2) / designWidth;
      const scaleY = (window.innerHeight - padding * 2) / designHeight;
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, Math.min(scaleX, scaleY))
      );
      setScale(newScale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatar(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAvatar = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("YOU ARE NOT LOGGED IN.");
    if (!userName.trim()) return alert("PLEASE ENTER A NAME.");

    try {
      setLoading(true);
      const data = await createAvatar(token, {
        userName: userName.trim(),
        avatar,
        characterOption: selectedIndex,
      });
      setAvatarId(data.avatar._id);
      navigate("/");
    } catch (err) {
      console.log(err);
      alert(
        "FAILED TO CREATE AVATAR: " +
          (err instanceof Error ? err.message : "UNKNOWN ERROR")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-200 p-4">
      {/* WRAPPER: like “screenshot” */}
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative"
      >
        {/* BIG PIXELBUTTON BACKGROUND */}
        <PixelButton
          colorA="#677fb4"
          colorB="#384071"
          colorText="#384071"
          textSize="1rem"
          height={designHeight}
          width={designWidth}
          cursorPointer={false}
        />

        {/* OVERLAY CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
          {/* AVATAR */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-32 h-32 rounded-full bg-center bg-cover border-2 border-black"
              style={{ backgroundImage: `url(${avatar})` }}
            />
            <label className="cursor-pointer">
              <span className="px-3 py-1 bg-[#a5b6dd] rounded-md text-sm">
                Browse
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* USERNAME */}
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your Name"
            className="w-full text-center px-2 py-1 rounded-md bg-[#a5b6dd] text-sm mt-5 h-1/12"
          />

          {/* CHARACTER SELECTION */}
          <div className="w-full">
            <h3 className="text-center font-semibold mb-2 text-white mt-3">
              Character Selection
            </h3>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => {
                const isSelected = selectedIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                      isSelected ? "bg-[#ffffff]" : "bg-[#a5b6dd]"
                    }`}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 24,
                        background: `url(${playerSprite}) -${opt.x}px -${opt.y}px/auto`,
                      }}
                    />
                    <span
                      className={`font-medium ${
                        isSelected ? "text-[#677fb4]" : "text-[#ffffff]"
                      }`}
                    >
                      Character {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CREATE BUTTON */}
          <div className="w-full text-sm font-bold mt-4">
            <PixelButton
              colorA={loading ? "#ccc" : "#ffcc00"}
              colorB={loading ? "#aaa" : "#d4a500"}
              colorText="#000"
              height={50}
              width="100%"
              textSize="0.8rem"
              cursorPointer={!loading}
              onClick={handleCreateAvatar}
            >
              {loading ? "Creating..." : "Create Avatar"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
