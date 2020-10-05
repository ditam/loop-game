
/* game is a shared global between all js code -> this file should be loaded first. */
const game = {
  state: {
    choices: 0,
    currentTaskIndex: 0,
    hasTask: false,
    lastDrawTime: 0,
    mapBounds: {
      x: 800,
      y: 500
    },
    // objects is a coordinate-ordered list of map elements,
    // so that no z-index needs to be considered when iterating and rendering
    objects: [],
    player: {
      x: 420,
      y: 270
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
    x: 420,
    y: 210,
    isHidden: false,
    assetURL: 'assets/house.png',
    id: 'home',
    width: 96,
    height: 96
  },
  {
    x: 470,
    y: 150,
    isHidden: false,
    assetURL: 'assets/tree1.png',
  },
  {
    x: 390,
    y: 170,
    isHidden: false,
    assetURL: 'assets/tree-group.png',
  },
  {
    x: 100,
    y: 350,
    isHidden: true,
    assetURL: 'assets/well.png',
    id: 'well'
  },
  {
    x: 550,
    y: 330,
    isHidden: true,
    assetURL: 'assets/fire-out.png',
    id: 'fire-out'
  },
  {
    x: 550,
    y: 330,
    isHidden: true,
    forceHide: true, // can only be revealed explicitly, not via discovery
    assetURL: 'assets/fire.png',
    id: 'fire-lit'
  },
  {
    x: 500,
    y: 200,
    isHidden: true,
    assetURL: 'assets/fence.png',
    id: 'fence-broken'
  },
  {
    x: 550,
    y: 200,
    isHidden: true,
    assetURL: 'assets/fence-broken.png',
    id: 'fence-broken'
  },
  {
    x: 550,
    y: 200,
    isHidden: true,
    forceHide: true,
    assetURL: 'assets/fence.png',
    id: 'fence-mended'
  },
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
