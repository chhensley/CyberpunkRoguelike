importScripts(site + 'worker/ecs/factory.js')

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

  factory = new EntityFactory()

  //onDestroy event handler
  onDestroy = function() {}

  /**
   * Creates a new entity
   * @param {string} baseObj - ID of game object definition, null for an empty entity
   * @return {object} - New game entity
   */
  createEntity(id) {
    var entity = factory.get(id)
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