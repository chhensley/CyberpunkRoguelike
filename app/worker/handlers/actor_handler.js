/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

// Move actor message
var MsgMove = function(entity, dx, dy) {
  this.id = 'actor_move'
  this.entity = entity
  this.dx = dx
  this.dy = dy
}

msgManager.addHandler(
  function(msg, msgManager) {
    switch(msg.id) {
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
            return
          }
        }
        msg.entity.position = position
        break;
    }
  }
)