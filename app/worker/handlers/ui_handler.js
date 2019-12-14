/**
 * Copyright 2019
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
  var map = []
  
  //Create empty map
  for(var x = 0; x < config.map.width; x++) {
    var row = []
    for(var y = 0; y < config.map.height; y++) {
      row.push({char: '', color: ''})
    }
    map.push(row)
  }

  var minX = player.position.x - config.terminal.width/2
  var maxX = player.position.x + config.terminal.width/2
  var minY = player.position.y - config.terminal.height/2
  var maxY = player.position.y + config.terminal.width/2

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
  

  //Fill map
  for (var entity of view) {
    var position = entity.position
    if(position.x > maxX || position.x < minX || position.y > maxY || position.y < minY)
      continue;
    //position.x - minX, position.y - minY
    map[entity.position.x - minX][entity.position.y - minY] = entity.tile
  }

  return map
}