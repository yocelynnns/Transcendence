import { useEffect, useMemo, useState } from "react";
import TeamSelectLayout from "./teamSelectLayout";
import type { Player, Pokemon } from "./types";
import "./teamSelect.css";

const API = "http://localhost:3001";
const TEAM_SIZE = 3;
const PICK_TIME_SECONDS = 30;

// TODO: replace with real logged-in player id later
const PLAYER_ID = "6967fbfd6755bb8b6e32cd96";

export default function TeamSelectPage() {
  const [inventory, setInventory] = useState<Pokemon[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);

  const [slots, setSlots] = useState<(Pokemon | null)[]>(
    Array.from({ length: TEAM_SIZE }, () => null)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PICK_TIME_SECONDS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // --- Timer ---
  useEffect(() => {
    setTimeLeft(PICK_TIME_SECONDS);
    const t = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  // --- Fetch player + inventory ---
  useEffect(() => {
    if (!PLAYER_ID) return;

    (async () => {
      try {
        const res = await fetch(`${API}/players/${PLAYER_ID}`);
        const data = await res.json();

        if (!res.ok) {
          setMsg(data?.error ?? "Failed to load player");
          setPlayer(null);
          setInventory([]);
          return;
        }

        setPlayer(data);

        if (Array.isArray(data?.pokemons) && typeof data.pokemons[0] === "object") {
          setInventory(data.pokemons);
        } else {
          setInventory([]);
          setMsg("No inventory found (seed or populate missing).");
        }
      } catch (e) {
        console.error(e);
        setMsg("Network error fetching player");
        setPlayer(null);
        setInventory([]);
      }
    })();
  }, []);

  const usedIds = useMemo(
    () => new Set(slots.filter(Boolean).map((p) => (p as Pokemon)._id)),
    [slots]
  );

  const pickPokemon = (p: Pokemon) => {
    if (timeLeft === 0) return flashMsg("Time's up!");
    if (usedIds.has(p._id)) return flashMsg("Already selected");

    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = p;

      const nextEmpty = next.findIndex((x) => x === null);
      if (nextEmpty !== -1) setActiveSlot(nextEmpty);

      return next;
    });
  };

  const removeSlot = (idx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  };

  const canReady = slots.every(Boolean) && timeLeft > 0;

  const saveTeam = async () => {
    if (!PLAYER_ID) return flashMsg("Set PLAYER_ID first.");
    if (!slots.every(Boolean)) return flashMsg("Pick 3 Pokémon first.");

    setSaving(true);
    setMsg(null);

    try {
      for (let i = 0; i < TEAM_SIZE; i++) {
        const p = slots[i] as Pokemon;

        await fetch(`${API}/players/${PLAYER_ID}/team/${i + 1}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pokemonId: p._id }),
        });
      }
      flashMsg("✅ Ready!");
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to save");
    } finally {
      setSaving(false);
    }
  };

  function flashMsg(text: string, ms = 1200) {
    setMsg(text);
    window.setTimeout(() => setMsg(null), ms);
  }

  const avatarSrc =
    player?.avatarUrl && player.avatarUrl.length > 0
      ? player.avatarUrl
      : "/assets/ui/default_avatar.png";

  return (
    <TeamSelectLayout
      inventory={inventory}
      usedIds={usedIds}
      onPick={pickPokemon}
      slots={slots}
      activeSlot={activeSlot}
      setActiveSlot={setActiveSlot}
      onRemoveSlot={removeSlot}
      timeLeft={timeLeft}
      msg={msg}
      playerName={player?.username ?? "Player"}
      avatarSrc={avatarSrc}
      canReady={canReady}
      saving={saving}
      onReady={saveTeam}
    />
  );
}
