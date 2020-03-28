/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//Register state listeners
function stateAttack(entity){}
function stateWait(entity){}

entityManager.fsmManager.registerStates(stateAttack, stateWait)

//Register event listeners
function onPersonDestroy() {
  delete this.actor
  delete this.hiddenTile
  this.tile = gameData.tiles['splat']
  delete this.destructable
  msgManager.msgLogMessage(setUpper(this.id + ' dies'))
}

entityManager.addListeners(onPersonDestroy)

//Register actor message handler
msgManager.addHandler(
  function(msg, msgManager) {
    switch(msg.id) {
      case 'actor_damage':
        msg.trgt.destructable.dmg += randInt(1, 3)
        if(msg.trgt.destructable.dmg >= msg.trgt.destructable.hp) msg.trgt.onDestroy()
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
      case 'ai_process':
        var actor = msg.entity.actor
        actor.statemachine[actor.state](msg.entity)
        break
      case 'app_start':
      case 'turn_end':
        entityManager.regenerateGameMap(config.map.width, config.map.height)
        break
      case 'turn_npc':
        var view = entityManager.getView('actor','position')
       for(const entity of view) {
          if(entity != player)
            msgManager.msgAIProcess(entity)
        }
        break
    }
  }
)