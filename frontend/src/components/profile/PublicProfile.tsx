import { useState, useEffect } from "react";
import { ASSETS } from "../../assets";
import { getPokemonFrontSprite } from "../../assets/helpers";

interface PublicProfileProps {
  avatarId: string;
  token: string;
  myAvatarId: string;
  onClose: () => void;
  onInviteToBattle?: () => void;
  onBlock?: () => void;
  onAddFriend?: () => void;
}

interface ProfileData {
  _id: string;
  userName: string;
  avatar: string;
  characterOption: number;
  battleWin: number;
  battleLoss: number;
  raceWin: number;
  raceLoss: number;
  guild?: { name: string; image: string };
  pokemonInventory: any[];
  friendshipStatus: 'none' | 'friend' | 'pending';
  isMe: boolean;
}

const defaultAvatar = ASSETS.AVATAR.CLEFFA;
const playerSprite = ASSETS.PLAYER.DEFAULT;

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 300,
  },
  container: {
    width: 320,
    maxHeight: "80vh",
    background: "white",
    borderRadius: 12,
    border: "4px solid #333",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    fontFamily: "monospace",
    overflow: "hidden",
    display: "flex", flexDirection: "column" as const,
  },
  header: {
    background: "#ffcc00",
    padding: 16,
    borderBottom: "2px solid #333",
    display: "flex", alignItems: "center", gap: 12,
  },
  avatar: {
    width: 64, height: 64,
    borderRadius: "50%",
    border: "3px solid #333",
    backgroundSize: "cover", backgroundPosition: "center",
  },
  name: {
    fontSize: 18, fontWeight: "bold" as const, color: "#333",
  },
  closeBtn: {
    marginLeft: "auto",
    background: "transparent", border: "none",
    fontSize: 20, cursor: "pointer", color: "#333",
  },
  content: {
    padding: 16,
    overflowY: "auto" as const,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    background: "#f9f9f9",
    padding: 8,
    borderRadius: 8,
    border: "2px solid #333",
    textAlign: "center" as const,
  },
  statNumber: {
    fontSize: 20, fontWeight: "bold" as const, color: "#333",
  },
  statLabel: {
    fontSize: 10, color: "#666",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: "bold" as const,
    marginBottom: 8, color: "#333",
  },
  pokemonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
  },
  pokemonCell: {
    width: 50, height: 50,
    border: "2px solid #333",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f9f9f9",
  },
  actions: {
    padding: 12,
    borderTop: "2px solid #333",
    display: "flex", gap: 8,
    flexWrap: "wrap" as const,
  },
  actionBtn: (color: string) => ({
    flex: 1,
    padding: "8px 12px",
    fontSize: 12,
    fontFamily: "monospace",
    border: "2px solid #333",
    borderRadius: 6,
    cursor: "pointer",
    background: color,
    color: color === "#333" ? "white" : "#333",
    fontWeight: "bold" as const,
  }),
};

export default function PublicProfile({
  avatarId, token, myAvatarId, onClose,
  onInviteToBattle, onBlock, onAddFriend
}: PublicProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [avatarId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:25001/api/social/profile/${avatarId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to load profile");
        return;
      }
      
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const characterOptions = [
    { x: 64, y: 72 }, { x: 64, y: 168 }, { x: 64, y: 264 }
  ];

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: "center", color: "#ff5555" }}>
            {error || "Profile not found"}
          </div>
        </div>
      </div>
    );
  }

  const winRate = profile.battleWin + profile.battleLoss > 0
    ? Math.round((profile.battleWin / (profile.battleWin + profile.battleLoss)) * 100)
    : 0;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{
            ...styles.avatar,
            backgroundImage: `url(${profile.avatar || defaultAvatar})`,
          }} />
          <div>
            <div style={styles.name}>{profile.userName}</div>
            {profile.guild && (
              <div style={{ fontSize: 12, color: "#666" }}>
                🏰 {profile.guild.name}
              </div>
            )}
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Stats */}
          <div style={styles.statGrid}>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{profile.battleWin}</div>
              <div style={styles.statLabel}>BATTLE WINS</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{winRate}%</div>
              <div style={styles.statLabel}>WIN RATE</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{profile.pokemonInventory.length}</div>
              <div style={styles.statLabel}>POKÉMON</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{profile.raceWin}</div>
              <div style={styles.statLabel}>RACE WINS</div>
            </div>
          </div>

          {/* Character Preview */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Character</div>
            <div style={{
              width: 32, height: 48,
              border: "2px solid #333",
              background: `url(${playerSprite}) -${characterOptions[profile.characterOption || 0].x}px -${characterOptions[profile.characterOption || 0].y}px/auto`,
            }} />
          </div>

          {/* Pokemon Preview */}
          {profile.pokemonInventory.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                Pokémon ({profile.pokemonInventory.length})
              </div>
              <div style={styles.pokemonGrid}>
                {profile.pokemonInventory.slice(0, 8).map((p, i) => (
                  <div key={i} style={styles.pokemonCell}>
                    <img 
                      src={getPokemonFrontSprite(p.name)} 
                      alt={p.name}
                      width={40} height={40}
                    />
                  </div>
                ))}
                {profile.pokemonInventory.length > 8 && (
                  <div style={{...styles.pokemonCell, fontSize: 12}}>
                    +{profile.pokemonInventory.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions - only show if not viewing self */}
        {!profile.isMe && (
          <div style={styles.actions}>
            {profile.friendshipStatus !== 'friend' && onAddFriend && (
              <button onClick={onAddFriend} style={styles.actionBtn("#4CAF50")}>
                ➕ Add Friend
              </button>
            )}
            {onInviteToBattle && (
              <button 
                onClick={onInviteToBattle} 
                style={styles.actionBtn("#ffcc00")}
              >
                ⚔️ Battle
              </button>
            )}
            {onBlock && (
              <button onClick={onBlock} style={styles.actionBtn("#ff5555")}>
                🚫 Block
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}