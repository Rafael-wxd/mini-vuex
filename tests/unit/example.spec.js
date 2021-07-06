import { createApp, computed } from 'vue'
import {
  createStore,
  useStore,
  mapState,
  mapGetters,
  mapMutations,
  mapActions 
} from '@/vuex'

const storeClone = function (obj) {
  if (obj == null) { return null }
  var result = Array.isArray(obj) ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        result[key] = storeClone(obj[key])
      } else {
        result[key] = obj[key]
      }
    }
  }
  return result
}

function mount (store, component = {}, injectKey = null) {
  const el = createElement()

  component.render = () => {}

  const app = createApp(component)

  app.use(store, injectKey)

  return app.mount(el)
}

function createElement () {
  const el = document.createElement('div')

  document.body.appendChild(el)

  return el
}

describe('Store', () => {
  const testData = 'create state'

  it('create Store', () => {  
    const store = createStore({})
    const vm = mount(store)
    expect(vm.$store).toBe(store)
  })

  it('useStore', () => {
    const store = createStore({})
    const vm = mount(store, {
      setup () {
        return {
          useStore: useStore()
        }
      }
    })

    expect(vm.$store === vm.useStore).toBe(true)
  })

  it('useStore key', () => {
    const testKey = 'testKey'
    const store = createStore({})

    const vm = mount(store, {
      setup () {
        return {
          useStore: useStore(testKey)
        }
      }
    }, testKey)

    expect(vm.$store === vm.useStore).toBe(true)
  })

  const stateStore = {
    state: {
      test: testData
    },
    mutations: {
      updateTest (state, payload) {
        state.test += payload
      }
    }
  }

  it('create state', () => {
    const store = createStore(storeClone(stateStore))

    expect(store.state.test).toBe(testData)
  })

  it('mapState', () => {
    const store = createStore(storeClone(stateStore))

    const vm = mount(store, {
      computed: {
        ...mapState(['test'])
      }
    })

    expect(vm.test).toBe(testData)
  })

  it('mapState function', () => {
    const store = createStore(storeClone(stateStore))

    const vm = mount(store, {
      computed: {
        ...mapState({
          test (state) {
            return state.test
          }
        })
      }
    })

    expect(vm.test).toBe(testData)
  })

  it('updateState', () => {
    const store = createStore(storeClone(stateStore))

    expect(store.state.test).toBe(testData)
    store.commit('updateTest', ' update')
    expect(store.state.test).toBe(testData + ' update')
  })

  const getterStore = {
    state: {
      test: testData
    },
    getters: {
      testGetter (state) {
        return state.test + ' getters'
      }
    },
    mutations: {
      updateGetter (state, payload) {
        state.test += payload
      }
    }
  }

  it('create getters', () => {
    const store = createStore(storeClone(getterStore))

    expect(store.getters.testGetter).toBe(testData + ' getters')
  })

  it('mapGetters', () => {
    const store = createStore(storeClone(getterStore))

    const vm = mount(store, {
      computed: {
        ...mapGetters(['testGetter'])
      }
    })

    expect(vm.testGetter).toBe(testData + ' getters')
  })

  it('mapGetters function', () => {
    const store = createStore(storeClone(getterStore))

    const vm = mount(store, {
      computed: {
        ...mapGetters({
          testGetter (getters) {
            return getters.testGetter
          }
        })
      }
    })

    expect(vm.testGetter).toBe(testData + ' getters')
  })

  it('updateGetters', () => {
    const store = createStore(storeClone(getterStore))

    expect(store.getters.testGetter).toBe(testData + ' getters')
    store.commit('updateGetter', ' update')
    expect(store.getters.testGetter).toBe(testData + ' update getters')
  })

  const mutationStore = {
    state: {
      test: testData
    },
    mutations: {
      testUpdate (state, payload) {
        state.test += payload
      }
    }
  }

  it('mutations', () => {
    const store = createStore(storeClone(mutationStore))

    expect(store.state.test).toBe(testData)
    store.commit('testUpdate', ' update')
    expect(store.state.test).toBe(testData + ' update')
  })

  it('mapMutation', () => {
    const store = createStore(storeClone(mutationStore))

    const vm = mount(store, {
      computed: {
        ...mapState(['test'])
      },
      methods: {
        ...mapMutations(['testUpdate'])
      }
    })

    expect(vm.test).toBe(testData)
    vm.testUpdate(' update')
    expect(vm.test).toBe(testData + ' update')
  })

  const actionStore = {
    state: {
      test: testData
    },
    mutations: {
      testUpdate (state, payload) {
        state.test += payload
      }
    },
    actions: {
      testUpdate ({ commit }, payload) {
        commit('testUpdate', payload)
      }
    }
  }

  it('actions', () => {
    const store = createStore(storeClone(actionStore))

    expect(store.state.test).toBe(testData)
    store.dispatch('testUpdate', ' update')
    expect(store.state.test).toBe(testData + ' update')
  })

  it('mapActions', () => {
    const store = createStore(storeClone(actionStore))

    const vm = mount(store, {
      computed: {
        ...mapState(['test'])
      },
      methods: {
        ...mapActions(['testUpdate'])
      }
    })

    expect(vm.test).toBe(testData)
    vm.testUpdate(' update')
    expect(vm.test).toBe(testData + ' update')
  })

  it('not namespaced', () => {
    const store = createStore({
      state: {
        a: 'a'
      },
      mutations: {
        update (state, payload) {
          state.a += payload
        }
      },
      modules: {
        b: {
          state: {
            a: 'b'
          },
          mutations: {
            update (state, payload) {
              state.a += payload
            }
          }
        }
      }
    })
    expect(store.state.a === 'a' && store.state.b.a === 'b').toBe(true)
    store.commit('update', '1')
    expect(store.state.a === 'a1' && store.state.b.a === 'b1').toBe(true)
  })

  it('namespaced', () => {
    const store = createStore({
      state: {
        a: 'a'
      },
      mutations: {
        update (state, payload) {
          state.a += payload
        }
      },
      modules: {
        b: {
          namespaced: true,
          state: {
            a: 'b'
          },
          mutations: {
            update (state, payload) {
              state.a += payload
            }
          }
        }
      }
    })

    expect(store.state.a === 'a' && store.state.b.a === 'b').toBe(true)
    store.commit('update', '1')
    expect(store.state.a === 'a1' && store.state.b.a === 'b').toBe(true)
  })

  it('mapState namespaced', () => {
    const store = createStore({
      state: {
        a: 'a'
      },
      mutations: {
        update (state, payload) {
          state.a += payload
        }
      },
      modules: {
        b: {
          namespaced: true,
          state: {
            a: 'b'
          },
          mutations: {
            update (state, payload) {
              state.a += payload
            }
          }
        }
      }
    })

    const vm = mount(store, {
      computed: {
        ...mapState('b', ['a'])
      }
    })

    expect(vm.a).toBe('b')
  })

  it('strict', () => {
    const store = createStore({
      strict: true
    })

    expect(store.strict).toBe(true)
  })

  it('registerModule', () => {
    const store = createStore({
      state: {
        a: 'a'
      }
    })

    store.registerModule(['b'], {
      state: {
        a: 'b'
      }
    })

    expect(store.state.a === 'a' && store.state.b.a === 'b').toBe(true)
  })

  it('unregisterModule', () => {
    const store = createStore({})

    store.registerModule(['a'], {
      state: {
        a: 'a'
      }
    })

    expect(store.state.a.a).toBe('a')
    store.unregisterModule(['a'])
    expect(store.state.a).toBe(undefined)
  })

  it('plugins', () => {
    const storeJest = 'storeJest'
    const setStoreJest = function (store) {
      store['storeJest'] = storeJest
    }

    const store = createStore({
      plugins: [
        setStoreJest
      ]
    })

    expect(store.storeJest).toBe(storeJest)
  })

  it('replaceState', () => {
    const store = createStore({})

    store.replaceState({
      a: 1
    })

    expect(store.state.a && store.state.a === 1).toBe(true)
  })

  it('subscribe', () => {
    const store = createStore({
      plugins: [
        (store) => {
          store.subscribe((mutation, state) => {
            expect(mutation.type === 'update' && mutation.payload === 1).toBe(true)
            expect(state).toBe(store.state)
          })
        }
      ],
      state: {
        a: 1
      },
      mutations: {
        update (state, payload) {
          state.a += payload
        }
      }
    })

    store.commit('update', 1)
  })

  it('subscribeAction', async () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        update (state, payload) {
          state.a += payload
        }
      },
      actions: {
        update ({ commit }, payload) {
          commit('update', payload)
        }
      }
    })
    store.subscribeAction(function (action, state) {
      expect(action.type === 'update' && action.payload === 1).toBe(true)
      expect(state).toBe(store.state)
    })
    await store.dispatch('update', 1)
  })

  it('hasModule', () => {
    const store = createStore({
      state: {
        a: 'a'
      }
    })

    store.registerModule(['b'], {
      state: {
        a: 'b'
      }
    })

    expect(store.hasModule('b')).toBe(true)
    expect(store.hasModule('c')).toBe(false)
  })
})
