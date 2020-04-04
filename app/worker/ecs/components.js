/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

//Components

/**
 * Identifies entity as capable of acting independently
 * @param {number} fov - field of view distance
 * @param {string} state - starting AI state
 * @param {object} statemachine - finite state machine whichs serves as AI
 */
var Actor = function(fov, state, statemachine) {
  this.fov = fov
  this.state = state
  this.statemachine = statemachine
  this.knowledge = {}
}

/**
 * Identifies entity as destructable
 * @param {number} hp - Total hit points
 * @param {function} onDestroy - Callback run when actor destroyed
 */
var Destructable = function(hp, actions) {
  this.hp = hp
  this.dmg = 0
  this.actions = actions
}

/**
 * Indicates entity exists on game map
 * @param {number} x 
 * @param {number} y 
 */
var Position = function(x, y) {
  this.x  = x
  this.y = y
}

/**
 * Symbolic representation of image on game map
 * @param {string} char - unicode character
 * @param {number} color - RGB color
 * @param {number} alpha - opacity value between 0 and 1
 * @param {boolean} blockMove - true if this object blocks movement
 * @param {boolean} blockLOS - true if this object blocks line of site
 */
var Tile = function(char, color, alpha, blockMove, blockLOS) {
  this.char = char
  this.color = color + Math.floor(alpha * 255).toString(16).toUpperCase()
  this.blockMove = blockMove
  this.blockLOS = blockLOS
}