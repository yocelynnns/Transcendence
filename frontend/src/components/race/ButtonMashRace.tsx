import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./ButtonMashRace.css";

interface Player {
  id: string;
  avatarId: string;
  name: string;
  position: number;
  sprite: string; // Sprite is now sent from server
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

  // Define achievements
  const achievements: Achievement[] = [
    { id: "first_win", title: "Level 1: First Victory", description: "Win your first race", requirement: 1, icon: "🏅" },
    { id: "five_wins", title: "Level 2: Speed Demon", description: "Win 5 races", requirement: 5, icon: "🔥" },
    { id: "ten_wins", title: "Level 3: Racing Legend", description: "Win 10 races", requirement: 10, icon: "👑" },
  ];

  // Fetch match history and user info on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("=== FETCHING RACE DATA ===");
        console.log("Avatar ID:", avatarId);
        
        // Fetch user's avatar info to get username
        const avatarRes = await fetch(`http://localhost:5001/api/avatar/${avatarId}`);
        console.log("Avatar API response status:", avatarRes.status);
        
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          console.log("Avatar data received:", avatarData);
          const username = avatarData.userName || avatarData.avatar?.userName;
          console.log("Setting username to:", username);
          setMyUserName(username);
        } else {
          console.error("Failed to fetch avatar:", await avatarRes.text());
        }

        // Fetch race stats for achievements
        console.log("Fetching race stats...");
        const statsRes = await fetch(`http://localhost:5001/api/race/stats/${avatarId}`);
        console.log("Stats API response status:", statsRes.status);
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          console.log("Stats received:", stats);
          setTotalWins(stats.wins);
        } else {
          console.error("Failed to fetch stats:", await statsRes.text());
        }

        // Fetch match history
        console.log("Fetching match history...");
        const historyRes = await fetch(`http://localhost:5001/api/race/history/${avatarId}`);
        console.log("History API response status:", historyRes.status);
        
        if (historyRes.ok) {
          const history = await historyRes.json();
          console.log("Match history received:", history);
          setMatchHistory(history);
        } else {
          console.error("Failed to fetch history:", await historyRes.text());
        }

        // Fetch leaderboard
        console.log("Fetching leaderboard...");
        const leaderboardRes = await fetch(`http://localhost:5001/api/race/leaderboard`);
        console.log("Leaderboard API response status:", leaderboardRes.status);
        
        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          console.log("Leaderboard received:", leaderboardData);
          setLeaderboard(leaderboardData);
        } else {
          console.error("Failed to fetch leaderboard:", await leaderboardRes.text());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [avatarId]);

  // Create socket connection on mount
  useEffect(() => {
    const newSocket = io("http://localhost:5001/minigame");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Server now sends players with sprites already assigned
    socket.on("raceJoined", (racePlayers: Player[]) => {
      console.log("Race joined, players:", racePlayers);
      setPlayers(racePlayers);
    });
    
    socket.on("raceUpdate", (racePlayers: Player[]) => {
      setPlayers(racePlayers);
    });
    
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
    if (socket) {
      socket.disconnect();
    }
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="button-mash-container">
      {!joined ? (
        <div className="join-screen">
          <h2 className="join-title">🐱 Eevee Race 🐱</h2>

          <div className="join-instructions">
            <h3>How to Win:</h3>
            <ol>
              <li>Wait for an opponent to join (automatic matchmaking)</li>
              <li>
                Press <strong>SPACEBAR</strong> as fast as you can!
              </li>
              <li>First to reach the finish line wins! 🏆</li>
            </ol>
          </div>

          {/* Achievements Section */}
          <div className="achievements-section">
            <h3>🏆 Achievements</h3>
            {loading ? (
              <div className="loading">Loading achievements...</div>
            ) : (
              <div className="achievements-list">
                {achievements.map((achievement) => {
                  const isUnlocked = totalWins >= achievement.requirement;
                  const progress = Math.min((totalWins / achievement.requirement) * 100, 100);
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
                    >
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-description">{achievement.description}</div>
                        <div className="achievement-progress">
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            {totalWins} / {achievement.requirement}
                          </div>
                        </div>
                      </div>
                      {isUnlocked && <div className="unlocked-badge">✓</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="leaderboard-section">
            <h3>👑 Top Racers</h3>
            {loading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="no-leaderboard">No racers yet. Be the first to compete!</div>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userName === myUserName;
                  const medalEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉";
                  
                  return (
                    <div 
                      key={entry.rank} 
                      className={`leaderboard-entry ${isCurrentUser ? "current-user" : ""}`}
                    >
                      <div className="leaderboard-rank">{medalEmoji}</div>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">
                          {entry.userName}
                          {isCurrentUser && <span className="you-badge"> (You)</span>}
                        </div>
                        <div className="leaderboard-stats">
                          {entry.wins}W - {entry.losses}L
                        </div>
                      </div>
                      <div className="leaderboard-wins">{entry.wins}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Match History Section */}
          <div className="match-history-section">
            <h3>📊 Recent Matches</h3>
            {loading ? (
              <div className="loading">Loading history...</div>
            ) : matchHistory.length === 0 ? (
              <div className="no-history">No matches yet. Be the first to race!</div>
            ) : (
              <div className="match-history-list">
                {matchHistory.map((match) => {
                  // Determine if current user is player1 or player2
                  const isPlayer1 = match.player1 === myUserName;
                  const myName = isPlayer1 ? match.player1 : match.player2;
                  const opponentName = isPlayer1 ? match.player2 : match.player1;
                  const didIWin = match.winner === myUserName;

                  return (
                    <div key={match._id} className="match-record">
                      <div className="match-players">
                        {/* Me (always on left) */}
                        <div className="player-side me">
                          <span className={`player-name ${didIWin ? "winner" : "loser"}`}>
                            {myName} (You)
                          </span>
                          {didIWin && <span className="trophy">🏆</span>}
                        </div>

                        <span className="vs">VS</span>

                        {/* Opponent (always on right) */}
                        <div className="player-side opponent">
                          {!didIWin && <span className="trophy">🏆</span>}
                          <span className={`player-name ${!didIWin ? "winner" : "loser"}`}>
                            {opponentName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="match-result">
                        {didIWin ? "✅ Win" : "❌ Loss"}
                      </div>
                      
                      <div className="match-date">{match.date}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={joinRace}>Join Race</button>
        </div>
      ) : (
        <div className="race-screen">
          {!started && (
            <div className="waiting-message">⏳ Waiting for another player to join...</div>
          )}

          {winner && (
            <div className="winner-message">
              🎉 {winner} wins! 🏆
              <button className="exit-button" onClick={handleExit}>
                Exit Race
              </button>
            </div>
          )}

          {started && !winner && (
            <div className="instructions">
              Press <strong>SPACEBAR</strong> to move! 🚀
            </div>
          )}

          <div className="race-track-container">
            {players.map((p) => (
              <div key={p.id} className="race-lane">
                <div className="lane-background"></div>
                {p.position < 100 && (
                  <div className="finish-line">
                    <img
                      src="/assets/race/finish-line.png"
                      alt="finish line"
                      className="finish-line-sprite"
                    />
                  </div>
                )}
                <div className="race-player-name">{p.name}</div>
                <div className="player-position">{Math.floor(p.position)}%</div>
                <div className="player-character" style={{ left: `${p.position * 0.95}%` }}>
                  <img
                    src={p.sprite}
                    alt={`${p.name}'s character`}
                    className="character-sprite"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonMashRace;

