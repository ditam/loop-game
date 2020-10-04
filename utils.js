game.utils = {

  avg: function(array) {
    if (!array.length) return 0;
    let sum = 0;
    array.forEach(x => sum+=x);
    return sum/array.length;
  },

  fadeInObject: function(obj) {
    if (!obj.isHidden) {
      console.warn('Object is already displayed or fading in:', obj);
    }

    obj.isHidden = false;
    obj.isFadingIn = true;
    obj.fadeCounter = 0;
  },

  isObjectInProximity: function(playerCoords, objectCoords) {
    const xDist = Math.abs(playerCoords.x - objectCoords.x);
    const yDist = Math.abs(playerCoords.y - objectCoords.y);

    const distSquared = xDist*xDist + yDist*yDist;
    return distSquared < ACTIVITY_RADIUS*ACTIVITY_RADIUS;
  },

  findObjectByID: function(id, objects) {
    return objects.filter(o => o.id === id)[0];
  }
};
