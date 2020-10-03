
const WIDTH = 800;
const HEIGHT = 500;

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
  target.css('left', (WIDTH - textSizer.width())/2 + 'px');

  let i = 0;

  (function _writeChar() {
    if (i < msg.length) {
      target.text(target.text() + msg[i]);
      i++;
      setTimeout(_writeChar, charDelay);
    }
  })();
}

$(document).ready(function() {
  console.log('Hello Loop Game!');

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'linen';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = 'green';
  ctx.lineWidth = 5;

  ctx.moveTo(225, 300);
  ctx.lineTo(325, 450);
  ctx.lineTo(625,  50);
  ctx.stroke();

  writeMessage('Hello and welcome to the looping themed game!');

  setTimeout(function() {writeMessage('A short message.');}, 4000);
  setTimeout(function() {writeMessage('Yeah.');}, 10000);
});
