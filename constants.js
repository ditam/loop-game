
/* Game constants */

const WIDTH = 800;
const HEIGHT = 500;

const PLAYER_SPEED = 3;
// draws a new footstep every this many frames - note player speed above
const FOOTSTEP_FREQUENCY = 5;

const MAP_BOUNDS = {
  x: 1500,
  y: 800
};

// The map will scroll if the player is within this distance from the viewport edge
const MAP_SCROLL_PADDING = 100;

const FADE_IN_DURATION = 100;
const FADE_OUT_DURATION = 150;
// objects don't start fading out until hitting this delay
// (effectively extends duration without starting to visibly fade)
const FADE_OUT_DELAY = 20;

// The player is considered to be "at" an object within this radius
const ACTIVITY_RADIUS = 40;

const OBJECT_DEFAULT_SIZE = 10;