import { reactive, watch } from 'vue'
import { objectForEach, getNewestState } from '../utils.js'

function startStrictMode (store) {
  watch(() => store._state.data, () => {
    console.assert(store._strictState, '[vuex] Modification of state in mutations is recommended.')
  }, { deep: true, flush: 'sync' })
}

export function installState (store, rootState, path, module) {
  // 是否为根节点
  const isRoot = !path.length

  // 在不为根节点模式下将当前数据添加到根节点
  if (!isRoot) {
    const parentState = path.slice(0, -1).reduce((state, key) => {
      return state[key]
    }, rootState)
    const key = path[path.length - 1]
    store._strictThrough(() => {
      parentState[key] = module.state
    })
  }

  // 获取别名
  const namespaced = store._modules.getNamespaced(path)

  // 有别名时将对应的module储存以便后续操作
  if (namespaced) {
    store._namespaceWrapped[namespaced] = module
  }

  // 储存getter到getter管理模型中
  module.forEachGetters((key, getter) => {
    // 将key和别名拼接
    key = namespaced + key
    // 将key和对应的getter匹配
    // getNewestState 获取当前最新的state
    // 注~相同名字的getter会被覆盖
    store._gettersWrapped[key] = () => {
      return getter(getNewestState(store.state, path))
    }
  })

  // 储存mutation到mutation管理模型中
  module.forEachMutations((key, mutaion) => {
    // 将key和别名拼接
    key = namespaced + key
    // 根据key创建数组
    const entry = store._mutationsWrapped[key] || (store._mutationsWrapped[key] = [])
    // 相同名字共同添加数组
    entry.push((payload) => {
      mutaion.call(store, getNewestState(store.state, path), payload)
    })
  })

  // 储存action到action管理模型中
  module.forEachActions((key, action) => {
    // 将key和别名拼接
    key = namespaced + key
    // 根据key创建数组
    const entry = store._actionsWrapped[key] || (store._actionsWrapped[key] = [])
    // 相同名字共同添加数组
    entry.push((payload) => {
      const res = action.call(store, {
        // 添加commit方法
        commit: function (type, payload) {
          store.commit(namespaced + type, payload)
        },
        // 添加dispatch方法
        dispatch: function (type, payload) {
          store.dispatch(namespaced + type, payload)
        },
        // 添加getters参数
        getters: module._raw.getters || {},
        // 添加state参数
        state: module._raw.state || {},
        // 添加顶级getters
        rootGetters: store.getters,
        // 添加顶级state
        rootState: store.state
      }, payload)
      if (res && typeof res.then === 'function') {
        return res
      }
      // res转换为异步promise
      return Promise.resolve(res)
    })
  })

  // 遍历子级递归处理
  module.forEachChild((key, child) => {
    installState(store, rootState, path.concat(key), child)
  })
}

// 重置state属性
export function resetStoreState (store, state) {
  // 将state通过reactive赋值给_state
  store._state = reactive({data: state})
  // 初始化getters
  store.getters = {}
  // 遍历getter模型管理绑定监听state变化更新
  objectForEach(store._gettersWrapped, (key, getter) => {
    Object.defineProperty(store.getters, key, {
      get: getter,
      enumerable: true
    })
  })

  // 是否开启严格模式
  if (store.strict) {
    startStrictMode(store)
  }
}

// 重置store
export function resetStore (store) {
  store._gettersWrapped = Object.create(null)
  store._mutationsWrapped = Object.create(null)
  store._actionsWrapped = Object.create(null)

  const state = store.state
  installState(store, state, [], store._modules.root)
  resetStoreState(store, state)
}
