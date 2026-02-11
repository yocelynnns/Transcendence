//IMPORTS
import { useEffect, useState } from "react";
import type { MapPokemon } from "../types/pokemonTypes";

//TYPES
type PlayerPos = { x: number; y: number };
type EncounterState = {
  encounterPokemon: MapPokemon | null;
  showDialog: boolean;
  stopMovement: boolean;
};

//MAIN HOOK
export function useEncounter(
  playerPos: PlayerPos,
  pokemonList: MapPokemon[],
  tileSize: number
) {
  //STATE
  const [state, setState] = useState<EncounterState>({
    encounterPokemon: null,
    showDialog: false,
    stopMovement: false,
  });
  const [lastNoTime, setLastNoTime] = useState(0);

  //CHECK ENCOUNTER
  useEffect(() => {
    if (state.encounterPokemon || state.showDialog) return;
    if (Date.now() - lastNoTime < 1000) return;

    for (const p of pokemonList) {
      const dx = Math.abs(playerPos.x - p.x);
      const dy = Math.abs(playerPos.y - p.y);
      if (dx < tileSize && dy < tileSize) {
        requestAnimationFrame(() =>
          setState({ encounterPokemon: p, showDialog: true, stopMovement: true })
        );
        break;
      }
    }
  }, [playerPos, pokemonList, state.encounterPokemon, state.showDialog, lastNoTime, tileSize]);

  //HANDLE CATCH YES
  const handleCatchYes = (removePokemon: (id: string) => void) => {
    if (!state.encounterPokemon) return;
    removePokemon(state.encounterPokemon._id);
    setState({ encounterPokemon: null, showDialog: false, stopMovement: false });
  };

  //HANDLE CATCH NO
  const handleCatchNo = () => {
    setState({ encounterPokemon: null, showDialog: false, stopMovement: false });
    setLastNoTime(Date.now());
  };

  //RETURN
  return {
    encounterPokemon: state.encounterPokemon,
    showDialog: state.showDialog,
    stopMovement: state.stopMovement,
    handleCatchYes,
    handleCatchNo,
  };
}
