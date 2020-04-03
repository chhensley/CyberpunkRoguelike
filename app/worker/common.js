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