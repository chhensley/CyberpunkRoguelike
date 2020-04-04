/**
 * Copyright 2020
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
  msgManager.msgStack.msgActorMove(entity, next.x - entity.position.x, next.y - entity.position.y)
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
    msgManager.msgStack.msgAIProcess(entity)
    return
  }
}

entityManager.factory.fsmManager.registerStates(stateAttack, stateWait)

msgManager.registerCallback('ai_process', function(msg, msgStack, entityManager){
  var actor = msg.entity.actor
  actor.statemachine[actor.state](msg.entity)
})

msgManager.registerCallback('turn_npc', function(msg, msgStack, entityManager){
  var view = entityManager.getView('actor','position')
  entityManager.regenerateGameMap(config.map.width, config.map.height)
  for(const entity of view) {
    if(entity != player)
      msgStack.msgAIProcess(entity)
  }
})
