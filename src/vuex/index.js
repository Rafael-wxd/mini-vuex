import Store from './store.js'
import { useStore } from './injectKey.js'
import { mapState, mapGetters, mapMutations, mapActions } from './helpers.js'

function createStore (options) {
  return new Store(options)
}

export default {
  createStore,
  useStore,
  mapState,
  mapGetters,
  mapActions
}

export {
  createStore,
  useStore,
  mapState,
  mapGetters,
  mapMutations,
  mapActions
}
