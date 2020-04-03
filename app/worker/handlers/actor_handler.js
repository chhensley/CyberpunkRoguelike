/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

/**
 * Barebones Path finding algorithm
 * @param {Position} src - starting position
 * @param {Position} trgt - ending position
 * @param {function} callback - path finding callback
 */
function simplePathFinding(src, trgt, callback) {
  //Calculate adjacent squares
  var adjacent = [
    new Position(src.x + 1, src.y),
    new Position(src.x - 1, src.y),
    new Position(src.x, src.y + 1),
    new Position(src.x, src.y - 1)
  ]

  var next = null
  var nextDist = 0

  for(const pos of adjacent) {
    //If this adjacent tile is the target, return it as next position
    if(pos.x == trgt.x && pos.y == trgt.y) return pos

    //If this adjacent tile is impassible, skip it
    if(!callback(pos.x, pos.y)) continue

    //Otherwise check if this is the closest tile
    var dist = Math.abs(trgt.x - pos.x) + Math.abs(trgt.y - pos.y)
    if(!next || dist < nextDist) {
      next = pos
      nextDist = dist
    }
  }

  return next
}

//Register state listeners
function stateAttack(entity) {
  //delete entity.actor.knowledge.playerPos //Delete this once move is complete
  fov.compute(entity.position.x, entity.position.y, entity.actor.fov, function(x, y, r, visibility) {
    if(x == player.position.x && y == player.position.y)
      entity.actor.knowledge.playerPos = {x: x, y: y}
  })

  //If this is the player's last known location, and they can't be found, wait
  if(entity.position.x == entity.actor.knowledge.playerPos.x && entity.position.y == entity.actor.knowledge.playerPos.y) {
    entity.actor.state = 'wait'
    msgManager.msgAIProcess(entity)
  }
  
  var next = simplePathFinding(entity.position, player.position, pathCallback)
  msgManager.msgActorMove(entity, next.x - entity.position.x, next.y - entity.position.y)
}

function stateWait(entity) {
  //Search for player
  delete entity.actor.knowledge.playerPos
  fov.compute(entity.position.x, entity.position.y, entity.actor.fov, function(x, y, r, visibility) {
    if(x == player.position.x && y == player.position.y)
      entity.actor.knowledge.playerPos = {x: x, y: y}
  })

  //If player is found, attack
  if(entity.actor.knowledge.playerPos) {
    entity.actor.state = 'attack'
    msgManager.msgAIProcess(entity)
    return
  }
}

entityManager.factory.fsmManager.registerStates(stateAttack, stateWait)


//Register event listeners
function onPersonDestroy(entity) {
  delete entity.actor
  delete entity.hiddenTile
  entity.tile = entityManager.factory.tiles.get('splat')
  msgManager.msgLogMessage(setUpper(entity.id + ' dies'))
  entity.id = 'corpse'
  delete entity.destructable
}

function onPlayerDestroy(entity) {
  msgManager.msgAppGameOver()
  msgManager.msgLogMessage('Player died')
}

entityManager.factory.addListeners(onPlayerDestroy, onPersonDestroy)

//Register actor message handler
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
        for(const entity of entityManager.atPosition(position.x, position.y)) {
          if(entity.tile.blockMove) {
            if(entity.destructable) msgManager.msgActorDamage(msg.entity, entity)
            return
          }
        }

        //Update internally stored map
        var entityMapPosition = entityManager.atPosition(msg.entity.position.x, msg.entity.position.y)
        var index = entityMapPosition.indexOf(msg.entity)
        if (index !== -1) entityMapPosition.splice(index, 1);
        entityManager.atPosition(position.x, position.y).push(msg.entity)
        
        msg.entity.position = position
        break
      case 'ai_process':
        var actor = msg.entity.actor
        actor.statemachine[actor.state](msg.entity)
        break
      case 'app_start':
        entityManager.regenerateGameMap(config.map.width, config.map.height)
        break
      case 'turn_npc':
        var view = entityManager.getView('actor','position')
        for(const entity of view) {
          if(entity != player)
            msgStack.msgAIProcess(entity)
        }
        break
    }
  }
)