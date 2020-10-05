
/* game is a shared global between all js code -> this file should be loaded first. */
const game = {
  state: {
    choices: 0,
    currentTaskIndex: 0,
    hasTask: false,
    mapBounds: {
      //x: 800,
      //y: 500
      x: 1500,
      y: 700
    },
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
};

// add debug placeholder objects
game.state.objects = [
  {
    x: 280,
    y: 111,
    isHidden: true,
    assetURL: 'assets/watchtower.png',
    width: 128,
    height: 128
  },
  {
    id: 'red-x',
    x: 200,
    y: 300,
    isHidden: true,
    assetURL: 'assets/house.png',
    width: 70,
    height: 70
  },
  {
    x: 680,
    y: 450,
    isHidden: true,
    assetURL: 'assets/tree-group.png',
    width: 70,
    height: 70
  },
  {
    x: 700,
    y: 430,
    isHidden: true,
    assetURL: 'assets/tree-group.png',
    width: 70,
    height: 70
  },
  {
    x: 400,
    y: 430,
    isHidden: true,
    assetURL: 'assets/tree-group.png',
    width: 50,
    height: 50
  },
  {
    x: 500,
    y: 320,
    isHidden: true,
    assetURL: 'assets/tree-large.png',
    width: 50,
    height: 50
  }
];

// DEBUG: generate gridmarks
// for (let i=0; i<25; i++) {
//   for (let j=0; j<10; j++) {
//     game.state.objects.push({
//       x: i*100,
//       y: j*100
//     });
//   }
// }
