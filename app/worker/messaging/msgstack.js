/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

/**
 * Game message stack
 */
class MessageStack {
  _msgStack = []

  //Pops last message from the stack
  pop() {
    return this._msgStack.pop()
  }

  //Returns true if the stack is empty
  isEmpty() {
    return this._msgStack.length == 0
  }

  //Functions for pushing invidual messages
  msgAppStart() {
    this._msgStack.push({id: 'app_start'})
  }

  msgAppGameOver() {
    this._msgStack.push({id: 'app_gameover'})
  }

  msgTurnStart() {
    this._msgStack.push({id: 'turn_start'})
  }

  msgTurnNPC() {
    this._msgStack.push({id: 'turn_npc'})
  }

  msgTurnEnd() {
    this._msgStack.push({id: 'turn_end'})
  }

  /**
   * Generic action for use
   * @param {Object} action - message defined in external .json file
   * @param {*} src - action being used
   * @param {*} trgt - entity being effected, if any
   */
  msgAction(action, src, trgt) {
    this._msgStack.push(Object.assign(action, {src: src, trgt: trgt}))
  }

  /**
   * Damage a destructable entity
   * @param {Object} src - entity dealing damage
   * @param {Object} trgt - entity being damage
   */
  msgActionDamage(src, trgt) {
    this._msgStack.push({id: 'action_damage', src: src, trgt: trgt})
  }

  /**
   * Destroy a destructable entity
   * @param {Object} entity 
   * @param {string} action - destroy action
   */
  msgActionDestroy(entity, action) {
    this._msgStack.push({id: 'action_destroy', entity: entity, action: action})
  }

  /**
   * Use item action
   * @param {string} action - name of action (ie: drop, pick up, consume)
   * @param {Object} src - entity using the item
   * @param {Object} trgt - entity being used
   */
  msgActionUse(action, src, trgt) {
    this._msgStack.push({id: 'action_use', action: action, src: src, trgt: trgt})
  }

  /**
   * Move actor message
   * @param {Entity} entity 
   *    Entity to move
   * @param {number} dx 
   *    Delta x
   * @param {number} dy 
   *    Delta y
   */
  msgActorMove(entity, dx, dy) {
    this._msgStack.push({id: 'actor_move', entity: entity, dx: dx, dy:dy})
  }

  /**
   * Process the AI for an entity
   * @param {Object} entity
   */
  msgAIProcess(entity) {
    this._msgStack.push({id: 'ai_process', entity: entity})
  }

  /**
   * Key input from UI message
   * @param {String} key 
   *    Key pressed
   */
  msgKeyInput(key) {
    this._msgStack.push({id: 'key_input', key: key})
  }

  /**
   * Post a message to the player facing message log
   * @param {String} logMsg 
   *    Message to post
   */
  msgLogMessage(logMsg) {
    this._msgStack.push({id: 'log_message', logMsg: logMsg})
  }
}