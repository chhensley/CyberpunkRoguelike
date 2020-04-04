/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//Generic action use
msgManager.registerCallback('action_use', function(msg, msgStack, entityManager){
  var action = msg.trgt.usable[msg.action]
  if(action) {
    for(i = action.actions.length - 1; i >= 0; i--) {
      msgStack.msgAction(action.actions[i], msg.trgt, msg.src)
    }
  }
})

//Individual actions
msgManager.registerCallback('action_heal', function(msg, msgStack, entityManager){
  const amt = randInt(msg.min, msg.max)
  if(msg.trgt.destructable) {
    var destruct = msg.trgt.destructable
    destruct.dmg = amt < destruct.dmg ? destruct.dmg - amt : 0
  }
  msgStack.msgLogMessage(setUpper(msg.trgt.id) + ' heals ' + amt + ' hitpoints')
})

msgManager.registerCallback('action_delete', function(msg, msgStack, entityManager){
  entityManager.deleteEntity(msg.src)
})

