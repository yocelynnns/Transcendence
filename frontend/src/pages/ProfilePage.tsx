//IMPORTS
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ASSETS } from "../assets";
import { createAvatar } from "../services/avatarService";

//DEFAULT ASSETS
const defaultAvatar = ASSETS.AVATAR.CLEFFA;
const playerSprite = ASSETS.PLAYER.DEFAULT;

//TYPES / PROPS
interface ProfilePageProps {
  //PROP FROM APP
  setAvatarId: (id: string) => void;
}

//MAIN COMPONENT
export default function ProfilePage({ setAvatarId }: ProfilePageProps) {

  //STATE
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [userName, setUserName] = useState("Cookiee");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  //NAVIGATION AND TOKEN
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  //CHARACTER OPTIONS
  const options = [
    { x: 64, y: 72 },
    { x: 64, y: 168 },
    { x: 64, y: 264 },
  ];

  //HANDLE IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatar(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  //CREATE AVATAR API CALL
  const handleCreateAvatar = async () => {
    if (!token) return alert("YOU ARE NOT LOGGED IN.");
    if (!userName.trim()) return alert("PLEASE ENTER A NAME.");

    try {
      setLoading(true);
      const data = await createAvatar(token, {
        userName: userName.trim(),
        avatar,
        characterOption: selectedIndex,
      });

      //SAVE AVATAR ID
      setAvatarId(data.avatarId);
      localStorage.setItem("avatarId", data.avatarId);

      //NAVIGATE HOME
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("FAILED TO CREATE AVATAR: " + (err instanceof Error ? err.message : "UNKNOWN ERROR"));
    } finally {
      setLoading(false);
    }
  };

  //RENDER
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#b3e5fc", fontFamily: "monospace" }}>
      <div style={{ display: "flex", flexDirection: "column", background: "#fff", border: "4px solid #000", padding: 20, borderRadius: 8, width: 360, textAlign: "center" }}>
        {/*HEADER*/}
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Create Your Profile</h1>

        {/*AVATAR UPLOAD*/}
        <div style={{ marginBottom: 16 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", border: "2px solid #333", background: `url(${avatar}) center/cover`, margin: "0 auto 8px auto" }} />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        {/*USERNAME INPUT*/}
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your Name"
          style={{ fontSize: 16, padding: 8, width: "100%", borderRadius: 6, border: "1px solid #ccc", marginBottom: 16, boxSizing: "border-box" }}
        />

        {/*CHARACTER SELECTION*/}
        <div style={{ marginBottom: 16 }}>
          <h3>Preferences</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt, i) => (
              <div key={i} onClick={() => setSelectedIndex(i)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 16, height: 24, border: "1px solid #ccc", background: `url(${playerSprite}) -${opt.x}px -${opt.y}px/auto` }} />
                <span>Character {i + 1}</span>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid black", background: "white", marginLeft: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {selectedIndex === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "blue" }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*CREATE BUTTON*/}
        <button type="button" onClick={handleCreateAvatar} disabled={loading} style={{ fontSize: 16, padding: 10, borderRadius: 6, border: "2px solid #000", background: loading ? "#ccc" : "#ffcc00", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Creating..." : "Create Avatar"}
        </button>
      </div>
    </div>
  );
}
