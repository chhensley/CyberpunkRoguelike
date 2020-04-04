/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */


msgManager.registerCallback('action_damage', function(msg, msgStack, entityManager) {
  msg.trgt.destructable.dmg += randInt(1, 3)
  //if(msg.trgt.destructable.dmg >= msg.trgt.destructable.hp) msg.trgt.destructable.onDestroy(msg.trgt)
  if(msg.trgt.destructable.dmg >= msg.trgt.destructable.hp) {
    while(msg.trgt.destructable.actions.length) {
      msgStack.msgActionDestroy(msg.trgt, msg.trgt.destructable.actions.pop())
    }
  }
  var logMsg = msg.src.id + ' punches ' + msg.trgt.id
  msgStack.msgLogMessage(setUpper(logMsg))
})

msgManager.registerCallback('action_destroy', function(msg, msgStack, entityManager) {
  if(msg.action == 'destroy_player') {
    msgStack.msgAppGameOver()
    msgStack.msgLogMessage('Player died')
  }
})

msgManager.registerCallback('action_destroy', function(msg, msgStack, entityManager) {
  if(msg.action == 'destroy_person') {
    delete msg.entity.actor
    delete msg.entity.hiddenTile
    msg.entity.tile = entityManager.factory.tiles.get('splat')
    msgStack.msgLogMessage(setUpper(msg.entity.id + ' dies'))
    msg.entity.id = 'corpse'
    delete msg.entity.destructable
  }
})