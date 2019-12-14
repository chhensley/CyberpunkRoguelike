/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

var site = 'https://chhensley.github.io/CyberpunkRoguelike/'

importScripts(site + 'app/shared/rot.min.js', site + 'app/shared/util.js', site + 'app/worker/entity.js', site + 'app/worker/msgmanager.js')

//Load game configuration
var manifest = getJson(site + 'manifest.json')
var config = getJson(site + manifest.config)
var gameData = {
  colors: {},
  tiles: {}
}

//Load colors
for(const url of manifest.colors) {
  gameData.colors = {...gameData.colors, ...getJson(site + url)}
}

//Load game tiles
for(const url of manifest.tiles)
 {
  var tiles = getJson(site + url)
  for(const key in tiles) {
    const tile = tiles[key]
    gameData.tiles[key] = new Tile(tile.char, tile.color, tile.blockMove)
  }
}

//Intialize game state
var entityManager = new EntityManager()
var msgManager = new MsgManager()

//Load message handlers
for(const handler of manifest.handlers) {
  importScripts(site + handler)
}
//importScripts(...manifest.handlers)

//Place player on map
var player = entityManager.createEntity()
player.tile = gameData.tiles['player']
player.position = new Position(config.map.width/2, config.map.height/2)

//Generate some random terrain to navigates
for(var i = 0; i < 1000; i++) {
  const x = Math.floor(config.map.width * ROT.RNG.getUniform())
  const y = Math.floor(config.map.height * ROT.RNG.getUniform())

  const view = entityManager.getView('position')
  var legal = true;
  for(const entity of view) {
    if(entity.position.x == x && entity.position == y) {
      legal = false
      break
    }
  }

  if(legal) {
    var wall = entityManager.createEntity()
    wall.tile = gameData.tiles['wall']
    wall.position = new Position(x, y)
  }
}

//Run game setup
msgManager.msgAppStart()
msgManager.run()
for(var msg of msgManager._uiMsgQueue) {
  this.postMessage(msg)
}

onmessage = function(e) {
  if(e.data.id == 'keypress') {
    msgManager.msgTurnEnd()
    msgManager.msgKeyInput(e.data.body)
    msgManager.msgTurnStart()

    msgManager.run()
    for(var msg of msgManager._uiMsgQueue) {
      this.postMessage(msg)
    }
    this.postMessage({id: 'input_unlock'})
  }
}