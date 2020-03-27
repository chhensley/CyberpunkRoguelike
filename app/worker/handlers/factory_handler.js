/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

var bspConfig = config.map.binaryPartition

/**
 * Tree for using Binary Space Partition for map gen
 * Focus is on creating city buildings
 * @param {Object} min - top left corner of space to partition
 * @param {Object} max - bottom right corner of space to partition
 * @param {Object} parent - parent node, or null if this is the root node
 * @param {number} depth - number of layers beyond this node
 * @param {boolean} isVertical - true if this space should be divided vertically
 */
function BSPTree(min, max, parent, depth, isVertical) {
  this.min = min
  this.max = max
  this.parent = parent
  this.isVertical = isVertical
  this.children = []

  //Divide the space in two if this node isn't the deepest node
  if (depth) {
    if ((isVertical) && (max.x - min.x  > bspConfig.minWidth * 2)) {
      var width = randInt(bspConfig.minWidth, max.x - min.x - bspConfig.minWidth)
      var child0Max = {x: min.x + width - depth, y: max.y}
      var child1Min = {x: min.x + width + depth + 1, y: min.y}
    } else if((!isVertical) && (max.y - min.y > bspConfig.minHeight * 2)) {
      var height = randInt(bspConfig.minHeight, max.y - min.y - bspConfig.minHeight)
      var child0Max = {x: max.x, y: min.y + height - depth}
      var child1Min = {x: min.x, y: min.y + height + depth + 1}
    }

    if(child0Max && child1Min) {
      this.children.push(new BSPTree(min, child0Max, this, depth - 1, !isVertical))
      this.children.push(new BSPTree(child1Min, max, this, depth - 1, !isVertical))
    }
  }
}

//Flattens the binary tree, returning the deepest nodes
BSPTree.prototype.flatten = function() {
  var nodes  = []
  if(this.children.length > 0) {
    for(const child of this.children)  {
      nodes = nodes.concat(child.flatten())
    }
  } else {
    nodes.push(this)
  }
  return nodes
}

/**
 * Generates a BSP tree of given depth
 * @param {number} depth
 */
function generateBSPTree(depth) {
  var min = {x:0, y: 0}
  var max = {x: config.map.width - 1, y: config.map.height - 1}
  return new BSPTree(min, max, null, depth, randInt(0,1))
}

/**
 * Draws the space defined by BSP node on the game map
 * @param {Object[][]} map - Two dimensional array of tiles
 * @param {Object} node - Node to draw
 */
function drawNode(map, node) {
  for(var x = node.min.x; x <= node.max.x; x++) {
    map[x][node.min.y] = 'wall'
    map[x][node.max.y] = 'wall'
  }

  for(var y = node.min.y; y <= node.max.y; y++) {
    map[node.min.x][y] = 'wall'
    map[node.max.x][y] = 'wall'
  }
}

/**
 * Creates random doors in a node drawn on the game map
 * @param {BSPTree} node - current node
 * @param {Object[][]} map - two dimensional array of tiles
 */
function createDoors(node, map) {
  var doors = randInt(bspConfig.minDoors, bspConfig.maxDoors)
  for(var i = 0; i < doors; i++) {
    //For each door, randomly remove a wall tile
    if(randInt(0,1)) {
      var x = randInt(node.min.x + 1, node.max.x - 1)
      var y = randInt(0,1)?node.max.y:node.min.y
      if(!y) y = node.max.y
      if(y == config.map.height - 1) y = node.min.y
    } else {
      var x = randInt(0,1)?node.max.x:node.min.x
      var y = randInt(node.min.y + 1, node.max.y - 1)
      if(!x) x = node.max.x
      if(x == config.map.width - 1) x = node.min.x
    }
    map[x][y] = null
  } 
}

/**
 * Creats a city block map from a binary space partition tree
 * @param {BSPTree} tree
 */
function generateCityBlock(tree) {
  var map = []

  //Create empty game map
  for(var x = 0; x < config.map.width; x++) {
    map.push([])
    for(var y = 0; y < config.map.height; y++) {
      map[x].push(null)
    }
  }

  //Generate buildings from binary space partition
  var nodes = tree.flatten()

  for(const node of nodes) {
    drawNode(map, node)
  }

  for (const node of nodes) {
    createDoors(node, map)
  }

  //Convert game map into entities
  for(var x = 0; x < config.map.width; x++) {
    map.push([])
    for(var y = 0; y < config.map.height; y++) {
      if(map[x][y]) {
        const entity = entityManager.createEntity(map[x][y])
        entity.position = new Position(x, y)
      }
    }
  }

  //Place player in the middle of the largest street
  player = entityManager.createEntity('player')
  
  player.position = tree.isVertical?center(
    {x: tree.children[0].max.x, y: tree.children[0].min.y}, 
    {x: tree.children[1].min.x, y: tree.children[1].max.y}
  ):center(
    {x: tree.children[0].min.x, y: tree.children[0].max.y}, 
    {x: tree.children[1].max.x, y: tree.children[1].min.y}
  )
}

msgManager.addHandler(
  function(msg, msgManager) {
    if(msg.id == 'app_start') {
      generateCityBlock(generateBSPTree(bspConfig.depth))
    }
  }
)