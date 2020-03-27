/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

// Centeralizes management of all messages
class MsgManager {

  //Do not modify these directly
  _handlers = []
  _msgStack = []
  _uiMsgQueue = []

  /**
   * Registers a mesage handler
   * This is used in the .js files for the individual handler
   * @param {function} handler 
   */
  addHandler(handler) {
    this._handlers.push(handler)
  }

  /**
   * Adds a message to the queueu to be passed to main.js
   * @param {Object} msg 
   */
  pushUIMsg(msg) {
    this._uiMsgQueue.push(msg)
  }

  /**
   * Adds a game message to the message stack
   * Use this for dev only. Create a function for individual messages
   * @param {Object} msg 
   *    Message to add
   */
  pushMsg(msg) {
    this._msgStack.push(msg)
  }

  /**
   * Processes all messages in the current message stack
   */
  run() {
    this._uiMsgQueue = []
    while(this._msgStack.length) {
      const msg = this._msgStack.pop()
      for(const handler of this._handlers) {
        handler(msg, this)
      }
    }
  }

  //Functions for pushing invidual messages
  msgAppStart() {
    this._msgStack.push({id: 'app_start'})
  }

  msgTurnStart() {
    this._msgStack.push({id: 'turn_start'})
  }

  msgTurnEnd() {
    this._msgStack.push({id: 'turn_end'})
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