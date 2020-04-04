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

  //Returns true if there are more UI messages in the queue
  hasNextUIMsg() {
    return this._uiMsgQueue.length != 0
  }

  //Returns next UI messages in the queue
  nextUIMsg() {
    if (!this._uiMsgQueue.length) return null
    const msg = this._uiMsgQueue[0]
    this._uiMsgQueue.splice(0, 1)
    return msg
  }

  //Returns true if there are more messages to process in the stack
  hasNext() {
    return !this.msgStack.isEmpty()
  }

  //Processes the next mesage in the message stack
  processNext() {
    const msg = this.msgStack.pop()
    if(this._callbacks[msg.id]) {
      for(const callback of this._callbacks[msg.id]) {
        callback(msg, this.msgStack, entityManager)
      }
    }
  }
}