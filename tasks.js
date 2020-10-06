
(function() {
  let currentTask = null;

  game.tasks = [
    {
      id: 'go-to-well',
      startMessage: 'Like every morning, he went straight to the well.',
      endMessage: null,
      startEffect: function(gameState) {
        const well = game.utils.findObjectByID('well', gameState.objects);
        game.utils.fadeInObject(well);
      },
      setData: function(player, gameState) {
        // TODO: move target to params, then we can create "go-to-x" task type
        const well = game.utils.findObjectByID('well', gameState.objects);
        currentTask = {
          target: {
            x: well.x,
            y: well.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          }
        };
        currentTask.acceptableBounds = {
          x0: Math.min(currentTask.target.x, currentTask.startPosition.x) - 50,
          y0: Math.min(currentTask.target.y, currentTask.startPosition.y) - 50,
          x1: Math.max(currentTask.target.x, currentTask.startPosition.x) + 50,
          y1: Math.max(currentTask.target.y, currentTask.startPosition.y) + 50
        }
        // TODO: save times - will allow waiting tasks and speed-based checks
      },
      checker: function(player) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          player.x < bounds.x0 || player.y < bounds.y0 ||
          player.x > bounds.x1 || player.y > bounds.y1
        ) {
          taskState.failed = true;
        }

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);

        return taskState;
      }
    },
    {
      id: 'go-to-house',
      startMessage: 'With the water he walked carefully back to the house.',
      endMessage: null,
      startEffect: function(gameState) {
        const well = game.utils.findObjectByID('well', gameState.objects);
        game.utils.fadeInObject(well);
      },
      setData: function(player, gameState) {
        // TODO: refactor: generic straight to target type fn
        const home = game.utils.findObjectByID('home', gameState.objects);
        currentTask = {
          target: {
            x: home.x,
            y: home.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          }
        };
        currentTask.acceptableBounds = {
          x0: Math.min(currentTask.target.x, currentTask.startPosition.x) - 50,
          y0: Math.min(currentTask.target.y, currentTask.startPosition.y) - 50,
          x1: Math.max(currentTask.target.x, currentTask.startPosition.x) + 50,
          y1: Math.max(currentTask.target.y, currentTask.startPosition.y) + 50
        }
      },
      checker: function(player) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          player.x < bounds.x0 || player.y < bounds.y0 ||
          player.x > bounds.x1 || player.y > bounds.y1
        ) {
          taskState.failed = true;
        }

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);

        return taskState;
      }
    },
    {
      id: 'free-roam-to-fire',
      startMessage: 'He has gotten cold, so he went to set the fire.',
      startEffect: function(gameState) {
        const fireOut = game.utils.findObjectByID('fire-out', gameState.objects);
        game.utils.fadeInObject(fireOut);
      },
      endEffect: function(gameState) {
        game.utils.swapObjects('fire-out', 'fire');
      },
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('fire', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);
        taskState.failed = gameState.lastDrawTime - currentTask.startTime > 60*1000;

        return taskState;
      }
    },
    {
      id: 'stay-at-fire',
      startMessage: 'And he just stood there for a while to warm up.',
      setData: function(player, gameState) {
        currentTask = {
          startPosition: {
            x: player.x,
            y: player.y
          },
          startTime: gameState.lastDrawTime,
          inGracePeriod: true
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        if (gameState.lastDrawTime - currentTask.startTime > (this.startMessage.length * MESSAGE_CHAR_DELAY)+300) {
          currentTask.inGracePeriod = false;
          currentTask.startPosition = {
            x: player.x,
            y: player.y
          };
        }

        if (currentTask.inGracePeriod) {
          return taskState;
        }

        const bounds = currentTask.acceptableBounds;
        if (
          player.x !== currentTask.startPosition.x ||
          player.y !== currentTask.startPosition.y
        ) {
          if (gameState.lastDrawTime - currentTask.startTime > gracePeriod) {
            taskState.failed = true;
          }
        }

        taskState.completed = gameState.lastDrawTime - currentTask.startTime > 5000;

        return taskState;
      }
    },
    {
      id: 'mend-fence-freeroam',
      startMessage: 'He decided to mend the broken fence by his house.',
      startEffect: function(gameState) {
        const fenceBroken = game.utils.findObjectByID('fence-broken', gameState.objects);
        game.utils.fadeInObject(fenceBroken);
      },
      endEffect: function(gameState) {
        game.utils.swapObjects('fence-broken', 'fence-mended');
        gameState.mapBounds = STAGE_BOUNDS[1];
        gameState.choices++;
      },
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('fence-broken', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);
        taskState.failed = gameState.lastDrawTime - currentTask.startTime > 60*1000;

        return taskState;
      }
    },
    {
      id: 'go-home-end-stage',
      startMessage: 'It was time for him to go home.',
      endEffect: function(gameState) {
        if (game.meta.resets > 10) {
          resetGame('He didn\'t -need- to go home, of course...');
        } else {
          resetGame('He felt like he was missing out on something.');
        }
      },
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('home', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);

        taskState.failed = player.x > currentTask.startPosition.x + 50;

        return taskState;
      }
    },
    {
      id: 'stage-2-start',
      setData: function() {
        // dummy // TODO make optional
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = player.x > 850 && player.y < 270;

        return taskState;
      }
    },
    {
      id: 'stage-2-bridge',
      startEffect: function(gameState) {
        const target = game.utils.findObjectByID('bridge', gameState.objects);
        game.utils.fadeInObject(target);
        game.state.forcedScrolling = true;
        game.state.forcedScrollCount = 0;
      },
      startMessage: 'He was happy to see the old bridge, and headed straight for it.',
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('bridge', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          }
        };
        currentTask.acceptableBounds = {
          x0: Math.min(currentTask.target.x, currentTask.startPosition.x) - 50,
          y0: Math.min(currentTask.target.y, currentTask.startPosition.y) - 50,
          x1: Math.max(currentTask.target.x, currentTask.startPosition.x) + 50,
          y1: Math.max(currentTask.target.y, currentTask.startPosition.y) + 50
        }
      },
      checker: function(player) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          player.x < bounds.x0 || player.y < bounds.y0 ||
          player.x > bounds.x1 || player.y > bounds.y1
        ) {
          taskState.failed = true;
        }

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);

        return taskState;
      }
    },
    {
      id: 'stage-2-stay-at-bridge',
      endEffect: function(gameState) {
        gameState.choices++;
      },
      startEffect: function(gameState) {
        const targets = gameState.objects.filter((obj) => obj.class==='river-scenery');
        targets.forEach(game.utils.fadeInObject);
      },
      startMessage: 'From the bridge, he took a long look at the riverside.',
      endMessage: 'The view inspired him to explore.',
      setData: function(player, gameState) {
        currentTask = {
          startPosition: {
            x: player.x,
            y: player.y
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        if (gameState.lastDrawTime - currentTask.startTime > (this.startMessage.length * MESSAGE_CHAR_DELAY)+300) {
          currentTask.inGracePeriod = false;
          currentTask.startPosition = {
            x: player.x,
            y: player.y
          };
        }

        if (currentTask.inGracePeriod) {
          return taskState;
        }

        const bounds = currentTask.acceptableBounds;
        if (
          player.x !== currentTask.startPosition.x ||
          player.y !== currentTask.startPosition.y
        ) {
          if (gameState.lastDrawTime - currentTask.startTime > 300) {
            taskState.failed = true;
          }
        }

        taskState.completed = gameState.lastDrawTime - currentTask.startTime > 6000;

        return taskState;
      }
    },
    {
      id: 'stage-2-finale-trigger',
      setData: function() {
        // dummy // TODO make optional
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        // triggered in bottom left corner outside of stage1
        taskState.completed = (
          (player.x < 700 && player.y > 500) || // either arriving from the east
          (player.x < 450 && player.y > 400) // or from the top
        );

        return taskState;
      }
    },
    {
      id: 'stage-2-end-choice',
      startMessage: 'The wolves in the south scared him, so he headed straight home.',
      blocksAutoContinue: true,
      endEffect: function(gameState) {
        if (game.meta.resets > 20) {
          resetGame('He wished he had dared the wolves.');
        } else {
          resetGame('He felt like he was missing out on something.');
        }
      },
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('home', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          }
        };
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target);

        taskState.failed = player.x < 250 && player.y > 500;

        return taskState;
      }
    },
    {
      id: 'stage-3-opener',
      startMessage: 'Heading south, he saw parts of the forest he\'d never seen before',
      endEffect: function(gameState) {
        const target = game.utils.findObjectByID('tower', gameState.objects);
        game.utils.fadeInObject(target);
        game.state.forcedScrolling = true;
        game.state.forcedScrollCount = 0;
      },
      setData: function() {
        // dummy // TODO make optional
      },
      checker: function(player, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };
        // Failed if goes back to stage 1, completed if crosses random area's east edge
        taskState.failed = (
          player.y < 500 ||
          // also if they start east in the stage 2 corridor
          (player.y < 650 && player.x > 400)
        );

        taskState.completed = player.x > 700;


        return taskState;
      }
    },
    {
      id: 'stage-3-tower',
      startMessage: 'He noticed the tower, and decided to climb it.',
      endEffect: function(gameState) {
        const targets = gameState.objects.filter((obj) => obj.y > 600 && obj.x < 1600);
        setTimeout(function() {
          targets.forEach(game.utils.fadeInObject);
        }, 2000);
        game.state.forcedScrolling = true;
        game.state.forcedScrollCount = 0;
      },
      setData: function(player, gameState) {
        const target = game.utils.findObjectByID('tower', gameState.objects);
        currentTask = {
          target: {
            x: target.x,
            y: target.y
          },
          startPosition: {
            x: player.x,
            y: player.y
          }
        };
        currentTask.acceptableBounds = {
          x0: Math.min(currentTask.target.x, currentTask.startPosition.x) - 100,
          y0: Math.min(currentTask.target.y, currentTask.startPosition.y) - 100,
          x1: Math.max(currentTask.target.x, currentTask.startPosition.x) + 100,
          y1: Math.max(currentTask.target.y, currentTask.startPosition.y) + 100
        }
      },
      checker: function(player) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          player.x < bounds.x0 || player.y < bounds.y0 ||
          player.x > bounds.x1 || player.y > bounds.y1
        ) {
          taskState.failed = true;
        }

        taskState.completed = game.utils.isObjectInProximity(player, currentTask.target, true);

        return taskState;
      }
    },
  ];
})();
