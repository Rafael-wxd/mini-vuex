import { objectForEach } from '../utils.js'

export default class Module {
  constructor (rawModule) {
    this._raw = rawModule
    this._children = {}
    this.state = rawModule.state
    this.namespaced = rawModule.namespaced
  }
  getChild (key) {
    return this._children[key]
  }
  addChild (key, module) {
    this._children[key] = module
  }
  removeChild (key) {
    delete this._children[key]
  }
  hanChild (key) {
    return key in this._children
  }
  forEachChild (fn) {
    objectForEach(this._children, fn)
  }
  forEachGetters (fn) {
    const getters = this._raw.getters
    if (getters) {
      objectForEach(getters, fn)
    }
  }
  forEachMutations (fn) {
    const mutations = this._raw.mutations
    if (mutations) {
      objectForEach(mutations, fn)
    }
  }
  forEachActions (fn) {
    const actions = this._raw.actions
    if (actions) {
      objectForEach(actions, fn)
    }
  }
}