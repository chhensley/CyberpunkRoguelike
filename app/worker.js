/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//To run locally set site to empty string
var site = 'https://chhensley.github.io/CyberpunkRoguelike/app/'
//var site = ''

importScripts(site + 'shared/rot.min.js', site + 'shared/util.js', site + 'worker/entity.js', site + 'worker/msgmanager.js')

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
    gameData.tiles[key] = new Tile(tile.char, tile.color, tile.blockMove, tile.blockLOS)
  }
}

//Intialize game state
var entityManager = new EntityManager()
var msgManager = new MsgManager()

//Load message handlers
for(const handler of manifest.handlers) {
  importScripts(site + handler)
}

//Place player on map
var player = entityManager.createEntity()

//Send RNG seed to main thread for display
this.postMessage({id: 'set_value', body: {'property': 'seed', 'value': ROT.RNG.getSeed()}})

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