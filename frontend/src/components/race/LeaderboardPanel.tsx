import React from "react";

interface LeaderboardEntry {
  rank: number;
  userName: string;
  wins: number;
  losses: number;
  totalRaces: number;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  myUserName: string;
  loading: boolean;
  leaderboardListH: string;
  compact: boolean;
  cardPad: string;
  titleText: string;
}

const LeaderboardPanel: React.FC<Props> = ({
  leaderboard,
  myUserName,
  loading,
  leaderboardListH,
  compact,
  cardPad,
}) => {
  return (
    <div className={`bg-[#a5b6dd] rounded-md ${cardPad} flex flex-col overflow-hidden`}>
      <h3 className={`text-center font-semibold mb-3 text-white text-xl`}>
        Top Racers
      </h3>

      {loading ? (
        <div className="text-center text-gray-600 py-3">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center text-gray-600 py-3">No racers yet.</div>
      ) : (
        <div className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"} overflow-y-auto pr-1 ${leaderboardListH}`}>
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.userName === myUserName;
            const medalEmoji =
              entry.rank === 1
                ? "🥇"
                : entry.rank === 2
                ? "🥈"
                : entry.rank === 3
                ? "🥉"
                : "";

            return (
              <div
                key={entry.rank}
                className={`bg-white rounded-lg border-2 flex items-center justify-between ${
                  compact ? "p-2" : "p-3"
                } ${isCurrentUser ? "border-green-500 bg-linear-to-r from-green-50 to-white" : "border-gray-200"}`}
              >
                {/* Rank & Medal */}
                <div className="flex items-center gap-2 min-w-15">
                  <span className="font-bold">{entry.rank}.</span>
                  <span className="text-xl">{medalEmoji}</span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className={`${compact ? "text-[11px]" : "text-sm"} font-bold text-gray-800 truncate`}>
                    {entry.userName}
                    {isCurrentUser && <span className="text-green-500 font-normal ml-1">(You)</span>}
                  </div>
                </div>

                {/* Wins / Losses */}
                <div className="flex items-center gap-3 min-w-20 justify-end">
                  <div className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-green-600`}>
                    {entry.wins}W
                  </div>
                  <div className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-red-600`}>
                    {entry.losses}L
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;