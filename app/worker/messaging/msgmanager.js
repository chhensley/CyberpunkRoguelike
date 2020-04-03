/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

importScripts(site + 'worker/messaging/msgstack.js')

// Centeralizes management of all messages
class MsgManager {

  //Do not modify these directly
  _handlers = []
  _uiMsgQueue = []

  msgStack = new MessageStack()

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
   * Processes all messages in the current message stack
   */
  run() {
    this._uiMsgQueue = []
    while(!this.msgStack.isEmpty()) {
      const msg = this.msgStack.pop()
      for(const handler of this._handlers) {
        handler(msg, this.msgStack)
      }
    }
  }
}