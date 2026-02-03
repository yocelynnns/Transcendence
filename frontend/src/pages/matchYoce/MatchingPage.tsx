import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarData } from "../../types/avatarTypes";
import { ASSETS } from "../../assets";
import { useGameSocket } from "../../ws/useGameSocket";
import "./styles/index.css";

interface MatchMakingProps {
  avatarData: AvatarData | null;
}

interface OpponentData {
  socketId: string;
  avatarId: string;
  avatar?: AvatarData;
}

function StatRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="mm-row">
      <div className="mm-k">{label}</div>
      <div className="mm-v">{value}</div>
    </div>
  );
}

// Decorative Standby placeholders
const STANDBY_PLACEHOLDER = {
  a: "-",
  b: "-",
  c: "-",
  d: "-",
  regional: "-",
  worldwide: "-",
};

export default function Matching({ avatarData }: MatchMakingProps) {
  const navigate = useNavigate();
  const defaultAvatar = ASSETS.AVATAR.CLEFFA;

  const { joinMatching, subscribeEvent } = useGameSocket(() => {});

  const [opponentDetails, setOpponentDetails] = useState<OpponentData | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [matchStarted, setMatchStarted] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);

  const currentId = avatarData?._id;
  const waiting = !opponentDetails && !matchStarted;

  // --- Matchmaking subscriptions ---
  useEffect(() => {
    if (!currentId) return;

    joinMatching(currentId);

    const cleanupWaiting = subscribeEvent("waitingForOpponent", () => {
      setOpponentDetails(null);
      setMatchStarted(false);
      setCountdown(5);
    });

    const cleanupFound = subscribeEvent(
      "opponentFound",
      async (data: { avatarId: string; socketId: string; battleId: string }) => {
        setBattleId(data.battleId);

        try {
          const res = await fetch(`http://localhost:25001/api/avatar/${data.avatarId}`);
          const avatar: AvatarData = await res.json();
          setOpponentDetails({ ...data, avatar });
        } catch (err) {
          console.error("Failed to fetch opponent avatar:", err);
          setOpponentDetails({ ...data, avatar: undefined });
        }

        setMatchStarted(true);
        setCountdown(5);
      }
    );

    const cleanupLeft = subscribeEvent("opponentLeft", () => {
      setOpponentDetails(null);
      setMatchStarted(false);
      setCountdown(5);
      setBattleId(null);
      alert("Opponent disconnected.");
    });

    const cleanupAlready = subscribeEvent("alreadyInPool", () => {
      alert("You are already in the matchmaking queue!");
    });

    const cleanupError = subscribeEvent("matchError", (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      cleanupWaiting();
      cleanupFound();
      cleanupLeft();
      cleanupAlready();
      cleanupError();
    };
  }, [currentId, joinMatching, subscribeEvent]);

  // --- Countdown for match start ---
  useEffect(() => {
    if (!matchStarted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (battleId) navigate(`/teamSelect/${battleId}`, { state: { battleId, avatarData } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchStarted, navigate, avatarData, battleId]);

  if (!avatarData) {
    return <div className="mm-loading">Loading player data...</div>;
  }

  const me = avatarData;
  const opp = opponentDetails?.avatar;

  return (
    <div className="mm-page">
      <div className="mm-board">
        <div className="mm-top">
          <div className="mm-banner">matching...</div>

          <div className="mm-sub">
            {matchStarted ? (
              <span>
                match starts in <b>{countdown}</b>s
              </span>
            ) : (
              <span>waiting for opponent...</span>
            )}
          </div>
        </div>

        <div className="mm-panels">
          {/* LEFT (You) */}
          <div className="mm-panel mm-left">
            <div className="mm-panelInner">
              <div className="mm-avatarCircle">
                <img className="mm-avatarImg" src={me.avatar || defaultAvatar} alt="You" />
              </div>

              <div className="mm-nameBar mm-nameBarLeft">{me.userName}</div>

              <div className="mm-stats">
                <StatRow label="-" value={STANDBY_PLACEHOLDER.a} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.b} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.c} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.d} />

                <div className="mm-split">
                  <div className="mm-mini">
                    <div className="mm-miniK">-</div>
                    <div className="mm-miniV">{STANDBY_PLACEHOLDER.regional}</div>
                  </div>
                  <div className="mm-mini">
                    <div className="mm-miniK">-</div>
                    <div className="mm-miniV">{STANDBY_PLACEHOLDER.worldwide}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VS badge */}
          <div className="mm-vsWrap">
            <div className="mm-vs">VS</div>
          </div>

          {/* RIGHT (Opponent) */}
          <div className="mm-panel mm-right">
            <div className="mm-panelInner">
              <div className="mm-avatarCircle">
                {waiting ? (
                  <div className="mm-loaderWrap">
                    <img
                      src="/assets/matching/loading.gif"
                      className="mm-loader"
                      alt="Searching..."
                    />
                  </div>
                ) : (
                  <img className="mm-avatarImg" src={opp?.avatar || defaultAvatar} alt="Opponent" />
                )}
              </div>

              <div className="mm-nameBar mm-nameBarRight">
                {waiting ? "searching..." : opp?.userName || "-"}
              </div>

              <div className={`mm-stats ${waiting ? "is-dim" : ""}`}>
                <StatRow label="-" value={STANDBY_PLACEHOLDER.a} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.b} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.c} />
                <StatRow label="-" value={STANDBY_PLACEHOLDER.d} />

                <div className="mm-split">
                  <div className="mm-mini">
                    <div className="mm-miniK">-</div>
                    <div className="mm-miniV">{STANDBY_PLACEHOLDER.regional}</div>
                  </div>
                  <div className="mm-mini">
                    <div className="mm-miniK">-</div>
                    <div className="mm-miniV">{STANDBY_PLACEHOLDER.worldwide}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="mm-return" onClick={() => navigate("/")}>
          return
        </button>
      </div>
    </div>
  );
}
