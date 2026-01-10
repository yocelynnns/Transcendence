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
          top: "83.33%",
          width: "100%",
          height: "16.67%",
          // backgroundImage: `url(${menuBar})`,
        }}
      >
        <img
          src={menuBar}
          alt="menu Bar"
          style={{
            position: "absolute",
            left: "0%",
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}
