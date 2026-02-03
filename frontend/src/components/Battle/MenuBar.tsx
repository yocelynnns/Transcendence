import "../../styles/MenuBar.css";

interface MenuBarProps {
  currentPokemon: string;
  pokemon1?: { icon: string; isDead: boolean; onClick: () => void };
  pokemon2?: { icon: string; isDead: boolean; onClick: () => void };
  onAttack: () => void;
  disabled: boolean; // 👈 ADD
}

export default function MenuBar({ currentPokemon, pokemon1, pokemon2, onAttack, disabled }: MenuBarProps) {
  const menuBar = "/assets/menu_bar/menu_bar.png";

  const renderSwitchButton = (pokemon: { icon: string; isDead: boolean; onClick: () => void }) => (
    <div
      className={`switch ${pokemon.isDead || disabled ? "disabled" : ""}`}
      onClick={!pokemon.isDead && !disabled ? pokemon.onClick : undefined}
    >
      <img src={pokemon.icon} />
      {(pokemon.isDead || disabled) && <div className="switch-overlay" />}
    </div>
  );

  return (
    <div className="menu-bar">
      <img src={menuBar} className="menu-bg" />
      <div className="menu-content">
        <div className="menu-text">
          {disabled ? "WAITING FOR OPPONENT..." : <>WHAT WILL <span>{currentPokemon.toUpperCase()}</span> DO?</>}
        </div>
        {!disabled && (
          <div className="menu-actions">
            {pokemon1 && renderSwitchButton(pokemon1)}
            {pokemon2 && renderSwitchButton(pokemon2)}
            <button
              className="attack menu-button"
              onClick={!disabled ? onAttack : undefined}
            >
              ATTACK
            </button>
            <button className="surrender">SURRENDER</button>
          </div>
        )}
      </div>
    </div>
  );
}
