import { reactive, watch } from 'vue'
import { objectForEach, getNewestState } from '../utils.js'

function startStrictMode (store) {
  watch(() => store._state.data, () => {
    console.assert(store._strictState, '[vuex] Modification of state in mutations is recommended.')
  }, { deep: true, flush: 'sync' })
}

export function installState (store, rootState, path, module) {
  const isRoot = !path.length

  if (!isRoot) {
    const parentState = path.slice(0, -1).reduce((state, key) => {
      return state[key]
    }, rootState)
    const key = path[path.length - 1]
    store._strictThrough(() => {
      parentState[key] = module.state
    })
  }

  // get namespaced
  const namespaced = store._modules.getNamespaced(path)

  // Add namespaced
  if (namespaced) {
    store._namespaceWrapped[namespaced] = module
  }

  // Add getters
  module.forEachGetters((key, getter) => {
    key = namespaced + key
    store._gettersWrapped[key] = () => {
      return getter(getNewestState(store.state, path))
    }
  })

  // Add mutations
  module.forEachMutations((key, mutaion) => {
    key = namespaced + key
    const entry = store._mutationsWrapped[key] || (store._mutationsWrapped[key] = [])
    entry.push((payload) => {
      mutaion.call(store, getNewestState(store.state, path), payload)
    })
  })

  // Add actions
  module.forEachActions((key, action) => {
    key = namespaced + key
    const entry = store._actionsWrapped[key] || (store._actionsWrapped[key] = [])
    entry.push((payload) => {
      const res = action.call(store, {
        commit: function (type, payload) {
          store.commit(namespaced + type, payload)
        },
        dispatch: function (type, payload) {
          store.dispatch(namespaced + type, payload)
        },
        getters: module._raw.getters || {},
        state: module._raw.state || {},
        rootGetters: store.getters,
        rootState: store.state
      }, payload)
      if (res && typeof res.then === 'function') {
        return res
      }
      return Promise.resolve(res)
    })
  })

  // Add state
  module.forEachChild((key, child) => {
    installState(store, rootState, path.concat(key), child)
  })
}

export function resetStoreState (store, state) {
  store._state = reactive({data: state})
  store.getters = {}
  objectForEach(store._gettersWrapped, (key, getter) => {
    Object.defineProperty(store.getters, key, {
      get: getter,
      enumerable: true
    })
  })

  if (store.strict) {
    startStrictMode(store)
  }
}

export function resetStore (store) {
  store._gettersWrapped = Object.create(null)
  store._mutationsWrapped = Object.create(null)
  store._actionsWrapped = Object.create(null)

  const state = store.state
  installState(store, state, [], store._modules.root)
  resetStoreState(store, state)
}
