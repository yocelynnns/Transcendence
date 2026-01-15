import "./menuBar.css";
// import menuBar from "../../assets/menu_bar/menu_bar.png";
// import cleffaIcon from "../../assets/pokemon/normal/cleffa/cleffa_icon.png";
// import togepiIcon from "../../assets/pokemon/normal/togepi/togepi_icon.png";

interface MenuBarProps {
  currentPokemon: string;
  pokemon1: { icon: string; isDead: boolean; onClick: () => void };
  pokemon2: { icon: string; isDead: boolean; onClick: () => void };
  onAttack: () => void;
}

export default function MenuBar({ currentPokemon, pokemon1, pokemon2, onAttack }: MenuBarProps) {
  const menuBar = "/assets/menu_bar/menu_bar.png";

  const renderSwitchButton = (pokemon: { icon: string; isDead: boolean; onClick: () => void }) => (
    <div className={`switch ${pokemon.isDead ? "disabled" : ""}`} onClick={!pokemon.isDead ? pokemon.onClick : undefined}>
      <img src={pokemon.icon} />
      {pokemon.isDead && <div className="switch-overlay" />}
    </div>
  );

  return (
    <div className="menu-bar">
      <img src={menuBar} className="menu-bg" />
      <div className="menu-content">
        <div className="menu-text">WHAT WILL <span>{currentPokemon.toUpperCase()}</span> DO?</div>
        <div className="menu-actions">
          {renderSwitchButton(pokemon1)}
          {renderSwitchButton(pokemon2)}
          <button className="attack" onClick={onAttack}>ATTACK</button>
          <button className="surrender">SURRENDER</button>
        </div>
      </div>
    </div>
  );
}
