import frontCleffa from "../assets/sprites/pokemon/normal/cleffa/front_cleffa.gif";
import backCleffa from "../assets/sprites/pokemon/normal/togepi/back_togepi.gif";

export default function Battle() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0b1e5f", // navy blue night sky
        overflow: "hidden",
      }}
    >
      {/* Enemy Pokémon */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "20%",
          textAlign: "center",
        }}
      >
        <img
          src={frontCleffa}
          alt="Front Cleffa"
          style={{ width: "300px", display: "block" }}
        />
      </div>

      {/* Your Pokémon */}
      <div
        style={{
          position: "absolute",
          bottom: "150px", // leave space for menu bar
          left: "20%",
          textAlign: "center",
        }}
      >
        <img
          src={backCleffa}
          alt="Back Cleffa"
          style={{ width: "400px", display: "block" }}
        />
      </div>

      {/* Menu bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "150px",
          backgroundColor: "#999",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 2rem",
          boxSizing: "border-box",
        }}
      >
        <button>poke1</button>
        <button>poke2</button>
        <button>attack</button>
        <button>surrender</button>
      </div>
    </div>
  );
}
