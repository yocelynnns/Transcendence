import { useState, useEffect } from "react";
import { ASSETS } from "../../assets";

const defaultAvatar = ASSETS.AVATAR.CLEFFA;

interface PublicProfile {
  avatarId: string;
  userName: string;
  avatarImage: string;
  characterOption: number;
  battleWin: number;
  battleLoss: number;
  raceWin: number;
  raceLoss: number;
  online?: boolean;
  friendshipStatus?: string;
}

interface PublicProfilePopupProps {
  token: string;
  myAvatarId: string;
  targetAvatarId: string;
  onClose: () => void;
  onChallenge?: (avatarId: string) => void; // ADD THIS PROP
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 300,
  },
  popup: {
    width: 320,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "4px solid #333",
    fontFamily: "monospace",
    overflow: "hidden",
  },
  header: {
    background: "#ffcc00",
    padding: 20,
    textAlign: "center" as const,
    borderBottom: "3px solid #333",
    position: "relative" as const,
  },
  closeBtn: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    background: "transparent",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#333",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    border: "4px solid #333",
    margin: "0 auto 12px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative" as const,
  },
  onlineIndicator: (online: boolean) => ({
    position: "absolute" as const,
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: online ? "#4CAF50" : "#999",
    border: "3px solid white",
  }),
  userName: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#333",
    margin: "0 0 4px 0",
  },
  status: {
    fontSize: 12,
    color: "#666",
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 12,
    textAlign: "center" as const,
    borderBottom: "2px solid #ffcc00",
    paddingBottom: 8,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  statBox: {
    background: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    border: "2px solid #333",
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase" as const,
  },
  winRate: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold" as const,
  },
  actions: {
    padding: "0 20px 20px",
    display: "flex",
    gap: 8,
  },
  actionBtn: (bg: string, disabled?: boolean) => ({
    flex: 1,
    padding: 10,
    background: disabled ? "#ccc" : bg,
    color: "white",
    border: "2px solid #333",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  }),
  loading: {
    padding: 40,
    textAlign: "center" as const,
    color: "#666",
  },
  error: {
    padding: 40,
    textAlign: "center" as const,
    color: "#ff5555",
  },
};

export default function PublicProfilePopup({
  token,
  myAvatarId,
  targetAvatarId,
  onClose,
  onChallenge, // ADD THIS
}: PublicProfilePopupProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/friends/profile/${targetAvatarId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);
    } catch {
      setError("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [targetAvatarId, token]); // only run when these change


  // useEffect(() => {
  //   fetchProfile();
  // }, [targetAvatarId]);

  // const fetchProfile = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch(
  //       `/api/friends/profile/${targetAvatarId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (!res.ok) {
  //       throw new Error("Failed to fetch profile");
  //     }

  //     const data = await res.json();
  //     setProfile(data);
  //   } catch (err) {
  //     setError("Could not load profile");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return "0%";
    return `${Math.round((wins / total) * 100)}%`;
  };

  const handleChallenge = () => {
    if (!profile?.online || profile?.avatarId === myAvatarId) {
      return;
    }
    
    if (onChallenge) {
      onChallenge(profile.avatarId);
      onClose();
    }
  };

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div style={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div style={styles.error}>{error || "Profile not found"}</div>
        </div>
      </div>
    );
  }

  const isMe = profile.avatarId === myAvatarId;
  const canChallenge = profile.online && !isMe;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
          <div
            style={{
              ...styles.avatar,
              backgroundImage: `url(${profile.avatarImage || defaultAvatar})`,
            }}
          >
            <div style={styles.onlineIndicator(!!profile.online)} />
          </div>
          <h2 style={styles.userName}>{profile.userName}</h2>
          <div style={styles.status}>
            {isMe
              ? "This is you!"
              : profile.friendshipStatus === "friend"
              ? "Your Friend"
              : "Player"}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsSection}>
          <div style={styles.sectionTitle}>Battle Record</div>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{profile.battleWin}</div>
              <div style={styles.statLabel}>Wins</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{profile.battleLoss}</div>
              <div style={styles.statLabel}>Losses</div>
            </div>
          </div>
          <div
            style={{
              ...styles.statBox,
              marginTop: 12,
              background: "#e8f5e9",
              borderColor: "#4CAF50",
            }}
          >
            <div style={styles.winRate}>
              Win Rate: {calculateWinRate(profile.battleWin, profile.battleLoss)}
            </div>
          </div>
        </div>

        {/* Race Stats (if available) */}
        {(profile.raceWin > 0 || profile.raceLoss > 0) && (
          <div style={{ ...styles.statsSection, paddingTop: 0 }}>
            <div style={styles.sectionTitle}>Race Record</div>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{profile.raceWin}</div>
                <div style={styles.statLabel}>Wins</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{profile.raceLoss}</div>
                <div style={styles.statLabel}>Losses</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isMe && (
          <div style={styles.actions}>
            <button
              onClick={handleChallenge}
              disabled={!canChallenge}
              style={styles.actionBtn("#ff5722", !canChallenge)}
              title={!profile.online ? "Friend is offline" : "Challenge to battle"}
            >
              {profile.online ? "⚔️ Challenge" : "⚫ Offline"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}