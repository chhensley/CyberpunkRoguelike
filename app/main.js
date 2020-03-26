/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//To run locally set site to empty string
/**
 * This dynamically grabs the full parent path for building relative URLs
 * This is required to properly handle loading pages within github's CMS
 */
var site = location.href.substring(0, location.href.lastIndexOf('/') + 1)

var worker = new Worker(site + 'app/worker.js')

//Retrieve configuration info
var manifest = getJson(site + 'app/manifest.json')
var config = getJson(site + 'app/' + manifest.config)

//Intialize simulated terminal
var term = new ROT.Display
term.setOptions(config.terminal);

//Initialize input
var inputLock = false

document.body.onload = function() {
  document.getElementById('term').appendChild(term.getContainer())
}

worker.onmessage = function(e) {
  switch(e.data.id) {
    case 'term_refresh':
      refreshTerm(e.data.body)
      break
    case 'input_unlock':
      inputLock = false
      break
    case 'set_value':
      document.getElementById(e.data.body.property).innerHTML = e.data.body.value
      break
  }
}

/**
 * Draws a 2-dimensional array of tile objects to the terminal
 * @param {object[][]} map 
 */
function refreshTerm(map) {
  term.clear()
  for(var x = 0; x < config.terminal.width; x++) {
    for (var y = 0; y < config.terminal.height; y++) {
      if (map[x][y].char) {
        term.draw(x, y, map[x][y].char, map[x][y].color)
      }
    }
  }
}

/**
 * Processes key input, or simulated keyinput from a button control
 * @param {String} key
 *    Keyboard input
 */
function keyInput(key) {
  if(!inputLock) {
    inputLock = true;
    worker.postMessage({id: 'keypress', body: key})
  }
}

window.addEventListener('keyup', function(e){
  keyInput(e.key)
}, false);

document.getElementById('up').addEventListener('click', function(e){
  keyInput('w')
}, false)

document.getElementById('down').addEventListener('click', function(e){
  keyInput('s')
}, false)

document.getElementById('left').addEventListener('click', function(e){
  keyInput('a')
}, false)

document.getElementById('right').addEventListener('click', function(e){
  keyInput('d')
}, false)