import React from "react";
import cleffa from "../assets/pokemon/normal/cleffa/cleffa.gif";
import togepi from "../assets/pokemon/normal/togepi/togepi.gif";
import nightCaveBg from "../assets/bg/night_cave.png";

import oppPlatform from "../assets/bg/pink_platform_opp.png";
import playerPlatform from "../assets/bg/pink_platform_player.png";

import oppHpBar from "../assets/health_bar/health_bar_opp.png";
import playerHpBar from "../assets/health_bar/health_bar_player.png";

import menuBar from "../assets/menu_bar/menu_bar.png"

export default function Battle() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${nightCaveBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* enemy container */}
      <div
        style={{
          position: "absolute",
          left: "31.25%",
          top: "16.67%",
          width: "62.5%",
          height: "38.89%",
          // backgroundColor: "#999",
        }}
      >
        {/* enemy platform */}
        <img
          src={oppPlatform}
          alt="Enemy platform"
          style={{
            position: "absolute",
            left: "40%",
            top: "45%",
            width: "60%",
            imageRendering: "pixelated",
          }}
        />
        {/* enemy pokemon */}
        <img
          src={cleffa}
          alt="Enemy Pokemon"
          style={{
            position: "absolute",
            left: "55%",
            top: "5%",
            width: "30%",
            imageRendering: "pixelated",
          }}
        />
        {/* enemy hp bar */}
        <img
          src={oppHpBar}
          alt="Enemy Hp Bar"
          style={{
            position: "absolute",
            left: "-10%",
            top: "-5%",
            width: "55%",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* player container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          width: "75%",
          height: "33%",
          // backgroundColor: "#999",
        }}
      >
        {/* player platform */}
        <img
          src={playerPlatform}
          alt="Player platform"
          style={{
            position: "absolute",
            bottom: 0,
            width: "83.33%",
            imageRendering: "pixelated",
          }}
        />
        {/* player pokemon */}
        <img
          src={togepi}
          alt="Player Pokemon"
          style={{
            position: "absolute",
            left: "16.67%",
            top: "-30%",
            width: "45%",
            imageRendering: "pixelated",
          }}
        />
        {/* player hp bar */}
        <img
          src={playerHpBar}
          alt="Player Hp Bar"
          style={{
            position: "absolute",
            top: "10%",
            left: "65%",
            width: "45.83%",
            imageRendering: "pixelated",
          }}
        />
      </div>
      
      {/* menu bar container */}
        <div
        style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "16.67%",
        }}
        >
        {/* menu bar image */}
        <img
            src={menuBar}
            alt="menu Bar"
            style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
            }}
        />

        {/* overlay content */}
        <div
            style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 3%",
            gap: "2%",
            }}
        >
            {/* LEFT: text box */}
            <div style={styles.textBox}>
            <p style={styles.text}>
                What will Togepi do?
            </p>
            </div>

            {/* RIGHT: buttons */}
            <div style={styles.buttonGroup}>
            <div style={styles.switchBox}>
                <img src={cleffa} alt="Cleffa" style={styles.switchImg} />
            </div>

            <div style={styles.switchBox}>
                <img src={togepi} alt="Togepi" style={styles.switchImg} />
            </div>

            <div style={styles.attackBtn}>ATTACK</div>

            <div style={styles.surrenderBtn}>SURRENDER</div>
            </div>
        </div>
        </div>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  textBox: {
    height: "70%",
    width: "46.875%",
    // backgroundColor: "#ffffffcc",
    border: "none",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
  },

  text: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0,
    color: "#222",
  },

  buttonGroup: {
    width: "53.125%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "3.125%",
  },

  switchBox: {
    width: "11.76%",
    borderRadius: "12px",
    backgroundColor: "#eaeaea",
    border: "2px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  switchImg: {
    width: "90%",
    height: "90%",
    imageRendering: "pixelated",
  },

  attackBtn: {
    width: "23.53%",
    // height: "56px",
    aspectRatio: "4 / 1",
    borderRadius: "12px",
    backgroundColor: "#c0392b",
    border: "2px solid #333",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  surrenderBtn: {
    width: "23.53%",
    aspectRatio: "4 / 1",
    // height: "56px",
    borderRadius: "12px",
    backgroundColor: "#555",
    border: "2px solid #333",
    color: "white",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
