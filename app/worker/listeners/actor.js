/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

msgManager.registerCallback('actor_damage', function(msg, msgStack, entityManager) {
  msg.trgt.destructable.dmg += randInt(1, 3)
  if(msg.trgt.destructable.dmg >= msg.trgt.destructable.hp) msg.trgt.destructable.onDestroy(msg.trgt)
  var logMsg = msg.src.id + ' punches ' + msg.trgt.id
  msgStack.msgLogMessage(setUpper(logMsg))
 })


msgManager.registerCallback('actor_move', function(msg, msgStack, entityManager){
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
      if(entity.destructable) msgStack.msgActorDamage(msg.entity, entity)
      return
    }
  }

  //Update internally stored map
  var entityMapPosition = entityManager.atPosition(msg.entity.position.x, msg.entity.position.y)
  var index = entityMapPosition.indexOf(msg.entity)
  if (index !== -1) entityMapPosition.splice(index, 1);
  entityManager.atPosition(position.x, position.y).push(msg.entity)
  
  msg.entity.position = position
})