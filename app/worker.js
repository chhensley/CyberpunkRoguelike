/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

/**
 * This dynamically grabs the full parent path for building relative URLs
 * This is required to properly handle loading pages within github's CMS
 */
var site = location.href.substring(0, location.href.lastIndexOf('/') + 1)

importScripts(site + 'shared/rot.min.js', 
  site + 'shared/util.js', 
  site + 'worker/common.js', 
  site + 'worker/ecs/entity.js', 
  site + 'worker/messaging/msgmanager.js', 
  site + 'worker/pathfinding.js'
)

//Process all messages in the game message stack
function processMessages() {
  while(msgManager.hasNext()) {
    msgManager.processNext()
    while(msgManager.hasNextUIMsg()) {
      this.postMessage(msgManager.nextUIMsg())
    }
  }
}

var fov = new ROT.FOV.RecursiveShadowcasting(fovCallback)

//Load game file configuration
var manifest = getJson(site + 'manifest.json')
var config = getJson(site + manifest.config)

//Intialize game state
var entityManager = new EntityManager()
var factory = EntityManager.factory
var msgManager = new MsgManager()

//Load game data
var factory = new EntityFactory()
entityManager.factory = factory

//Load message handlers
for(const url of manifest.listeners) {
  importScripts(site + url)
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
for(const url of manifest.objects) { factory.load(url) }

//Place player on map
var player

//Send RNG seed to main thread for display
this.postMessage({id: 'set_value', body: {'property': 'seed', 'value': ROT.RNG.getSeed()}})

//Run game setup
msgManager.msgStack.msgAppStart()
processMessages()

onmessage = function(e) {
  if(e.data.id == 'keypress') {
    //Main game loop
    msgManager.msgStack.msgTurnEnd()
    msgManager.msgStack.msgTurnNPC()
    msgManager.msgStack.msgKeyInput(e.data.body)
    msgManager.msgStack.msgTurnStart()

    processMessages()

    this.postMessage({id: 'input_unlock'})
  }
}