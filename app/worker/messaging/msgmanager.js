/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

importScripts(site + 'worker/messaging/msgstack.js')

// Centeralizes management of all messages
class MsgManager {

  //Do not modify these directly
  _callbacks = {}
  _handlers = []
  _uiMsgQueue = []

  msgStack = new MessageStack()

  /**
   * Registers a callback
   * Callback: function(msg, msgStack, entityManager)
   * @param {string} msgId - messages with this id are passed to listenre
   * @param {function} callback - listener callback 
   */
  registerCallback(msgId, callback) {
    if(this._callbacks[msgId] == null) this._callbacks[msgId] = []

    this._callbacks[msgId].push(callback)
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
  process() {
    this._uiMsgQueue = []
    while(!this.msgStack.isEmpty()) {
      const msg = this.msgStack.pop()
      if(!this._callbacks[msg.id]) continue
      for(const callback of this._callbacks[msg.id] ) {
        callback(msg, this.msgStack, entityManager)
      }
    }
  }
}