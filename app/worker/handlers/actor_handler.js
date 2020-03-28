/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

var fovMap = []

/**
 * Callback for field of view calculations
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {number} - random number
 */
function fovCallback(x, y) {
    return x >= 0 && x < config.map.width && y >=0 && y < config.map.height ? fovMap[x][y] : false
}

/**
 * Maps all objects which block field of view
 * @return {boolean[][]} - map marking all tiles which block LOS
 */
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

entityManager.addListener('onPersonDestroy', function(entity) {
  delete entity.actor
  delete entity.hiddenTile
  entity.tile = gameData.tiles['splat']
  delete entity.destructable
  msgManager.msgLogMessage(setUpper(entity.id + ' dies'))
})

msgManager.addHandler(
  function(msg, msgManager) {
    switch(msg.id) {
      case 'actor_damage':
        msg.trgt.destructable.dmg += randInt(1, 3)
        if(msg.trgt.destructable.dmg >= msg.trgt.destructable.hp) msg.trgt.destructable.onDestroy(msg.trgt)
        var logMsg = msg.src.id + ' punches ' + msg.trgt.id
        msgManager.msgLogMessage(setUpper(logMsg))
        break
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
            if(entity.destructable) msgManager.msgActorDamage(msg.entity, entity)
            return
          }
        }
        msg.entity.position = position
        break
      case 'app_start':
        fovMap = generateFOVMap()
        break
    }
  }
)