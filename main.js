$(document).ready(function() {
  console.log('Hello Loop Game!');

  const WIDTH = 800;
  const HEIGHT = 500;

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);

  const ctx = canvas.getContext('2d');

  ctx.strokeStyle = 'green';
  ctx.lineWidth = 5;

  ctx.moveTo(225, 300);
  ctx.lineTo(325, 450);
  ctx.lineTo(625,  50);
  ctx.stroke();
});
