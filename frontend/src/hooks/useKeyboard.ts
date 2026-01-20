//IMPORTS
import { useEffect, useRef } from "react";

//MAIN HOOK
export default function useKeyboard() {
  //STATE
  const keysPressed = useRef<Set<string>>(new Set());

  //EFFECT: LISTEN KEYBOARD
  useEffect(() => {
    //HANDLE KEY DOWN
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      keysPressed.current.add(e.key);
    };

    //HANDLE KEY UP
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    //ADD EVENT LISTENERS
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    //CLEANUP
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  //RETURN
  return keysPressed;
}
