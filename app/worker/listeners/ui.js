/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//X and Y offsets for translating the game map to the terminal view port
const offset = {
  minX: Math.floor(config.terminal.width/2),
  maxX: Math.ceil(config.terminal.width/2),
  minY: Math.floor(config.terminal.height/2),
  maxY: Math.ceil(config.terminal.height/2)
}

/**
 * Builds the map to be displayed to the player from an entity view
 * All entities must have position and tile
 * @param {array} view 
 */
function buildMap(view) {
  var minX = player.position.x - offset.minX
  var maxX = player.position.x + offset.maxX
  var minY = player.position.y - offset.minY
  var maxY = player.position.y + offset.maxY

  //Adjust view port to be within map boundaries
  if (minX < 0) {
    minX = 0;
    maxX = config.terminal.width - 1;
  } else if (maxX >= config.map.width) {
    maxX = config.map.width;
    minX = config.map.width - config.terminal.width;
  }

  if (minY < 0) {
    minY = 0;
    maxY = config.terminal.height;
  } else if (maxY >= config.map.height) {
    maxY = config.map.height;
    minY = config.map.height - config.terminal.height;
  }
  var visibleMap = [] //Map visibile to player

  //Create empty map
  for(var x = 0; x < config.terminal.width; x++) {
    visibleMap.push([])
    for(var y = 0; y < config.terminal.height; y++) {
      visibleMap[x].push(entityManager.factory.tiles.get('emptyHidden'))
    }
  }
  
  //Add entities to map
  for(let x = minX; x < maxX; x++)
    for(let y = minY; y < maxY; y++) {
      for(const entity of entityManager.atPosition(x, y)) {
        if(entity.hiddenTile) visibleMap[x - minX][y - minY] = entity.hiddenTile
      }
    }

  //Mask off non-visible parts of map
  fov.compute(player.position.x, player.position.y, player.actor.fov, function(x, y, r, visibility) {
    if (x < 0 || x >= config.map.width || y < 0 || y >= config.map.height)
      return

    visibleMap[x - minX][y - minY] = entityManager.factory.tiles.get('empty')
    for(const entity of entityManager.atPosition(x, y)) {
      
      if(!visibleMap[x - minX][y - minY].blockMove) {
        visibleMap[x - minX][y - minY] = entity.tile
      }
    }
  })

  return visibleMap
}

/**
 * Update full UI
 * @param {Object} entityManager 
 */
function updateUI(entityManager) {
  //Update player Hitpoints
  var currentHP =  player.destructable.hp - player.destructable.dmg
  var color = entityManager.factory.colors.get('term00')
  if(currentHP <= player.destructable.hp/4)
    color = entityManager.factory.colors.get('critical00')
  else if(currentHP <= player.destructable.hp/2)
    color = entityManager.factory.colors.get('term01')
  msgManager.pushUIMsg({id: 'set_value', body: {property: 'current_hp', value: currentHP, color: color}})
  
  //Update terminal
  const view = entityManager.getView('position', 'tile')
  msgManager.pushUIMsg({id: 'term_refresh', body: buildMap(view)})
}

//Message listener callbacks
msgManager.registerCallback('app_start', function(msg, msgStack, entityManager) {
  entityManager.regenerateGameMap(config.map.width, config.map.height)
  msgManager.pushUIMsg({id: 'set_value', body: {property: 'total_hp', value: player.destructable.hp}})
  updateUI(entityManager)
})

msgManager.registerCallback('turn_end', function(msg, msgStack, entityManager) {
  updateUI(entityManager)
})

msgManager.registerCallback('term_refresh',  function(msg, msgStack, entityManager){
  const view = entityManager.getView('position', 'tile')
  msgManager.pushUIMsg({id: 'term_refresh', body: buildMap(view)})
})

msgManager.registerCallback('app_gameover', function(msg, msgStack, entityManager){
  msgManager.pushUIMsg({id: 'game_over'})
})

msgManager.registerCallback('key_input', function(msg, msgStack, entityManager){
  switch(msg.key) {
    case 'w':
      msgStack.msgActorMove(player, 0, -1)
      break
    case 's':
      msgStack.msgActorMove(player, 0, 1)
      break
    case 'a':
      msgStack.msgActorMove(player, -1, 0)
      break
    case 'd':
      msgStack.msgActorMove(player, 1, 0)
      break
  }
}) 

msgManager.registerCallback('log_message', function(msg, msgStack, entityManager){
  msgManager.pushUIMsg({id: 'log_msg', body: msg.logMsg})
})