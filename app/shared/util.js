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
 * Retrieves JSON object from url
 * Used to load configuration and game data
 * @param {string} url
 */
function getJson(url)
{
    console.log('Loading ' + url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false )
    xmlHttp.send( null )

    if (xmlHttp.status == 200)
      return JSON.parse(xmlHttp.responseText)
    else
      return null
}

/**
 * Returns a random integer within a range
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 */
function randInt(min, max) {
  const range = max - min + 1
  return Math.floor(range * ROT.RNG.getUniform()) + min
}

/**
 * Returns random member of an array
 * @param {array} array
 */
function randMember(array) {
  return array[Math.floor(array.length * ROT.RNG.getUniform())]
}