//IMPORTS
import { useEffect, useState } from "react";
import type { SpawnedPokemon } from "./usePokemonSpawner";

//TYPES
type PlayerPos = { px: number; py: number };
type EncounterState = {
  encounterPokemon: SpawnedPokemon | null;
  showDialog: boolean;
  stopMovement: boolean;
};

//MAIN HOOK
export function useEncounter(
  playerPos: PlayerPos,
  pokemonList: SpawnedPokemon[],
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
    if (Date.now() - lastNoTime < 10000) return;

    for (const p of pokemonList) {
      const dx = Math.abs(playerPos.px - p.x);
      const dy = Math.abs(playerPos.py - p.y);
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
