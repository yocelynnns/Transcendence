import { useEffect, useState } from "react";
import { AvatarData } from "../components/AvatarProfile";
import { useNavigate } from "react-router-dom";
import { ASSETS } from "../assets";
import { useGameSocket } from "../ws/useGameSocket";

interface MatchMakingProps {
  avatarData: AvatarData | null;
}

interface OpponentData {
  socketId: string;
  avatarId: string;
  avatar?: AvatarData; // fetched avatar info
}

export default function Matching({ avatarData }: MatchMakingProps) {
  const navigate = useNavigate();
  const defaultAvatar = ASSETS.AVATAR.CLEFFA;

  const { joinMatching, waiting, opponent } = useGameSocket(() => {});

  const [opponentDetails, setOpponentDetails] = useState<OpponentData | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [matchStarted, setMatchStarted] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);

  // Join matchmaking on mount
  useEffect(() => {
    if (avatarData) {
      joinMatching(avatarData.avatarId);
    }
  }, [avatarData, joinMatching]);

  // Fetch opponent avatar info when opponent is found
  useEffect(() => {
    if (opponent?.avatarId) {
      fetch(`http://localhost:5001/api/avatar/${opponent.avatarId}`)
        .then(res => res.json())
        .then(data => {
          setOpponentDetails({ ...opponent, avatar: data });
          setMatchStarted(true);

          // ✅ Use battleId from socket
          setBattleId(opponent.battleId || null);
        })
        .catch(err => console.error("Failed to fetch opponent avatar:", err));
    } else {
      setOpponentDetails(null);
      setMatchStarted(false);
      setCountdown(5);
    }
  }, [opponent]);



  // Countdown timer for match start
  useEffect(() => {
    if (!matchStarted) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/teamSelect/${battleId}`, { state: { avatarData } });
          // navigate(`/prebattle/${battleId}`, { state: { avatarData } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchStarted, navigate]);

  if (!avatarData) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e2f",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 20,
        }}
      >
        Loading player data...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 100%)",
        fontFamily: "monospace",
        color: "#999",
        textAlign: "center",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 32,
          marginBottom: 12,
          color: "#fff",
          textShadow: "0 0 10px #888",
        }}
      >
        {matchStarted ? "Match Found!" : "Waiting for Opponent..."}
      </h1>

      {/* Countdown under title if match started */}
      {matchStarted && (
        <div
          style={{
            fontSize: 18,
            marginBottom: 30,
            color: "#a2d5f2",
            textShadow: "0 0 6px #000",
          }}
        >
          Match starts in {countdown} second{countdown > 1 ? "s" : ""}
        </div>
      )}

      {/* Player vs Enemy */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Player */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 16,
              border: "4px solid #a2d5f2",
              background: `url(${avatarData.avatar || defaultAvatar}) center/cover`,
              boxShadow: "0 0 15px #a2d5f2",
            }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              color: "#fff",
              textShadow: "0 0 6px #a2d5f2",
            }}
          >
            {avatarData.userName}
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontSize: 36,
            fontWeight: "bold",
            color: "#888",
            textShadow: "0 0 15px #666",
          }}
        >
          VS
        </div>

        {/* Opponent */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 16,
              border: "4px solid #ff5555",
              backgroundColor: "#444",
              boxShadow: "0 0 15px #ff5555",
              overflow: "hidden",
              background: opponentDetails?.avatar
                ? `url(${opponentDetails.avatar.avatar}) center/cover`
                : undefined,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {waiting && !opponentDetails && (
              <img
                src="/assets/matching/loading.gif"
                alt="Searching..."
                style={{ width: "100%", height: "100%", borderRadius: 16 }}
              />
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              color: "#fff",
              fontStyle: waiting && !opponentDetails ? "italic" : "normal",
              textShadow: opponentDetails?.avatar
                ? "0 0 4px #ff5555"
                : "0 0 6px #888",
            }}
          >
            {waiting && !opponentDetails
              ? "Searching..."
              : opponentDetails?.avatar
              ? opponentDetails.avatar.userName
              : ""}
          </div>
        </div>
      </div>

      {/* Return Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          height: "5%",
          marginTop: "2%",
          fontSize: 16,
          fontWeight: "bold",
          borderRadius: 8,
          border: "none",
          background: "linear-gradient(135deg, #888 0%, #666 100%)",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 0 12px #666",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        Return
      </button>
    </div>
  );
}
