/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */


// Centeralizes management of all game entities
class EntityManager {
  //Do not modify these directly
  _entities = []
  _listeners = {}

  /**
   * Registers single event listeners
   * @param {string} id - key for event listener in _listeners dictionary
   * @param {function} listener - event listener
   */
  addListener(id, listener) {
    this._listeners[id] = listener
  }

  /**
   * Registers multiple event listeners
   * The key in _listeners dictionary will be the function name
   * @param {function, function, ...} - One or more functions to register
   */
  addListeners() {
    console.log(arguments[0])
    for(var i = 0; i < arguments.length; i++) {
      this._listeners[arguments[i].name] = arguments[i]
    }
  }

  /**
   * Returns a registered listener
   * @param {string} id - key for event listener in _listeners dictionary
   * @return {function} listener - event listener
   */
  listener(id) {
    return this._listeners[id]
  }

  //onDestroy event handler
  onDestroy = function() {}

  /**
   * Creates a new entity
   * @param {string} baseObj - ID of game object definition, null for an empty entity
   * @return {object} - New game entity
   */
  createEntity(baseObj) {
    var entity = {}
    
    if(baseObj) {
      const baseEntity = gameData.objects[baseObj]
      for(const component in baseEntity) {
        switch(component) {
          case 'actor':
            entity.actor = new Actor(baseEntity.actor.fov)
            break
          case 'destructable':
            entity.destructable = new Destructable(baseEntity.destructable.hp)
            entity.onDestroy = this._listeners[baseEntity.destructable.onDestroy]
            break
          case 'id':
            entity.id = baseEntity.id
            break
          case 'tile':
            entity.tile = gameData.tiles[baseEntity.tile]
            break
          case 'hiddenTile':
            entity.hiddenTile =  gameData.tiles[baseEntity.hiddenTile]
            break
        }
      }
    }

    this._entities.push(entity)
    return entity
  }

  /**
   * Returns the subset of entities with all named components
   * @param {...String} string - Names of components to match
   * @return {array} - Array of entities with all matching components
   */
  getView() {
    if (arguments.length == 0)
      return this._entities

    var view = []
    for (var entity of this._entities) {
      var match = true
      for (var arg of arguments) {
        if(!entity.hasOwnProperty(arg)) {
          match = false
          break
        }
      }
      if (match)
        view.push(entity)
    }
    
    return view
  }
}

//Default listener
function onDefault(entity) {}

//Component definitions
var Actor = function(fov) {
  this.fov = fov
}

var Destructable = function(hp) {
  this.hp = hp
  this.dmg = 0
}

var Position = function(x, y) {
  this.x  = x
  this.y = y
}

var Tile = function(char, color, alpha, blockMove, blockLOS) {
  this.char = char
  this.color = gameData.colors[color] + Math.floor(alpha * 255).toString(16).toUpperCase()
  this.blockMove = blockMove
  this.blockLOS = blockLOS
}