// PLAYER
import player from './player/player.png';

// AVATAR
import cleffa from './avatar/cleffa.png';

// GUILD
import logo from './guild/logo.png';

// MAP
import map from './map/map.png';
import mapForeground from './map/map_foreground.png';
import mapJson from './map/map.json';

// POKEMON — FIRE
import charmanderFront from './pokemon/fire/charmander/front_charmander.gif';
import charmanderBack from './pokemon/fire/charmander/back_charmander.gif';
import charmander from './pokemon/fire/charmander/charmander.png';
import shinyCharmander from './pokemon/fire/charmander/shiny_front_charmander.gif';

import ponytaFront from './pokemon/fire/ponyta/front_ponyta.gif';
import ponytaBack from './pokemon/fire/ponyta/back_ponyta.gif';
import ponyta from './pokemon/fire/ponyta/ponyta.png';
import shinyPonyta from './pokemon/fire/ponyta/shiny_front_ponyta.gif';

import vulpixFront from './pokemon/fire/vulpix/front_vulpix.gif';
import vulpixBack from './pokemon/fire/vulpix/back_vulpix.gif';
import vulpix from './pokemon/fire/vulpix/vulpix.png';
import shinyVulpix from './pokemon/fire/vulpix/shiny_front_vulpix.gif';

// POKEMON — GRASS
import bulbasaurFront from './pokemon/grass/bulbasaur/front_bulbasaur.gif';
import bulbasaurBack from './pokemon/grass/bulbasaur/back_bulbasaur.gif';
import bulbasaur from './pokemon/grass/bulbasaur/bulbasaur.png';
import shinyBulbasaur from './pokemon/grass/bulbasaur/shiny_front_bulbasaur.gif';

import bellsproutFront from './pokemon/grass/bellsprout/front_bellsprout.gif';
import bellsproutBack from './pokemon/grass/bellsprout/back_bellsprout.gif';
import bellsprout from './pokemon/grass/bellsprout/bellsprout.png';
import shinyBellsprout from './pokemon/grass/bellsprout/shiny_front_bellsprout.gif';

import oddishFront from './pokemon/grass/oddish/front_oddish.gif';
import oddishBack from './pokemon/grass/oddish/back_oddish.gif';
import oddish from './pokemon/grass/oddish/oddish.png';
import shinyOddish from './pokemon/grass/oddish/shiny_front_oddish.gif';

// POKEMON — NORMAL
import cleffaFront from './pokemon/normal/cleffa/front_cleffa.gif';
import cleffaBack from './pokemon/normal/cleffa/back_cleffa.gif';
import shinyCleffa from './pokemon/normal/cleffa/shiny_front_cleffa.gif';

import pikachuFront from './pokemon/normal/pikachu/front_pikachu.gif';
import pikachuBack from './pokemon/normal/pikachu/back_pikachu.gif';
import pikachu from './pokemon/normal/pikachu/pikachu.png';
import shinyPikachu from './pokemon/normal/pikachu/shiny_front_pikachu.gif';

import togepiFront from './pokemon/normal/togepi/front_togepi.gif';
import togepiBack from './pokemon/normal/togepi/back_togepi.gif';
import togepi from './pokemon/normal/togepi/togepi.png';
import shinyTogepi from './pokemon/normal/togepi/shiny_front_togepi.gif';

// POKEMON — WATER
import psyduckFront from './pokemon/water/psyduck/front_psyduck.gif';
import psyduckBack from './pokemon/water/psyduck/back_psyduck.gif';
import psyduck from './pokemon/water/psyduck/psyduck.png';
import shinyPsyduck from './pokemon/water/psyduck/shiny_front_psyduck.gif';

import slowpokeFront from './pokemon/water/slowpoke/front_slowpoke.gif';
import slowpokeBack from './pokemon/water/slowpoke/back_slowpoke.gif';
import slowpoke from './pokemon/water/slowpoke/slowpoke.png';
import shinySlowpoke from './pokemon/water/slowpoke/shiny_front_slowpoke.gif';

import squirtleFront from './pokemon/water/squirtle/front_squirtle.gif';
import squirtleBack from './pokemon/water/squirtle/back_squirtle.gif';
import squirtle from './pokemon/water/squirtle/squirtle.png';
import shinySquirtle from './pokemon/water/squirtle/shiny_front_squirtle.gif';

// HEALTH battle
import greenHp from "./battle/green_hp.png";
import yellowHp from "./battle/yellow_hp.png";
import redHp from "./battle/red_hp.png";

import healthBlockPlayer from "./battle/health_block_player.png";
import healthBlockEnemy from "./battle/health_block_enemy.png";

import pokeballAlive from "./battle/pokeball_alive.png";
import pokeballDead from "./battle/pokeball_dead.png";

import sword from "./battle/sword.png";
import spec from "./battle/spec.png";
import history from "./battle/history.png";
import ai from "./battle/ai.png";
import event from "./battle/event.png";

// ELEMENTS
import profilebanner from "./elements/profilebanner.png"
import catchDialog from "./elements/catchDialog.png"

// BUTTON
import leftA from "./elements/button/leftA.png"
import leftB from "./elements/button/leftB.png"
import midA from "./elements/button/midA.png"
import midB from "./elements/button/midB.png"
import rightA from "./elements/button/rightA.png"
import rightB from "./elements/button/rightB.png"

// ICONS
import friendlisticon from "./elements/icons/friendlist.png"
import guildicon from "./elements/icons/guild.png"
import eventicon from "./elements/icons/event.png"
import xicon from "./elements/icons/x.png"
import backicon from "./elements/icons/back.png"
import sendicon from "./elements/icons/send.png"
import sendblueicon from "./elements/icons/sendblue.png"
import bluexicon from "./elements/icons/bluex.png"

import spectateicon from "./elements/icons/spectate.png"
import chaticon from "./elements/icons/chat.png"
import blockicon from "./elements/icons/block.png"
import unblockicon from "./elements/icons/unblock.png"
import battleicon from "./elements/icons/battle.png"
import friendlistblue from "./elements/icons/friendlistblue.png"
import tickicon from "./elements/icons/tick.png"

// EXPORT CENTRAL ASSETS
export const ASSETS = {
  PLAYER: { DEFAULT: player },
  AVATAR: { CLEFFA: cleffa },
  GUILD: { LOGO: logo },
  MAP: { DEFAULT: map, FOREGROUND: mapForeground, JSON: mapJson },
  HEALTH: {
    HP: {
      GREEN: greenHp,
      YELLOW: yellowHp,
      RED: redHp,
    },
    BLOCK: {
      PLAYER: healthBlockPlayer,
      ENEMY: healthBlockEnemy,
    },
    POKEBALL: {
      ALIVE: pokeballAlive,
      DEAD: pokeballDead,
    },
    SWORD: {
      CROSS: sword,
    },
    SPEC: {
      SPEC: spec,
    },
    HISTORY:{
      HISTORY: history,
    },
    AI:{
      AI: ai,
    },
    EVENT:{
      EVENT:event,
    },
  },
  POKEMON: {
    CHARMANDER: { FRONT: charmanderFront, BACK: charmanderBack, DEFAULT: charmander, SHINY: shinyCharmander },
    PONYTA: { FRONT: ponytaFront, BACK: ponytaBack, DEFAULT: ponyta, SHINY: shinyPonyta },
    VULPIX: { FRONT: vulpixFront, BACK: vulpixBack, DEFAULT: vulpix, SHINY: shinyVulpix },
    BULBASAUR: { FRONT: bulbasaurFront, BACK: bulbasaurBack, DEFAULT: bulbasaur, SHINY: shinyBulbasaur },
    BELLSPROUT: { FRONT: bellsproutFront, BACK: bellsproutBack, DEFAULT: bellsprout, SHINY: shinyBellsprout },
    ODDISH: { FRONT: oddishFront, BACK: oddishBack, DEFAULT: oddish, SHINY: shinyOddish },
    CLEFFA: { FRONT: cleffaFront, BACK: cleffaBack, DEFAULT: cleffa, SHINY: shinyCleffa },
    PIKACHU: { FRONT: pikachuFront, BACK: pikachuBack, DEFAULT: pikachu, SHINY: shinyPikachu },
    TOGEPI: { FRONT: togepiFront, BACK: togepiBack, DEFAULT: togepi, SHINY: shinyTogepi },
    PSYDUCK: { FRONT: psyduckFront, BACK: psyduckBack, DEFAULT: psyduck, SHINY: shinyPsyduck },
    SLOWPOKE: { FRONT: slowpokeFront, BACK: slowpokeBack, DEFAULT: slowpoke, SHINY: shinySlowpoke },
    SQUIRTLE: { FRONT: squirtleFront, BACK: squirtleBack, DEFAULT: squirtle, SHINY: shinySquirtle }
  },

  ELEMENTS: {
    BUTTON: { LEFT: {A: leftA, B: leftB},
              MID: {A: midA, B: midB},
              RIGHT: {A: rightA, B: rightB}},
    PROFILEBANNER: profilebanner,
    CATCHDIALOG: catchDialog,
  },

  ICONS: {
    FRIENDLIST: friendlisticon,
    GUILD: guildicon,
    EVENT: eventicon,
    X: xicon,
    BLUEX: bluexicon,
    BACK: backicon,
    SEND: sendicon,
    BATTLE: battleicon,
  },

  FRIENDICON: {
    X: bluexicon,
    SPECTATE: spectateicon,
    CHAT: chaticon,
    BLOCK : blockicon,
    UNBLOCK: unblockicon,
    BATTLE: battleicon,
    FRIENDLIST: friendlistblue,
    TICK: tickicon,
    SEND: sendblueicon,
  }
};
