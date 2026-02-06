import { useEffect } from "react";
import { Guild, GuildMessage } from "../types/guildTypes";
import { useGameSocket } from "../ws/useGameSocket";
import type { Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";


interface Props {
  setGuilds: Dispatch<SetStateAction<Guild[]>>;
  avatarId: string;
}
export function useFullGuildUpdates({ setGuilds, avatarId }: Props) {
  const { subscribeEvent } = useGameSocket(() => {});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!subscribeEvent) return;

    const unsubscribe = subscribeEvent<
      Partial<Guild> & { _id: string; action?: "delete" | "update" | "kick"; targetAvatarId?: string }
    >("guildUpdate", (updatedGuild) => {
      setGuilds((prev) => {
        if (updatedGuild.action === "delete") {
          if (prev.some((g) => g._id === updatedGuild._id)) {
            queryClient.invalidateQueries({ queryKey: ["avatar", avatarId], exact: true });
          }
          return prev.filter((g) => g._id !== updatedGuild._id);
        }

        const index = prev.findIndex((g) => g._id === updatedGuild._id);

        if (index >= 0) {
          const newList = [...prev];

          if (updatedGuild.action === "kick" && updatedGuild.targetAvatarId) {

            if (updatedGuild.targetAvatarId === avatarId) {
              queryClient.invalidateQueries({ queryKey: ["avatar", avatarId], exact: true });
            }

            newList[index] = {
              ...newList[index],
              members: newList[index].members.filter((m) => {
                const mId = typeof m.avatar === "string" ? m.avatar : m.avatar?._id;
                return mId !== updatedGuild.targetAvatarId;
              }),
            };
          } else {
            newList[index] = {
              ...newList[index],
              ...updatedGuild,
              members: updatedGuild.members ?? newList[index].members,
            };
          }

          return newList;
        }

        return [
          ...prev,
          {
            ...(updatedGuild as Guild),
            members: updatedGuild.members ?? [],
          },
        ];
      });
    });

    return () => unsubscribe();
  }, [subscribeEvent, setGuilds, avatarId, queryClient]);
}

interface UseGuildChatSocketProps {
  guildId: string | undefined;
  setMessages: React.Dispatch<React.SetStateAction<GuildMessage[]>>;
}

export function useGuildChatSocket({
  guildId,
  setMessages,
}: UseGuildChatSocketProps) {
  const { subscribeEvent, emitEvent } = useGameSocket(() => {});

  useEffect(() => {
    if (!guildId) return;

    emitEvent("joinGuild", guildId);


    const unsubscribe = subscribeEvent<GuildMessage>(
      "guildMessage",
      (msg) => setMessages((prev) => [...prev, msg])
    );

    return () => unsubscribe();
  }, [guildId, subscribeEvent, setMessages, emitEvent]);
}
