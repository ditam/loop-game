
const WIDTH = 800;
const HEIGHT = 500;
const PLAYER_SPEED = 5;

const MAP_BOUNDS = {
  x: 1500,
  y: 800
};

// The map will scroll if the player is within this distance from the viewport edge
const MAP_SCROLL_PADDING = 100;

const VIEWPORT = {
  x: 0,
  y: 0
};

const FADE_IN_DURATION = 100;
const FADE_OUT_DURATION = 150;

let DEBUG_LOG;

// TODO: add param for duration - if missing, do not erase
function writeMessage(msg) {
  const target = $('#text-overlay');
  const textSizer = $('#text-measure-helper');

  const charDelay = 35;
  target.empty();

  // to align the text to the center,
  // we write it to the hidden helper, and measure its width
  textSizer.empty();
  textSizer.text(msg);
  target.css('left', (WIDTH - textSizer.outerWidth())/2 + 'px');

  let i = 0;

  (function _writeChar() {
    if (i < msg.length) {
      target.text(target.text() + msg[i]);
      i++;
      setTimeout(_writeChar, charDelay);
    }
  })();
}

let ctx; // canvas 2d context
let startTime;
let lastDrawTime;

const player = {
  x: 300,
  y: 300
};

const keysPressed = {
  up: false,
  right: false,
  down: false,
  left: false
};

const objects = {
  el01: {
    x: 111,
    y: 111,
    assetURL: 'assets/test01.png'
  },
  el02: {
    x: 200,
    y: 300,
    isHidden: true,
    assetURL: 'assets/test02.png',
    width: 30,
    height: 30
  },
  el03: {
    x: 210,
    y: 470,
    assetURL: 'assets/test03.png',
    width: 20,
    height: 20
  },
}

function createImageRefFromObjAsset(obj) {
  if (obj.assetURL) {
    const image = $('<img>').attr('src', obj.assetURL);
    obj.image = image.get(0);
  } else {
    console.error('Object has no asset URL:', obj);
  }
}

// generate debug gridmarks
for (let i=0; i<25; i++) {
  for (let j=0; j<10; j++) {
    const name = `marker_i${i}_j${j}`;
    objects[name] = {
      x: i*100,
      y: j*100
    };
  }
}

function fadeInObject(obj) {
  if (!obj.isHidden) {
    console.warn('Object is already displayed or fading in:', obj);
  }

  obj.isHidden = false;
  obj.isFadingIn = true;
  obj.fadeCounter = 0;
}

let lastStepWasLeftFooted = false;
function addFootstep(x, y, angle) {
  let name = 'footstep'; // should not matter, just for uniqueness
  while (name in objects) {
    name += 'a';
  }
  objects[name] = {
    x: x,
    y: y,
    angle: angle,
    isFadingOut: true,
    fadeCounter: 0,
    assetURL: 'assets/footprint.png',
    width: 15,
    height: 15,
    offsetX: lastStepWasLeftFooted? 6 : -6
    // TODO: add support for rotation
  };
  createImageRefFromObjAsset(objects[name]);
  lastStepWasLeftFooted = !lastStepWasLeftFooted;
}

let drawCount = 0;
function draw(timestamp) {
  if (!startTime) {
    startTime = timestamp;
    lastDrawTime = timestamp;
  }

  // draw background
  ctx.fillStyle = 'linen';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const playerInViewport = {
    x: player.x-VIEWPORT.x,
    y: player.y-VIEWPORT.y
  };

  let hasMoved = false;
  let movementAngle;

  // move player according to current pressed keys
  // TODO: separate drawing and simulation
  if (keysPressed.up) {
    player.y = Math.max(0, player.y - PLAYER_SPEED);
    playerInViewport.y = player.y - VIEWPORT.y;
    if (playerInViewport.y <= MAP_SCROLL_PADDING) { // TODO: use padding+speed in bounds check?
      VIEWPORT.y = Math.max(0, VIEWPORT.y - PLAYER_SPEED);
      playerInViewport.y = player.y - VIEWPORT.y;
    }
    hasMoved = true;
    movementAngle = 0;
  }
  if (keysPressed.right) {
    player.x = Math.min(MAP_BOUNDS.x, player.x + PLAYER_SPEED);
    playerInViewport.x = player.x - VIEWPORT.x;
    if (playerInViewport.x >= WIDTH - MAP_SCROLL_PADDING) {
      VIEWPORT.x = Math.min(MAP_BOUNDS.x - WIDTH, VIEWPORT.x + PLAYER_SPEED);
      playerInViewport.x = player.x - VIEWPORT.x;
    }
    hasMoved = true;
    movementAngle = 90 * Math.PI / 180;
  }
  if (keysPressed.down) {
    player.y = Math.min(MAP_BOUNDS.y, player.y + PLAYER_SPEED);
    playerInViewport.y = player.y - VIEWPORT.y;
    if (playerInViewport.y >= HEIGHT- MAP_SCROLL_PADDING) {
      VIEWPORT.y = Math.min(MAP_BOUNDS.y - HEIGHT, VIEWPORT.y + PLAYER_SPEED);
      playerInViewport.y = player.y - VIEWPORT.y;
    }
    hasMoved = true;
    movementAngle = 180 * Math.PI / 180;
  }
  if (keysPressed.left) {
    player.x = Math.max(0, player.x - PLAYER_SPEED);
    playerInViewport.x = player.x - VIEWPORT.x;
    if (playerInViewport.x <= MAP_SCROLL_PADDING) {
      VIEWPORT.x = Math.max(0, VIEWPORT.x - PLAYER_SPEED);
      playerInViewport.x = player.x - VIEWPORT.x;
    }
    hasMoved = true;
    movementAngle = 270 * Math.PI / 180;
  }

  // add footstep every once in a while
  if (hasMoved && !(drawCount%5)) {
    addFootstep(player.x, player.y, movementAngle);
  }

  // DEBUG logging
  if (keysPressed.debug) {
    DEBUG_LOG.text(`Player at (x${player.x}-y${player.y})`);
  } else {
    DEBUG_LOG.empty();
  }

  // draw objects
  ctx.fillStyle = 'black';
  for (const [key, obj] of Object.entries(objects)) {
    if (obj.assetURL) {
      ctx.save();

      let w, h;
      if (obj.width && obj.height) {
        w = obj.width;
        h = obj.height;
      } else {
        w = 10;
        h = 10;
      }

      // if the object is fading, apply an alpha to the drawing context
      if (obj.isFadingIn) {
        ctx.globalAlpha = obj.fadeCounter / FADE_IN_DURATION;
        obj.fadeCounter++;
        if (obj.fadeCounter >= FADE_IN_DURATION) {
          obj.isFadingIn = false;
          delete obj.fadeCounter;
        }
      } else if (obj.isFadingOut) {
        // objects don't start fading out until hitting this delay
        const fadeOutDelay = 30;
        obj.fadeCounter++;
        if (obj.fadeCounter > fadeOutDelay) {
          let newAlpha = 1 - (obj.fadeCounter - fadeOutDelay) / FADE_OUT_DURATION;
          // with the delay, we might get out of semantic range - easiest to just clip
          ctx.globalAlpha = Math.max(0, Math.min(1, newAlpha));

          if ((obj.fadeCounter - fadeOutDelay) >= FADE_OUT_DURATION) {
            obj.isFadingOut = false;
            delete obj.fadeCounter;
            // TODO: remove object entirely instead (prob after moving to objects array)
            obj.isHidden = true;
          }
        }
      }

      if (!obj.isHidden) {
        let dX = dY = 0;
        if (obj.offsetX) dX = obj.offsetX;
        if (obj.offsetY) dY = obj.offsetY;
        const computedX = obj.x - w/2 - VIEWPORT.x + dX;
        const computedY = obj.y - h/2 - VIEWPORT.y + dY;
        ctx.translate(computedX, computedY);
        ctx.rotate(obj.angle || 0);
        ctx.drawImage(obj.image, 0, 0, w, h);
      }

      // reset any transformations
      ctx.restore();
    } else {
      // fallback if no asset: draw a rect (used by debug gridpoints for now)
      ctx.fillRect(obj.x-1.5-VIEWPORT.x, obj.y-1.5-VIEWPORT.y, 3, 3);
    }
  }

  // draw player
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(playerInViewport.x, playerInViewport.y, 10, 0, 2 * Math.PI);
  ctx.fill();

  lastDrawTime = timestamp;
  drawCount++;
  requestAnimationFrame(draw);
}

$(document).ready(function() {
  console.log('Hello Loop Game!');

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);

  ctx = canvas.getContext('2d');

  const DEBUG_KEYCODE = 68; // -> press d for debug info
  DEBUG_LOG = $('#debug-log');


  // generate img elements for objects with assets, and add them as the image key
  for (const [key, obj] of Object.entries(objects)) {
    if (obj.assetURL) {
      createImageRefFromObjAsset(obj);
    }
  }

  document.addEventListener('keydown', event => {
    switch(event.keyCode) {
      case 38:
        keysPressed.up = true;
        break;
      case 39:
        keysPressed.right = true;
        break;
      case 40:
        keysPressed.down = true;
        break;
      case 37:
        keysPressed.left = true;
        break;
      case DEBUG_KEYCODE:
        keysPressed.debug = true;
        break;
    }
  });

  document.addEventListener('keyup', event => {
    switch(event.keyCode) {
      case 38:
        keysPressed.up = false;
        break;
      case 39:
        keysPressed.right = false;
        break;
      case 40:
        keysPressed.down = false;
        break;
      case 37:
        keysPressed.left = false;
        break;
      case DEBUG_KEYCODE:
        keysPressed.debug = false;
        break;
    }
  });

  writeMessage('Hello and welcome to the looping themed game!');

  setTimeout(function() {writeMessage('A short message.');}, 4000);
  setTimeout(function() {writeMessage('Yeah.');}, 10000);

  setTimeout(function() {fadeInObject(objects.el02)}, 3000);

  requestAnimationFrame(draw);
});
