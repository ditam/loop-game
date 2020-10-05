
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

  const mobileControlsButton = $('#mobile-controls-button');
  const mobileControls = $('#mobile-controls');
  mobileControlsButton.click(function() {
    mobileControls.toggle();
  });

  ['up', 'right', 'down', 'left'].forEach(function(dir) {
    $(`#mobile-${dir}`).on('mousedown touchstart', () => keysPressed[dir] = true);
    $(`#mobile-${dir}`).on('mouseup touchend', () => keysPressed[dir] = false);
  });

  // TODO: remove global dependencies, interact via game object
  startDay();

  requestAnimationFrame(draw);
});