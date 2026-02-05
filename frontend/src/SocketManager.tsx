import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGameSocket } from "./ws/useGameSocket";

interface SocketManagerProps {
  avatarId: string | null | undefined;
}

export default function SocketManager({ avatarId }: SocketManagerProps) {
  const { emitEvent } = useGameSocket(() => {});
  const location = useLocation();

  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const previous = prevPath.current;

    if (previous === "/matching") {
      emitEvent("leaveMatching", avatarId);
      console.log("Left matching due to route change:", previous);
    }

    prevPath.current = location.pathname;
  }, [location.pathname, avatarId, emitEvent]);

  return null;
}
