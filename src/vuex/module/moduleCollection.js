import Module from './module'
import { objectForEach } from '../utils.js'

export default class ModuleCollection {
  constructor (rootModule) {
    this.root = null
    this.register(rootModule, [])
  }
  register (rawModule, path) {
    const newModule = new Module(rawModule)
    if (path.length <= 0) {
      this.root = newModule
    } else {
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      const key = path[path.length - 1]
      parent.addChild(key, newModule)
    }

    if (rawModule.modules) {
      objectForEach(rawModule.modules, (key, childModule) => {
        this.register(childModule, path.concat(key))
      })
    }

    return newModule
  }
  getNamespaced (path) {
    let module = this.root
    return path.reduce((namespaced, current) => {
      module = module.getChild(current)
      return namespaced + (module.namespaced ? `${current}/` : '')
    }, '')
  }
  unregister (path) {
    const parentModule = path.slice(0, -1).reduce((rawModule, key) => {
      return rawModule.getChild(key)
    }, this.root)
    
    parentModule.removeChild(path[path.length - 1])
  }
  inRootModule (path) {
    const parentModule = path.slice(0, -1).reduce((rawModule, key) => {
      return rawModule.getChild(key)
    }, this.root)

    return parentModule.hanChild(path[path.length - 1])
  }
}

