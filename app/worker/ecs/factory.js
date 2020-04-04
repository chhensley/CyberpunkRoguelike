/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

importScripts(site + 'worker/ecs/components.js')
importScripts(site + 'worker/ecs/statemachine.js')

//Factory class for creating entities and components
class EntityFactory {

  //Do not directly access this member
  _entities = {}

  fsmManager = new StateMachineManager()

  //Color Factory
  colors = {
    //Do not directly modify this value
    _colors: {},
    load: function(url) {
      var colors = getJson(site + url)
      
      this._colors = Object.assign({}, this._colors, colors)
    },
    get: function(color) { return this._colors[color]}
  }

  //Tile Factory
  tiles = {
    //Do not directly modify this values
    _tiles: {},
    load: function(url, colors) {
      var tiles = getJson(site + url)
      for(const key in tiles) {
        const tile = tiles[key]
        this._tiles[key] = new Tile(tile.char, colors.get(tile.color), tile.alpha?tile.alpha:1, tile.blockMove, tile.blockLOS)
      }
    },
    get: function(tile) { return this._tiles[tile] }
  }
  
  load(url) {
    var entities = getJson(site + url)
    this._entities = Object.assign({}, this._entities, entities)
  }

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

  get(id) {
    var entity = {}

    if(id) {
      const baseEntity = this._entities[id]
      for(const component in baseEntity) {
        switch(component) {
          case 'actor':
            entity.actor = new Actor(baseEntity.actor.fov, 
              baseEntity.actor.state,
              this.fsmManager.getMachine(baseEntity.actor.statemachine)
            )
            break
          case 'destructable':
            entity.destructable = new Destructable(baseEntity.destructable.hp, baseEntity.destructable.actions)
            break
          case 'hiddenTile':
            entity.hiddenTile =  this.tiles.get(baseEntity.hiddenTile)
            break
          case 'id':
            entity.id = baseEntity.id
            break
          case 'tile':
            entity.tile = this.tiles.get(baseEntity.tile)
            break
          case 'usable':
            entity.usable = new Usable()
            for(const action in baseEntity.usable) {
              entity.usable.addAction(action, baseEntity.usable[action].actions, baseEntity.usable[action].description)
            }
            break
        }
      }
    }

    return entity;
  }
}
