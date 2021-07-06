# wxd-vuex

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run jezt
```

#### 描述

模仿vuex4.0了大部分功能，在vue3.0中使用

核心概念

state

```vue
import { createStore } from 'vuex'
export defualt createStore({
  state: {
  	a: 1
  }
})

// 页面中使用
// this.$store.state.a
// 或者
import { useStore } from 'vuex'
import { computed } from 'vue'

setup () {
  const store = useStore()
  
  return {
    a: computed(() => store.state.a)
  }
}
```

getter

```
import { createStore } from 'vuex'
export defualt createStore({
  state: {
  	a: 1
  },
  getters: {
    aGetter (state) {
      return state + '_getter'
    }
  }
})

// 页面中使用
// this.$store.getters.aGetter
// 或者
import { useStore } from 'vuex'
import { computed } from 'vue'

setup () {
  const store = useStore()
  
  return {
    aGetter: computed(() => store.getters.aGetter)
  }
}
// aGetter = '1_getter'
```

mutations

```
import { createStore } from 'vuex'
export defualt createStore({
  state: {
  	a: 1
  },
  mutations: {
    aUpdate (state, payload) {
      state.a += payload
    }
  }
})

// 页面中使用
// this.$store.commit('aUpdate', 1)
// 或者
import { useStore } from 'vuex'

setup () {
  const store = useStore()
  
  return {
    aUpdate: () => { store.commit('aUpdate', 1) }
  }
}
// a => 2
```

actions

```
import { createStore } from 'vuex'
export defualt createStore({
  state: {
  	a: 1
  },
  mutations: {
    aUpdate (state, payload) {
      state.a += payload
    }
  },
  actions: {
    aUpdate ({ commit }, payload) {
      commit('aUpdate', 1)
    }
  }
})

// 页面中使用
// this.$store.dispatch('aUpdate', 1)
// 或者
import { useStore } from 'vuex'

setup () {
  const store = useStore()
  
  return {
    aUpdate: () => { store.dispatch('aUpdate', 1) }
  }
}
// a => 2
```

modules

```
import { createStore } from 'vuex'
export defualt createStore({
  state: {
  	a: 1
  },
  modules: {
    b: {
      state: {
        a: 2
      }
    }
  }
})

// 页面中使用
// this.$store.state.a
// this.$store.state.b.a
// 或者
import { useStore } from 'vuex'
import { computed } from 'vue'

setup () {
  const store = useStore()
  
  return {
    a: computed(() => store.state.a),
    b: computed(() => store.state.b.a)
  }
}

// a => 1
// b => 2
```

实例方法---

commit

dispatch

replaceState

subscribe

subscribeAction

registerModule

unregisterModule

hasModule

辅助函数---

mapState

mapGetters

mapActions

mapMutations