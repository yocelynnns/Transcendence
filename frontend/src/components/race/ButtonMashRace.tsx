import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./ButtonMashRace.css";

interface Player {
  id: string;
  avatarId: string;
  name: string;
  position: number;
}

interface MatchHistoryItem {
  _id: string;
  player1: string;
  player2: string;
  winner: string;
  date: string;
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

  // Fetch match history and user info on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("=== FETCHING RACE DATA ===");
        console.log("Avatar ID:", avatarId);
        
        // Fetch user's avatar info to get username
        // Use your existing avatar API endpoint
        const avatarRes = await fetch(`http://localhost:5001/api/avatar/${avatarId}`);
        console.log("Avatar API response status:", avatarRes.status);
        
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          console.log("Avatar data received:", avatarData);
          // Adjust this based on your avatar API response structure
          const username = avatarData.userName || avatarData.avatar?.userName;
          console.log("Setting username to:", username);
          setMyUserName(username);
        } else {
          console.error("Failed to fetch avatar:", await avatarRes.text());
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

    socket.on("raceJoined", (racePlayers: Player[]) => {
        const playerWithSprites = racePlayers.map(p => ({
            ...p,
            sprite: characterSprites[Math.floor(Math.random() * characterSprites.length)]
        }));
        setPlayers(playerWithSprites);
    });
    socket.on("raceUpdate", (racePlayers: Player[]) => {
        setPlayers(prevPlayers =>
                   racePlayers.map(p => {
                       const existing = prevPlayers.find(pp => pp.id === p.id);
                       return {
                           ...p,
                           sprite: existing?.sprite || characterSprites[Math.floor(Math.random() * characterSprites.length)]
                       };
                   })
                  );
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

  // Sprites for player 1 and player 2
  const SPRITE_COUNT = 8;

  const characterSprites = Array.from(
      { length: SPRITE_COUNT },
      (_, i) => `/assets/race/eevee-${i + 1}.gif`
  );

  return (
    <div className="button-mash-container">
      {!joined ? (
        <div className="join-screen">
          <h2 className="join-title">🏁 Button Mash Race 🏁</h2>

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
            {players.map((p, index) => (
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

