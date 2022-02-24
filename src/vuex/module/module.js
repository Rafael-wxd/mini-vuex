import { objectForEach } from '../utils.js'

export default class Module {
  // 初始化模型数据
  constructor (rawModule) {
    this._raw = rawModule
    this._children = {}
    this.state = rawModule.state || {}
    this.namespaced = rawModule.namespaced
  }
  // 获取子级
  getChild (key) {
    return this._children[key]
  }
  // 添加子级
  addChild (key, module) {
    this._children[key] = module
  }
  // 删除子级
  removeChild (key) {
    delete this._children[key]
  }
  // 判断某个子级是否存在
  hanChild (key) {
    return key in this._children
  }
  // 遍历子级
  forEachChild (fn) {
    objectForEach(this._children, fn)
  }
  // 遍历当前注册的getters
  forEachGetters (fn) {
    const getters = this._raw.getters
    if (getters) {
      objectForEach(getters, fn)
    }
  }
  // 遍历当前注册的mutations
  forEachMutations (fn) {
    const mutations = this._raw.mutations
    if (mutations) {
      objectForEach(mutations, fn)
    }
  }
  // 遍历当前注册的actions
  forEachActions (fn) {
    const actions = this._raw.actions
    if (actions) {
      objectForEach(actions, fn)
    }
  }
}