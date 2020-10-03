
const WIDTH = 800;
const HEIGHT = 500;
const PLAYER_SPEED = 3;

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

function draw(timestamp) {
  if (!startTime) {
    startTime = timestamp;
    lastDrawTime = timestamp;
  }

  ctx.fillStyle = 'linen';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // TODO: separate drawing and simulation
  if (keysPressed.up) {
    player.y = Math.max(0, player.y - PLAYER_SPEED);
  }
  if (keysPressed.right) {
    player.x = Math.min(WIDTH, player.x + PLAYER_SPEED);
  }
  if (keysPressed.down) {
    player.y = Math.min(HEIGHT, player.y + PLAYER_SPEED);
  }
  if (keysPressed.left) {
    player.x = Math.max(0, player.x - PLAYER_SPEED);
  }

  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
  ctx.fill();

  lastDrawTime = timestamp;
  requestAnimationFrame(draw);
}

$(document).ready(function() {
  console.log('Hello Loop Game!');

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);

  ctx = canvas.getContext('2d');

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
    }
  });

  writeMessage('Hello and welcome to the looping themed game!');

  setTimeout(function() {writeMessage('A short message.');}, 4000);
  setTimeout(function() {writeMessage('Yeah.');}, 10000);

  requestAnimationFrame(draw);
});
