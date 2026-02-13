// frontend/src/components/race/buttonmashrace.tsx
import React, { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import RaceTrack from "./RaceTrack";
import HowToPlayCard from "./HowToPlayCard";
import RecentMatches from "./RecentMatches";
import LeaderboardPanel from "./LeaderboardPanel";
import AchievementsPanel from "./AchievementsPanel";
import PixelButton from "../elements/PixelButton";

interface Player {
  id: string;
  avatarId: string;
  name: string;
  position: number;
  sprite: string;
}

interface MatchHistoryItem {
  _id: string;
  player1: string;
  player2: string;
  winner: string;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  icon: string;
}

interface LeaderboardEntry {
  rank: number;
  userName: string;
  wins: number;
  losses: number;
  totalRaces: number;
}

interface ButtonMashRaceProps {
  avatarId: string;
  onExit?: () => void;
}

const ButtonMashRace: React.FC<ButtonMashRaceProps> = ({ avatarId, onExit }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joined, setJoined] = useState(false);
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [myUserName, setMyUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [totalWins, setTotalWins] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "achievements">("history");
  // ✅ Compact mode for "mobile landscape" / short height screens
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updateCompact = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      setCompact(h <= 520 && w >= h); // short-height + landscape-ish => compact
    };
    updateCompact();
    window.addEventListener("resize", updateCompact);
    return () => window.removeEventListener("resize", updateCompact);
  }, []);

  const achievements: Achievement[] = [
    { id: "first_win", title: "Level 1: First Victory", description: "Win your first race", requirement: 1, icon: "🏅" },
    { id: "five_wins", title: "Level 2: Speed Demon", description: "Win 5 races", requirement: 5, icon: "🔥" },
    { id: "ten_wins", title: "Level 3: Racing Legend", description: "Win 10 races", requirement: 10, icon: "👑" },
  ];

  // Fetch profile + stats + history + leaderboard
  const fetchData = async () => {
    try {
      const avatarRes = await fetch(`/api/avatar/${avatarId}`);
      if (avatarRes.ok) {
        const avatarData = await avatarRes.json();
        const username = avatarData.userName || avatarData.avatar?.userName || "";
        setMyUserName(username);
      }

      const statsRes = await fetch(`/api/race/stats/${avatarId}`);
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setTotalWins(stats.wins);
      }

      const historyRes = await fetch(`/api/race/history/${avatarId}`);
      if (historyRes.ok) {
        const history = await historyRes.json();
        setMatchHistory(history);
      }

      const leaderboardRes = await fetch(`/api/race/leaderboard`);
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error("Error fetching race data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarId]);

  // Socket connect
    useEffect(() => {
      const newSocket = io("/minigame");
      setSocket(newSocket);

      return () => {
        newSocket.disconnect(); // now returns void
      };
    }, []);


  // Socket events + key press
  useEffect(() => {
    if (!socket) return;

    socket.on("raceJoined", (racePlayers: Player[]) => setPlayers(racePlayers));
    socket.on("raceUpdate", (racePlayers: Player[]) => setPlayers(racePlayers));
    socket.on("raceStart", () => {
      setStarted(true);
      setWinner(null);
    });
    socket.on("raceOver", (winnerName: string) => {
      setWinner(winnerName);
      setStarted(false);
    });
    socket.on("raceError", (error: string) => alert(error));

    const handleKeyPress = (e: KeyboardEvent) => {
      if (joined && started && !winner && e.code === "Space") socket.emit("press");
    };
    window.addEventListener("keyup", handleKeyPress);

    return () => {
      socket.off();
      window.removeEventListener("keyup", handleKeyPress);
    };
  }, [socket, joined, started, winner]);

  const joinRace = () => {
    if (!socket) return;
    socket.emit("joinRace", { avatarId });
    setJoined(true);
    setStarted(false);
    setWinner(null);
  };

  const handleExit = () => {
    socket?.disconnect();
    onExit?.();
  };

  // ✅ Rematch = re-join matchmaking, reset local UI
  const rematch = () => {
    if (!socket) return;
    setWinner(null);
    setStarted(false);
    // keep joined true so you stay on race screen
    socket.emit("joinRace", { avatarId });
    // refresh sidebar data
    setLoading(true);
    fetchData();
  };

  // ✅ FIX: show rematch for BOTH players whenever race ended
  // - primary: winner received
  // - fallback: someone reached 100% but raceOver maybe missed
  const raceEnded = useMemo(() => {
    if (winner) return true;
    return players.some((p) => p.position >= 100);
  }, [winner, players]);

  // ✅ Compact typography/spacing helpers
  const cardPad = compact ? "p-2" : "p-3 sm:p-4";
  const titleText = compact ? "text-[11px]" : "text-sm sm:text-base";
  const bodyText = compact ? "text-[10px]" : "text-xs sm:text-sm";

  // ✅ Heights for each scrollable list (keeps Join button always visible)
//   const recentListH = useMemo(() => (compact ? "h-[150px]" : "h-[260px] sm:h-[320px]"), [compact]);
  const leaderboardListH = useMemo(() => (compact ? "h-[120px]" : "h-[200px] sm:h-[240px]"), [compact]);
  const achievementListH = useMemo(() => (compact ? "h-[160px]" : "h-[260px] sm:h-[320px]"), [compact]);

  return (
    <div className="fixed inset-0 bg-[#384071] z-50 p-4 overflow-hidden">
        {/* Close Button */}
        <button
        onClick={handleExit}
        className="absolute top-8 right-8 text-2xl cursor-pointer z-50"
        >
        <span className="text-white text-3xl hover:scale-110 block">×</span>
        </button>

        {/* TITLE (separate from panels like you requested) */}
        <h1 className="text-center text-white font-bold mt-1 text-2xl mb-4 bg-[#677fb4] rounded-lg h-15 justify-center items-center pt-4">
            Eevee Button Mash Race
        </h1>

        {/* TWO MAIN SECTIONS */}
        <div className="flex flex-col md:flex-row h-[calc(100%-3rem)] gap-6">
        
        {/* ================= LEFT PANEL ================= */}
        <div className="md:flex-[1_1_35%] w-full shrink-0">
        <div className="h-19/20 p-6 bg-[#677fb4] rounded-lg flex flex-col">

            {/* SCROLLABLE LEFT CONTENT */}
            <div className="flex-1 overflow-y-auto space-y-4">
            
            {/* HOW TO PLAY */}
            <div className={`bg-[#a5b6dd] rounded-md ${cardPad} text-center`}>
                <h3 className={`font-semibold mb-2 text-white text-xl`}>
                    How To Play
                </h3>
                <ul className={`${bodyText} space-y-1`}>
                <li>1. Wait for an opponent (matchmaking)</li>
                <li>2. Press SPACEBAR rapidly</li>
                <li>3. First to finish wins</li>
                </ul>
            </div>

            {/* TOP RACERS */}
            <div className={`bg-[#a5b6dd] rounded-md flex-1 ${cardPad}`}>
                <LeaderboardPanel
                leaderboard={leaderboard}
                myUserName={myUserName}
                loading={loading}
                leaderboardListH={leaderboardListH}
                compact={compact}
                cardPad={cardPad}
                titleText={titleText}
                />
            </div>

            </div> {/* end scrollable wrapper */}

        </div>
        </div>


        {/* ================= RIGHT PANEL ================= */}
        <div className="md:flex-[1_1_65%] w-full shrink-0">
            <div className="h-19/20 p-6 bg-[#677fb4] rounded-lg flex flex-col">

                {/* TABS */}
                <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-md font-semibold ${
                    activeTab === "history"
                        ? "bg-[#ffffff] text-[#384071]"
                        : "bg-[#a5b6dd] text-[#677fb4]"
                    }`}
                >
                    Match History
                </button>

                <button
                    onClick={() => setActiveTab("achievements")}
                    className={`px-4 py-2 rounded-md font-semibold ${
                    activeTab === "achievements"
                        ? "bg-[#ffffff] text-[#384071]"
                        : "bg-[#a5b6dd] text-[#677fb4]"
                    }`}
                >
                    Achievements
                </button>
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1 overflow-y-auto pr-1">

                {/* MATCH HISTORY TAB */}
                {activeTab === "history" && (
                    <>
                    {loading && <p className="text-center">Loading...</p>}
                    {!loading && matchHistory.length === 0 && (
                        <p className="text-center text-[#384071]">
                        No races yet
                        </p>
                    )}

                    {matchHistory.map((m) => {
                        const didWin = m.winner === myUserName;

                        return (
                        <div
                            key={m._id}
                            className="bg-[#a5b6dd] rounded-md p-4 mb-4"
                        >
                            <p className="text-center font-bold">
                            {m.player1} vs {m.player2}
                            </p>

                            <p className="text-center text-sm">
                            {didWin ? "🏆 WIN" : "❌ LOSS"}
                            </p>

                            <p className="text-center text-sm text-gray-500">
                            {m.date}
                            </p>
                        </div>
                        );
                    })}
                    </>
                )}

                {/* ACHIEVEMENTS TAB */}
                {activeTab === "achievements" && (
                    <AchievementsPanel
                        achievements={achievements}
                        totalWins={totalWins}
                        achievementListH={achievementListH}
                        cardPad={cardPad}
                        titleText={titleText}
                        compact={compact}
                    />
                )}

                </div>

                {/* JOIN BUTTON */}
                {!joined && (
                <button
                    onClick={joinRace}
                    className="mt-6 px-4 py-3 bg-[#57b87c] text-white rounded-md w-full font-semibold hover:scale-102"
                >
                    Join Race
                </button>
                )}
                {joined && (
                    <RaceTrack
                        players={players}
                        started={started}
                        winner={winner}
                        compact={compact}
                        onClose={handleExit}
                    />
                )}
            </div>
           </div>
        </div>
    </div>
    );

};

export default ButtonMashRace;