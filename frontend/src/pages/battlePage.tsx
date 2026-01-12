import React from "react";
import cleffa from "../assets/pokemon/water/slowpoke/front_slowpoke.gif";
import togepi from "../assets/pokemon/water/slowpoke/back_slowpoke.gif";
import background from "../assets/bg/background.png";

import oppPlatform from "../assets/bg/pink_platform_opp.png";
import playerPlatform from "../assets/bg/pink_platform_player.png";

import oppHpBlock from "../assets/health_bar/health_block_opp.png";
import playerHpBlock from "../assets/health_bar/health_block_player.png";
import pokeballAlive from "../assets/health_bar/pokeball_alive.png";
import pokeballDead from "../assets/health_bar/pokeball_dead.png";

import greenHp from "../assets/health_bar/green_hp.png"
import yellowHp from "../assets/health_bar/yellow_hp.png"
import redHp from "../assets/health_bar/red_hp.png"

import menuBar from "../assets/menu_bar/menu_bar.png"
import cleffaIcon from "../assets/pokemon/water/slowpoke/slowpoke_icon.png"
import togepiIcon from "../assets/pokemon/water/slowpoke/shiny_slowpoke_icon.png"

export default function Battle() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${background})`,
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
            top: "0%",
            width: "30%",
            imageRendering: "pixelated",
          }}
        />
        {/* enemy details */}
        <div
        style={{
            position: "absolute",
            left: "-10%",
            top: "-5%",
            width: "55%",
            // height: "47.95%",
            imageRendering: "pixelated",
        }}
            >
            <img
            src={oppHpBlock}
            alt="Enemy Hp Block"
            style={{
                width: "100%",
                // display: "block",
                imageRendering: "pixelated",
            }}
            />
            <div
                style={{
                position: "absolute",
                top: "57%",
                left: "39%",
                width: "46.5%",
                height: "9.5%",
                // background: "#666666",
            }}
            >
                <img
                src={greenHp}
                alt="Enemy Hp Bar"
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%"
                }}
            />
            </div>
            <div
                style={{
                position: "absolute",
                top: "18%",
                left: "8%",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#222",
                pointerEvents: "none",
            }}
            >
                SLOWPOKE
            </div>
            <div
                style={{
                position: "absolute",
                top: "42%",
                left: "8%",
                height: "10%",
            }}
            >
                <img src={pokeballAlive} alt="ball 1" style={styles.pokeball} />
                <img src={pokeballAlive} alt="ball 2" style={styles.pokeball} />
                <img src={pokeballDead} alt="ball 3" style={styles.pokeball} />
            </div>
            <div
                style={{
                position: "absolute",
                top: "25%",
                right: "16%",
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#666666",
                pointerEvents: "none",
                textAlign: "right",
                }}
            >
                ATK 6
            </div>
        </div>
      </div>

      {/* player container */}
      <div
        style={{
          position: "absolute",
          top: "47%",
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
            bottom: "-5%",
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
        {/* player details */}
        {/* <img
          src={playerHpBlock}
          alt="Player Hp Block"
          style={{
            position: "absolute",
            top: "12%",
            left: "65%",
            width: "45.83%",
            imageRendering: "pixelated",
          }}
        /> */}

        <div
        style={{
            position: "absolute",
            left: "65%",
            top: "12%",
            width: "45.83%",
            // height: "47.95%",
            imageRendering: "pixelated",
        }}
            >
            <img
            src={playerHpBlock}
            alt="Player Hp Block"
            style={{
                width: "100%",
                // display: "block",
                imageRendering: "pixelated",
            }}
            />
            <div
                style={{
                position: "absolute",
                top: "57%",
                left: "47%",
                width: "46.5%",
                height: "9.5%",
                // background: "#666666",
            }}
            >
                <img
                src={yellowHp}
                alt="Enemy Hp Bar"
                style={{
                    position: "absolute",
                    width: "60%",
                    height: "100%"
                }}
            />
            </div>
            <div
                style={{
                position: "absolute",
                top: "18%",
                left: "15%",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#222",
                pointerEvents: "none",
            }}
            >
                SLOWPOKE
            </div>
            <div
                style={{
                position: "absolute",
                top: "42%",
                left: "15%",
                height: "10%",
            }}
            >
                <img src={pokeballAlive} alt="ball 1" style={styles.pokeball} />
                <img src={pokeballAlive} alt="ball 2" style={styles.pokeball} />
                <img src={pokeballAlive} alt="ball 3" style={styles.pokeball} />
            </div>
            <div
                style={{
                position: "absolute",
                top: "25%",
                right: "8%",
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#666666",
                pointerEvents: "none",
                textAlign: "right",
                }}
            >
                ATK 6
            </div>
        </div>
      </div>
      
      {/* menu bar container */}
        <div
        style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "20%",
            backgroundColor: "#333333"
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
                WHAT WILL SLOWPOKE DO?
            </p>
            </div>

            {/* RIGHT: buttons */}
            <div style={styles.buttonGroup}>
            <div style={styles.switchBox}>
                <img src={cleffaIcon} alt="Cleffa" style={styles.switchImg} />
            </div>

            <div style={styles.switchBox}>
                <img src={togepiIcon} alt="Togepi" style={styles.switchImg} />
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
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
    color: "#222",
    alignItems: 'center',    // vertical centering
  },

  buttonGroup: {
    width: "53.125%",
    height: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "3.125%",
    paddingRight: "3.125%", 
  },

  switchBox: {
    // width: "11.76%",
    aspectRatio: "1 / 1",
    height: "50%",
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
    height: "50%",
    // height: "56px",
    // aspectRatio: "4 / 2",
    borderRadius: "12px",
    backgroundColor: "#f01e2c",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },

  surrenderBtn: {
    width: "30%",
    // aspectRatio: "4 / 2",
    height: "50%",
    borderRadius: "12px",
    backgroundColor: "#676767",
    fontWeight: "bold",
    // border: "2px solid #333",
    color: "white",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pokeball: {
    width: "4.5%",      // or % if you want responsive
    paddingRight: "1%",
    imageRendering: "pixelated",
    },

};
