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

//Menu key commands
const menuKeys = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'
]

//Intialize simulated terminal
var term = new ROT.Display
term.setOptions(config.terminal);

//Initialize other UI elments
document.getElementById('menu_use').style.width = (config.terminal.width * config.terminal.fontSize) + 'px'
document.getElementById('menu_use').style.height = (config.terminal.height * config.terminal.fontSize) + 'px'

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
      if(state == 'locked') state = 'action'
      break
    case 'log_msg':
      const msgLog = document.getElementById('msglog')
      const msg = document.createElement('div')
      msg.innerHTML = e.data.body
      msgLog.removeChild(msgLog.childNodes[0])
      msgLog.appendChild(msg)
      break
    case 'menu_inventory':
        document.getElementById('term').innerHTML = ''
        document.getElementById('menu_use').style.display = 'block'
        var label = document.createElement('div')
        label.innerHTML = 'Select Item:'
        document.getElementById('menu_use').appendChild(label)
        var count = 0
        for(const entity of e.data.body) {
          const item = document.createElement('button')
          const key = document.createElement('span')
          key.innerHTML = menuKeys[count++] + ' | '
          const icon = document.createElement('span')
          icon.innerHTML = entity.icon
          const text = document.createElement('span')
          text.innerHTML = ' ' + entity.id.toUpperCase()
          const desc = document.createElement('desc')
          if(entity.description) {
            desc.innerHTML = ' | ' + entity.description
          }
          item.className = 'menu'
          item.appendChild(key)
          item.appendChild(icon)
          item.appendChild(text)
          if (entity.description) item.appendChild(desc)
          item.addEventListener('click', function(e){
            keyInput(this.children[0].innerHTML[0])
          }, false)
          document.getElementById('menu_use').appendChild(item)
        }
        state = 'menu_inventory'
        break
    case 'menu_use':
      document.getElementById('term').innerHTML = ''
      document.getElementById('menu_use').style.display = 'block'
      var label = document.createElement('div')
      label.innerHTML = 'Select Action:'
      document.getElementById('menu_use').appendChild(label)

      var count = 0
      for(const action of e.data.body) {
        const item = document.createElement('button')
        const key = document.createElement('span')
        key.innerHTML = menuKeys[count++] + ' | '
        const icon = document.createElement('span')
        icon.innerHTML = action.icon
        const text = document.createElement('span')
        text.innerHTML = ' ' + action.action.toUpperCase() + ' ' + action.id.toUpperCase()
        const desc = document.createElement('desc')
        if(action.description) {
          desc.innerHTML = ' | ' + action.description
        }
        item.className = 'menu'
        item.appendChild(key)
        item.appendChild(icon)
        item.appendChild(text)
        if (action.description) item.appendChild(desc)
        item.addEventListener('click', function(e){
          keyInput(this.children[0].innerHTML[0])
        }, false)
        document.getElementById('menu_use').appendChild(item)
      }
      state = 'menu_use'
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
  switch(state) {
    case 'action':
      state = 'locked'
      if (['w', 's', 'a', 'd'].includes(key) ) worker.postMessage({id: 'keypress', body: key})
      else if(key == ' ') worker.postMessage({id: 'use'})
      else if(key == 'i') worker.postMessage({id: 'inventory'})
      else state = 'action'
      break
    case 'menu_use':
      state = 'locked'
      var index = menuKeys.indexOf(key)
      if(index > -1 && index < document.getElementById('menu_use').children.length - 1) {
        document.getElementById('menu_use').style.display = 'hidden'
        document.getElementById('term').appendChild(term.getContainer())
        document.getElementById('menu_use').innerHTML = ''
        document.getElementById('menu_use').style.display = 'none'
        worker.postMessage({id: 'menu', body: index})
      }
      else state = 'menu_use'
      break
    case 'menu_inventory':
      state = 'locked'
      var index = menuKeys.indexOf(key)
      if(index > -1 && index < document.getElementById('menu_use').children.length - 1) {
        document.getElementById('menu_use').style.display = 'hidden'
        document.getElementById('term').appendChild(term.getContainer())
        document.getElementById('menu_use').innerHTML = ''
        document.getElementById('menu_use').style.display = 'none'
        worker.postMessage({id: 'inventory_item', body: index})
      } else state = 'menu_inventory'
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