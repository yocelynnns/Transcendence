// src/components/Battle/MenuBar.tsx
import PixelButton from "../elements/PixelButton";

interface MenuBarProps {
  currentPokemon: string;
  pokemon1?: { icon: string; isDead: boolean; onClick: () => void };
  pokemon2?: { icon: string; isDead: boolean; onClick: () => void };
  onAttack: () => void;
  onSurrender: () => void; 
  waiting: boolean;
  forceSwitch: boolean;
}

export default function MenuBar({
  currentPokemon,
  pokemon1,
  pokemon2,
  onAttack,
  onSurrender, 
  waiting,
  forceSwitch,
}: MenuBarProps) {
  const menuBar = "/assets/menu_bar/menu_bar.png";

  const Switch = (p: { icon: string; isDead: boolean; onClick: () => void }) => {
    const blocked = p.isDead || waiting;

    return (
      <button
        type="button"
        onClick={!blocked ? p.onClick : undefined}
        className={[
          "relative flex items-center justify-center rounded-xl border-2 border-[#333] bg-[#eaeaea]",
          "h-[clamp(42px,7vh,64px)] w-[clamp(42px,7vh,64px)]",
          blocked
            ? "opacity-60 cursor-not-allowed"
            : "hover:brightness-95 active:scale-[0.99]",
        ].join(" ")}
      >
        <img
          src={p.icon}
          className="h-[85%] w-[85%] [image-rendering:pixelated]"
          draggable={false}
        />
      </button>
    );
  };

  return (
    <div className="absolute bottom-0 left-0 w-full h-[clamp(120px,22vh,180px)] select-none">
      <img
        src={menuBar}
        className="h-full w-full [image-rendering:pixelated] pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center gap-3 px-4 sm:px-8">
        <div className="flex-1 text-[clamp(16px,1.9vw,26px)] text-[#222] pixelify-sans">
          {waiting ? (
            "WAITING FOR OPPONENT..."
          ) : forceSwitch ? (
            <>
              YOUR POKÉMON FAINTED! <span className="text-[#08519C]">SWITCH</span>!
            </>
          ) : (
            <>
              WHAT WILL{" "}
              <span className="text-[#08519C]">{currentPokemon.toUpperCase()}</span>{" "}
              DO?
            </>
          )}
        </div>

        {!waiting && (
          <div className="flex items-center gap-3 pixelify-sans">
            {pokemon1 && <Switch {...pokemon1} />}
            {pokemon2 && <Switch {...pokemon2} />}

            <PixelButton
              height={56}
              width={120}
              onClick={!forceSwitch ? onAttack : undefined}
              cursorPointer={!forceSwitch}
              hoverScale={!forceSwitch ? 1.03 : 1}
              colorA={!forceSwitch ? "#F01E2C" : "#B04B52"}
              colorB={!forceSwitch ? "#B31621" : "#8F3D43"}
              colorText="#FFFFFF"
              textSize="18px"
            >
              ATTACK
            </PixelButton>

            <PixelButton
              height={56}
              width={130}
              onClick={onSurrender}
              cursorPointer={true}
              hoverScale={1.03}
              colorA="#676767"
              colorB="#4F4F4F"
              colorText="#FFFFFF"
              textSize="18px"
            >
              SURRENDER
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
