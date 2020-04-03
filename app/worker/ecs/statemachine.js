/**
 * Copyright 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */


//Centralizes management of all fine state machines
class StateMachineManager {

  //Do not modify these directly
  _states = {}
  _machines = {}

  /**
   * Registers multiple state functions
   * The key in _states dictionary will be the function name
   * Each function should take the owning relevant entity as a parameter
   * @param {function, function, ...} - One or more functions to register
   */
  registerStates() {
    for(var i = 0; i < arguments.length; i++) {
      this._states[arguments[i].name] = arguments[i]
    }
  }

  /**
   * Registers a new state machine
   * @param {string} id - Id for state machine, becomes key in _machines dictionary
   * @param {object} fsmDef - Object defining state. Each key is a state, each value is the _states function for that state
   */
  registerMachine(id, fsmDef) {
    this._machines[id] = {}
    for(const state in fsmDef) {
      this._machines[id][state] = this._states[fsmDef[state]]
    }
  }

  /**
   * Loads state machine defintions from external url
   * @param {String} url 
   */
  load(url) {
    var statemachines = getJson(site + url)
    for(const key in statemachines) {
      this.registerMachine(key, statemachines[key])
    }
  }

  /**
   * Returns a previously registered state machine
   * @param {String} id - Id of state machine
   * @return {Object} - State machine
   */
  getMachine(id) {
    return this._machines[id]
  }
}