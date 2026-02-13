import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPokemonFrontSprite, getPokemonGifPath } from "../../assets/helpers";
import { ASSETS } from "../../assets";
import { AvatarData } from "../../types/avatarTypes";
import { useGameSocket } from "../../ws/useGameSocket";
import TermsOfServicePage from "../../pages/TermsOfServicePage";
import PrivacyPolicyPage from "../../pages/PrivacyPolicypage";

const playerSprite = ASSETS.PLAYER.DEFAULT;

interface BattlePokemon {
  name: string;
  type: string;
  is_shiny: boolean;
}

interface BattleHistory {
  _id: string;
  player1: { userName: string; _id: string };
  player2: { userName: string; _id: string };
  pokemon1: BattlePokemon[];
  pokemon2: BattlePokemon[];
  winner?: "player1" | "player2" | "draw";
  winnerReason?: string;
  createdAt: Date;
  endedAt?: Date;
}

interface ProfilePageProps {
  avatarData: AvatarData;
  updateAvatar?: (fields: Partial<AvatarData>) => void;
  onClose?: () => void;
  me?: boolean;
  handleLogOut?: () => void;
}

export default function ProfilePage({
  avatarData,
  updateAvatar,
  onClose,
  me,
  handleLogOut,
}: ProfilePageProps) {
  const navigate = useNavigate();
  const { signOut, emitEvent } = useGameSocket(() => undefined);

  const [tempName, setTempName] = useState(avatarData.userName);
  const [selectedIndex, setSelectedIndex] = useState(avatarData.characterOption);
  const [battles, setBattles] = useState<BattleHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const options = [
    { x: 64, y: 72 },
    { x: 64, y: 168 },
    { x: 64, y: 264 },
  ];

  // Fetch battle history only on mount or when battleHistory IDs change
  useEffect(() => {
    if (!avatarData?.battleHistory?.length) return;

    const fetchBattles = async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          avatarData.battleHistory.map(async (battleId) => {
            const res = await fetch(
              `https://localhost/api/battle/${battleId.toString()}`
            );
            const data = await res.json();
            return {
              ...data,
              createdAt: new Date(data.createdAt),
              endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
            };
          })
        );
        setBattles(results.reverse());
      } catch {
        setBattles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, [avatarData.battleHistory]);

  // Avatar image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAvatar = ev.target?.result as string;
      updateAvatar?.({ avatar: newAvatar });
      emitEvent("avatarUpdated", {
        avatarId: avatarData._id,
        avatarImage: newAvatar,
        userName: avatarData.userName,
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  // Username submit
  const handleNameSubmit = () => {
    updateAvatar?.({ userName: tempName });
    emitEvent("avatarUpdated", {
      avatarId: avatarData._id,
      avatarImage: avatarData.avatar,
      userName: tempName,
    });
  };


  const handleSignOut = () => {
    signOut();
    sessionStorage.removeItem("token");
    handleLogOut?.();
    navigate("/login");
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return "-";
    const diff = end.getTime() - start.getTime();
    return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
  };

  const getBattleBg = (winner?: string, isPlayerOne?: boolean) => {
    if (winner === "draw") return "#fff9e6";

    if (winner === "player1") {
      return isPlayerOne ? "#ecfdf3" : "#fdecec";
    }

    if (winner === "player2") {
      return !isPlayerOne ? "#ecfdf3" : "#fdecec";
    }
    return "#fff";
  };


  // Battle stats
  const totalGames = battles.filter(
    (b) =>
      b.player1?._id?.toString() === avatarData._id.toString() ||
      b.player2?._id?.toString() === avatarData._id.toString()
  ).length;

  const wins = battles.filter(
    (b) =>
      (b.winner === "player1" && b.player1?._id?.toString() === avatarData._id.toString()) ||
      (b.winner === "player2" && b.player2?._id?.toString() === avatarData._id.toString())
  ).length;

  const draws = battles.filter(
    (b) =>
      b.winner === "draw" &&
      (b.player1?._id?.toString() === avatarData._id.toString() ||
        b.player2?._id?.toString() === avatarData._id.toString())
  ).length;

  const losses = totalGames - wins - draws;

  // NEW: compute win rate
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-[#ab7b81] z-50 p-4 overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-2xl cursor-pointer z-50"
      >
        <img
          src={ASSETS.ICONS.X}
          alt="x"
          className="w-10 h-10 object-contain image-rendering-pixelated hover:scale-110"
        />
      </button>

      <div className={`flex flex-col ${me ? "md:flex-row" : "md:flex-col"} h-full gap-6 overflow-y-auto`}>
        {/* LEFT PANEL */}
        <div className={`${me ? "md:flex-[1_1_33%]" : "w-full"} shrink-0`}>
          <div className="h-full p-6 bg-[#ecc2be] rounded-lg flex flex-col overflow-y-auto">

            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-32 h-32 rounded-full bg-center bg-cover"
                style={{
                  backgroundImage: `url(${avatarData.avatar || ASSETS.AVATAR.CLEFFA})`,
                }}
              />
              {me && (
                <label className="mt-3 cursor-pointer">
                  <span className="px-3 py-1 bg-[#fff1ef] rounded-md text-sm">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Username */}
            <div className="flex justify-center gap-2 mb-6 w-full">
              {me ? (
                <>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-center px-2 py-1 bg-[#fff1ef] rounded-md w-2/3"
                  />
                  <button
                    onClick={handleNameSubmit}
                    className="px-3 py-1 bg-[#fff1ef] rounded-md hover:scale-102 hover:text-[#fff1ef] hover:bg-[#ab7b81]"
                  >
                    Change
                  </button>
                </>
              ) : (
                <span className="px-3 py-1 bg-[#fff1ef] rounded-md text-center w-2/3">
                  {avatarData.userName}
                </span>
              )}
            </div>

            {/* Character Selection */}
            {me && (
              <div className="mb-6 w-full">
                <h3 className="text-center font-semibold mb-3">Character Selection</h3>
                <div className="flex flex-col gap-3">
                  {options.map((opt, i) => {
                    const isSelected = selectedIndex === i;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedIndex(i);
                          updateAvatar?.({ characterOption: i });
                          emitEvent("avatarUpdated", {
                            avatarId: avatarData._id,
                            avatarImage: avatarData.avatar,
                            userName: avatarData.userName,
                            characterOption: i,
                          });
                        }}
                        className={`flex items-center gap-4 p-3 cursor-pointer rounded-md
                          ${isSelected ? "bg-[#fff1ef]" : "bg-[#f6e3df]"}
                        `}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 24,
                            background: `url(${playerSprite}) -${opt.x}px -${opt.y}px/auto`,
                          }}
                        />
                        <span className="font-medium text-[#ab7b81]">
                          Character {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pokemon Inventory */}
            <div className="mb-6 w-full">
              <h3 className="text-center font-semibold mb-3">Inventory / Pokemon</h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {avatarData.pokemonInventory.map((p, i) => (
                  <div
                    key={i}
                    className="bg-[#fff1ef] rounded-md flex flex-col items-center justify-center p-2 text-xs"
                  >
                    <img
                      src={getPokemonFrontSprite(p.name) ?? undefined}
                      alt={p.name}
                      width={40}
                      height={40}
                    />
                    <span className="w-full text-center text-[#ab7b81] text-[10px] sm:text-xs wrap-break-word">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign Out */}
            {me && (
              <div className="flex justify-center mt-auto w-full">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded-md w-full"
                >
                  Sign Out
                </button>
              </div>
            )}

            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={() => setShowTOS(true)}
                className="text-[1rem] text-blue-500 underline hover:text-blue-700"
              >
                Terms of Service
              </button>

              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-[1rem] text-blue-500 underline hover:text-blue-700"
              >
                Privacy Policy
              </button>
            </div>

          </div>

          {showTOS && (
            <div className="fixed inset-0 z-60 bg-white overflow-auto">
              <TermsOfServicePage />
              <button
                onClick={() => setShowTOS(false)}
                className="absolute top-6 right-6 text-2xl font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                ×
              </button>
            </div>
          )}

          {showPrivacyPolicy && (
          <div className="fixed inset-0 z-60 bg-white overflow-auto">
            <PrivacyPolicyPage />
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="absolute top-6 right-6 text-2xl font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              ×
            </button>
          </div>
        )}

        </div>

        {/* RIGHT PANEL */}
        <div className={`${me ? "md:flex-[1_1_67%]" : "w-full"} shrink-0`}>
          <div className="h-full p-6 bg-[#ecc2be] rounded-lg flex flex-col overflow-y-auto font-mono">
            <h2 className="text-center font-bold mb-6 text-lg">Match History</h2>

            {/* Stats */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <StatBox title="Games" value={totalGames} color="#4a90e2" />
              <StatBox title="Wins" value={wins} color="#57b87c" />
              <StatBox title="Losses" value={losses} color="#e74c3c" />
              <StatBox title="Draws" value={draws} color="#888888" />
              <StatBox title="Win Rate" value={winRate} color="#a982d0" suffix="%" />
            </div>


            {/* Battle List */}
            {loading && <p className="text-center">Loading...</p>}
            {!loading && battles.length === 0 && (
              <p className="text-center text-[#ab7b81]">No matches yet</p>
            )}

            {battles.map((b) => (
              <div
                key={b._id}
                className="bg-[#fff1ef] rounded-md p-4 mb-4"
                style={{
                  background: getBattleBg(
                    b.winner,
                    (avatarData._id.toString() == b.player1._id.toString())
                  ),
                }}
              >
                <div className="grid grid-cols-3 items-center mb-2">
                  <div className="flex gap-1">
                    {b.pokemon1.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonGifPath(p.name, p.type, p.is_shiny, false)}
                        width={36}
                        height={36}
                      />
                    ))}
                  </div>
                  <div className="text-center font-bold">VS</div>
                  <div className="flex gap-1 justify-end">
                    {b.pokemon2.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonGifPath(p.name, p.type, p.is_shiny, false)}
                        width={36}
                        height={36}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-center font-bold">
                  {b.player1.userName} vs {b.player2.userName}
                </p>
                <p className="text-center text-sm">{b.winnerReason ?? "—"}</p>
                <p className="text-center text-sm">
                  Duration: {formatDuration(b.createdAt, b.endedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBox = ({
  title,
  value,
  color,
  suffix,
}: {
  title: string;
  value: number;
  color: string;
  suffix?: string;
}) => (
  <div
    className="rounded-lg text-center text-white px-3 py-1 min-w-15"
    style={{ background: color }}
  >
    <div className="text-xs">{title}</div>
    <div className="text-lg font-bold">
      {value}
      {suffix && suffix}
    </div>
  </div>
);
