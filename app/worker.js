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
 * Callback for field of view calculations
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @return {boolean} - true if los can pass through coordinates
 */
function fovCallback(x, y) {
  for(const entity of entityManager.atPosition(x, y)) {
    if(entity.tile.blockLOS) return false
  }
  return true
}

/**
 * Callback for pathing calculations
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @return {boolean} - true if entity can move through coordinates
 */
function pathCallback(x,y) {
  if(x < 0 || x >= config.map.width || y < 0 || y >= config.map.height) return false
  
  for(const entity of entityManager.atPosition(x, y)) {
    if(entity.tile.blockMove) return false
  }
  return true
}

/**
 * This dynamically grabs the full parent path for building relative URLs
 * This is required to properly handle loading pages within github's CMS
 */
var site = location.href.substring(0, location.href.lastIndexOf('/') + 1)

importScripts(site + 'shared/rot.min.js', site + 'shared/util.js', site + 'worker/ecs/entity.js', site + 'worker/msgmanager.js', site + 'worker/pathfinding.js')

var fov = new ROT.FOV.RecursiveShadowcasting(fovCallback)

//Load game file configuration
var manifest = getJson(site + 'manifest.json')
var config = getJson(site + manifest.config)

//Intialize game state
var entityManager = new EntityManager()
var factory = EntityManager.factory
var msgManager = new MsgManager()

//Load game data
var gameData = {}
var factory = new EntityFactory()
entityManager.factory = factory

//Load message handlers
for(const handler of manifest.handlers) {
  importScripts(site + handler)
}

//Load colors
for(const url of manifest.colors) { factory.colors.load(url) }

//Load game tiles
for(const url of manifest.tiles) { factory.tiles.load(url, factory.colors) }


//Load finite state machines
for(const url of manifest.statemachines){
  var statemachines = getJson(site + url)
  for(const key in statemachines) {
    factory.fsmManager.registerMachine(key, statemachines[key])
  }
}

//Load game objects
for(const url of manifest.objects) {
  factory.load(url)
}

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
    msgManager.msgTurnNPC()
    msgManager.msgKeyInput(e.data.body)
    msgManager.msgTurnStart()

    msgManager.run()
    for(var msg of msgManager._uiMsgQueue) {
      this.postMessage(msg)
    }
    this.postMessage({id: 'input_unlock'})
  }
}