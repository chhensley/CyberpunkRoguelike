/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */


/**
 * Returns the center point of a square
 * @param {Object} min - upper left corner
 * @param {Object} mad - lower right corner
 */
function center(min, max) {
  var center = {}
  center.x = Math.floor(min.x + (max.x - min.x)/2)
  center.y = Math.floor(min.y + (max.y - min.y)/2)

  return center
}

/**
 * Returns an object created from merging json from one or more urls
 * @param {string[]} urls - list of .json file urls
 * @return {object} - merged contents of the .json file
 */
function loadJson(urls) {
  var json = {}
  for(const url of urls) {
    json = {...json, ...getJson(site + url)}
  }
  return json
}

/**
 * Returns a random integer within a range
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {number} - random number
 */
function randInt(min, max) {
  const range = max - min + 1
  return Math.floor(range * ROT.RNG.getUniform()) + min
}

/**
 * Returns random member of an array
 * @param {array} array
 * @return {} - random member
 */
function randMember(array) {
  return array[Math.floor(array.length * ROT.RNG.getUniform())]
}

/**
 * This dynamically grabs the full parent path for building relative URLs
 * This is required to properly handle loading pages within github's CMS
 */
var site = location.href.substring(0, location.href.lastIndexOf('/') + 1)

importScripts(site + 'shared/rot.min.js', site + 'shared/util.js', site + 'worker/entity.js', site + 'worker/msgmanager.js')

//Load game file configuration
var manifest = getJson(site + 'manifest.json')
var config = getJson(site + manifest.config)

//Intialize game state
var entityManager = new EntityManager()
var msgManager = new MsgManager()

//Load message handlers
for(const handler of manifest.handlers) {
  importScripts(site + handler)
}

//Load game data
var gameData = {}

//Load colors
gameData.colors = loadJson(manifest.colors)

//Load game tiles
gameData.tiles = {}
for(const url of manifest.tiles)
 {
  var tiles = getJson(site + url)
  for(const key in tiles) {
    const tile = tiles[key]
    gameData.tiles[key] = new Tile(tile.char, tile.color, tile.alpha?tile.alpha:1, tile.blockMove, tile.blockLOS)
  }
}

//Load finite state machines
for(const url of manifest.statemachines)
 {
  var statemachines = getJson(site + url)
  for(const key in statemachines) {
    entityManager.fsmManager.registerMachine(key, statemachines[key])
  }
}

//Load game objects
gameData.objects = loadJson(manifest.objects)

//Place player on map
var player

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