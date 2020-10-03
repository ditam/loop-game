
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
    x: 220,
    y: 310,
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

  // move player according to current pressed keys
  // TODO: separate drawing and simulation
  if (keysPressed.up) {
    player.y = Math.max(0, player.y - PLAYER_SPEED);
    playerInViewport.y = player.y - VIEWPORT.y;
    if (playerInViewport.y <= MAP_SCROLL_PADDING) { // TODO: use padding+speed in bounds check?
      VIEWPORT.y = Math.max(0, VIEWPORT.y - PLAYER_SPEED);
      playerInViewport.y = player.y - VIEWPORT.y;
    }
  }
  if (keysPressed.right) {
    player.x = Math.min(MAP_BOUNDS.x, player.x + PLAYER_SPEED);
    playerInViewport.x = player.x - VIEWPORT.x;
    if (playerInViewport.x >= WIDTH - MAP_SCROLL_PADDING) {
      VIEWPORT.x = Math.min(MAP_BOUNDS.x - WIDTH, VIEWPORT.x + PLAYER_SPEED);
      playerInViewport.x = player.x - VIEWPORT.x;
    }
  }
  if (keysPressed.down) {
    player.y = Math.min(MAP_BOUNDS.y, player.y + PLAYER_SPEED);
    playerInViewport.y = player.y - VIEWPORT.y;
    if (playerInViewport.y >= HEIGHT- MAP_SCROLL_PADDING) {
      VIEWPORT.y = Math.min(MAP_BOUNDS.y - HEIGHT, VIEWPORT.y + PLAYER_SPEED);
      playerInViewport.y = player.y - VIEWPORT.y;
    }
  }
  if (keysPressed.left) {
    player.x = Math.max(0, player.x - PLAYER_SPEED);
    playerInViewport.x = player.x - VIEWPORT.x;
    if (playerInViewport.x <= MAP_SCROLL_PADDING) {
      VIEWPORT.x = Math.max(0, VIEWPORT.x - PLAYER_SPEED);
      playerInViewport.x = player.x - VIEWPORT.x;
    }
  }

  // DEBUG logging
  if (keysPressed.debug) {
    DEBUG_LOG.text(`Player at (x${player.x}-y${player.y})`);
  } else {
    DEBUG_LOG.empty();
  }

  // draw player
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(playerInViewport.x, playerInViewport.y, 10, 0, 2 * Math.PI);
  ctx.fill();

  // draw objects
  ctx.fillStyle = 'black';
  for (const [key, obj] of Object.entries(objects)) {
    if (obj.assetURL) {
      let w, h;
      if (obj.width && obj.height) {
        w = obj.width;
        h = obj.height;
      } else {
        w = 10;
        h = 10;
      }
      ctx.drawImage(obj.image, obj.x-5-VIEWPORT.x, obj.y-5-VIEWPORT.y, w, h);
    } else {
      // fallback if no asset: draw a rect (used by debug gridpoints for now)
      ctx.fillRect(obj.x-1.5-VIEWPORT.x, obj.y-1.5-VIEWPORT.y, 3, 3);
    }
  }

  lastDrawTime = timestamp;
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
      const image = $('<img>').attr('src', obj.assetURL);
      obj.image = image.get(0);
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

  requestAnimationFrame(draw);
});
