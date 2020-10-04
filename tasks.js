
(function() {
  let currentTask = null;

  game.tasks = [
    {
      id: 'go-to-x',
      startMessage: 'He went straight to the X.',
      endMessage: null,
      setData: function(player) {
        // TODO: move target to params, then we can create "go-to-x" task type
        currentTask = {
          target: {
            x: 200,
            y: 300
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
      endMessage: 'Completed',
      setData: function(player, time) {
        currentTask = {
          startPosition: {
            x: player.x,
            y: player.y
          },
          startTime: time
        };
      },
      checker: function(playerCoords, time) {
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

        taskState.completed = time - currentTask.startTime > 5000;

        return taskState;
      }
    },
  ];
})();
