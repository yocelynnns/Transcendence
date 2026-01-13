import "./menuBar.css";
// import menuBar from "../../assets/menu_bar/menu_bar.png";
// import cleffaIcon from "../../assets/pokemon/normal/cleffa/cleffa_icon.png";
// import togepiIcon from "../../assets/pokemon/normal/togepi/togepi_icon.png";

interface MenuBarProps {
  currentPokemon: string
  pokemonIcon1: string;
  pokemonIcon2: string;
}

export default function MenuBar({currentPokemon, pokemonIcon1, pokemonIcon2, }: MenuBarProps) {
  
  const menuBar = "/assets/menu_bar/menu_bar.png";

  return (
    <div className="menu-bar">
      <img src={menuBar} className="menu-bg" />

      <div className="menu-content">
        <div className="menu-text">WHAT WILL {currentPokemon.toUpperCase()} DO?</div>

        <div className="menu-actions">
          <div className="switch">
            <img src={pokemonIcon1} />
          </div>
          <div className="switch">
            <img src={pokemonIcon2} />
          </div>

          <button className="attack">ATTACK</button>
          <button className="surrender">SURRENDER</button>
        </div>
      </div>
    </div>
  );
}
