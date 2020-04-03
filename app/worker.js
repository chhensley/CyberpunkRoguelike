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
for(const url of manifest.objects) { factory.load(url) }

//Place player on map
var player

//Send RNG seed to main thread for display
this.postMessage({id: 'set_value', body: {'property': 'seed', 'value': ROT.RNG.getSeed()}})

//Run game setup
msgManager.msgStack.msgAppStart()
msgManager.run()
for(var msg of msgManager._uiMsgQueue) {
  this.postMessage(msg)
}

onmessage = function(e) {
  if(e.data.id == 'keypress') {
    msgManager.msgStack.msgTurnEnd()
    msgManager.msgStack.msgTurnNPC()
    msgManager.msgStack.msgKeyInput(e.data.body)
    msgManager.msgStack.msgTurnStart()

    msgManager.run()
    for(var msg of msgManager._uiMsgQueue) {
      this.postMessage(msg)
    }
    this.postMessage({id: 'input_unlock'})
  }
}