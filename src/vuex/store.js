import ModuleCollection from './module/moduleCollection.js'
import { storeKey } from './injectKey.js'
import { installState, resetStoreState, resetStore } from './state/index.js'
import { getNewestState } from './utils.js'

export default class Store {
  // 严格模式->正常修改state执行
  _strictThrough (fn) {
    const strictState = this._strictState
    this._strictState = true
    typeof fn === 'function' && fn()
    this._strictState = strictState
  }
  constructor (options = {}) {
    const store = this

    // 创建树形模型
    store._modules = new ModuleCollection(options)

    // 是否开启严格模式
    store.strict = options.strict || false
    // 默认校验属性
    store._strictState = false

    // 创建getters模型
    store._gettersWrapped = Object.create(null)
    // 创建mutation模型
    store._mutationsWrapped = Object.create(null)
    // 创建action模型
    store._actionsWrapped = Object.create(null)
    // 别名管理模型
    store._namespaceWrapped = Object.create(null)

    // 取出state模型
    const state = store._modules.root.state

    // 初始化state数据
    installState(store, state, [], store._modules.root)

    // 注册state监听
    resetStoreState(store, state)

    // 创建mutation订阅管理器
    store._subscribe = []

    // 创建action订阅管理器
    store._subscribeAction = []

    // 遍历添加的插件并将store赋值传参
    if (Array.isArray(options.plugins)) {
      options.plugins.forEach(plugin => plugin(store))
    }
  }
  get state () {
    return this._state.data
  }
  // commit -> 执行mutations方法 type为执行方法名 payload为新数据
  commit (type, payload) {
    // entry = [key] => [mutaions...]
    const entry = this._mutationsWrapped[type] || []
    // 在严格模式允许方法中执行
    this._strictThrough(() => {
      // 将payload传参到绑定的mutation中
      entry.forEach(handler => handler(payload))
    })
    // 执行绑定的subscribe方法 传参{mutation方法名, 参数}, state属性
    this._subscribe.forEach(subscribe => subscribe({type, payload}, this.state))
  }
  // dispatch -> 执行actions方法 type为执行方法名 payload为新数据
  dispatch (type, payload) {
    // entry = [key] => [actions...]
    const entry = this._actionsWrapped[type] || []
    // 通过promise.all方法执行完所有action后执行执行绑定的subscribeActions方法
    return Promise.all(entry.map(handler => handler(payload))).then(() => {
      this._subscribeAction.forEach(subscribeAction => subscribeAction({type, payload}, this.state))
    })
  }
  // 订阅mutation执行变化触发
  subscribe (fn) {
    if (typeof fn !== 'function') {
      throw 'The parameter type is Function'
    }
    this._subscribe.push(fn)
  }
  // 订阅action执行后触发
  subscribeAction (fn) {
    if (typeof fn !== 'function') {
      throw 'The parameter type is Function'
    }
    this._subscribeAction.push(fn)
  }
  // 修改store的跟状态 传递参数->新的state
  replaceState (newState) {
    this._strictThrough(() => {
      this._state.data = newState
    })
  }
  // vue注册执行方法
  install (app, injectKey = null) {
    app.provide(injectKey !== null ? injectKey : storeKey, this)
    app.config.globalProperties.$store = this
  }
  // 注册动态模块
  registerModule (path, module) {
    if (typeof path === 'string') path = [path]

    const store = this

    // 将module注册模块
    const newModule = store._modules.register(module, path)

    // 初始化state状态
    installState(store, store.state, path, newModule)

    // 重置state属性
    resetStoreState(store, store.state)
  }
  // 卸载动态模块
  unregisterModule (path) {
    if (typeof path === 'string') path = [path]

    // 删除对应路径的模块
    this._modules.unregister(path)

    // 删除对应路径的state
    this._strictThrough(() => {
      const parentState = getNewestState(this.state, path.slice(0, -1))
      delete parentState[path[path.length - 1]]
    })
    
    // 重置store
    resetStore(this)
  }
  // 判断路径是否有模块
  hasModule (path) {
    if (typeof path === 'string') path = [path]

    return this._modules.inRootModule(path)
  }
}
