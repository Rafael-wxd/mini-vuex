import { createStore } from '@/vuex'

const store = createStore({
  strict: true,
  plugins: [],
  state: {
    a: 'a'
  },
  getters: {
    aGetters (state) {
      return state.a + '/'
    }
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
  },
  modules: {
   b: {
     state: {
       a: 'b'
     },
     getters: {
      aGetters (state) {
        return state.a + '/'
      }
    },
     mutations: {
        update (state, payload) {
          state.a += payload
        }
      },
      actions: {
        update (store, payload) {
          store.commit('update', payload)
        }
      }
   },
   c: {
     state: {
       a: 'c'
     },
     getters: {
      aGetters (state) {
        return state.a + '/'
      }
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
   }
  }
})

export default store
