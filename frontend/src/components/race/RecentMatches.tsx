import React from "react";

interface MatchHistoryItem {
  _id: string;
  player1: string;
  player2: string;
  winner: string;
  date: string;
}

interface Props {
  matchHistory: MatchHistoryItem[];
  myUserName: string;
  loading: boolean;
  recentListH: string;
  compact: boolean;
  cardPad: string;
  titleText: string;
}

const RecentMatches: React.FC<Props> = ({
  matchHistory,
  myUserName,
  loading,
  recentListH,
  compact,
  cardPad,
  titleText,
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg border-l-4 border-green-500 ${cardPad} flex flex-col overflow-hidden`}>
      <h3 className={`${titleText} text-gray-800 mb-1.5`}>
        📊 Recent Matches
      </h3>

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-3">
          Loading history...
        </div>
      ) : matchHistory.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-3">
          No matches yet.
        </div>
      ) : (
        <div className={`flex flex-col gap-2 pr-1 overflow-y-auto ${recentListH}`}>
          {matchHistory.map((match) => {
            const isPlayer1 = match.player1 === myUserName;
            const myName = isPlayer1 ? match.player1 : match.player2;
            const opponentName = isPlayer1 ? match.player2 : match.player1;
            const didIWin = match.winner === myUserName;

            return (
              <div
                key={match._id}
                className={`bg-white rounded-lg border-2 border-gray-200 ${
                  compact ? "p-2" : "p-3"
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-2 ${
                    compact ? "mb-0.5" : "mb-1"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`${
                        compact ? "text-[10px]" : "text-xs sm:text-sm"
                      } font-semibold truncate ${
                        didIWin
                          ? "text-green-700"
                          : "text-gray-500 line-through"
                      }`}
                    >
                      {myName} (You)
                    </span>
                    {didIWin && <span>🏆</span>}
                  </div>

                  <span
                    className={`${
                      compact ? "text-[9px]" : "text-[10px]"
                    } text-gray-400 font-bold px-2`}
                  >
                    VS
                  </span>

                  <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                    {!didIWin && <span>🏆</span>}
                    <span
                      className={`${
                        compact ? "text-[10px]" : "text-xs sm:text-sm"
                      } font-semibold truncate ${
                        !didIWin
                          ? "text-green-700"
                          : "text-gray-500 line-through"
                      }`}
                    >
                      {opponentName}
                    </span>
                  </div>
                </div>

                <div
                  className={`${
                    compact ? "text-[10px]" : "text-xs"
                  } font-bold text-center`}
                >
                  {didIWin ? "✅ Win" : "❌ Loss"}
                </div>

                <div
                  className={`${
                    compact ? "text-[9px]" : "text-[10px]"
                  } text-gray-400 text-center`}
                >
                  {match.date}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentMatches;