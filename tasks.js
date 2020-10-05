
(function() {
  let currentTask = null;

  game.tasks = [
    {
      id: 'go-to-x',
      startMessage: 'He went straight to the well.',
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
      checker: function(playerCoords) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          playerCoords.x < bounds.x0 || playerCoords.y < bounds.y0 ||
          playerCoords.x > bounds.x1 || playerCoords.y > bounds.y1
        ) {
          taskState.failed = true;
        }

        taskState.completed = game.utils.isObjectInProximity(playerCoords, currentTask.target);

        return taskState;
      }
    },
    {
      id: 'stay-here',
      startMessage: 'And he just stood there for a while.',
      endMessage: 'Indeed.',
      setData: function(player, gameState) {
        currentTask = {
          startPosition: {
            x: player.x,
            y: player.y
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(playerCoords, gameState) {
        const taskState = {
          completed: false,
          failed: false
        };

        const bounds = currentTask.acceptableBounds;
        if (
          playerCoords.x !== currentTask.startPosition.x ||
          playerCoords.y !== currentTask.startPosition.y
        ) {
          taskState.failed = true;
        }

        taskState.completed = gameState.lastDrawTime - currentTask.startTime > 5000;

        return taskState;
      }
    },
    {
      id: 'free-roam-to-green',
      startMessage: 'And he went to the green thing.',
      endMessage: 'Which expanded his map!',
      endEffect: function(gameState) {
        gameState.mapBounds = {
          x: 1400,
          y: 500
        };
        gameState.choices++;
      },
      setData: function(player, gameState) {
        currentTask = {
          target: {
            x: 660,
            y: 450
          },
          startTime: gameState.lastDrawTime
        };
      },
      checker: function(playerCoords) {
        const taskState = {
          completed: false,
          failed: false
        };

        taskState.completed = game.utils.isObjectInProximity(playerCoords, currentTask.target);

        return taskState;
      }
    },
  ];
})();
