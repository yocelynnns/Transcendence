import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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
  const [scale, setScale] = useState(1);

  const achievements: Achievement[] = [
    { id: "first_win", title: "Level 1: First Victory", description: "Win your first race", requirement: 1, icon: "🏅" },
    { id: "five_wins", title: "Level 2: Speed Demon", description: "Win 5 races", requirement: 5, icon: "🔥" },
    { id: "ten_wins", title: "Level 3: Racing Legend", description: "Win 10 races", requirement: 10, icon: "👑" },
  ];

  // Responsive scaling based on viewport
  useEffect(() => {
    const updateScale = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Base scale on smaller dimension to ensure everything fits
      const heightScale = viewportHeight / 1000; // Base: 1000px height
      const widthScale = viewportWidth / 1400; // Base: 1400px width
      
      // Use smaller scale to ensure content fits
      const newScale = Math.min(heightScale, widthScale, 1); // Cap at 1 (100%)
      setScale(Math.max(newScale, 0.5)); // Minimum 50% scale
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const avatarRes = await fetch(`http://localhost:5001/api/avatar/${avatarId}`);
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          const username = avatarData.userName || avatarData.avatar?.userName;
          setMyUserName(username);
        }

        const statsRes = await fetch(`http://localhost:5001/api/race/stats/${avatarId}`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setTotalWins(stats.wins);
        }

        const historyRes = await fetch(`http://localhost:5001/api/race/history/${avatarId}`);
        if (historyRes.ok) {
          const history = await historyRes.json();
          setMatchHistory(history);
        }

        const leaderboardRes = await fetch(`http://localhost:5001/api/race/leaderboard`);
        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [avatarId]);

  useEffect(() => {
    const newSocket = io("http://localhost:5001/minigame");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("raceJoined", (racePlayers: Player[]) => setPlayers(racePlayers));
    socket.on("raceUpdate", (racePlayers: Player[]) => setPlayers(racePlayers));
    socket.on("raceStart", () => setStarted(true));
    socket.on("raceOver", (winnerName: string) => setWinner(winnerName));
    socket.on("raceError", (error: string) => alert(error));

    const handleKeyPress = (e: KeyboardEvent) => {
      if (joined && started && !winner && e.code === "Space") {
        socket.emit("press");
      }
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
  };

  const handleExit = () => {
    if (socket) socket.disconnect();
    if (onExit) onExit();
  };

  return (
    <div className="fixed inset-0 p-5 font-sans bg-gradient-to-b from-sky-300 to-blue-50 overflow-y-auto flex items-center justify-center">
      {/* Exit Button - Always visible */}
      <button
        onClick={handleExit}
        className="fixed top-5 right-5 z-50 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-110 flex items-center gap-2"
        title="Return to Home"
      >
        <span className="text-xl">←</span>
        <span>Exit</span>
      </button>

      <div 
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease',
        }}
        className="w-full"
      >
        {!joined ? (
          <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-center text-3xl text-gray-800 mb-5">🏁 Eevee Race 🏁</h2>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN - Instructions & Match History */}
              <div className="flex flex-col gap-5">
                {/* Instructions */}
                <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-lg text-gray-800 mb-4">How to Win:</h3>
                  <ol className="list-decimal pl-5 space-y-2.5">
                    <li className="text-gray-600 leading-relaxed">
                      Wait for an opponent to join (automatic matchmaking)
                    </li>
                    <li className="text-gray-600 leading-relaxed">
                      Press <strong className="text-green-500 font-bold">SPACEBAR</strong> as fast as you can!
                    </li>
                    <li className="text-gray-600 leading-relaxed">
                      First to reach the finish line wins! 🏆
                    </li>
                  </ol>
                </div>

                {/* Match History */}
                <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500 flex-1">
                  <h3 className="text-lg text-gray-800 mb-4">📊 Recent Matches</h3>
                  {loading ? (
                    <div className="text-center text-gray-400 text-sm py-5">Loading history...</div>
                  ) : matchHistory.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-5">No matches yet. Be the first to race!</div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                      {matchHistory.map((match) => {
                        const isPlayer1 = match.player1 === myUserName;
                        const myName = isPlayer1 ? match.player1 : match.player2;
                        const opponentName = isPlayer1 ? match.player2 : match.player1;
                        const didIWin = match.winner === myUserName;

                        return (
                          <div key={match._id} className="bg-white p-4 rounded-lg border-2 border-gray-200 transition-all hover:border-green-500 hover:shadow-md hover:shadow-green-100">
                            <div className="flex items-center justify-between gap-4 mb-2.5">
                              <div className="flex items-center gap-2 flex-1">
                                <span className={`text-[15px] font-semibold ${didIWin ? 'text-green-700' : 'text-gray-500 line-through'}`}>
                                  {myName} (You)
                                </span>
                                {didIWin && <span className="text-lg">🏆</span>}
                              </div>
                              <span className="text-xs text-gray-400 font-bold px-2.5">VS</span>
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                {!didIWin && <span className="text-lg">🏆</span>}
                                <span className={`text-[15px] font-semibold ${!didIWin ? 'text-green-700' : 'text-gray-500 line-through'}`}>
                                  {opponentName}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm font-bold mb-1 text-center">
                              {didIWin ? "✅ Win" : "❌ Loss"}
                            </div>
                            <div className="text-xs text-gray-400 text-center">{match.date}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Leaderboard & Achievements */}
              <div className="flex flex-col gap-5">
                {/* Leaderboard */}
                <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-red-400">
                  <h3 className="text-lg text-gray-800 mb-4">👑 Top Racers</h3>
                  {loading ? (
                    <div className="text-center text-gray-400 text-sm py-5">Loading leaderboard...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-5">No racers yet. Be the first to compete!</div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {leaderboard.map((entry) => {
                        const isCurrentUser = entry.userName === myUserName;
                        const medalEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉";
                        
                        return (
                          <div 
                            key={entry.rank} 
                            className={`bg-white p-4 rounded-lg border-2 flex items-center gap-4 transition-all hover:translate-x-1 hover:shadow-md ${
                              isCurrentUser 
                                ? 'border-green-500 bg-gradient-to-r from-green-50 to-white shadow-green-200' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="text-3xl min-w-[50px] text-center">{medalEmoji}</div>
                            <div className="flex-1">
                              <div className="text-base font-bold text-gray-800 mb-1">
                                {entry.userName}
                                {isCurrentUser && <span className="text-xs text-green-500 font-normal"> (You)</span>}
                              </div>
                              <div className="text-sm text-gray-600">
                                {entry.wins}W - {entry.losses}L
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-red-400 min-w-[50px] text-right">
                              {entry.wins}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-yellow-400 flex-1">
                  <h3 className="text-lg text-gray-800 mb-4">🏆 Achievements</h3>
                  {loading ? (
                    <div className="text-center text-gray-400 text-sm py-5">Loading achievements...</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {achievements.map((achievement) => {
                        const isUnlocked = totalWins >= achievement.requirement;
                        const progress = Math.min((totalWins / achievement.requirement) * 100, 100);
                        
                        return (
                          <div 
                            key={achievement.id} 
                            className={`bg-white p-4 rounded-lg border-2 flex items-center gap-4 transition-all relative hover:-translate-y-0.5 hover:shadow-md ${
                              isUnlocked 
                                ? 'border-green-500 bg-gradient-to-r from-green-50 to-white' 
                                : 'border-gray-200 opacity-60 grayscale-[50%]'
                            }`}
                          >
                            <div className={`text-4xl min-w-[50px] text-center ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className={`text-base font-bold mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                                {achievement.title}
                              </div>
                              <div className={`text-sm mb-2 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                                {achievement.description}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isUnlocked ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-xs font-bold text-gray-600 min-w-[50px] text-right">
                                  {totalWins} / {achievement.requirement}
                                </div>
                              </div>
                            </div>
                            {isUnlocked && (
                              <div className="absolute top-2.5 right-2.5 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Join Button - Full Width at Bottom */}
            <button 
              onClick={joinRace}
              className="w-full mt-6 py-3 bg-green-500 text-white rounded-lg text-lg font-bold cursor-pointer transition-colors hover:bg-green-600"
            >
              Join Race
            </button>
          </div>
        ) : (
          <div className="w-full max-w-[1400px] mx-auto">
            {!started && (
              <div className="text-center text-lg text-gray-600 p-5 bg-white rounded-xl my-5">
                ⏳ Waiting for another player to join...
              </div>
            )}

            {winner && (
              <div className="text-center text-3xl text-yellow-300 bg-gradient-to-br from-purple-600 to-purple-800 p-5 rounded-xl my-5 animate-pulse">
                🎉 {winner} wins! 🏆
              </div>
            )}

            {started && !winner && (
              <div className="text-center text-xl text-gray-800 bg-yellow-100 p-4 rounded-xl my-5 border-2 border-yellow-400">
                Press <strong className="text-red-600 text-2xl">SPACEBAR</strong> to move! 🚀
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-xl mt-5">
              {players.map((p) => (
                <div key={p.id} className="relative h-[100px] mb-5 bg-green-500 border-3 border-green-800 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_48px,rgba(255,255,255,0.3)_48px,rgba(255,255,255,0.3)_50px)]" />
                  
                  {p.position < 100 && (
                    <div className="absolute left-[95%] top-1/2 -translate-y-1/2 flex items-center justify-center z-[15]">
                      <img src="/assets/race/finish-line.png" alt="finish line" className="w-10 h-10 object-contain" />
                    </div>
                  )}

                  <div className="absolute left-2.5 top-1 font-bold text-base text-gray-800 bg-white/90 px-2 py-0.5 rounded z-[5]">
                    {p.name}
                  </div>

                  <div className="absolute right-2.5 top-1 font-bold text-sm text-gray-600 bg-white/90 px-2 py-0.5 rounded z-[5]">
                    {Math.floor(p.position)}%
                  </div>

                  <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-out z-10 drop-shadow-lg"
                    style={{ left: `${p.position * 0.95}%` }}
                  >
                    <img src={p.sprite} alt={`${p.name}'s character`} className="w-20 h-20 object-contain block" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonMashRace;