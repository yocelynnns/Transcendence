import React from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  icon: string;
}

interface Props {
  achievements: Achievement[];
  totalWins: number;
  achievementListH: string;
  compact: boolean;
  cardPad: string;
  titleText: string;
}

const AchievementsPanel: React.FC<Props> = ({
  achievements,
  totalWins,
  achievementListH,
  compact,
  cardPad,
  titleText,
}) => {
  return (
    <div
      className={`bg-[#a5b6dd] rounded-md ${cardPad} flex flex-col overflow-hidden justify-center`}
    >
      <h3
        className={`${titleText} text-[#384071] font-bold mb-3 text-center`}
      >
        Achievements
      </h3>

      <div
        className={`flex flex-col ${
          compact ? "gap-2" : "gap-3"
        } overflow-y-auto pr-1 ${achievementListH}`}
      >
        {achievements.map((a) => {
          const isUnlocked = totalWins >= a.requirement;
          const progress = Math.min(
            (totalWins / a.requirement) * 100,
            100
          );

          return (
            <div
              key={a.id}
              className={`rounded-md p-3 flex items-center gap-3 transition-all ${
                isUnlocked
                  ? "bg-[#d7e1f5]"
                  : "bg-[#d7e1f5] opacity-75"
              }`}
            >
              {/* Icon */}
              <div
                className={`${
                  compact ? "text-2xl" : "text-3xl"
                } min-w-9 text-center`}
              >
                {a.icon}
              </div>

              {/* Text + Progress */}
              <div className="flex-1">
                <div
                  className={`font-bold ${
                    compact ? "text-xs" : "text-sm"
                  } text-[#384071]`}
                >
                  {a.title}
                </div>

                {!compact && (
                  <div className="text-[11px] text-[#384071]/80 mb-2">
                    {a.description}
                  </div>
                )}

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#e6ecfa] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isUnlocked
                          ? "bg-green-500"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="text-[10px] font-bold text-[#384071] min-w-10.5 text-right">
                    {totalWins}/{a.requirement}
                  </div>
                </div>
              </div>

              {/* Unlocked Badge */}
              {isUnlocked && (
                <div className="text-[#ffcc00] font-bold text-sm bg-[#677fb4] px-2 py-0.5 rounded">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;