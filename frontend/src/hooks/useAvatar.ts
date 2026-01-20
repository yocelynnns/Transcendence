import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AvatarData } from "../components/AvatarProfile";

export function useAvatar() {
  const queryClient = useQueryClient();
  const avatarId = localStorage.getItem("avatarId");
  const token = localStorage.getItem("token");

  // FETCH AVATAR
  const query = useQuery<AvatarData, Error>({
    queryKey: ["avatar", avatarId],
    queryFn: async (): Promise<AvatarData> => {
      if (!avatarId || !token) {
        throw new Error("No avatarId or token");
      }

      const res = await fetch(`http://localhost:5001/api/avatar/${avatarId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch avatar");
      }

      return (await res.json()) as AvatarData;
    },
    enabled: Boolean(avatarId && token),
  });

  // MUTATION
  const mutation = useMutation<AvatarData, Error, Partial<AvatarData>>({
    mutationFn: async (updatedFields) => {
      if (!avatarId || !token) {
        throw new Error("No avatarId or token");
      }

      const res = await fetch(`http://localhost:5001/api/avatar/${avatarId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Failed to update avatar");
      }

      return (await res.json()) as AvatarData;
    },

    onSuccess: (data) => {
      queryClient.setQueryData<AvatarData>(["avatar", avatarId], (old) => {
        if (!old) return data;
        return { ...old, ...data };
      });
    },

    onError: (err) => {
      console.error("Failed to update avatar:", err.message);
    },
  });

  return {
    avatarData: query.data,
    updateAvatar: mutation.mutate,
    isLoading: query.isLoading,
  };
}
