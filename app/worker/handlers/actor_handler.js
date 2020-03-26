/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

var fovMap = []

function fovCallback(x, y) {
    return x >= 0 && x < config.map.width && y >=0 && y < config.map.height ? fovMap[x][y] : false
}

function generateFOVMap() {
  var fovMap = []

  //Generate empty FOV map
  for(var x = 0; x < config.map.width; x++) {
    fovMap.push([])
    for(var y = 0; y < config.map.height; y++) {
      fovMap[x].push(true)
    }
  }

  //Mark tiles which block LOS
  var view = entityManager.getView('position', 'tile')
  for(const entity of view) {
    fovMap[entity.position.x][entity.position.y] = !entity.tile.blockLOS && fovMap[entity.position.x][entity.position.y]
  }

  return fovMap
}

msgManager.addHandler(
  function(msg, msgManager) {
    switch(msg.id) {
      case 'actor_move':
        //Check that move is in bounds
        var position = new Position(msg.entity.position.x + msg.dx, msg.entity.position.y + msg.dy)
        if(position.x < 0 || position.y < 0 || position.x >= config.map.width || 
          position.y >= config.map.height) {
            return
          }

        //Check that the square is not occupied
        var view = entityManager.getView('position', 'tile')
        for(const entity of view) {
          if(position.x == entity.position.x && position.y == entity.position.y && entity.tile.blockMove) {
            return
          }
        }
        msg.entity.position = position
        break;
      case 'app_start':
        fovMap = generateFOVMap()
        break
    }
  }
)