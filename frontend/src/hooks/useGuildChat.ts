import { GuildMessage } from "../types/guildTypes";

export async function fetchGuildMessages(
  guildId: string | undefined,
  token: string | null
): Promise<GuildMessage[]> {
  const res = await fetch(`/api/guildMessage/${guildId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch guild messages");
  }

  const data: GuildMessage[] = await res.json();
  return data;
}
