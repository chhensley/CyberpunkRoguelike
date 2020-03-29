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
  _gameMap = {
    width: 0,
    height: 0,
    tiles: []
  }

  fsmManager = new StateMachineManager()

  /**
   * Registers multiple event listeners
   * The key in _listeners dictionary will be the function name
   * @param {function, function, ...} - One or more functions to register
   */
  addListeners() {
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
            entity.actor = new Actor(baseEntity.actor.fov, 
              baseEntity.actor.state,
              this.fsmManager.getMachine(baseEntity.actor.statemachine)
            )
            break
          case 'destructable':
            entity.destructable = new Destructable(baseEntity.destructable.hp, this._listeners[baseEntity.destructable.onDestroy])
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

  /**
   * Returns array of entities at the given coordinates
   * @param {*} x - x coordinate
   * @param {*} y - y coordinate
   */
  atPosition(x, y) {
    return x < 0 || x >= this._gameMap.width || y < 0 || y >= this._gameMap.height ? [] : this._gameMap.tiles[x][y]
  }

  /**
   * Regenerates two dimensional array of entities
   * @param {number} width - width of game map
   * @param {number} height - height of game map
   */
  regenerateGameMap(width, height) {
    this._gameMap.width = width
    this._gameMap.height = height
    this._gameMap.tiles = []
    for(let x = 0; x < width; x++) {
      this._gameMap.tiles.push([])
      for(let y = 0; y < height; y++) {
        this._gameMap.tiles[x].push([])
      }
    }

    let view = entityManager.getView('position', 'tile') 
    for (const entity of view) {
      this._gameMap.tiles[entity.position.x][entity.position.y].push(entity)
    }
  }
}

//Centralizes management of all fine state machines
class StateMachineManager {

  //Do not modify these directly
  _states = {}
  _machines = {}

  /**
   * Registers multiple state functions
   * The key in _states dictionary will be the function name
   * Each function should take the owning relevant entity as a parameter
   * @param {function, function, ...} - One or more functions to register
   */
  registerStates() {
    for(var i = 0; i < arguments.length; i++) {
      this._states[arguments[i].name] = arguments[i]
    }
  }

  /**
   * Registers a new state machine
   * @param {string} id - Id for state machine, becomes key in _machines dictionary
   * @param {object} fsmDef - Object defining state. Each key is a state, each value is the _states function for that state
   */
  registerMachine(id, fsmDef) {
    this._machines[id] = {}
    for(const state in fsmDef) {
      this._machines[id][state] = this._states[fsmDef[state]]
    }
  }

  /**
   * Returns a previously registered state machine
   * @param {String} id - Id of state machine
   * @return {Object} - State machine
   */
  getMachine(id) {
    return this._machines[id]
  }
}

//Component definitions
var Actor = function(fov, state, statemachine) {
  this.fov = fov
  this.state = state
  this.statemachine = statemachine
  this.knowledge = {}
}

var Destructable = function(hp, onDestroy) {
  this.hp = hp
  this.dmg = 0
  this.onDestroy = onDestroy
  console.log(this.onDestroy)
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