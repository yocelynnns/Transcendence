import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./ButtonMashRace.css";

interface Player {
  id: string;
  avatarId: string;
  name: string;
  position: number;
}

interface ButtonMashRaceProps {
  avatarId: string; // Pass from your main game (logged-in user's avatar _id)
  onExit?: () => void;
}

const ButtonMashRace: React.FC<ButtonMashRaceProps> = ({ avatarId, onExit }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joined, setJoined] = useState(false);
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

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
    if (socket) {
      socket.disconnect();
    }
    if (onExit) {
      onExit();
    }
  };

  // Sprites for player 1 and player 2
  const characterSprites = ["/assets/race/player-1.png", "/assets/race/player-2.png"];

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
                {p.position < 95 && (
                  <div className="finish-line">
                    <img
                      src="/assets/race/finish-line.png"
                      alt="finish line"
                      className="finish-line-sprite"
                    />
                  </div>
                )}
                <div className="player-name">{p.name}</div>
                <div className="player-position">{Math.floor(p.position)}%</div>
                <div className="player-character" style={{ left: `${p.position * 0.95}%` }}>
                  <img
                    src={characterSprites[index % characterSprites.length]}
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

