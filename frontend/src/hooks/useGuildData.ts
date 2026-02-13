import { Guild } from "../types/guildTypes";

export async function fetchAllGuilds(): Promise<Guild[]> {
  const res = await fetch("https://localhost/api/guild");
  if (!res.ok) throw new Error("Failed to fetch guilds");
  const data: Guild[] = await res.json();

  return data.map((g) => ({ ...g, members: g.members || [] }));
}

export async function fetchGuildById(guildId: string, token: string): Promise<{
  guild: Guild;
  members: { avatar: string; role: "leader" | "officer" | "member" }[];
  role: "leader" | "member";
}> {
  const res = await fetch(`https://localhost/api/guild/${guildId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch guild by ID");
  return res.json();
}


