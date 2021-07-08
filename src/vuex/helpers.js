import { normalizeMap } from './utils.js'

function getMapData (namespace, map) {
  if (typeof namespace !== 'string') {
    map = namespace
    namespace = ''
  } else if (namespace.charAt(namespace.length - 1) !== '/') {
    namespace += '/'
  }
  return {namespace, map}
}

function createMapFun (namespace, map, type) {
  const mapData = getMapData(namespace, map)
  namespace = mapData['namespace']
  map = mapData['map']

  const res = {}
  normalizeMap(map).forEach(({key, value}) => {
    res[key] = function mappedState (...args) {
      let state = this.$store.state
      let getters = this.$store.getters
      let commit = this.$store.commit
      let dispatch = this.$store.dispatch

      if (namespace) {
        const module = this.$store._namespaceWrapped[namespace]
        state = module._raw.state || {}
        getters = module._raw.getters || {}
      }
      if (type === 'state') {
        return typeof value === 'function'
          ? value.call(this, state, getters)
          : Array.isArray(map)
            ? state[key]
            : state[value]
      } else if (type === 'getters') {
        return typeof value === 'function'
          ? value.call(this, getters)
          : Array.isArray(map)
            ? getters[key]
            : getters[value]
      } else if (type === 'mutations') {
        const name = Array.isArray(map)
          ? namespace + key
          : namespace + value
        return commit.apply(this.$store, [name].concat(args || ''))
      } else if (type === 'actions') {
        const name = Array.isArray(map)
          ? namespace + key
          : namespace + value
        return dispatch.apply(this.$store, [name].concat(args || ''))
      }
    }
  })
  return res
}

export const mapState = (namespace, states) => {
  return createMapFun(namespace, states, 'state')
}

export const mapGetters = (namespace, getters) => {
  return createMapFun(namespace, getters, 'getters')
}

export const mapMutations = (namespace, mutations) => {
  return createMapFun(namespace, mutations, 'mutations')
}

export const mapActions = (namespace, actions) => {
  return createMapFun(namespace, actions, 'actions')
}
