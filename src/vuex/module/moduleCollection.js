import Module from './module'
import { objectForEach } from '../utils.js'

export default class ModuleCollection {
  constructor (rootModule) {
    // 初始化root
    this.root = null
    // 递归执行绑定module
    this.register(rootModule, [])
  }
  register (rawModule, path) {
    // 创建模型
    const newModule = new Module(rawModule)
    if (path.length <= 0) {
      // 根节点直接绑定模型
      this.root = newModule
    } else {
      // 子节点绑定模型并添加到到父级模型中
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      const key = path[path.length - 1]
      parent.addChild(key, newModule)
    }

    // 当有modules时遍历执行注册模型
    if (rawModule.modules) {
      objectForEach(rawModule.modules, (key, childModule) => {
        this.register(childModule, path.concat(key))
      })
    }

    return newModule
  }
  // 获取别名
  getNamespaced (path) {
    let module = this.root
    return path.reduce((namespaced, current) => {
      module = module.getChild(current)
      return namespaced + (module.namespaced ? `${current}/` : '')
    }, '')
  }
  // 删除模块
  unregister (path) {
    const parentModule = path.slice(0, -1).reduce((rawModule, key) => {
      return rawModule.getChild(key)
    }, this.root)
    
    parentModule.removeChild(path[path.length - 1])
  }
  // 检测模型中是否有某个模块
  inRootModule (path) {
    const parentModule = path.slice(0, -1).reduce((rawModule, key) => {
      return rawModule.getChild(key)
    }, this.root)

    return parentModule.hanChild(path[path.length - 1])
  }
}

