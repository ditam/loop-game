function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

const game = {
  state: {
    hasTask: false,
    currentTaskIndex: 0,
    // objects is a coordinate-ordered list of map elements,
    // so that no z-index needs to be considered when iterating and rendering
    objects: [],
    player: {
      x: 650,
      y: 110
    },
    resetting: false,
    viewport: {
      x: 0,
      y: 0
    }
  },
  meta: {
    resets: 0
  }
  // NB: other files also attach to the game object
};

// add debug placeholder objects
const el01 = {
  x: 111,
  y: 111,
  assetURL: 'assets/test01.png'
};
const el02 = {
  id: 'red-x',
  x: 200,
  y: 300,
  isHidden: true,
  assetURL: 'assets/test02.png',
  width: 30,
  height: 30
};
const el03 = {
  x: 210,
  y: 470,
  assetURL: 'assets/test03.png',
  width: 20,
  height: 20
};
createImageRefFromObjAsset(el01);
createImageRefFromObjAsset(el02);
createImageRefFromObjAsset(el03);
game.state.objects.push(el01);
game.state.objects.push(el02);
game.state.objects.push(el03);

// generate debug gridmarks
for (let i=0; i<25; i++) {
  for (let j=0; j<10; j++) {
    game.state.objects.push({
      x: i*100,
      y: j*100
    });
  }
}

// sort objects by coordinates (so that z-index appearance is correct when drawn in order)
// re-sort every time a new element is added, or make sure it is inserted at the right place!
function sortObjects() {
  game.state.objects.sort(function(a, b) {
    // drawing will iterate this in reverse (so it can remove items), so we put lowest y coord last
    if (a.y < b.y) {
      return 1;
    } else if (a.y === b.y) {
      return (a.x <= b.x)? 1 : -1;
    } else {
      return -1;
    }
  });
}
sortObjects();

// save initial state (will reset to this)
game._initialState = clone(game.state);
console.log('saved initial state:', game._initialState);

function createImageRefFromObjAsset(obj) {
  if (obj.assetURL) {
    const image = $('<img>').attr('src', obj.assetURL);
    obj.image = image.get(0);
  } else {
    console.error('Object has no asset URL:', obj);
  }
}

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

function writeDelayedMessage(msg, delay) {
  // TODO: guard against scheduling on top of existing. Shared timeout vars?
  setTimeout(
    () => writeMessage(msg),
    delay
  );
}

/* rendering and simulation globals */
let ctx; // canvas 2d context
let startTime;
let lastDrawTime;
let canvasCover;

/* user interaction state */
const keysPressed = {
  up: false,
  right: false,
  down: false,
  left: false
};

let lastStepWasLeftFooted = false;
function addFootstep(x, y, angle) {
  // TODO: maybe keep these in separate collection rather than in objects?
  const footstepObj = {
    type: 'footstep',
    x: x,
    y: y,
    angle: angle,
    isFadingOut: true,
    fadeCounter: 0,
    assetURL: 'assets/footprint.png',
    width: 15,
    height: 15,
  };

  // instead of writing the general math, slanted angles are the combination of the
  // straight components with half lengths
  switch (angle) {
    case 0:
      footstepObj.offsetX = lastStepWasLeftFooted? 6 : -6;
      break;
    case (45 * Math.PI / 180):
      footstepObj.offsetX = lastStepWasLeftFooted? 3 : -3;
      footstepObj.offsetY = lastStepWasLeftFooted? 3 : -3;
      break;
    case (90 * Math.PI / 180):
      footstepObj.offsetY = lastStepWasLeftFooted? 6 : -6;
      break;
    case (135 * Math.PI / 180):
      footstepObj.offsetY = lastStepWasLeftFooted? 3 : -3;
      footstepObj.offsetX = lastStepWasLeftFooted? 3 : 9;
      break;
    case (180 * Math.PI / 180):
      footstepObj.offsetX = lastStepWasLeftFooted? 6 : 18;
      break;
    case (225 * Math.PI / 180):
      footstepObj.offsetX = lastStepWasLeftFooted? 3 : 9;
      footstepObj.offsetY = lastStepWasLeftFooted? 3 : 9;
      break;
    case (270 * Math.PI / 180):
      footstepObj.offsetY = lastStepWasLeftFooted? 6 : 18;
      break;
    case (315 * Math.PI / 180):
      footstepObj.offsetY = lastStepWasLeftFooted? 3 : 9;
      footstepObj.offsetX = lastStepWasLeftFooted? 3 : -3;
      break;
  }

  createImageRefFromObjAsset(footstepObj);
  game.state.objects.push(footstepObj);

  lastStepWasLeftFooted = !lastStepWasLeftFooted;
}

function checkCoordsForCurrentTask(coords) {
  const currentTask = game.tasks[game.state.currentTaskIndex];
  return currentTask.checker(coords);
}

function startTask() {
  game.state.hasTask = true;
  const currentTask = game.tasks[game.state.currentTaskIndex];
  currentTask.setData(game.state.player);
}

function resetInitialState() {
  game.meta.resets++;
  game.state = clone(game._initialState);
  // clone does not carry the HTMLImageElements, so we re-add them
  // TODO: there should be a more efficient way of doing this - update clone?
  game.state.objects.forEach(function(obj) {
    if (obj.assetURL) {
      createImageRefFromObjAsset(obj);
    }
  });
}

function resetGame() {
  // show reset-loop message
  game.state.resetting = true;
  canvasCover.fadeTo(1000, 1, () => $('.text-overlay').empty().addClass('resetting'));
  writeDelayedMessage('You\'re not listening...', 2000);
  let restartDelay = 10*1000;
  if (game.meta.resets <= 1) {
    writeDelayedMessage('I\'m telling you a story.', 6000);
  } else {
    restartDelay = 6000;
  }

  // schedule actual reset
  setTimeout(
    function() {
      // it needs to be empty, but keeping the resetting class while fading, so no padding appears
      $('.text-overlay').empty();
      canvasCover.fadeTo(1000, 0, function() {
        // after the fade is complete, remove the class which switches back to the original style
        $('.text-overlay').removeClass('resetting')
        startDay(); // -> this can now safely display new msgs
      });
      game.state.resetting = false;
      resetInitialState();
    },
    restartDelay
  );
}

let drawCount = 0;
function draw(timestamp) {
  // during resets drawing is paused
  if (game.state.resetting) {
    drawCount = 0;
    requestAnimationFrame(draw);
    return;
  };

  if (!startTime) {
    startTime = timestamp;
    lastDrawTime = timestamp;
  }

  // draw background
  ctx.fillStyle = 'linen';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // shorthands
  const player = game.state.player;
  const viewport = game.state.viewport;

  const playerInViewport = {
    x: player.x-viewport.x,
    y: player.y-viewport.y
  };

  let hasMoved = false;
  const movementAngles = [];

  // move player according to current pressed keys
  // TODO: separate drawing and simulation
  if (keysPressed.up) {
    player.y = Math.max(0, player.y - PLAYER_SPEED);
    playerInViewport.y = player.y - viewport.y;
    if (playerInViewport.y <= MAP_SCROLL_PADDING) { // TODO: use padding+speed in bounds check?
      viewport.y = Math.max(0, viewport.y - PLAYER_SPEED);
      playerInViewport.y = player.y - viewport.y;
    }
    hasMoved = true;
    movementAngles.push(0);
  }
  if (keysPressed.right) {
    player.x = Math.min(MAP_BOUNDS.x, player.x + PLAYER_SPEED);
    playerInViewport.x = player.x - viewport.x;
    if (playerInViewport.x >= WIDTH - MAP_SCROLL_PADDING) {
      viewport.x = Math.min(MAP_BOUNDS.x - WIDTH, viewport.x + PLAYER_SPEED);
      playerInViewport.x = player.x - viewport.x;
    }
    hasMoved = true;
    movementAngles.push(90 * Math.PI / 180);
  }
  if (keysPressed.down) {
    player.y = Math.min(MAP_BOUNDS.y, player.y + PLAYER_SPEED);
    playerInViewport.y = player.y - viewport.y;
    if (playerInViewport.y >= HEIGHT- MAP_SCROLL_PADDING) {
      viewport.y = Math.min(MAP_BOUNDS.y - HEIGHT, viewport.y + PLAYER_SPEED);
      playerInViewport.y = player.y - viewport.y;
    }
    hasMoved = true;
    movementAngles.push(180 * Math.PI / 180);
  }
  if (keysPressed.left) {
    player.x = Math.max(0, player.x - PLAYER_SPEED);
    playerInViewport.x = player.x - viewport.x;
    if (playerInViewport.x <= MAP_SCROLL_PADDING) {
      viewport.x = Math.max(0, viewport.x - PLAYER_SPEED);
      playerInViewport.x = player.x - viewport.x;
    }
    hasMoved = true;
    movementAngles.push(270 * Math.PI / 180);
  }

  // add footstep every once in a while
  if (hasMoved && !(drawCount%FOOTSTEP_FREQUENCY)) {
    let angle = game.utils.avg(movementAngles);

    // Bugfix: if we are going up & left, rewrite angle manually to 315deg
    // (This is an inherent problem with the avg method, if we pushed 360 instead of 0, up-right would need fixing.)
    if (keysPressed.left && keysPressed.up) angle = 315 * Math.PI / 180;

    addFootstep(player.x, player.y, angle);
  }

  // check if movement satisfies current task
  if (game.state.hasTask) {
    const taskState = checkCoordsForCurrentTask({x: player.x, y: player.y});
    if (taskState.failed) {
      resetGame();
    } else if (taskState.completed) {
      console.log('task completed!');
      game.state.hasTask = false;
      writeDelayedMessage('And he just stood there for a while.', 300);
    }
  }

  // DEBUG logging
  if (keysPressed.debug) {
    DEBUG_LOG.text(`Player at (x${player.x}-y${player.y})`);
  } else {
    DEBUG_LOG.empty();
  }

  // draw objects
  ctx.fillStyle = 'black';
  // we iterate backwards to be able to remove faded items without complications
  for (let i = game.state.objects.length -1; i >= 0; i--) {
    const obj = game.state.objects[i];
    if (obj.assetURL) {
      ctx.save();

      let w, h;
      if (obj.width && obj.height) {
        w = obj.width;
        h = obj.height;
      } else {
        w = OBJECT_DEFAULT_SIZE;
        h = OBJECT_DEFAULT_SIZE;
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
        obj.fadeCounter++;
        if (obj.fadeCounter > FADE_OUT_DELAY) {
          let newAlpha = 1 - (obj.fadeCounter - FADE_OUT_DELAY) / FADE_OUT_DURATION;
          // with the delay, we might get out of semantic range - easiest to just clip
          ctx.globalAlpha = Math.max(0, Math.min(1, newAlpha));

          if ((obj.fadeCounter - FADE_OUT_DELAY) >= FADE_OUT_DURATION) {
            // we delete the faded out object entirely
            game.state.objects.splice(i, 1);
          }
        }
      }

      if (!obj.isHidden) {
        let dX = dY = 0;
        if (obj.offsetX) dX = obj.offsetX;
        if (obj.offsetY) dY = obj.offsetY;
        const computedX = obj.x - w/2 - viewport.x + dX;
        const computedY = obj.y - h/2 - viewport.y + dY;
        ctx.translate(computedX, computedY);
        ctx.rotate(obj.angle || 0);
        ctx.drawImage(obj.image, 0, 0, w, h);
      }

      // reset any transformations
      ctx.restore();
    } else {
      // fallback if no asset: draw a rect (used by debug gridpoints for now)
      ctx.fillRect(obj.x-1.5-viewport.x, obj.y-1.5-viewport.y, 3, 3);
    }
  };

  // draw player
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(playerInViewport.x, playerInViewport.y, 10, 0, 2 * Math.PI);
  ctx.fill();

  lastDrawTime = timestamp;
  drawCount++;
  requestAnimationFrame(draw);
}

function startDay() {
  writeDelayedMessage('It was a day just like any other.', 1000);

  setTimeout(
    function() {
      writeMessage('He went straight to the X.');
      // TODO: only start task after msg is fully shown
      startTask();
    },
    5000
  );

  // TODO: remove, demo only
  const redX = game.utils.findObjectByID('red-x', game.state.objects);
  setTimeout(function() {game.utils.fadeInObject(redX)}, 3000);
}

$(document).ready(function() {
  console.log('Hello Loop Game!');

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);
  ctx = canvas.getContext('2d');

  // TODO: set initial sizes from CSS to prevent jumping
  canvasCover = $('#canvas-cover');
  canvasCover.css('height', HEIGHT);
  canvasCover.css('width', WIDTH);
  $('#text-overlay').css('opacity', 0);
  canvasCover.fadeTo(600, 0, () => $('#text-overlay').fadeTo(300, 1));

  const DEBUG_KEYCODE = 68; // -> press and hold d for debug info
  DEBUG_LOG = $('#debug-log');

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

  startDay();

  requestAnimationFrame(draw);
});
