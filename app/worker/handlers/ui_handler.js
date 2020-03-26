/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

 msgManager.addHandler(
   function(msg, msgManager) {
     switch(msg.id) {
      case 'turn_end':
      case 'app_start':
      case 'term_refresh':
        const view = entityManager.getView('position', 'tile')
        msgManager.pushUIMsg({id: 'term_refresh', body: buildMap(view)})
        break
      case 'key_input':
        switch(msg.key) {
          case 'w':
            msgManager.msgActorMove(player, 0, -1)
            break
          case 's':
            msgManager.msgActorMove(player, 0, 1)
            break
          case 'a':
            msgManager.msgActorMove(player, -1, 0)
            break;
          case 'd':
            msgManager.msgActorMove(player, 1, 0)
            break;
        }
        break;
     }
   }
 )

 /**
 * Builds the map to be displayed to the player from an entity view
 * All entities must have position and tile
 * @param {array} view 
 */
function buildMap(view) {

  var minX = player.position.x - config.terminal.width/2
  var maxX = player.position.x + config.terminal.width/2 - 1
  var minY = player.position.y - config.terminal.height/2
  var maxY = player.position.y + config.terminal.width/2 - 1

  //Adjust view port to be within map boundaries
  if (minX < 0) {
    minX = 0;
    maxX = config.terminal.width - 1;
  } else if (maxX >= config.map.width) {
    maxX = config.map.width - 1;
    minX = config.map.width - config.terminal.width;
  }

  if (minY < 0) {
    minY = 0;
    maxY = config.terminal.height - 1;
  } else if (maxY >= config.map.height) {
    maxY = config.map.height - 1;
    minY = config.map.height - config.terminal.height;
  }

  var map = [] //Game map within the terminal window
  var visibleMap = [] //Map visibile to player


  //Create empty map
  for(var x = 0; x < config.terminal.width; x++) {
    map.push([])
    visibleMap.push([])
    for(var y = 0; y < config.terminal.height; y++) {
      map[x].push(gameData.tiles['empty'])
      visibleMap[x].push(gameData.tiles['_null_'])
    }
  }
  
  //Add entities to map
  for (var entity of view) {
    var position = entity.position
    if(position.x > maxX || position.x < minX || position.y > maxY || position.y < minY)
      continue;
    map[entity.position.x - minX][entity.position.y - minY] = entity.tile
  }

  //Mask off non-visible parts of map
  var fov = new ROT.FOV.RecursiveShadowcasting(fovCallback)
  fov.compute(player.position.x, player.position.y, player.actor.fov, function(x, y, r, visibility) {
    visibleMap[x - minX][y - minY] = map[x - minX][y - minY]
  })

  return visibleMap
}