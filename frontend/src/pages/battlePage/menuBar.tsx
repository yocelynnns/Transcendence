import "./menuBar.css";
import menuBar from "../../assets/menu_bar/menu_bar.png";
import cleffaIcon from "../../assets/pokemon/normal/cleffa/cleffa_icon.png";
import togepiIcon from "../../assets/pokemon/normal/togepi/togepi_icon.png";

export default function MenuBar() {
  return (
    <div className="menu-bar">
      <img src={menuBar} className="menu-bg" />

      <div className="menu-content">
        <div className="menu-text">WHAT WILL TOGEPI DO?</div>

        <div className="menu-actions">
          <div className="switch">
            <img src={cleffaIcon} />
          </div>
          <div className="switch">
            <img src={togepiIcon} />
          </div>

          <button className="attack">ATTACK</button>
          <button className="surrender">SURRENDER</button>
        </div>
      </div>
    </div>
  );
}
