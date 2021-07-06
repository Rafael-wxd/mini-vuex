import ModuleCollection from './module/moduleCollection.js'
import { storeKey } from './injectKey.js'
import { installState, resetStoreState, resetStore } from './state/index.js'
import { getNewestState } from './utils.js'

export default class Store {
  _strictThrough (fn) {
    const strictState = this._strictState
    this._strictState = true
    typeof fn === 'function' && fn()
    this._strictState = strictState
  }
  constructor (options = {}) {
    const store = this

    // Create tree manipulation data
    store._modules = new ModuleCollection(options)

    // Strict mode
    store.strict = options.strict || false
    // Strict corresponding state
    store._strictState = false

    // The getters managers
    store._gettersWrapped = Object.create(null)
    // The mutations managers
    store._mutationsWrapped = Object.create(null)
    // The actions managers
    store._actionsWrapped = Object.create(null)
    // The namespaceWrapped managers
    store._namespaceWrapped = Object.create(null)

    // Definition state status
    const state = store._modules.root.state
    installState(store, state, [], store._modules.root)

    // Binding state
    resetStoreState(store, state)

    // Create subscribe mutation
    store._subscribe = []

    // Create subscribe action
    store._subscribeAction = []

    // Create plugins
    if (Array.isArray(options.plugins)) {
      options.plugins.forEach(plugin => plugin(store))
    }
  }
  get state () {
    return this._state.data
  }
  commit (type, payload) {
    const entry = this._mutationsWrapped[type] || []
    this._strictThrough(() => {
      entry.forEach(handler => handler(payload))
    })
    this._subscribe.forEach(subscribe => subscribe({type, payload}, this.state))
  }
  dispatch (type, payload) {
    const entry = this._actionsWrapped[type] || []
    return Promise.all(entry.map(handler => handler(payload))).then(() => {
      this._subscribeAction.forEach(subscribeAction => subscribeAction({type, payload}, this.state))
    })
  }
  subscribe (fn) {
    if (typeof fn !== 'function') {
      throw 'The parameter type is Function'
    }
    this._subscribe.push(fn)
  }
  subscribeAction (fn) {
    if (typeof fn !== 'function') {
      throw 'The parameter type is Function'
    }
    this._subscribeAction.push(fn)
  }
  replaceState (newState) {
    this._strictThrough(() => {
      this._state.data = newState
    })
  }
  install (app, injectKey = null) {
    app.provide(injectKey !== null ? injectKey : storeKey, this)
    app.config.globalProperties.$store = this
  }
  registerModule (path, module) {
    if (typeof path === 'string') path = [path]

    const store = this

    const newModule = store._modules.register(module, path)

    installState(store, store.state, path, newModule)

    resetStoreState(store, store.state)
  }
  unregisterModule (path) {
    if (typeof path === 'string') path = [path]

    this._modules.unregister(path)

    this._strictThrough(() => {
      const parentState = getNewestState(this.state, path.slice(0, -1))
      delete parentState[path[path.length - 1]]
    })
     
    resetStore(this)
  }
  hasModule (path) {
    if (typeof path === 'string') path = [path]

    return this._modules.inRootModule(path)
  }
}
