/**
 * Copyright 2019 - 2020
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
const config = getJson(site + 'app/' + getJson(site + 'app/manifest.json').config)

//Intialize simulated terminal
var term = new ROT.Display
term.setOptions(config.terminal);

//Initialize input
var state = 'action'

//Initialize message log
for(let i = 0; i < config.messageLog.history; i++) {
  const entry = document.createElement('div')
  entry.innerHTML = '&nbsp'
  document.getElementById('msglog').appendChild(entry)
}

document.body.onload = function() {
  document.getElementById('term').appendChild(term.getContainer())
}

worker.onmessage = function(e) {
  switch(e.data.id) {
    case 'game_over':
      state = 'game_over'
      term.clear()
      term.draw(30, 30, 'GAME OVER, MAN!')
      break
    case 'input_unlock':
      if(state == 'locked')
        state = 'action'
      break
    case 'log_msg':
      const msgLog = document.getElementById('msglog')
      const msg = document.createElement('div')
      msg.innerHTML = e.data.body
      msgLog.removeChild(msgLog.childNodes[0])
      msgLog.appendChild(msg)
      break
    case 'set_value':
      var element = document.getElementById(e.data.body.property)
      element.innerHTML = e.data.body.value
      if(e.data.body.color)
        element.style.color = e.data.body.color
      break
    case 'term_refresh':
      if(state != 'game_over') refreshTerm(e.data.body)
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
  if(state == 'action') {
    state = 'locked'
    if (['w', 's', 'a', 'd'].includes(key) ) 
      worker.postMessage({id: 'keypress', body: key})
    if(key == ' ')
      worker.postMessage({id: 'use'})
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

document.getElementById('use').addEventListener('click', function(e){
  keyInput(' ')
},)