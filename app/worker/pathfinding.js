/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

function AstarPath(parent, startX, startY, endX, endY) {
  //Set directly set values
  this.x = startX
  this.y = startY
  this.parent = parent

  if(parent) {
    //If this is not the start of the path inherit values from previous tile
    this.endX = parent.endX
    this.endY = parent.endY
    this.fromStart = parent.fromStart + 1
  } else {
    //Othwise use the passed values
    this.endX = endX
    this.endY = endY
    this.fromStart = 0 //The initial parent should be the starting square
  }

  this.fromGoal = Math.abs(this.x - this.endX) + Math.abs(this.y - this.endY)
  this.score = this.fromStart + this.fromGoal
}

AstarPath.prototype.compare = function(x, y) {
  return this.x == x && this.y == y
}

function _returnPathFromArray(x, y, array) {
  for(const astarPath of array) {
    if(astarPath.compare(x, y)) return array
  }

  return null
}

function _pushPathToArray(astarPath, array) {
  for(let i = 0; i < array.length; i++) {
    if(array[i].x == astarPath.x && array[i].y == astarPath.y) {
      if(array[i].score > astarPath.score) array[i] = astarPath
    }
  }
  array.push(astarPath)
}

function _getClosest(array) {
  var closest = null
  for(astarPath of array) {
    if(!closest) {
      closest = astarPath
    } else if(astarPath.score < closest.score) {
      closest = astarPath
    }
  }
  return closest
}

function findPath(startX, startY, endX, endY, callback) {
  var closed = []
  var open = []
  var current = new AstarPath(null, startX, startY, endX, endY)
  var i = 0
  while(current) {
    console.log(current)
    //Start with the closest tile if is not the current tile
    var closest = _getClosest(open)
    if(closest && closest.score < current.score) {
      _pushPathToArray(current, open)
      current = closest
    }
    closed.push(current)
    
    //Calculate position of adjacent tiles
    var positions = [
      {x: current.x + 1, y: current.y},
      {x: current.x - 1, y: current.y},
      {x: current.x, y: current.y + 1},
      {x: current.x, y: current.y - 1}
    ]

    var next = null
    for(const position of positions) {
      //If the adjacent tile is the end position return the path
      if(endX == position.x && endY == position.y) return new AstarPath(current, position.x, position.y)

      //If the adjacent tile is already closed or blocked, skip it
      if(_returnPathFromArray(position.x, position.y, closed) || !callback(position.x, position.y)) continue

      //Set the next closest tile in this path, store the rest in the list of open tiles
      var astarPath = new AstarPath(current, position.x, position.y)
      if(!next) {
        next = astarPath
      } else if(astarPath.score < next.score) {  
        _pushPathToArray(next, open)
        next = astarPath
      } else {
        _pushPathToArray(astarPath, open)
      }
    }
    current = next ? next : _getClosest(open)
  }

  return null
}